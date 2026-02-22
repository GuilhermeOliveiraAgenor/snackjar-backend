import { Either, failure, success } from "../../../core/either";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeStepRepository } from "../../repositories/recipe-step-repository";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { RecipeRepository } from "../../repositories/recipe-repository";
import { InactiveError } from "../../errors/inactive-error";
import { RecipeStatus } from "../../../core/enum/recipe-status";

interface DeleteRecipeStepUseCaseRequest {
  id: string;
  userId: string;
}

type DeleteRecipeStepUseCaseResponse = Either<
  NotFoundError | NotAllowedError | InactiveError,
  null
>;

export class DeleteRecipeStepUseCase {
  constructor(
    private recipeStepRepository: RecipeStepRepository,
    private recipeRepository: RecipeRepository,
  ) {}
  async execute({
    id,
    userId,
  }: DeleteRecipeStepUseCaseRequest): Promise<DeleteRecipeStepUseCaseResponse> {
    const recipeStep = await this.recipeStepRepository.findById(id);
    if (!recipeStep) {
      return failure(new NotFoundError("Step"));
    }

    if (recipeStep.createdBy.toString() != userId) {
      return failure(new NotAllowedError("User"));
    }

    const recipe = await this.recipeRepository.findById(recipeStep.recipeId.toString());

    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe?.status.toString() !== RecipeStatus.ACTIVE) {
      return failure(new InactiveError("Recipe"));
    }
    await this.recipeStepRepository.delete(recipeStep);

    return success(null);
  }
}
