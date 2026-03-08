import { FavoriteRecipeProps, FavoriteRecipe } from "../../src/core/entities/favoriteRecipe";
import { UniqueEntityID } from "../../src/core/domain/value-objects/unique-entity-id";
import { getPrismaClient } from "../../src/infra/prisma/client";
import { PrismaFavoriteRecipeMapper } from "../../src/infra/mappers/prisma-favorite-recipe-mapper";

export function makeFavoriteRecipe(override?: Partial<FavoriteRecipeProps>) {
  return FavoriteRecipe.create({
    recipeId: new UniqueEntityID(),
    createdBy: new UniqueEntityID(),
    ...override,
  });
}

export class FavoriteRecipeFactory {
  private prisma = getPrismaClient();

  async makePrismaFavoriteRecipe(data: Partial<FavoriteRecipeProps> = {}): Promise<FavoriteRecipe> {
    const favoriteRecipe = makeFavoriteRecipe(data);

    await this.prisma.favoriteRecipe.create({
      data: PrismaFavoriteRecipeMapper.toPersistency(favoriteRecipe),
    });

    return favoriteRecipe;
  }
}
