import {
  Recipe as PrismaRecipe,
  RecipeIngredient as PrismaRecipeIngredient,
  RecipeStep as PrismaRecipeStep,
  Category as PrismaCategory,
} from "@prisma/client";

import { PrismaRecipeMapper } from "./prisma-recipe-mapper";
import { PrismaRecipeIngredientMapper } from "./prisma-recipe-ingredient-mapper";
import { PrismaRecipeStepMapper } from "./prisma-recipe-step-mapper";

type PrismaRecipeDetails = PrismaRecipe & {
  category: PrismaCategory;
  recipeIngredient: PrismaRecipeIngredient[];
  recipeStep: PrismaRecipeStep[];
};

export class PrismaRecipeDetailsMapper {
  static toDomain(raw: PrismaRecipeDetails) {
    return {
      recipe: PrismaRecipeMapper.toDomain(raw),

      recipeIngredients: raw.recipeIngredient.map(PrismaRecipeIngredientMapper.toDomain),

      recipeSteps: raw.recipeStep.map(PrismaRecipeStepMapper.toDomain),
    };
  }
}
