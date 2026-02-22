import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { Either, failure, success } from "../../../core/either";
import { Recipe } from "../../../core/entities/recipe";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { InactiveError } from "../../errors/inactive-error";
import { InvalidFieldsError } from "../../errors/invalid-fields-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface EditRecipeUseCaseRequest {
  id: string;
  title?: Recipe["title"] | undefined;
  description?: Recipe["description"] | undefined;
  preparationTime?: Recipe["preparationTime"] | undefined;
  userId: string;
}

type EditRecipeUseCaseResponse = Either<
  NotFoundError | NotAllowedError | InactiveError | AlreadyExistsError | InvalidFieldsError,
  {
    recipe: Recipe;
  }
>;

export class EditRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}
  async execute({
    id,
    title,
    description,
    preparationTime,
    userId,
  }: EditRecipeUseCaseRequest): Promise<EditRecipeUseCaseResponse> {
    // verify if exists recipe
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe.status !== RecipeStatus.ACTIVE) {
      return failure(new InactiveError("Recipe"));
    }

    if (recipe.createdBy.toString() != userId) {
      return failure(new NotAllowedError("User"));
    }

    if (title !== undefined) {
      const alreadyExists = await this.recipeRepository.findByUserIdAndTitle(userId, title);

      if (alreadyExists && alreadyExists.id.toString() != id) {
        return failure(new AlreadyExistsError("Recipe"));
      }
    }

    if (preparationTime !== undefined && preparationTime <= 0) {
      return failure(new InvalidFieldsError("PreparationTime"));
    }

    recipe.title = title ?? recipe.title;
    recipe.description = description ?? recipe.description;
    recipe.preparationTime = preparationTime ?? recipe.preparationTime;
    recipe.updatedBy = new UniqueEntityID(userId);

    // pass to repository
    await this.recipeRepository.save(recipe);

    return success({
      recipe,
    });
  }
}
