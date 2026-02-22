import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecipeStepRepository } from "../../../../test/repositories/in-memory-recipe-step";
import { CreateRecipeStepUseCase } from "./create-recipe-step";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { makeUser } from "../../../../test/factories/make-user";
import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { makeRecipeStep } from "../../../../test/factories/make-recipe-step";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeStepRepository: InMemoryRecipeStepRepository;
let inMemoryRecipeRepository: InMemoryRecipeRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: CreateRecipeStepUseCase;

describe("Create Recipe Step Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeStepRepository = new InMemoryRecipeStepRepository();
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new CreateRecipeStepUseCase(inMemoryRecipeStepRepository, inMemoryRecipeRepository);
  });
  it("should be able to create a recipe step", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      step: 1,
      description: "Jogue o açucar na bandeja",
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.recipeStep).toMatchObject({
        step: 1,
        description: "Jogue o açucar na bandeja",
      });
    }
  });
  it("should not be able to create recipe step when recipe id does not exists", async () => {
    const result = await sut.execute({
      recipeId: "0",
      step: 1,
      description: "Jogue a farinha na bandeja",
      userId: "user-1",
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(0);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to create a recipe step when user is not creator", async () => {
    const user1 = makeUser();
    await inMemoryUserRepository.create(user1);

    const user2 = makeUser();
    await inMemoryUserRepository.create(user2);

    const recipe = makeRecipe({
      createdBy: new UniqueEntityID(user1.id.toString()),
    });
    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      step: 1,
      description: "Jogue na bandeja",
      recipeId: recipe.id.toString(),
      userId: user2.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryRecipeRepository.items).toHaveLength(1);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to create a recipe step already exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      step: 1,
      createdBy: user.id,
      recipeId: recipe.id,
    });

    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      step: 1,
      description: "Jogue na bandeja",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });
  it("should not be able to create step when recipe is not ACTIVE", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      status: RecipeStatus.INACTIVE,
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      recipeId: recipe.id,
    });
    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      step: 1,
      description: "Jogue a farinha na bandeja",
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
