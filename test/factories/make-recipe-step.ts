import { faker } from "@faker-js/faker";
import { RecipeStep, RecipeStepProps } from "../../src/core/entities/recipeStep";
import { UniqueEntityID } from "../../src/core/domain/value-objects/unique-entity-id";
import { getPrismaClient } from "../../src/infra/prisma/client";
import { PrismaRecipeStepMapper } from "../../src/infra/mappers/prisma-recipe-step-mapper";

export function makeRecipeStep(override?: Partial<RecipeStepProps>) {
  return RecipeStep.create({
    step: faker.number.int(),
    description: faker.food.description(),
    recipeId: new UniqueEntityID(),
    createdBy: new UniqueEntityID(),
    ...override,
  });
}

export class RecipeStepFactory {
  private prisma = getPrismaClient();

  async makePrismaRecipeStep(data: Partial<RecipeStepProps> = {}): Promise<RecipeStep> {
    const recipeStep = makeRecipeStep(data);

    await this.prisma.recipeStep.create({
      data: PrismaRecipeStepMapper.toPersistency(recipeStep),
    });

    return recipeStep;
  }
}
