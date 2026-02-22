import { JwtPayload } from "./JwtPayload";

export interface IJWTService {
  sign(userId: string, provider: string): string;
  verify(token: string): JwtPayload;
}
