import { describe, beforeEach, it, expect } from "vitest";
import { InMemoryRecipeRepository } from "../../../../test/repositories/in-memory-recipe-repository";
import { CreateRecipeUseCase } from "./create-recipe";
import { InMemoryRecipeIngredientRepository } from "../../../../test/repositories/in-memory-recipe-ingredient";
import { Category } from "../../../core/entities/category";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { InMemoryRecipeStepRepository } from "../../../../test/repositories/in-memory-recipe-step";
import { makeCategory } from "../../../../test/factories/make-category";
import { InMemoryUserRepository } from "../../../../test/repositories/in-memory-user-repository";
import { makeUser } from "../../../../test/factories/make-user";
import { makeRecipe } from "../../../../test/factories/make-recipe";
import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { MeasurementUnit } from "../../../core/enum/measurement-unit";
import { InMemoryCategoryRepository } from "../../../../test/repositories/in-memory-category-repository";
import { InvalidFieldsError } from "../../errors/invalid-fields-error";

let inMemoryRecipeRepository: InMemoryRecipeRepository;
let inMemoryRecipeIngredientRepository: InMemoryRecipeIngredientRepository;
let inMemoryRecipeStepRepository: InMemoryRecipeStepRepository;
let inMemoryCategoryRepository: InMemoryCategoryRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: CreateRecipeUseCase;

describe("Create Recipe Use Case", () => {
  beforeEach(() => {
    inMemoryRecipeRepository = new InMemoryRecipeRepository();
    inMemoryRecipeIngredientRepository = new InMemoryRecipeIngredientRepository();
    inMemoryRecipeStepRepository = new InMemoryRecipeStepRepository();
    inMemoryCategoryRepository = new InMemoryCategoryRepository();
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new CreateRecipeUseCase(
      inMemoryRecipeRepository,
      inMemoryRecipeIngredientRepository,
      inMemoryRecipeStepRepository,
      inMemoryCategoryRepository,
    );
  });

  it("should be able to create a recipe", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    const result = await sut.execute({
      title: "Bolo de Cenoura",
      description: "Receita de bolo de cenoura",
      preparationTime: 60,
      categoryId: category.id.toString(),
      userId: user.id.toString(),

      recipeIngredient: [
        {
          ingredient: "Açucar",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
        {
          ingredient: "Farinha",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
      ],

      recipeStep: [
        {
          step: 1,
          description: "Jogue o açucar em um pote",
        },
        {
          step: 2,
          description: "Jogue a farinha em um pote",
        },
      ],
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeIngredientRepository.items).toHaveLength(2);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(2);
    if (result.isSuccess()) {
      expect(result.value.recipe).toMatchObject({
        title: "Bolo de Cenoura",
        description: "Receita de bolo de cenoura",
      });
    }

    expect(inMemoryRecipeIngredientRepository.items).toMatchObject([
      {
        ingredient: "Açucar",
        amount: "1",
        unit: "KG",
      },
      {
        ingredient: "Farinha",
        amount: "1",
        unit: "KG",
      },
    ]);
    expect(inMemoryRecipeStepRepository.items).toMatchObject([
      {
        step: 1,
        description: "Jogue o açucar em um pote",
      },
      {
        step: 2,
        description: "Jogue a farinha em um pote",
      },
    ]);
  });
  it("should be able to create a recipe with minimum data", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = Category.create({
      name: "Salgados",
      description: "Pratos salgados",
    });

    await inMemoryCategoryRepository.create(category);

    const result = await sut.execute({
      title: "Bolo de Laranja",
      description: "Receita de bolo de laranja",
      preparationTime: 60,
      categoryId: category.id.toString(),
      userId: user.id.toString(),

      recipeIngredient: [
        {
          ingredient: "Açucar",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
      ],

      recipeStep: [
        {
          step: 1,
          description: "Jogue o açucar em um pote",
        },
      ],
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryRecipeIngredientRepository.items).toHaveLength(1);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(1);
    if (result.isSuccess()) {
      expect(result.value.recipe).toMatchObject({
        title: "Bolo de Laranja",
        description: "Receita de bolo de laranja",
      });
    }
  });
  it("should not be able to create a recipe when title already exists", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = Category.create({
      name: "Salgados",
      description: "Pratos salgados",
    });

    await inMemoryCategoryRepository.create(category);

    const recipe = makeRecipe({
      title: "Bolo de Laranja",
      createdBy: new UniqueEntityID(user.id.toString()),
      categoryId: category.id,
    });

    await inMemoryRecipeRepository.create(recipe);

    const result = await sut.execute({
      // create recipe
      title: "Bolo de Laranja",
      description: "Receita de bolo de laranja",
      preparationTime: 60,
      categoryId: category.id.toString(),
      userId: user.id.toString(),

      recipeIngredient: [
        {
          ingredient: "Açucar",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
      ],

      recipeStep: [
        {
          step: 1,
          description: "Jogue o açucar em um pote",
        },
      ],
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
    expect(inMemoryRecipeRepository.items).toHaveLength(1);
  });
  it("should not be able to create a recipe when category does not exist", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      // create recipe
      title: "Bolo de Laranja",
      description: "Receita de bolo de laranja",
      preparationTime: 60,
      categoryId: "0",
      userId: user.id.toString(),

      recipeIngredient: [
        {
          ingredient: "Açucar",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
      ],

      recipeStep: [
        {
          step: 1,
          description: "Jogue o açucar em um pote",
        },
      ],
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect(inMemoryRecipeRepository.items).toHaveLength(0);
  });
  it("should not be able to create a recipe without ingredients", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = Category.create({
      name: "Salgados",
      description: "Pratos salgados",
    });

    await inMemoryCategoryRepository.create(category);

    const result = await sut.execute({
      title: "Bolo de Laranja",
      description: "Receita de bolo de laranja",
      preparationTime: 60,
      categoryId: category.id.toString(),
      userId: user.id.toString(),

      recipeIngredient: [],

      recipeStep: [
        {
          step: 1,
          description: "Jogue a farinha no pote",
        },
      ],
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidFieldsError);
    expect(inMemoryRecipeRepository.items).toHaveLength(0);
  });
  it("should not be able to create a recipe without steps", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = Category.create({
      name: "Salgados",
      description: "Pratos salgados",
    });

    await inMemoryCategoryRepository.create(category);

    const result = await sut.execute({
      title: "Bolo de Laranja",
      description: "Receita de bolo de laranja",
      preparationTime: 60,
      categoryId: category.id.toString(),
      userId: user.id.toString(),

      recipeIngredient: [
        {
          ingredient: "Farinha",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
      ],

      recipeStep: [],
    });

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidFieldsError);
    expect(inMemoryRecipeRepository.items).toHaveLength(0);
  });
  it("should not be able to create a recipe with duplicated steps", async () => {
    const user = makeUser();
    await inMemoryUserRepository.create(user);

    const category = makeCategory();
    await inMemoryCategoryRepository.create(category);

    const result = await sut.execute({
      title: "Bolo de Cenoura",
      description: "Receita de bolo de cenoura",
      preparationTime: 60,
      categoryId: category.id.toString(),
      userId: user.id.toString(),

      recipeIngredient: [
        {
          ingredient: "Açucar",
          amount: "1",
          unit: MeasurementUnit.KG,
        },
      ],

      recipeStep: [
        {
          step: 1,
          description: "Jogue o açucar em um pote",
        },
        {
          step: 1,
          description: "Jogue a farinha em um pote",
        },
      ],
    });

    expect(result.isError()).toBe(true);
    expect(inMemoryRecipeStepRepository.items).toHaveLength(0);
    expect(result.value).toBeInstanceOf(AlreadyExistsError);
  });
});
