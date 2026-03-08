import { RecipeDetailsRepository } from "../../src/application/repositories/recipe-details-repository";
import { RecipeIngredientRepository } from "../../src/application/repositories/recipe-ingredient-repository";
import { RecipeRepository } from "../../src/application/repositories/recipe-repository";
import { RecipeStepRepository } from "../../src/application/repositories/recipe-step-repository";
import { Recipe } from "../../src/core/entities/recipe";
import { RecipeIngredient } from "../../src/core/entities/recipeIngredient";
import { RecipeStep } from "../../src/core/entities/recipeStep";

export class InMemoryRecipeDetailsRepository implements RecipeDetailsRepository {
  constructor(
    private recipeRepository: RecipeRepository,
    private recipeIngredientRepository: RecipeIngredientRepository,
    private recipeStepRepository: RecipeStepRepository,
  ) {}
  async getDetailsByRecipeId(recipeId: string): Promise<{
    recipe: Recipe;
    recipeSteps: RecipeStep[];
    recipeIngredients: RecipeIngredient[];
  } | null> {
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) return null;

    const ingredients = await this.recipeIngredientRepository.findByRecipeId(recipeId);
    const steps = await this.recipeStepRepository.findByRecipeId(recipeId);

    return {
      recipe,
      ingredients,
      steps,
    };
  }
}
