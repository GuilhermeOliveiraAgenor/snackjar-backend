import { Request, Response, NextFunction } from "express";
import { GoogleTokenVerifier } from "../../../infra/auth/GoogleTokenVerifier";
import { JwtService } from "../../../infra/auth/JwtService";
import { authCookieConfig } from "../../cookies/cookie-config";
import { AuthenticateGoogleUserUseCase } from "../../../application/use-cases/user/authenticate-google-user";

export class AuthenticateGoogleUserController {
  constructor(
    private googleVerifier: GoogleTokenVerifier,
    private authenticateGoogleUseCase: AuthenticateGoogleUserUseCase,
    private jwtService: JwtService,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      const googleUser = await this.googleVerifier.verify(token);

      const result = await this.authenticateGoogleUseCase.execute(googleUser);

      if (result.isError()) {
        throw result.value;
      }

      const userId = result.value.user.id.toString();
      const provider = result.value.user.provider;

      const accessToken = this.jwtService.sign(userId, provider);

      res.cookie("access_token", accessToken, authCookieConfig);

      return res.status(200).json({ userId, provider });
    } catch (error) {
      next(error);
    }
  }
}
