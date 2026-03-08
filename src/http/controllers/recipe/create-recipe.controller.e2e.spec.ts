import { describe, beforeEach, it, expect } from "vitest";
import { CategoryFactory } from "../../../../test/factories/make-category";
import { UserFactory } from "../../../../test/factories/make-user";
import request from "supertest";
import { app } from "../../../app";

let userFactory: UserFactory;
let categoryFactory: CategoryFactory;

describe("Create Recipe (E2E)", async () => {
  beforeEach(() => {
    userFactory = new UserFactory();
    categoryFactory = new CategoryFactory();
  });
  it("should be able to create recipe", async () => {
    const user = await userFactory.makePrismaUser();
    const category = await categoryFactory.makePrismaCategory();

    const auth = await request(app).post("/auth").send({ email: user.email, password: "123456" });

    const response = await request(app)
      .post("/recipes")
      .set("Cookie", auth.headers["set-cookie"]?.[0] ?? "")
      .send({
        title: "Bolo de Chocolate",
        description: "Bolo simples de chocolate",
        preparationTime: 30,
        categoryId: category.id.toString(),

        recipeIngredient: [
          {
            ingredient: "Farinha",
            amount: "200",
            unit: "g",
          },
        ],

        recipeStep: [
          {
            step: 1,
            description: "Misture todos os ingredientes",
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        title: "Bolo de Chocolate",
        categoryId: category.id.toString(),
      }),
    );
  });
});
