import jwt from "jsonwebtoken";
import { IJWTService } from "../../core/cryptography/IJwtService";
import { JwtPayload } from "../../core/cryptography/JwtPayload";
import { env } from "../config/env";

export class JwtService implements IJWTService {
  sign(userId: string, provider: string) {
    return jwt.sign(
      {
        sub: userId,
        provider,
      },
      env.JWT_SECRET!,
      { expiresIn: "1d" },
    );
  }
  verify(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET!) as JwtPayload;
    return decoded;
  }
}
