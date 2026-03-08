import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../app";
import { UserFactory } from "../../../../test/factories/make-user";

let userFactory: UserFactory;

describe("Authenticate User (E2E)", () => {
  beforeEach(() => {
    userFactory = new UserFactory();
  });
  it("should be able to authenticate user", async () => {
    const password = "123456";

    const user = await userFactory.makePrismaUser({
      password,
    });

    const response = await request(app).post("/auth").send({
      email: user.email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
