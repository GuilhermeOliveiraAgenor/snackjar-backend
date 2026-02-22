import { Request, Response, NextFunction } from "express";
import { AuthenticateUserUseCase } from "../../../application/use-cases/user/authenticate-user";
import { JwtService } from "../../../infra/auth/JwtService";
import { z } from "zod";
import { authCookieConfig } from "../../cookies/cookie-config";

const authenticateSchema = z.object({
  email: z.string().min(10),
  password: z.string(),
});

export class AuthenticateUserController {
  constructor(
    private readonly authenticateUseCase: AuthenticateUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = authenticateSchema.parse(req.body);

      const result = await this.authenticateUseCase.execute({ email, password });

      if (result.isError()) {
        throw result.value;
      }

      const userId = result.value.userId.toString();
      const provider = result.value.provider.toString();

      const token = this.jwtService.sign(userId, provider);

      // pass token to cookie
      res.cookie("access_token", token, authCookieConfig);

      return res.status(200).json({ userId, provider });
    } catch (error) {
      next(error);
    }
  }
}
