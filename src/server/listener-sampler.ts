import { prisma } from "@/lib/prisma";

const ACTIVE_WINDOW_MS = 90 * 1000;
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000;

/** Periodically records how many distinct website visitors are currently active, so the
 * Studio analytics tab can show a real (not fabricated) average over time. */
export function startListenerSampler() {
  const sample = async () => {
    try {
      const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS);
      const count = await prisma.listenerSession.count({ where: { lastSeen: { gte: cutoff } } });
      await prisma.listenerCountSample.create({ data: { count } });
    } catch (err) {
      console.error("[listener-sampler] failed to record sample:", err);
    }
  };

  sample();
  return setInterval(sample, SAMPLE_INTERVAL_MS);
}
