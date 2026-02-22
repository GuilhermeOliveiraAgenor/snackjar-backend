import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { Either, failure, success } from "../../../core/either";
import { RecipeIngredient } from "../../../core/entities/recipeIngredient";
import { InactiveError } from "../../errors/inactive-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeIngredientRepository } from "../../repositories/recipe-ingredient-repository";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface CreateRecipeIngredientUseCaseRequest {
  ingredient: RecipeIngredient["ingredient"];
  amount: RecipeIngredient["amount"];
  unit: RecipeIngredient["unit"];
  recipeId: string;
  userId: string;
}

type CreateRecipeIngredientUseCaseResponse = Either<
  NotFoundError | NotAllowedError | InactiveError,
  { recipeIngredient: RecipeIngredient }
>;

export class CreateRecipeIngredientUseCase {
  constructor(
    private recipeIngredientRepository: RecipeIngredientRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  async execute({
    ingredient,
    amount,
    unit,
    recipeId,
    userId,
  }: CreateRecipeIngredientUseCaseRequest): Promise<CreateRecipeIngredientUseCaseResponse> {
    // verify if exists recipeId
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe.createdBy.toString() !== userId) {
      return failure(new NotAllowedError("User"));
    }

    if (recipe.status !== "ACTIVE") {
      return failure(new InactiveError("Recipe"));
    }

    const recipeIngredient = RecipeIngredient.create({
      ingredient,
      amount,
      unit,
      recipeId: recipe.id,
      createdBy: new UniqueEntityID(userId),
    });

    await this.recipeIngredientRepository.create(recipeIngredient);

    return success({ recipeIngredient });
  }
}
