// services/AvatarPreheater.ts
import { getOrBakeVariantFromModule } from "./ColorBaker.expo";

export type BakeTask = {
  baseModuleId: number; // require(...) id từ map images
  colorHex: string;     // "#RRGGBB"
  version?: string;     // optional
};

export async function preheatVariants(
  tasks: BakeTask[],
  onProgress?: (done: number, total: number) => void,
  concurrency = 2
) {
  const total = tasks.length;
  let done = 0;
  const queue = [...tasks];

  async function worker() {
    while (queue.length) {
      const job = queue.shift()!;
      try {
        await getOrBakeVariantFromModule(job.baseModuleId, job.colorHex, job.version ?? "v1");
      } catch (e) {
        console.warn("Bake failed", e);
      } finally {
        done++;
        onProgress?.(done, total);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, worker);
  await Promise.all(workers);
}
