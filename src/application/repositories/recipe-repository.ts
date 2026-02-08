import { Recipe } from "../../core/entities/recipe";

export interface RecipeRepository {
  create(recipe: Recipe): Promise<void>;
  save(recipe: Recipe): Promise<void>;
  findManyByUserId(
    userId: string,
    page: number,
    perPage: number,
    title?: string,
  ): Promise<{ recipes: Recipe[]; totalCount: number }>;
  findByUserIdAndTitle(userId: string, title: string): Promise<Recipe | null>;
  findById(id: string): Promise<Recipe | null>;
}
