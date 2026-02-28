import { Category } from "../../core/entities/category";
import { BasePresenter } from "./base/base-presenter";
import { PaginationMeta } from "./base/pagination-meta";

export class CategoryPresenter {
  private static map(raw: Category) {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toHTTP(category: Category) {
    return BasePresenter.toResponse(this.map(category));
  }

  static toHTTPPaginated(categories: Category[], meta: PaginationMeta) {
    return BasePresenter.toPaginatedResponse(categories.map(CategoryPresenter.map), meta);
  }
}
