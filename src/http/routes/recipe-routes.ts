import { Router } from "express";
import { makeAuthMiddleware } from "../factories/make-auth-middleware";
import { makeCreateRecipeController } from "../factories/make-create-recipe.controller";
import { makeDeleteRecipeController } from "../factories/make-delete-recipe.controller";
import { makeEditRecipeController } from "../factories/make-edit-recipe.controller";
import { makeFetchMyRecipesController } from "../factories/make-fetch-my-recipes.controller";
import { makeGetDetailsByRecipeIdController } from "../factories/make-get-details-by-recipe-id.controller";

const recipeRoutes = Router();

recipeRoutes.use(makeAuthMiddleware());

recipeRoutes.post("/recipes", (req, res, next) => {
  return makeCreateRecipeController().handle(req, res, next);
});

recipeRoutes.put("/recipes/:id", (req, res, next) => {
  return makeEditRecipeController().handle(req, res, next);
});

recipeRoutes.delete("/recipes/:id", (req, res, next) => {
  return makeDeleteRecipeController().handle(req, res, next);
});

recipeRoutes.get("/menu", (req, res, next) => {
  return makeFetchMyRecipesController().handle(req, res, next);
});

recipeRoutes.get("/recipes/details/:recipeId", (req, res, next) => {
  return makeGetDetailsByRecipeIdController().handle(req, res, next);
});

export { recipeRoutes };
