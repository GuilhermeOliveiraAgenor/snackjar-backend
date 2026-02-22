import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { EditRecipeUseCase } from "./edit-recipe";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../test/factories/make-user";
import { makeCategory } from "../../../../test/factories/make-category";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InMemoryCategoryRepository } from "../../../../test/repositories/in-memory-category-repository";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeRepository: InMemoryRecipeRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCategoryRepository: InMemoryCategoryRepository;

let sut: EditRecipeUseCase;

describe("Edit Recipe Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryCategoryRepository = new InMemoryCategoryRepository();

    sut = new EditRecipeUseCase(inMemoryRecipeRepository);
  });
  it("should be able to edit a recipe", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    // create recipe
    const recipe = makeRecipe({
      createdBy: user.id,
      categoryId: category.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    //pass to use case
    const result = await sut.execute({
      id: recipe.id.toString(),
      title: "Bolo de Chocolate",
      description: "Receita de bolo de chocolate",
      preparationTime: 50,
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.recipe).toMatchObject({
        title: "Bolo de Chocolate",
        description: "Receita de bolo de chocolate",
        preparationTime: 50,
      });
    }
  });
  it("should not be able to edit a recipe when id does not exist", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    const result = await sut.execute({
      id: "0",
      title: "Bolo de Cenoura",
      description: "Receita de bolo de cenoura",
      preparationTime: 60,
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to edit a recipe when user is not creator", async () => {
    const user1 = makeUser();
    await inMemoryUserRepository.create(user1);
    const user2 = makeUser();
    await inMemoryUserRepository.create(user2);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    const recipe = makeRecipe({
      createdBy: user1.id,
      categoryId: category.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      id: recipe.id.toString(),
      title: "Bolo de Cenoura",
      description: "Receita de bolo de cenoura",
      preparationTime: 60,
      userId: user2.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryRecipeRepository.items).toHaveLength(1);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to edit a recipe title already exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    const recipe1 = makeRecipe({
      title: "Bolo de Chocolate",
      createdBy: user.id,
      categoryId: category.id,
    });
    await inMemoryRecipeRepository.create(recipe1);

    const recipe2 = makeRecipe({
      createdBy: user.id,
      categoryId: category.id,
    });
    await inMemoryRecipeRepository.create(recipe2);

    const result = await sut.execute({
      id: recipe2.id.toString(),
      title: "Bolo de Chocolate",
      description: "Receita de bolo de chocolate",
      preparationTime: 60,
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
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
      title: "Bolo de Cenoura",
      description: "Receita de Bolo de Cenoura",
      preparationTime: 60,
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
