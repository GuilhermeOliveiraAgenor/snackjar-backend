import { BaseError } from "../../core/errors/base-error";

export class AlreadyExistsError extends BaseError {
  constructor(resource: string) {
    super(409, `alreadyExists.${resource}`, `${resource} Already Exists`);
  }
}
