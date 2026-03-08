import { describe, expect, it } from "vitest";
import { FetchCategoriesUseCase } from "./fetch-categories";
import { beforeEach } from "vitest";
import { makeCategory } from "../../../../test/factories/make-category";
import { InMemoryCategoryRepository } from "../../../../test/repositories/in-memory-category-repository";
import { InMemoryRedisCache } from "../../../../test/cache/redis-cache";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let inMemoryRedisCache: InMemoryRedisCache;
let sut: FetchCategoriesUseCase;

describe("Fetch categories", () => {
  beforeEach(() => {
    inMemoryCategoryRepository = new InMemoryCategoryRepository();
    inMemoryRedisCache = new InMemoryRedisCache();

    sut = new FetchCategoriesUseCase(inMemoryCategoryRepository, inMemoryRedisCache);
  });

  it("should be able to list all categories", async () => {
    // create categories

    const category1 = makeCategory();
    const category2 = makeCategory();

    await inMemoryCategoryRepository.create(category1);
    await inMemoryCategoryRepository.create(category2);

    const result = await sut.execute();

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryCategoryRepository.items.length).toBeGreaterThan(1);
    expect(inMemoryCategoryRepository.items).toHaveLength(2);
  });
});
