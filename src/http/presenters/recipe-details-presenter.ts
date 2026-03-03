import { Recipe } from "../../core/entities/recipe";
import { RecipeIngredient } from "../../core/entities/recipeIngredient";
import { RecipeStep } from "../../core/entities/recipeStep";
import { BasePresenter } from "./base/base-presenter";

export class RecipeDetailsPresenter {
  private static mapRecipe(raw: Recipe) {
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
  private static mapRecipeIngredient(raw: RecipeIngredient) {
    return {
      id: raw.id.toString(),
      ingredient: raw.ingredient,
      amount: raw.amount,
      unit: raw.unit,
      recipeId: raw.recipeId.toString(),
      createdAt: raw.createdAt,
      createdBy: raw.createdBy.toString(),
      updatedAt: raw.updatedAt,
      updatedBy: raw.updatedBy?.toString(),
    };
  }
  private static mapRecipeStep(raw: RecipeStep) {
    return {
      id: raw.id.toString(),
      step: raw.step,
      description: raw.description,
      recipeId: raw.recipeId.toString(),
      createdAt: raw.createdAt,
      createdBy: raw.createdBy.toString(),
      updatedAt: raw.updatedAt,
      updatedBy: raw.updatedBy?.toString(),
    };
  }
  static toHTTP(data: {
    recipe: Recipe;
    recipeIngredients: RecipeIngredient[];
    recipeSteps: RecipeStep[];
  }) {
    return BasePresenter.toResponse({
      recipe: this.mapRecipe(data.recipe),
      recipeIngredients: data.recipeIngredients.map((ingredient) =>
        this.mapRecipeIngredient(ingredient),
      ),
      recipeSteps: data.recipeSteps.map((step) => this.mapRecipeStep(step)),
    });
  }
}
