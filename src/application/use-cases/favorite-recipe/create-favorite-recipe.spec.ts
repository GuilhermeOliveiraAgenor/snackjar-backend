import { beforeEach, describe, it, expect } from "vitest";
import { CreateFavoriteRecipeUseCase } from "./create-favorite-recipe";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { InMemoryFavoriteRecipeRepository } from "../../../../test/repositories/in-memory-favorite-recipe-repository";
import { makeUser } from "../../../../test/factories/make-user";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { makeFavoriteRecipe } from "../../../../test/factories/make-favorite-recipe";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeRepository: InMemoryRecipeRepository;
let inMemoryFavoriteRecipeRepository: InMemoryFavoriteRecipeRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: CreateFavoriteRecipeUseCase;

describe("Create Favorite Recipe Use Case", () => {
  beforeEach(() => {
    inMemoryFavoriteRecipeRepository = new InMemoryFavoriteRecipeRepository();
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new CreateFavoriteRecipeUseCase(
      inMemoryFavoriteRecipeRepository,
      inMemoryRecipeRepository,
    );
  });
  it("should be able to create favorite recipe", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryFavoriteRecipeRepository.items).toHaveLength(1);
  });
  it("should not be able to create favorite recipe when recipe id does not exists", async () => {
    const user = makeUser();

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      recipeId: "0",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryFavoriteRecipeRepository.items).toHaveLength(0);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to create favorite recipe already existing", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const favoriteRecipe = makeFavoriteRecipe({ createdBy: user.id, recipeId: recipe.id });
    await inMemoryFavoriteRecipeRepository.create(favoriteRecipe);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });
  it("should not be able to create favorite recipe when user is not creator", async () => {
    const user1 = makeUser();
    const user2 = makeUser();

    await inMemoryUserRepository.create(user1);
    await inMemoryUserRepository.create(user2);

    const recipe = makeRecipe({
      createdBy: user1.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      userId: user2.id.toString(),
    });

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
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
