import { describe, expect, it } from "vitest";
import { app } from "../../../app";
import request from "supertest";

describe("Create Category (E2E)", () => {
  it("should be able to register category", async () => {
    const response = await request(app).post("/categories").send({
      name: "Salgados",
      description: "Pratos salgados",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: "Salgados",
        description: "Pratos salgados",
      }),
    );
  });
});
