import { Either, failure, success } from "../../../core/either";
import { InactiveError } from "../../errors/inactive-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeIngredientRepository } from "../../repositories/recipe-ingredient-repository";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface DeleteRecipeIngredientUseCaseRequest {
  id: string;
  userId: string;
}

type DeleteRecipeIngredientUseCaseResponse = Either<
  NotFoundError | NotAllowedError | InactiveError,
  null
>;

export class DeleteRecipeIngredientUseCase {
  constructor(
    private recipeIngredientRepository: RecipeIngredientRepository,
    private recipeRepository: RecipeRepository,
  ) {}
  async execute({
    id,
    userId,
  }: DeleteRecipeIngredientUseCaseRequest): Promise<DeleteRecipeIngredientUseCaseResponse> {
    // verify if recipe ingredient id exists
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

    if (recipe.status.toString() !== "ACTIVE") {
      return failure(new InactiveError("Recipe"));
    }

    await this.recipeIngredientRepository.delete(recipeIngredient);

    return success(null);
  }
}
