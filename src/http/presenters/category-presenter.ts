import { Category } from "../../core/entities/category";
import { BasePresenter } from "./base/base-presenter";

export class CategoryPresenter {
  private static map(raw: Category) {
    return {
      id: raw.id.toString(),
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toHTTP(category: Category | Category[]) {
    if (Array.isArray(category)) {
      return BasePresenter.toResponse(category.map((item) => this.map(item)));
    }

    return BasePresenter.toResponse(this.map(category));
  }
}
