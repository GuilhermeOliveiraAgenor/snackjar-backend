import { Recipe } from "../../core/entities/recipe";
import { BasePresenter } from "./base/base-presenter";
import { PaginationMeta } from "./base/pagination-meta";

export class RecipePresenter {
  static map(raw: Recipe) {
    return {
      id: raw.id.toString(),
      title: raw.title,
      description: raw.description,
      preparationTime: raw.preparationTime,
      status: raw.status,
      categoryId: raw.categoryId.toString(),
      createdAt: raw.createdAt,
      createdBy: raw.createdBy.toString(),
      updatedAt: raw.updatedAt,
      updatedBy: raw.updatedBy?.toString(),
      deletedAt: raw.deletedAt,
      deletedBy: raw.deletedBy?.toString(),
    };
  }

  static toHTTP(recipe: Recipe) {
    return BasePresenter.toResponse(this.map(recipe));
  }

  static toHTTPPaginated(recipes: Recipe[], meta: PaginationMeta) {
    return BasePresenter.toPaginatedResponse(recipes.map(RecipePresenter.map), meta);
  }
}
