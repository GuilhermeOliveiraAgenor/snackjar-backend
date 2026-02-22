import { describe, beforeEach, it, expect } from "vitest";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { InMemoryRecipeIngredientRepository } from "../../../../test/repositories/in-memory-recipe-ingredient";
import { CreateRecipeIngredientUseCase } from "./create-recipe-ingredient";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../test/factories/make-user";
import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { MeasurementUnit } from "../../../core/enum/measurement-unit";
import { makeRecipeIngredient } from "../../../../test/factories/make-recipe-ingredient";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeIngredientRepository: InMemoryRecipeIngredientRepository;
let inMemoryRecipeRepository: InMemoryRecipeRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: CreateRecipeIngredientUseCase;

describe("Create Recipe Ingredient Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryRecipeIngredientRepository = new InMemoryRecipeIngredientRepository();
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new CreateRecipeIngredientUseCase(
      inMemoryRecipeIngredientRepository,
      inMemoryRecipeRepository,
    );
  });
  it("should be able to create a recipe ingredient", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: new UniqueEntityID(user.id.toString()),
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      ingredient: "Açucar",
      amount: "1",
      unit: MeasurementUnit.KG,
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeIngredientRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.recipeIngredient).toMatchObject({
        ingredient: "Açucar",
        amount: "1",
        unit: "KG",
      });
    }
  });
  it("should not be able to create a recipe ingredient when recipe id does not exist", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      ingredient: "Açucar",
      amount: "1",
      unit: MeasurementUnit.KG,
      recipeId: "0",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(inMemoryRecipeIngredientRepository.items).toHaveLength(0);
  });
  it("should not be able to create a recipe ingredient when user is not creator", async () => {
    const user1 = makeUser();
    await inMemoryUserRepository.create(user1);

    const user2 = makeUser();
    await inMemoryUserRepository.create(user2);

    const recipe = makeRecipe({
      createdBy: new UniqueEntityID(user1.id.toString()),
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      ingredient: "Farinha",
      amount: "1000",
      unit: MeasurementUnit.KG,
      recipeId: recipe.id.toString(),
      userId: user2.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryRecipeRepository.items).toHaveLength(1);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to create ingredient when recipe is not ACTIVE", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      status: RecipeStatus.INACTIVE,
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeIngredient = makeRecipeIngredient({
      recipeId: recipe.id,
    });
    await inMemoryRecipeIngredientRepository.create(recipeIngredient);

    const result = await sut.execute({
      ingredient: "Açucar",
      amount: "1000",
      unit: MeasurementUnit.G,
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
