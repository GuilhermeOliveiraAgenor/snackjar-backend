import { FavoriteRecipe } from "../../core/entities/favoriteRecipe";
import { FavoriteRecipeWithRecipe } from "../../infra/mappers/prisma-favorite-recipe-mapper";
import { BasePresenter } from "./base/base-presenter";
import { PaginationMeta } from "./base/pagination-meta";
import { RecipePresenter } from "./recipe-presenter";

export class FavoriteRecipePresenter {
  private static map(raw: FavoriteRecipe) {
    return {
      id: raw.id.toString(),
      recipeId: raw.recipeId.toString(),
      createdBy: raw.createdBy.toString(),
      createdAt: raw.createdAt,
    };
  }
  static toHTTP(favoriteRecipe: FavoriteRecipe) {
    return BasePresenter.toResponse(this.map(favoriteRecipe));
  }

  static mapWithRecipe(raw: FavoriteRecipeWithRecipe) {
    return {
      id: raw.id.toString(),
      recipeId: raw.recipeId.toString(),
      createdBy: raw.createdBy.toString(),
      createdAt: raw.createdAt,
      recipe: raw.recipe ? RecipePresenter.map(raw.recipe) : null,
    };
  }

  static toHTTPPaginated(favoriteRecipes: FavoriteRecipeWithRecipe[], meta: PaginationMeta) {
    return BasePresenter.toPaginatedResponse(
      favoriteRecipes.map(FavoriteRecipePresenter.mapWithRecipe),
      meta,
    );
  }
}
