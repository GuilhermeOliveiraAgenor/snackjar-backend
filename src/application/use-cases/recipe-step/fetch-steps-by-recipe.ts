import { Either, failure, success } from "../../../core/either";
import { RecipeStep } from "../../../core/entities/recipeStep";
import { PaginationMeta } from "../../../http/presenters/base/pagination-meta";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeRepository } from "../../repositories/recipe-repository";
import { RecipeStepRepository } from "../../repositories/recipe-step-repository";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { InactiveError } from "../../errors/inactive-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";

interface FetchStepsByRecipeUseCaseRequest {
  recipeId: string;
  userId: string;
  page?: number;
  perPage?: number;
}
type FetchStepsByRecipeResponse = Either<
  NotFoundError | InactiveError | NotAllowedError,
  {
    recipeSteps: RecipeStep[];
    meta: PaginationMeta;
  }
>;

export class FetchStepsByRecipeUseCase {
  constructor(
    private recipeStepRepository: RecipeStepRepository,
    private recipeRepository: RecipeRepository,
  ) {}
  async execute({
    recipeId,
    userId,
    page = 1,
    perPage = 10,
  }: FetchStepsByRecipeUseCaseRequest): Promise<FetchStepsByRecipeResponse> {
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe.createdBy.toString() !== userId) {
      return failure(new NotAllowedError("User"));
    }

    if (recipe.status !== RecipeStatus.ACTIVE) {
      return failure(new InactiveError("Recipe"));
    }

    const result = await this.recipeStepRepository.findManyByRecipeId(
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
      recipeSteps: result.recipeSteps,
      meta,
    });
  }
}
