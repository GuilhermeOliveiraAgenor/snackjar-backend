import { Category } from "../../../core/entities/category";
import { CategoryRepository } from "../../repositories/category-repository";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { Either, failure, success } from "../../../core/either";
import { ICacheRepository } from "../../../core/cache/IRedisCache";
interface CreateCategoryUseCaseRequest {
  // create data request
  name: Category["name"];
  description: Category["description"];
}

// create response
type CreateCategoryUseCaseResponse = Either<
  AlreadyExistsError,
  {
    category: Category;
  }
>;

export class CreateCategoryUseCase {
  constructor(
    private categoryRepository: CategoryRepository,
    private cache: ICacheRepository,
  ) {} // define repository

  async execute({
    name,
    description,
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    // verify if category already exists
    const categoryName = await this.categoryRepository.findByName(name);
    if (categoryName) {
      return failure(new AlreadyExistsError("Category"));
    }

    // create object
    const category = Category.create({
      name,
      description,
    });

    await this.categoryRepository.create(category); // pass to repository

    await this.cache.deletePattern("categories:*");

    return success({
      category,
    });
  }
}
