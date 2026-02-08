import { RecipeRepository } from "../../src/application/repositories/recipe-repository";
import { Recipe } from "../../src/core/entities/recipe";

export class InMemoryRecipeRepository implements RecipeRepository {
  public items: Recipe[] = [];

  async create(recipe: Recipe): Promise<void> {
    this.items.push(recipe);
  }
  async save(recipe: Recipe): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === recipe.id);
    this.items[itemIndex] = recipe;
  }
  async findManyByUserId(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<{ recipes: Recipe[]; totalCount: number }> {
    const userRecipes = this.items.filter((item) => item.createdBy.toString() === userId);
    const totalCount = this.items.length;

    const recipes = userRecipes.slice((page - 1) * perPage, page * perPage);

    return {
      recipes,
      totalCount,
    };
  }
  async findById(id: string): Promise<Recipe | null> {
    const recipe = this.items.find((item) => item.id.toString() === id);
    if (!recipe) {
      return null;
    }
    return recipe;
  }
  async findByUserIdAndTitle(userId: string, title: string): Promise<Recipe | null> {
    const recipe = this.items.find(
      (item) => item.title === title && item.createdBy.toString() == userId.toString(),
    );
    if (!recipe) {
      return null;
    }
    return recipe;
  }
}
