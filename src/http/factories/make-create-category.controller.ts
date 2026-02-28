import { CreateCategoryUseCase } from "../../application/use-cases/category/create-category";
import { RedisCache } from "../../infra/cache/redis-cache";
import { getPrismaClient } from "../../infra/prisma/client";
import { PrismaCategoryRepository } from "../../infra/repositories/prisma-category-repository";
import { CreateCategoryController } from "../controllers/category/create-category.controller";

export function makeCreateCategoryController() {
  const prisma = getPrismaClient();
  // create use case
  const categoryRepository = new PrismaCategoryRepository(prisma);
  const cache = new RedisCache();
  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository, cache);

  return new CreateCategoryController(createCategoryUseCase);
}
