import { Recipe } from "../../core/entities/recipe";
import { RecipeIngredient } from "../../core/entities/recipeIngredient";
import { RecipeStep } from "../../core/entities/recipeStep";

export interface RecipeDetailsRepository {
  getDetailsByRecipeId(recipeId: string): Promise<{
    recipe: Recipe;
    recipeIngredients: RecipeIngredient[];
    recipeSteps: RecipeStep[];
  } | null>;
}
