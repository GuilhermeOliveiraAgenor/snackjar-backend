import { Request, Response, NextFunction } from "express";
import { FetchMyRecipesUseCase } from "../../../application/use-cases/recipe/fetch-my-recipes";
import { RecipePresenter } from "../../presenters/recipe-presenter";
import z from "zod";

const fetchMyRecipeSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  search: z
    .string()
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export class FetchMyRecipesController {
  constructor(private readonly fetchMyRecipesUseCase: FetchMyRecipesUseCase) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      const { page, search } = fetchMyRecipeSchema.parse(req.query);

      const result = await this.fetchMyRecipesUseCase.execute({
        userId,
        page,
        ...(search && { search }),
      });

      if (result.isError()) {
        throw result.value;
      }

      return res
        .status(200)
        .json(RecipePresenter.toHTTPPaginated(result.value.recipes, result.value.meta));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
