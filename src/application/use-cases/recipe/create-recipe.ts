import { Either, failure, success } from "../../../core/either";
import { Recipe } from "../../../core/entities/recipe";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeIngredientRepository } from "../../repositories/recipe-ingredient-repository";
import { RecipeRepository } from "../../repositories/recipe-repository";
import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { RecipeIngredient } from "../../../core/entities/recipeIngredient";
import { CategoryRepository } from "../../repositories/category-repository";
import { RecipeStep } from "../../../core/entities/recipeStep";
import { RecipeStepRepository } from "../../repositories/recipe-step-repository";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { InvalidFieldsError } from "../../errors/invalid-fields-error";
import { MeasurementUnit } from "../../../core/enum/measurement-unit";
import { RecipeStatus } from "../../../core/enum/recipe-status";

// create request
interface CreateRecipeUseCaseRequest {
  // recipe fields
  title: Recipe["title"];
  description: Recipe["description"];
  preparationTime: Recipe["preparationTime"];
  categoryId: string;
  userId: string;

  // recipe ingredient list
  recipeIngredient: {
    ingredient: string;
    amount: string;
    unit: MeasurementUnit;
  }[];

  // recipe step list
  recipeStep: {
    step: number;
    description: string;
  }[];
}

type CreateRecipeUseCaseResponse = Either<
  NotFoundError | InvalidFieldsError | AlreadyExistsError | InvalidFieldsError,
  {
    recipe: Recipe;
  }
>;

export class CreateRecipeUseCase {
  constructor(
    private recipeRepository: RecipeRepository,
    private recipeIngredientRepository: RecipeIngredientRepository,
    private recipeStepRepository: RecipeStepRepository,
    private categoryRepository: CategoryRepository,
  ) {}

  async execute({
    title,
    description,
    preparationTime,
    categoryId,
    recipeIngredient,
    recipeStep,
    userId,
  }: CreateRecipeUseCaseRequest): Promise<CreateRecipeUseCaseResponse> {
    // verify if exists category

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      return failure(new NotFoundError("Category"));
    }

    // verify if lists are null
    if (recipeIngredient.length === 0 || recipeStep.length === 0) {
      return failure(new InvalidFieldsError("Elements"));
    }

    const alreadyExists = await this.recipeRepository.findByUserIdAndTitle(userId, title);
    if (alreadyExists) {
      return failure(new AlreadyExistsError("Recipe"));
    }

    if (preparationTime <= 0) {
      return failure(new InvalidFieldsError("PreparationTime"));
    }

    // create recipe
    const recipe = Recipe.create({
      title,
      description,
      preparationTime,
      status: RecipeStatus.ACTIVE,
      categoryId: new UniqueEntityID(categoryId),
      createdBy: new UniqueEntityID(userId),
    });

    // map recipe ingredient created
    const recipeIngredientToCreate = recipeIngredient.map((item) =>
      RecipeIngredient.create({
        ingredient: item.ingredient,
        amount: item.amount,
        unit: item.unit,
        recipeId: recipe.id,
        createdBy: new UniqueEntityID(recipe.createdBy.toString()),
      }),
    );

    // map recipe step created
    const recipeStepToCreate = recipeStep.map((item) =>
      RecipeStep.create({
        step: item.step,
        description: item.description,
        recipeId: recipe.id,
        createdBy: new UniqueEntityID(userId),
      }),
    );

    const steps = recipeStepToCreate.map((s) => s.step);

    const hasDuplicatedSteps = steps.some((value, index) => steps.indexOf(value) !== index);
    if (hasDuplicatedSteps) {
      return failure(new AlreadyExistsError("Step"));
    }

    const hasInvalidSteps = steps.some((step) => step <= 0);
    if (hasInvalidSteps) {
      return failure(new InvalidFieldsError("Step"));
    }

    await this.recipeRepository.create(recipe);
    await this.recipeIngredientRepository.createMany(recipeIngredientToCreate);
    await this.recipeStepRepository.createMany(recipeStepToCreate);

    return success({
      recipe,
    });
  }
}
