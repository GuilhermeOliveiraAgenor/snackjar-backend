import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { Either, failure, success } from "../../../core/either";
import { RecipeIngredient } from "../../../core/entities/recipeIngredient";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InactiveError } from "../../errors/inactive-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeIngredientRepository } from "../../repositories/recipe-ingredient-repository";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface EditRecipeIngredientUseCaseRequest {
  id: string;
  ingredient?: RecipeIngredient["ingredient"] | undefined;
  amount?: RecipeIngredient["amount"] | undefined;
  unit?: RecipeIngredient["unit"] | undefined;
  userId: string;
}

type EditRecipeIngredientUseCaseResponse = Either<
  NotFoundError | NotAllowedError | InactiveError,
  {
    recipeIngredient: RecipeIngredient;
  }
>;

export class EditRecipeIngredientUseCase {
  constructor(
    private recipeIngredientRepository: RecipeIngredientRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  async execute({
    id,
    ingredient,
    amount,
    unit,
    userId,
  }: EditRecipeIngredientUseCaseRequest): Promise<EditRecipeIngredientUseCaseResponse> {
    // verify if recipe exists
    const recipeIngredient = await this.recipeIngredientRepository.findById(id);
    if (!recipeIngredient) {
      return failure(new NotFoundError("Ingredient"));
    }

    if (recipeIngredient.createdBy.toString() != userId) {
      return failure(new NotAllowedError("User"));
    }

    const recipe = await this.recipeRepository.findById(recipeIngredient.recipeId.toString());

    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe.status !== RecipeStatus.ACTIVE) {
      return failure(new InactiveError("Recipe"));
    }

    recipeIngredient.ingredient = ingredient ?? recipeIngredient.ingredient;
    recipeIngredient.amount = amount ?? recipeIngredient.amount;
    recipeIngredient.unit = unit ?? recipeIngredient.unit;
    recipeIngredient.updatedBy = new UniqueEntityID(userId);

    await this.recipeIngredientRepository.save(recipeIngredient);

    return success({
      recipeIngredient,
    });
  }
}
