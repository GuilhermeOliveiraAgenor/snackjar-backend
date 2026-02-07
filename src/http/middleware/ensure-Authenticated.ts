import { Request, Response, NextFunction } from "express";
import { IJWTService } from "../../core/cryptography/IJwtService";

export function ensureAuthenticated(jwtService: IJWTService) {
  return (req: Request, res: Response, next: NextFunction) => {
    // variable receive token
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const sub = jwtService.verify(token);
      // set user id
      req.user = {
        id: sub,
      };
      next();
    } catch (error) {
      return res.status(401).json({ message: `Token is not in the correct format ${error}` });
    }
  };
}
