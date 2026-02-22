import { AuthenticateGoogleUserUseCase } from "../../application/use-cases/user/authenticate-google-user";
import { GoogleTokenVerifier } from "../../infra/auth/GoogleTokenVerifier";
import { JwtService } from "../../infra/auth/JwtService";
import { getPrismaClient } from "../../infra/prisma/client";
import { PrismaUserRepository } from "../../infra/repositories/prisma-user-repository";
import { AuthenticateGoogleUserController } from "../controllers/user/authenticate-google-user.controller";

export function makeAuthenticateGoogleUserController() {
  const prisma = getPrismaClient();

  const userRepository = new PrismaUserRepository(prisma);
  const googleVerifier = new GoogleTokenVerifier();
  const jwtService = new JwtService();

  const authenticateGoogleUserUseCase = new AuthenticateGoogleUserUseCase(userRepository);

  return new AuthenticateGoogleUserController(
    googleVerifier,
    authenticateGoogleUserUseCase,
    jwtService,
  );
}
