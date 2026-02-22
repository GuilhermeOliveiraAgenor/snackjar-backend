import { Either, failure, success } from "../../../core/either";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { FavoriteRecipeRepository } from "../../repositories/favorite-recipe-repository";

interface DeleteFavoriteRecipeUseCaseRequest {
  id: string;
  userId: string;
}

type DeleteFavoriteRecipeUseCaseResponse = Either<NotFoundError | NotAllowedError, null>;

export class DeleteFavoriteRecipeUseCase {
  constructor(private favoriteRecipeRepository: FavoriteRecipeRepository) {}

  async execute({
    id,
    userId,
  }: DeleteFavoriteRecipeUseCaseRequest): Promise<DeleteFavoriteRecipeUseCaseResponse> {
    const favoriteRecipe = await this.favoriteRecipeRepository.findById(id);
    if (!favoriteRecipe) {
      return failure(new NotFoundError("Favorite"));
    }

    if (favoriteRecipe.createdBy.toString() !== userId) {
      return failure(new NotAllowedError("User"));
    }

    await this.favoriteRecipeRepository.delete(favoriteRecipe);

    return success(null);
  }
}
