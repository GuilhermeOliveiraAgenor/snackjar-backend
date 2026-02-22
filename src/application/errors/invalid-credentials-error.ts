import { BaseError } from "../../core/errors/base-error";

export class InvalidCredentialsError extends BaseError {
  constructor(resource: string) {
    super(401, `unauthorized.${resource}`, "Invalid Credentials");
  }
}
