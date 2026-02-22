import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRecipeStepRepository } from "../../../../test/repositories/in-memory-recipe-step";
import { EditRecipeStepUseCase } from "./edit-recipe-step";
import { makeRecipeStep } from "../../../../test/factories/make-recipe-step";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { makeUser } from "../../../../test/factories/make-user";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeStepRepository: InMemoryRecipeStepRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryRecipeRepository: InMemoryRecipeRepository;

let sut: EditRecipeStepUseCase;

describe("Edit Recipe Step Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeStepRepository = new InMemoryRecipeStepRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryRecipeRepository = new InMemoryRecipeRepository();

    sut = new EditRecipeStepUseCase(inMemoryRecipeStepRepository, inMemoryRecipeRepository);
  });
  it("should be able to edit a recipe step", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe();
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      createdBy: user.id,
      recipeId: recipe.id,
    });

    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      id: recipeStep.id.toString(),
      step: 1,
      description: "Jogue a açucar na bandeja",
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.recipeStep).toMatchObject({
        step: 1,
        description: "Jogue a açucar na bandeja",
      });
    }
  });
  it("should not be edit recipe step when id does not exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: "0",
      step: 1,
      description: "Jogue a farinha na bandeja",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to delete recipe step when recipe id does not exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      recipeId: new UniqueEntityID("0"),
      createdBy: user.id,
    });
    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      id: recipeStep.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be edit recipe step when user is not a creator", async () => {
    const user1 = makeUser();
    const user2 = makeUser();

    await inMemoryUserRepository.create(user1);
    await inMemoryUserRepository.create(user2);

    const recipeStep = makeRecipeStep({
      createdBy: user1.id,
    });

    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      id: recipeStep.id.toString(),
      step: 1,
      description: "Jogue a farinha na bandeja",
      userId: user2.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to edit recipe step when step already exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
    });

    await inMemoryRecipeRepository.create(recipe);

    const recipeStep1 = makeRecipeStep({
      step: 1,
      recipeId: recipe.id,
      createdBy: user.id,
    });
    const recipeStep2 = makeRecipeStep({
      step: 2,
      recipeId: recipe.id,
      createdBy: user.id,
    });

    await inMemoryRecipeStepRepository.create(recipeStep1);
    await inMemoryRecipeStepRepository.create(recipeStep2);

    const result = await sut.execute({
      id: recipeStep2.id.toString(),
      step: 1,
      description: "Jogue açucar na farinha",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });
  it("should not be able to edit step when recipe is not ACTIVE", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      status: RecipeStatus.INACTIVE,
      createdBy: user.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      recipeId: recipe.id,
      createdBy: user.id,
    });
    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      id: recipeStep.id.toString(),
      step: 1,
      description: "Jogue a farinha na bandeja",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
