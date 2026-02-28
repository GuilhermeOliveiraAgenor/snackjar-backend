import { FetchCategoriesUseCase } from "../../application/use-cases/category/fetch-categories";
import { RedisCache } from "../../infra/cache/redis-cache";
import { getPrismaClient } from "../../infra/prisma/client";
import { PrismaCategoryRepository } from "../../infra/repositories/prisma-category-repository";
import { FetchCategoriesController } from "../controllers/category/fetch-categories.controller";

export function makeFetchCategoriesController() {
  const prisma = getPrismaClient();

  const categoryRepository = new PrismaCategoryRepository(prisma);
  const cache = new RedisCache();

  const fetchCategoryUseCase = new FetchCategoriesUseCase(categoryRepository, cache);

  return new FetchCategoriesController(fetchCategoryUseCase);
}
