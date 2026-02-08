import { QueryMode, PrismaClient } from "@prisma/client";
import { RecipeRepository } from "../../application/repositories/recipe-repository";
import { Recipe } from "../../core/entities/recipe";
import { PrismaRecipeMapper } from "../mappers/prisma-recipe-mapper";
import { RecipeStatus } from "../../core/enum/recipe-status";

export class PrismaRecipeRepository implements RecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(recipe: Recipe): Promise<void> {
    await this.prisma.recipe.create({
      data: PrismaRecipeMapper.toPersistency(recipe),
    });
  }
  async save(recipe: Recipe): Promise<void> {
    await this.prisma.recipe.update({
      where: { id: recipe.id.toString() },
      data: PrismaRecipeMapper.toPersistency(recipe),
    });
  }
  async findManyByUserId(
    userId: string,
    page: number,
    perPage: number,
    title: string,
  ): Promise<{ recipes: Recipe[]; totalCount: number }> {
    const skip = (page - 1) * perPage;

    const where = {
      createdBy: userId,
      status: RecipeStatus.ACTIVE,
      deletedAt: null,

      ...(title && {
        title: { contains: title, mode: QueryMode.insensitive },
      }),
    };

    const [totalCount, recipes] = await Promise.all([
      this.prisma.recipe.count({ where }),
      this.prisma.recipe.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
    ]);

    return {
      recipes: recipes.map((raw) => PrismaRecipeMapper.toDomain(raw)),
      totalCount,
    };
  }
  async findById(id: string): Promise<Recipe | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });
    if (!recipe) return null;
    return PrismaRecipeMapper.toDomain(recipe);
  }

  async findByUserIdAndTitle(userId: string, title: string): Promise<Recipe | null> {
    const recipe = await this.prisma.recipe.findFirst({
      where: {
        createdBy: userId,
        title: {
          equals: title,
          mode: "insensitive",
        },
        status: "ACTIVE",
        deletedAt: null,
      },
    });
    if (!recipe) return null;
    return PrismaRecipeMapper.toDomain(recipe);
  }
}
