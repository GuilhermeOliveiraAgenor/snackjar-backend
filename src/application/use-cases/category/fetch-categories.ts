import { ICacheRepository } from "../../../core/cache/IRedisCache";
import { Either, success } from "../../../core/either";
import { Category } from "../../../core/entities/category";
import { CategoryRepository } from "../../repositories/category-repository";

type FetchCategoriesUseCaseResponse = Either<
  null,
  {
    categories: Category[];
  }
>;
export class FetchCategoriesUseCase {
  constructor(
    private categoryRepository: CategoryRepository,
    private cache: ICacheRepository, // repositorio redis
  ) {}
  async execute(): Promise<FetchCategoriesUseCaseResponse> {
    const cacheKey = "categories:all";

    const cached = await this.cache.get<{
      categories: Category[];
    }>(cacheKey);

    if (cached) {
      return success(cached);
    }

    const result = await this.categoryRepository.findMany();

    await this.cache.set(
      cacheKey,
      {
        categories: result.map((c: Category) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      },
      30,
    );

    return success({ categories: result });
  }
}
