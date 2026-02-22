import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { Either, failure, success } from "../../../core/either";
import { Recipe } from "../../../core/entities/recipe";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { InactiveError } from "../../errors/inactive-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface DeleteRecipeRequest {
  id: string;
  userId: string;
}

type DeleteRecipeResponse = Either<
  NotFoundError | NotAllowedError | InactiveError,
  {
    recipe: Recipe;
  }
>;

export class DeleteRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute({ id, userId }: DeleteRecipeRequest): Promise<DeleteRecipeResponse> {
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
    // inactive recipe
    recipe.inactivate();
    recipe.deletedBy = new UniqueEntityID(userId);

    await this.recipeRepository.save(recipe);
    return success({
      recipe,
    });
  }
}
