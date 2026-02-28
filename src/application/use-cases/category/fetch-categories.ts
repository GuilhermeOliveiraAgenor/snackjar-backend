import { Either, success } from "../../../core/either";
import { Category } from "../../../core/entities/category";
import { PaginationMeta } from "../../../http/presenters/base/pagination-meta";
import { RedisCache } from "../../../infra/cache/redis-cache";
import { CategoryRepository } from "../../repositories/category-repository";

type FetchCategoriesUseCaseResponse = Either<
  null,
  {
    categories: Category[];
    meta: PaginationMeta;
  }
>;
export class FetchCategoriesUseCase {
  constructor(
    private categoryRepository: CategoryRepository,
    private cache: RedisCache, // repositorio redis
  ) {}
  async execute({ page = 1, perPage = 10 }): Promise<FetchCategoriesUseCaseResponse> {
    // criar cache redis

    const cacheKey = `categories:${page}:${perPage}`;

    const cached = await this.cache.get<{
      categories: Category[];
      meta: PaginationMeta;
    }>(cacheKey);

    if (cached) {
      console.log("cache hit");
      return success(cached);
    }

    const result = await this.categoryRepository.findMany(page, perPage);

    const meta: PaginationMeta = {
      page,
      per_page: perPage,
      total_count: result.totalCount,
    };

    //setar o cache

    await this.cache.set(
      cacheKey,
      {
        categories: result.categories.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        meta,
      },
      900,
    );

    return success({ categories: result.categories, meta });
  }
}
