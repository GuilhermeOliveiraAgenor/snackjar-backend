import { FavoriteRecipe } from "../../core/entities/favoriteRecipe";
import { FavoriteRecipeWithRecipe } from "../../infra/mappers/prisma-favorite-recipe-mapper";

export interface FavoriteRecipeRepository {
  create(favoriteRecipe: FavoriteRecipe): Promise<void>;
  delete(favoriteRecipe: FavoriteRecipe): Promise<void>;
  findManyByUserId(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<{ favoritesRecipes: FavoriteRecipeWithRecipe[]; totalCount: number }>;
  existsByUserAndRecipe(userId: string, recipeId: string): Promise<boolean>;
  findById(id: string): Promise<FavoriteRecipe | null>;
}
