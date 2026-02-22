import { UniqueEntityID } from "../../../core/domain/value-objects/unique-entity-id";
import { Either, failure, success } from "../../../core/either";
import { FavoriteRecipe } from "../../../core/entities/favoriteRecipe";
import { RecipeStatus } from "../../../core/enum/recipe-status";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { InactiveError } from "../../errors/inactive-error";
import { NotAllowedError } from "../../errors/not-allowed-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { FavoriteRecipeRepository } from "../../repositories/favorite-recipe-repository";
import { RecipeRepository } from "../../repositories/recipe-repository";

interface CreateFavoriteRecipeUseCaseRequest {
  recipeId: string;
  userId: string;
}

type CreateFavoriteRecipeUseCaseResponse = Either<
  AlreadyExistsError | NotFoundError | InactiveError | NotAllowedError,
  {
    favoriteRecipe: FavoriteRecipe;
  }
>;

export class CreateFavoriteRecipeUseCase {
  constructor(
    private favoriteRecipeRepository: FavoriteRecipeRepository,
    private recipeRepository: RecipeRepository,
  ) {}
  async execute({
    recipeId,
    userId,
  }: CreateFavoriteRecipeUseCaseRequest): Promise<CreateFavoriteRecipeUseCaseResponse> {
    // verify if recipe id exists
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) {
      return failure(new NotFoundError("Recipe"));
    }

    if (recipe.createdBy.toString() != userId) {
      return failure(new NotAllowedError("User"));
    }

    if (recipe.status !== RecipeStatus.ACTIVE) {
      return failure(new InactiveError("Recipe"));
    }

    // verify if favorite recipe already exists
    const alreadyExists = await this.favoriteRecipeRepository.existsByUserAndRecipe(
      userId,
      recipeId,
    );
    if (alreadyExists) {
      return failure(new AlreadyExistsError("Favorite"));
    }

    const favoriteRecipe = FavoriteRecipe.create({
      recipeId: new UniqueEntityID(recipeId),
      createdBy: new UniqueEntityID(userId),
    });

    await this.favoriteRecipeRepository.create(favoriteRecipe);

    return success({
      favoriteRecipe,
    });
  }
}
