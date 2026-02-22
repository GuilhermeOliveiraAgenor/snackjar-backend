import { Either, failure, success } from "../../../core/either";
import { RecipeIngredient } from "../../../core/entities/recipeIngredient";
import { PaginationMeta } from "../../../http/presenters/base/pagination-meta";
import { InactiveError } from "../../errors/inactive-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeIngredientRepository } from "../../repositories/recipe-ingredient-repository";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface FetchIngredientsByRecipeRequest {
  recipeId: string;
  userId: string;
  page?: number;
  perPage?: number;
}

type FetchIngredientsByRecipeResponse = Either<
  NotFoundError | NotAllowedError | InactiveError,
  { recipeIngredients: RecipeIngredient[]; meta: PaginationMeta }
>;

export class FetchIngredientsByRecipeUseCase {
  constructor(
    private recipeIngredientRepository: RecipeIngredientRepository,
    private recipeRepository: RecipeRepository,
  ) {}
  async execute({
    recipeId,
    userId,
    page = 1,
    perPage = 10,
  }: FetchIngredientsByRecipeRequest): Promise<FetchIngredientsByRecipeResponse> {
    // verify if exists recipe id
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

    const result = await this.recipeIngredientRepository.findManyByRecipeId(
      recipe.id.toString(),
      page,
      perPage,
    );

    const meta: PaginationMeta = {
      page,
      per_page: perPage,
      total_count: result.totalCount,
    };

    return success({
      recipeIngredients: result.recipeIngredients,
      meta,
    });
  }
}
