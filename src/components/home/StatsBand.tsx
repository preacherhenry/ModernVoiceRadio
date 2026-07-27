import Container from "@/components/ui/Container";

const stats = [
  { value: "18+", label: "Years On Air" },
  { value: "2.4K", label: "Peak Live Listeners" },
  { value: "6", label: "Daily & Weekend Shows" },
  { value: "24/7", label: "Streaming Worldwide" },
];

export default function StatsBand() {
  return (
    <div className="border-b border-line bg-ink-2">
      <Container className="grid grid-cols-2 divide-x divide-line lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-8 text-center first:pl-0 last:pr-0 sm:px-8">
            <p className="font-display text-3xl font-extrabold text-gold sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400 sm:text-sm">
              {s.label}
            </p>
          </div>
        ))}
      </Container>
    </div>
  );
}
