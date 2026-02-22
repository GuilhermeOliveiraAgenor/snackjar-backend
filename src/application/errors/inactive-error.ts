import { BaseError } from "../../core/errors/base-error";

export class InactiveError extends BaseError {
  constructor(resource: string) {
    super(401, `inactive.${resource}`, `${resource} Inactive`);
  }
}
