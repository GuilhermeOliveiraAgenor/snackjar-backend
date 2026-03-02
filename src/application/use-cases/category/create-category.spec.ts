import { AlreadyExistsError } from "../../errors/already-exists-error";
import { describe, it, expect, beforeEach } from "vitest";
import { CreateCategoryUseCase } from "./create-category";
import { makeCategory } from "../../../../test/factories/make-category";
import { InMemoryCategoryRepository } from "../../../../test/repositories/in-memory-category-repository";
import { InMemoryRedisCache } from "../../../../test/cache/redis-cache";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let inMemoryRedisCache: InMemoryRedisCache;

let sut: CreateCategoryUseCase;

describe("Category Use Case", () => {
  beforeEach(() => {
    inMemoryCategoryRepository = new InMemoryCategoryRepository(); // define repository
    inMemoryRedisCache = new InMemoryRedisCache();
    sut = new CreateCategoryUseCase(inMemoryCategoryRepository, inMemoryRedisCache); // use case receive repository
  });
  it("should be able to create a category", async () => {
    const result = await sut.execute({
      name: "Salgados",
      description: "Pratos salgados",
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryCategoryRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.category).toMatchObject({
        name: "Salgados",
        description: "Pratos salgados",
      });
    }
  });

  it("should not be able to create a category name already exists", async () => {
    const category1 = makeCategory({
      name: "Salgados",
    });

    await inMemoryCategoryRepository.create(category1);

    const result = await sut.execute({
      name: "Salgados",
      description: "Pratos salgados",
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryCategoryRepository.items).toHaveLength(1);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });
});
