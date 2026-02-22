import { describe, beforeEach, it, expect } from "vitest";
import { InMemoryRecipeStepRepository } from "../../../../test/repositories/in-memory-recipe-step";
import { makeRecipeStep } from "../../../../test/factories/make-recipe-step";
import { makeUser } from "../../../../test/factories/make-user";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { FetchStepsByRecipeUseCase } from "./fetch-steps-by-recipe";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InactiveError } from "../../errors/inactive-error";

let inMemoryRecipeStepRepository: InMemoryRecipeStepRepository;
let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryRecipeRepository: InMemoryRecipeRepository;

let sut: FetchStepsByRecipeUseCase;

describe("Fetch My Recipe Steps By Recipe Id Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeStepRepository = new InMemoryRecipeStepRepository();
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new FetchStepsByRecipeUseCase(inMemoryRecipeStepRepository, inMemoryRecipeRepository);
  });
  it("should be able to my fetch recipe steps by recipe id", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({ createdBy: user.id });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      recipeId: recipe.id,
    });
    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(1);
  });
  it("should not be able to my fetch recipe steps when id does not exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      recipeId: "0",
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
  });
  it("should not be able to my fetch recipe steps when user is not creator", async () => {
    const user1 = makeUser();
    await inMemoryUserRepository.create(user1);

    const user2 = makeUser();
    await inMemoryUserRepository.create(user2);

    const recipe = makeRecipe({
      createdBy: user1.id,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      createdBy: user1.id,
    });
    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      userId: user2.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryRecipeRepository.items).toHaveLength(1);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
  it("should not be able to fetch steps when recipe is not active", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const recipe = makeRecipe({
      createdBy: user.id,
      status: RecipeStatus.INACTIVE,
    });
    await inMemoryRecipeRepository.create(recipe);

    const recipeStep = makeRecipeStep({
      createdBy: user.id,
      recipeId: recipe.id,
    });
    await inMemoryRecipeStepRepository.create(recipeStep);

    const result = await sut.execute({
      recipeId: recipe.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InactiveError);
  });
});
