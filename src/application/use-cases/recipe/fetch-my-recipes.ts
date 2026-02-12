import { Either, failure, success } from "../../../core/either";
import { Recipe } from "../../../core/entities/recipe";
import { PaginationMeta } from "../../../http/presenters/base/pagination-meta";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { RecipeRepository } from "../../repositories/recipe-repository";
import { UserRepository } from "../../repositories/user-repository";

interface FetchMyRecipesUseCaseRequest {
  userId: string;
  page?: number;
  perPage?: number;
  title?: string;
  categoryId?: string;
}

type FetchMyRecipesUseCaseResponse = Either<
  NotFoundError,
  {
    recipes: Recipe[];
    meta: PaginationMeta;
  }
>;

export class FetchMyRecipesUseCase {
  constructor(
    private recipeRepository: RecipeRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    userId,
    title,
    page = 1,
    perPage = 10,
    categoryId,
  }: FetchMyRecipesUseCaseRequest): Promise<FetchMyRecipesUseCaseResponse> {
    // verify if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return failure(new NotFoundError("user"));
    }

    const result = await this.recipeRepository.findManyByUserId(
      user.id.toString(),
      page,
      perPage,
      title,
      categoryId,
    );

    const meta: PaginationMeta = {
      page,
      per_page: perPage,
      total_count: result.totalCount,
    };

    return success({
      recipes: result.recipes,
      meta,
    });
  }
}
