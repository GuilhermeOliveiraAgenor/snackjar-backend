import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "../../src/core/domain/value-objects/unique-entity-id";
import { RecipeIngredient, RecipeIngredientProps } from "../../src/core/entities/recipeIngredient";
import { getPrismaClient } from "../../src/infra/prisma/client";
import { PrismaRecipeIngredientMapper } from "../../src/infra/mappers/prisma-recipe-ingredient-mapper";

export function makeRecipeIngredient(override?: Partial<RecipeIngredientProps>) {
  return RecipeIngredient.create({
    ingredient: faker.food.ingredient(),
    amount: faker.animal.bear(),
    unit: faker.animal.bird(),
    recipeId: new UniqueEntityID(),
    createdBy: new UniqueEntityID(),
    ...override,
  });
}

export class RecipeIngredientFactory {
  private prisma = getPrismaClient();

  async makePrismaRecipeIngredient(
    data: Partial<RecipeIngredientProps> = {},
  ): Promise<RecipeIngredient> {
    const recipeIngredient = makeRecipeIngredient(data);

    await this.prisma.recipeIngredient.create({
      data: PrismaRecipeIngredientMapper.toPersistency(recipeIngredient),
    });

    return recipeIngredient;
  }
}
