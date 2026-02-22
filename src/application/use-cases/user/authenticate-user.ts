import { IHashProvider } from "../../../core/cryptography/IHashProvider";
import { Either, failure, success } from "../../../core/either";
import { User } from "../../../core/entities/user";
import { InvalidCredentialsError } from "../../errors/invalid-credentials-error";
import { UserRepository } from "../../repositories/user-repository";

interface AuthenticateUserUseCaseRequest {
  email: User["email"];
  password: User["password"];
}

type AuthenticateUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    userId: string;
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
    // verify password
    const isValid = await this.hashProvider.compare(password, user.password);

    if (!isValid) {
      return failure(new InvalidCredentialsError("User"));
    }

    return success({ userId: user.id.toString() });
  }
}
