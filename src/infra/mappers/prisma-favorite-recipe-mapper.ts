import { Prisma, FavoriteRecipe as PrismaFavoriteRecipe } from "@prisma/client";
import { FavoriteRecipe } from "../../core/entities/favoriteRecipe";
import { UniqueEntityID } from "../../core/domain/value-objects/unique-entity-id";
import { PrismaRecipeMapper } from "./prisma-recipe-mapper";

type PrismaFavoriteWithRecipe = Prisma.FavoriteRecipeGetPayload<{
  include: { recipe: true };
}>;

export class PrismaFavoriteRecipeMapper {
  static toDomain(raw: PrismaFavoriteRecipe): FavoriteRecipe {
    return FavoriteRecipe.create(
      {
        recipeId: new UniqueEntityID(raw.recipeId),
        createdAt: raw.createdAt,
        createdBy: new UniqueEntityID(raw.createdBy),
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toDomainWithRecipe(raw: PrismaFavoriteWithRecipe) {
    return {
      id: raw.id,
      recipeId: raw.recipeId,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      recipe: raw.recipe ? PrismaRecipeMapper.toDomain(raw.recipe) : null,
    };
  }
  static toPersistency(raw: FavoriteRecipe): Prisma.FavoriteRecipeUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      recipeId: raw.recipeId.toString(),
      createdAt: raw.createdAt,
      createdBy: raw.createdBy.toString(),
    };
  }
}

export type FavoriteRecipeWithRecipe = ReturnType<
  typeof PrismaFavoriteRecipeMapper.toDomainWithRecipe
>;
