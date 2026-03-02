import { ICacheRepository } from "../../../core/cache/IRedisCache";
import { Either, success, failure } from "../../../core/either";
import { Category } from "../../../core/entities/category";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { CategoryRepository } from "../../repositories/category-repository";

// create request
interface EditCategoryUseCaseRequest {
  name?: Category["name"] | undefined;
  description?: Category["description"] | undefined;
  id: string;
}

// create response
type EditCategoryUseCaseResponse = Either<
  NotFoundError | AlreadyExistsError,
  { category: Category }
>;

export class EditCategoryUseCase {
  constructor(
    private categoryRepository: CategoryRepository,
    private cache: ICacheRepository,
  ) {}

  async execute({
    name,
    description,
    id,
  }: EditCategoryUseCaseRequest): Promise<EditCategoryUseCaseResponse> {
    const category = await this.categoryRepository.findById(id);

    // verify if exists category
    if (!category) {
      return failure(new NotFoundError("Category"));
    }

    if (name !== undefined) {
      const categoryName = await this.categoryRepository.findByName(name);
      if (categoryName && categoryName.id.toString() !== id) {
        return failure(new AlreadyExistsError("Category"));
      }
    }

    // update fields
    category.name = name ?? category.name;
    category.description = description ?? category.description;

    // pass to repository
    await this.categoryRepository.save(category);

    await this.cache.deletePattern("categories:*");

    return success({
      category,
    });
  }
}
