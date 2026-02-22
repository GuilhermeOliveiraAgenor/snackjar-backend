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

interface EditRecipeStepUseCaseRequest {
  id: string;
  step?: RecipeStep["step"] | undefined;
  description?: RecipeStep["description"] | undefined;
  userId: string;
}

type EditRecipeStepUseCaseResponse = Either<
  NotFoundError | NotAllowedError | AlreadyExistsError | InvalidFieldsError | InactiveError,
  {
    recipeStep: RecipeStep;
  }
>;

export class EditRecipeStepUseCase {
  constructor(
    private recipeStepRepository: RecipeStepRepository,
    private recipeRepository: RecipeRepository,
  ) {}
  async execute({
    id,
    step,
    description,
    userId,
  }: EditRecipeStepUseCaseRequest): Promise<EditRecipeStepUseCaseResponse> {
    const recipeStep = await this.recipeStepRepository.findById(id);
    if (!recipeStep) {
      return failure(new NotFoundError("Step"));
    }

    if (recipeStep.createdBy.toString() != userId) {
      return failure(new NotAllowedError("User"));
    }

    if (step !== undefined) {
      if (step <= 0) {
        return failure(new InvalidFieldsError("Step"));
      }
      const stepDuplicated = await this.recipeStepRepository.findByRecipeIdAndStep(
        recipeStep.recipeId.toString(),
        step,
      );
      if (stepDuplicated && stepDuplicated.id.toString() !== id) {
        return failure(new AlreadyExistsError("Step"));
      }
    }

    const recipe = await this.recipeRepository.findById(recipeStep.recipeId.toString());

    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe.status !== "ACTIVE") {
      return failure(new InactiveError("Recipe"));
    }

    recipeStep.step = step ?? recipeStep.step;
    recipeStep.description = description ?? recipeStep.description;
    recipeStep.updatedBy = new UniqueEntityID(userId);

    await this.recipeStepRepository.save(recipeStep);

    return success({
      recipeStep,
    });
  }
}
