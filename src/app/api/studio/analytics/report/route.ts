import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import sharp from "sharp";
import { requireBroadcaster } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { dailyListenerStats } from "@/lib/listener-analytics";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 40;
const INK = rgb(0.04, 0.05, 0.07);
const GREY = rgb(0.42, 0.45, 0.51);
const GOLD = rgb(0.68, 0.58, 0.02);

async function loadHeaderLogoBytes() {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo-mark.png");
  return readFile(logoPath);
}

async function loadWatermarkBytes() {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const raw = await readFile(logoPath);
  // Bake the blur into the pixels themselves (pdf-lib has no filter/blur
  // support) - opacity alone is applied later when it's drawn on the page.
  return sharp(raw).resize(1000).blur(14).png().toBuffer();
}

function drawPageChrome(page: PDFPage, headerLogo: PDFImage, watermark: PDFImage) {
  const wmDims = watermark.scaleToFit(440, 440);
  page.drawImage(watermark, {
    x: (PAGE_WIDTH - wmDims.width) / 2,
    y: (PAGE_HEIGHT - wmDims.height) / 2,
    width: wmDims.width,
    height: wmDims.height,
    opacity: 0.90,
  });

  const logoDims = headerLogo.scaleToFit(120, 46);
  page.drawImage(headerLogo, {
    x: MARGIN,
    y: PAGE_HEIGHT - MARGIN - logoDims.height,
    width: logoDims.width,
    height: logoDims.height,
  });
}

export async function GET() {
  await requireBroadcaster();

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const elapsedDays = now.getUTCDate();

  const [daily, cityRows, headerLogoBytes, watermarkBytes] = await Promise.all([
    dailyListenerStats(startOfMonth, elapsedDays),
    prisma.listenerSession.groupBy({
      by: ["city"],
      _count: { _all: true },
      where: { city: { not: null }, lastSeen: { gte: startOfMonth } },
      orderBy: { _count: { city: "desc" } },
    }),
    loadHeaderLogoBytes(),
    loadWatermarkBytes(),
  ]);

  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const headerLogo = await doc.embedPng(headerLogoBytes);
  const watermark = await doc.embedPng(watermarkBytes);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageChrome(page, headerLogo, watermark);
    y = PAGE_HEIGHT - MARGIN - 70;
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) newPage();
  }

  function text(value: string, x: number, size: number, f: PDFFont = font, color = INK) {
    page.drawText(value, { x, y, size, font: f, color });
  }

  function sectionHeading(label: string) {
    ensureSpace(40);
    y -= 10;
    text(label, MARGIN, 12, bold, GOLD);
    y -= 16;
  }

  function tableHeaderRow(cols: { label: string; x: number }[]) {
    ensureSpace(30);
    for (const c of cols) text(c.label, c.x, 9, bold, GREY);
    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.75,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 14;
  }

  function tableRow(cols: { label: string; x: number }[]) {
    ensureSpace(18);
    for (const c of cols) text(c.label, c.x, 9.5, font);
    y -= 16;
  }

  drawPageChrome(page, headerLogo, watermark);
  y = PAGE_HEIGHT - MARGIN - 70;

  text("Modern Voice Radio", MARGIN, 18, bold);
  y -= 22;
  text("Website Listener Report", MARGIN, 13, bold, GOLD);
  y -= 20;
  text(`Month: ${monthLabel}`, MARGIN, 10, font, GREY);
  y -= 14;
  text("Website-only figures - excludes listeners via outside apps or players.", MARGIN, 8.5, font, GREY);
  y -= 24;

  sectionHeading("Daily Listeners");
  const dateX = MARGIN;
  const peakX = MARGIN + 220;
  const avgX = MARGIN + 340;
  tableHeaderRow([
    { label: "Date", x: dateX },
    { label: "Peak Listeners", x: peakX },
    { label: "Average Listeners", x: avgX },
  ]);
  for (const d of daily) {
    tableRow([
      { label: d.date, x: dateX },
      { label: String(d.peak), x: peakX },
      { label: String(d.average), x: avgX },
    ]);
  }

  y -= 20;
  sectionHeading("Streaming Locations This Month");
  const cityX = MARGIN;
  const countX = MARGIN + 320;
  tableHeaderRow([
    { label: "City", x: cityX },
    { label: "Distinct Visitor Sessions", x: countX },
  ]);
  if (cityRows.length === 0) {
    tableRow([{ label: "No location data recorded yet.", x: cityX }]);
  } else {
    for (const row of cityRows) {
      tableRow([
        { label: row.city ?? "Unknown", x: cityX },
        { label: String(row._count._all), x: countX },
      ]);
    }
  }

  const pdfBytes = await doc.save();
  const filename = `listener-report-${now.toISOString().slice(0, 7)}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
