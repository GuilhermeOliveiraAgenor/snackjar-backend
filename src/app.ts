import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { recipeStepRoutes } from "./http/routes/recipe-step-routes";
import { errorHandler } from "./http/middleware/error-handler";
import { categoryRoutes } from "./http/routes/category-routes";
import { favoriteRecipeRoutes } from "./http/routes/favorite-recipe-routes";
import { recipeIngredientRoutes } from "./http/routes/recipe-ingredient-routes";
import { recipeRoutes } from "./http/routes/recipe-routes";
import { userRoutes } from "./http/routes/user-routes";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true, //cookie
  }),
);

app.use(categoryRoutes);
app.use(userRoutes);
app.use(favoriteRecipeRoutes);
app.use(recipeIngredientRoutes);
app.use(recipeRoutes);
app.use(recipeStepRoutes);

app.use(errorHandler);
