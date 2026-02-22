import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { DeleteRecipeUseCase } from "./delete-recipe";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { makeCategory } from "../../../../test/factories/make-category";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { makeUser } from "../../../../test/factories/make-user";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InMemoryCategoryRepository } from "../../../../test/repositories/in-memory-category-repository";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeRepository: InMemoryRecipeRepository;
let inMemoryCategoryRepository: InMemoryCategoryRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: DeleteRecipeUseCase;

describe("Soft delete Recipe Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryCategoryRepository = new InMemoryCategoryRepository();
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new DeleteRecipeUseCase(inMemoryRecipeRepository);
  });

  it("should be able to soft delete a recipe", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({ id: recipe.id.toString(), userId: user.id.toString() });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.recipe).toMatchObject({
        status: RecipeStatus.INACTIVE,
        deletedBy: user.id,
      });
    }
  });
  it("should not be able to delete a recipe when recipe id does not exist", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({ id: "0", userId: user.id.toString() });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to delete a recipe when user is not creator", async () => {
    const user1 = makeUser();
    await inMemoryUserRepository.create(user1);

    const user2 = makeUser();
    await inMemoryUserRepository.create(user2);

    const recipe = makeRecipe({
      createdBy: user1.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({ id: recipe.id.toString(), userId: user2.id.toString() });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to delete recipe is not ACTIVE", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      status: RecipeStatus.INACTIVE,
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      id: recipe.id.toString(),
      userId: "user-1",
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
