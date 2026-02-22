import { BaseError } from "../../core/errors/base-error";

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(404, `notFound.${resource}`, `${resource} Not Found`);
  }
}
