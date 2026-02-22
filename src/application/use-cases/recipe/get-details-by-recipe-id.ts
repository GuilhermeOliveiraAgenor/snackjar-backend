import { Either, failure, success } from "../../../core/either";
import { Recipe } from "../../../core/entities/recipe";
import { RecipeIngredient } from "../../../core/entities/recipeIngredient";
import { RecipeStep } from "../../../core/entities/recipeStep";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeDetailsRepository } from "../../repositories/recipe-details-repository";

interface GetDetailsByRecipeIdRequest {
  recipeId: string;
}

type GetDetailsByRecipeIdResponse = Either<
  NotFoundError,
  {
    recipe: Recipe;
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
  }
>;

export class GetDetailsByRecipeIdUseCase {
  constructor(private recipeDetailsRepository: RecipeDetailsRepository) {}
  async execute({ recipeId }: GetDetailsByRecipeIdRequest): Promise<GetDetailsByRecipeIdResponse> {
    const details = await this.recipeDetailsRepository.getDetailsByRecipeId(recipeId);
    if (!details) {
      return failure(new NotFoundError("Recipe"));
    }

    return success(details);
  }
}
