import { Router } from "express";
import { makeAuthMiddleware } from "../factories/make-auth-middleware";
import { makeAuthenticateUserController } from "../factories/make-authenticate.controller";
import { makeCreateUserController } from "../factories/make-create-user.controller";
import { makeGetMeController } from "../factories/make-get-me.controller";
import { makeLogoutController } from "../factories/make-logout.controller";
import { makeAuthenticateGoogleUserController } from "../factories/make-authenticate-google-user.controller";

const userRoutes = Router();

userRoutes.post("/users", (req, res, next) => {
  return makeCreateUserController().handle(req, res, next);
});

userRoutes.post("/auth", (req, res, next) => {
  return makeAuthenticateUserController().handle(req, res, next);
});

userRoutes.get("/me", makeAuthMiddleware(), (req, res, next) => {
  return makeGetMeController().handle(req, res, next);
});

userRoutes.post("/logout", (req, res) => {
  return makeLogoutController().handle(req, res);
});

userRoutes.post("/auth/google", (req, res, next) => {
  return makeAuthenticateGoogleUserController().handle(req, res, next);
});

export { userRoutes };
