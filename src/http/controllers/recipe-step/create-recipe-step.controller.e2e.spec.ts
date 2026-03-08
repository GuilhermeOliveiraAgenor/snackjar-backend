import { beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../../app";

import { UserFactory } from "../../../../test/factories/make-user";
import { CategoryFactory } from "../../../../test/factories/make-category";
import { RecipeFactory } from "../../../../test/factories/make-recipe";

let userFactory: UserFactory;
let categoryFactory: CategoryFactory;
let recipeFactory: RecipeFactory;

describe("Create Recipe Step (E2E)", () => {
  beforeEach(() => {
    userFactory = new UserFactory();
    categoryFactory = new CategoryFactory();
    recipeFactory = new RecipeFactory();
  });

  it("should be able to create recipe step", async () => {
    const user = await userFactory.makePrismaUser();
    const category = await categoryFactory.makePrismaCategory();

    const auth = await request(app).post("/auth").send({
      email: user.email,
      password: "123456",
    });

    const recipe = await recipeFactory.makePrismaRecipe({
      categoryId: category.id,
      createdBy: user.id,
    });

    const response = await request(app)
      .post(`/recipes/steps/${recipe.id}`)
      .set("Cookie", auth.headers["set-cookie"]?.[0] ?? "")
      .send({
        step: 2,
        description: "Jogue a farinha na bandeja",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        recipeId: recipe.id.toString(),
        step: 2,
        description: "Jogue a farinha na bandeja",
      }),
    );
  });
});
