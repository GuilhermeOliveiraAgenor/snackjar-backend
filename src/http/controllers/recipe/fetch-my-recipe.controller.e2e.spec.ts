import { beforeEach, describe, it, expect } from "vitest";
import { RecipeFactory } from "../../../../test/factories/make-recipe";
import { UserFactory } from "../../../../test/factories/make-user";
import request from "supertest";
import { app } from "../../../app";
import { CategoryFactory } from "../../../../test/factories/make-category";

let userFactory: UserFactory;
let recipeFactory: RecipeFactory;
let categoryFactory: CategoryFactory;

describe("Fetch My Recipes (E2E)", () => {
  beforeEach(() => {
    userFactory = new UserFactory();
    recipeFactory = new RecipeFactory();
    categoryFactory = new CategoryFactory();
  });
  it("should be able to fetch my recipes", async () => {
    const user = await userFactory.makePrismaUser();
    const category = await categoryFactory.makePrismaCategory();

    const auth = await request(app).post("/auth").send({ email: user.email, password: "123456" });

    await recipeFactory.makePrismaRecipe({
      categoryId: category.id,
      createdBy: user.id,
    });

    const response = await request(app)
      .get("/menu")
      .set("Cookie", auth.headers["set-cookie"]?.[0] ?? "");

    expect(response.status).toBe(200);
  });
});
