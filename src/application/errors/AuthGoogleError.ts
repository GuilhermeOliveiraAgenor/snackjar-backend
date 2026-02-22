import { BaseError } from "../../core/errors/base-error";

export class AuthGoogleError extends BaseError {
  constructor(resource: string) {
    super(401, `unauthorized.${resource}`, "Use Login with Google");
  }
}
