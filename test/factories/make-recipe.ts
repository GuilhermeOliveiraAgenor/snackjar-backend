import { faker } from "@faker-js/faker";
import { Recipe, RecipeProps } from "../../src/core/entities/recipe";
import { UniqueEntityID } from "../../src/core/domain/value-objects/unique-entity-id";
import { RecipeStatus } from "../../src/core/enum/recipe-status";
import { getPrismaClient } from "../../src/infra/prisma/client";
import { PrismaRecipeMapper } from "../../src/infra/mappers/prisma-recipe-mapper";

export function makeRecipe(override?: Partial<RecipeProps>) {
  return Recipe.create({
    title: faker.internet.domainName(),
    description: faker.food.description(),
    preparationTime: 60,
    status: RecipeStatus.ACTIVE,
    categoryId: new UniqueEntityID(),
    createdBy: new UniqueEntityID(),
    ...override,
  });
}

export class RecipeFactory {
  private prisma = getPrismaClient();

  async makePrismaRecipe(data: Partial<RecipeProps> = {}): Promise<Recipe> {
    const recipe = makeRecipe(data);

    await this.prisma.recipe.create({
      data: PrismaRecipeMapper.toPersistency(recipe),
    });

    return recipe;
  }
}
