import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        provider: string;
      };
    }
  }
}
