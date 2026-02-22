import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecipeIngredientRepository } from "../../../../test/repositories/in-memory-recipe-ingredient";
import { makeRecipeIngredient } from "../../../../test/factories/make-recipe-ingredient";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { DeleteRecipeIngredientUseCase } from "./delete-recipe-ingredient";
import { makeUser } from "../../../../test/factories/make-user";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeIngredientRepository: InMemoryRecipeIngredientRepository;
let inMemoryRecipeRepository: InMemoryRecipeRepository;

let inMemoryUserRepository: InMemoryUserRepository;

let sut: DeleteRecipeIngredientUseCase;

describe("Delete Recipe Ingredient", () => {
  beforeEach(() => {
    inMemoryRecipeIngredientRepository = new InMemoryRecipeIngredientRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryRecipeRepository = new InMemoryRecipeRepository();

    sut = new DeleteRecipeIngredientUseCase(
      inMemoryRecipeIngredientRepository,
      inMemoryRecipeRepository,
    );
  });
  it("should be able to delete a recipe ingredient", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe();
    await inMemoryRecipeRepository.create(recipe);

    const recipeIngredient = makeRecipeIngredient({
      createdBy: user.id,
      recipeId: recipe.id,
    });
    await inMemoryRecipeIngredientRepository.create(recipeIngredient);

    const result = await sut.execute({
      id: recipeIngredient.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeIngredientRepository.items).toHaveLength(0);
  });
  it("should not be able to delete recipe ingredient when id does not exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: "0",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to delete recipe ingredient when recipe id does not exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeIngredient = makeRecipeIngredient({
      recipeId: new UniqueEntityID("0"),
      createdBy: user.id,
    });
    await inMemoryRecipeIngredientRepository.create(recipeIngredient);

    const result = await sut.execute({
      id: recipeIngredient.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to delete recipe ingredient when user is not creator", async () => {
    const user1 = makeUser();
    await inMemoryUserRepository.create(user1);

    const user2 = makeUser();
    await inMemoryUserRepository.create(user2);

    const recipeIngredient = makeRecipeIngredient({
      createdBy: user1.id,
    });
    await inMemoryRecipeIngredientRepository.create(recipeIngredient);

    const result = await sut.execute({
      id: recipeIngredient.id.toString(),
      userId: user2.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to delete ingredient when recipe is not ACTIVE", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      status: RecipeStatus.INACTIVE,
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeIngredient = makeRecipeIngredient({
      recipeId: recipe.id,
      createdBy: user.id,
    });
    await inMemoryRecipeIngredientRepository.create(recipeIngredient);

    const result = await sut.execute({
      id: recipeIngredient.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
