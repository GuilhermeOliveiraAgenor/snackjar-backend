import { BaseError } from "../../core/errors/base-error";

export class NotAllowedError extends BaseError {
  constructor(resource: string) {
    super(403, `forbidden.${resource}`, `${resource} Not Allowed`);
  }
}
