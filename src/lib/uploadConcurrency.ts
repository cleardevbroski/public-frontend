export async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!values.length) return [];
  const limit = Math.max(1, Math.floor(concurrency));
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => runWorker()));
  return results;
}
