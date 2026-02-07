import { Request, Response } from "express";

export class LogoutController {
  async handle(req: Request, res: Response) {
    res.clearCookie("access_token");
    return res.status(200).json({ message: "Logged out" });
  }
}
