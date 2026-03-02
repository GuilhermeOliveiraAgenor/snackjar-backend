import { beforeEach, describe, expect, it } from "vitest";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { EditCategoryUseCase } from "../category/edit-category";
import { makeCategory } from "../../../../test/factories/make-category";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { InMemoryCategoryRepository } from "../../../../test/repositories/in-memory-category-repository";
import { InMemoryRedisCache } from "../../../../test/cache/redis-cache";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let inMemoryRedisCache: InMemoryRedisCache;

let sut: EditCategoryUseCase;

describe("Edit Category Use Case", () => {
  beforeEach(() => {
    inMemoryCategoryRepository = new InMemoryCategoryRepository(); // define repository
    inMemoryRedisCache = new InMemoryRedisCache();

    sut = new EditCategoryUseCase(inMemoryCategoryRepository, inMemoryRedisCache); // use case receive repository
  });

  it("should be able to update category", async () => {
    // create category
    const category = makeCategory();

    // pass to repository
    await inMemoryCategoryRepository.create(category);

    // pass the object to use case
    const result = await sut.execute({
      name: "Prato doce",
      description: "Prato",
      id: category.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryCategoryRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.category).toMatchObject({
        name: "Prato doce",
      });
    }
  });

  it("should not be able to update a category when id does not exist", async () => {
    const result = await sut.execute({
      id: "0",
      name: "Prato doce",
      description: "Prato",
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to update a category when already exists name", async () => {
    const category1 = makeCategory({
      name: "Salgados",
    });
    const category2 = makeCategory();

    await inMemoryCategoryRepository.create(category1);
    await inMemoryCategoryRepository.create(category2);

    const result = await sut.execute({
      id: category2.id.toString(),
      name: "Salgados",
      description: "Pratos salgados",
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });
});
