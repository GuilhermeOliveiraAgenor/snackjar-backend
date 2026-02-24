import { Either, success } from "../../../core/either";
import { User } from "../../../core/entities/user";
import { AuthProvider } from "../../../core/enum/AuthProvider";
import { UserRepository } from "../../repositories/user-repository";

interface AuthenticateGoogleUserRequest {
  googleId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

type AuthenticateGoogleUserResponse = Either<
  null,
  {
    user: User;
  }
>;

export class AuthenticateGoogleUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}
  async execute({
    googleId,
    name,
    email,
    avatarUrl,
  }: AuthenticateGoogleUserRequest): Promise<AuthenticateGoogleUserResponse> {
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = User.create({
        name,
        email,
        googleId,
        provider: AuthProvider.google,
        avatarUrl: avatarUrl ?? null,
      });

      await this.userRepository.create(user);

      return success({ user });
    }

    if (user.provider === AuthProvider.local) {
      user.googleId = googleId;
    }

    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = AuthProvider.google;
    }

    if (avatarUrl && !user.avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    await this.userRepository.save(user);

    return success({ user });
  }
}
