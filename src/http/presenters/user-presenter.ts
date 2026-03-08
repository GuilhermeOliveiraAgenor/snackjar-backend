import { User } from "../../core/entities/user";
import { BasePresenter } from "./base/base-presenter";

export class UserPresenter {
  private static map(raw: User) {
    return {
      id: raw.id.toString(),
      name: raw.name,
      email: raw.email,
      provider: raw.provider,
      avatarUrl: raw.avatarUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt,
    };
  }
  static toHTTP(user: User) {
    return BasePresenter.toResponse(this.map(user));
  }
}
