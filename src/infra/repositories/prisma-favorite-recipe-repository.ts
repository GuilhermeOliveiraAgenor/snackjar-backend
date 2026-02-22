import { PrismaClient } from "@prisma/client";
import { FavoriteRecipeRepository } from "../../application/repositories/favorite-recipe-repository";
import { FavoriteRecipe } from "../../core/entities/favoriteRecipe";
import {
  FavoriteRecipeWithRecipe,
  PrismaFavoriteRecipeMapper,
} from "../mappers/prisma-favorite-recipe-mapper";
import { RecipeStatus } from "../../core/enum/recipe-status";

export class PrismaFavoriteRecipeRepository implements FavoriteRecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async create(favoriteRecipe: FavoriteRecipe): Promise<void> {
    await this.prisma.favoriteRecipe.create({
      data: PrismaFavoriteRecipeMapper.toPersistency(favoriteRecipe),
    });
  }
  async delete(favoriteRecipe: FavoriteRecipe): Promise<void> {
    await this.prisma.favoriteRecipe.delete({
      where: {
        id: favoriteRecipe.id.toString(),
      },
    });
  }
  async findManyByUserId(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<{ favoritesRecipes: FavoriteRecipeWithRecipe[]; totalCount: number }> {
    const skip = (page - 1) * perPage;

    const where = {
      createdBy: userId,
      recipe: {
        status: RecipeStatus.ACTIVE,
        deletedAt: null,
      },
    };

    const [totalCount, favoriteRecipes] = await Promise.all([
      this.prisma.favoriteRecipe.count({ where }),
      this.prisma.favoriteRecipe.findMany({
        where,
        include: { recipe: true },
        skip,
        take: perPage,
      }),
    ]);
    return {
      favoritesRecipes: favoriteRecipes.map((raw) =>
        PrismaFavoriteRecipeMapper.toDomainWithRecipe(raw),
      ),
      totalCount,
    };
  }
  async existsByUserAndRecipe(userId: string, recipeId: string): Promise<boolean> {
    const result = await this.prisma.favoriteRecipe.findFirst({
      where: {
        createdBy: userId,
        recipeId,
      },
    });
    if (!result) return false;
    return true;
  }
  async findById(id: string): Promise<FavoriteRecipe | null> {
    const favoriteRecipe = await this.prisma.favoriteRecipe.findUnique({
      where: { id },
    });
    if (!favoriteRecipe) return null;
    return PrismaFavoriteRecipeMapper.toDomain(favoriteRecipe);
  }
}
