import { Either, success } from "../../../core/either";
import { PaginationMeta } from "../../../http/presenters/base/pagination-meta";
import { FavoriteRecipeWithRecipe } from "../../../infra/mappers/prisma-favorite-recipe-mapper";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { FavoriteRecipeRepository } from "../../repositories/favorite-recipe-repository";

interface FetchMyFavoriteRecipesRequest {
  userId: string;
  page?: number;
  perPage?: number;
}

type FetchMyFavoriteRecipesResponse = Either<
  NotFoundError,
  {
    favoriteRecipes: FavoriteRecipeWithRecipe[];
    meta: PaginationMeta;
  }
>;

export class FetchMyFavoriteRecipesUseCase {
  constructor(private favoriteRecipeRepository: FavoriteRecipeRepository) {}
  async execute({
    userId,
    page = 1,
    perPage = 10,
  }: FetchMyFavoriteRecipesRequest): Promise<FetchMyFavoriteRecipesResponse> {
    const result = await this.favoriteRecipeRepository.findManyByUserId(userId, page, perPage);

    const meta: PaginationMeta = {
      page,
      per_page: perPage,
      total_count: result.totalCount,
    };

    return success({
      favoriteRecipes: result.favoritesRecipes,
      meta,
    });
  }
}
