import { IHashProvider } from "../../../core/cryptography/IHashProvider";
import { Either, failure, success } from "../../../core/either";
import { User } from "../../../core/entities/user";
import { AuthProvider } from "../../../core/enum/AuthProvider";
import { AuthGoogleError } from "../../errors/AuthGoogleError";
import { InvalidCredentialsError } from "../../errors/invalid-credentials-error";
import { UserRepository } from "../../repositories/user-repository";

interface AuthenticateUserUseCaseRequest {
  email: User["email"];
  password: string;
}

type AuthenticateUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    userId: string;
    provider: string;
  }
>;

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: IHashProvider,
  ) {}
  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    // verify email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return failure(new InvalidCredentialsError("User"));
    }

    if (user.provider === AuthProvider.google) {
      return failure(new AuthGoogleError("Google"));
    }

    if (!user.password) {
      return failure(new InvalidCredentialsError("User"));
    }

    // verify password
    const isValid = await this.hashProvider.compare(password, user.password);

    if (!isValid) {
      return failure(new InvalidCredentialsError("User"));
    }

    return success({ userId: user.id.toString(), provider: user.provider.toString() });
  }
}
