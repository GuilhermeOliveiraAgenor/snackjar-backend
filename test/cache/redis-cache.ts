export class InMemoryRedisCache {
  private cache: Record<string, unknown> = {};

  async get<T>(key: string): Promise<T | null> {
    return (this.cache[key] as T) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.cache[key] = value;
  }

  async delete(key: string): Promise<void> {
    delete this.cache[key];
  }

  async deletePattern(pattern: string): Promise<void> {
    const prefix = pattern.replace("*", "");

    Object.keys(this.cache).forEach((key) => {
      if (key.startsWith(prefix)) {
        delete this.cache[key];
      }
    });
  }
}
