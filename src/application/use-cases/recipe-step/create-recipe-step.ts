import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { Either, failure, success } from "../../../core/either";
import { RecipeStep } from "../../../core/entities/recipeStep";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { InactiveError } from "../../errors/inactive-error";
import { InvalidFieldsError } from "../../errors/invalid-fields-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeRepository } from "../../repositories/recipe-repository";
import { RecipeStepRepository } from "../../repositories/recipe-step-repository";

interface CreateRecipeStepUseCaseRequest {
  recipeId: string;
  step: RecipeStep["step"];
  description: RecipeStep["description"];
  userId: string;
}

type CreateRecipeStepUseCaseResponse = Either<
  NotFoundError | NotAllowedError | AlreadyExistsError | InvalidFieldsError | InactiveError,
  {
    recipeStep: RecipeStep;
  }
>;

export class CreateRecipeStepUseCase {
  constructor(
    private recipeStepRepository: RecipeStepRepository,
    private recipeRepository: RecipeRepository,
  ) {}

  async execute({
    recipeId,
    step,
    description,
    userId,
  }: CreateRecipeStepUseCaseRequest): Promise<CreateRecipeStepUseCaseResponse> {
    // verify if recipeId exits
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

    const stepDuplicated = await this.recipeStepRepository.findByRecipeIdAndStep(
      recipe.id.toString(),
      step,
    );
    if (stepDuplicated) {
      return failure(new AlreadyExistsError("Step"));
    }

    if (step <= 0) {
      return failure(new InvalidFieldsError("Step"));
    }

    const recipeStep = RecipeStep.create({
      step,
      description,
      recipeId: recipe.id,
      createdBy: new UniqueEntityID(userId),
    });

    await this.recipeStepRepository.create(recipeStep);

    return success({
      recipeStep,
    });
  }
}
