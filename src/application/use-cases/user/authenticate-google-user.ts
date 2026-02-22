import { Either, success } from "../../../core/either";
import { User } from "../../../core/entities/user";
import { AuthProvider } from "../../../core/enum/AuthProvider";
import { UserRepository } from "../../repositories/user-repository";

interface AuthenticateGoogleUserRequest {
  googleId: string;
  name: string;
  email: string;
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
  }: AuthenticateGoogleUserRequest): Promise<AuthenticateGoogleUserResponse> {
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = User.create({
        name,
        email,
        googleId,
        provider: AuthProvider.google,
      });

      await this.userRepository.create(user);

      return success({ user });
    }

    // if (user.provider === "local") {
    //   user.googleId = googleId;
    //   await this.userRepository.save(user);
    // }

    // if (!user.googleId) {
    //   user.googleId = googleId;
    //   await this.userRepository.save(user);
    // }

    return success({ user });
  }
}
