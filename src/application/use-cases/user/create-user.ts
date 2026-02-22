import { Either, failure, success } from "../../../core/either";
import { User } from "../../../core/entities/user";
import { AlreadyExistsError } from "../../errors/already-exists-error";
import { UserRepository } from "../../repositories/user-repository";
import { IHashProvider } from "../../../core/cryptography/IHashProvider";
import { AuthProvider } from "../../../core/enum/AuthProvider";

interface CreateUserUseCaseRequest {
  name: User["name"];
  email: User["email"];
  password: string;
}

type CreateUserUseCaseResponse = Either<
  AlreadyExistsError,
  {
    user: User;
  }
>;

export class CreateUserUseCase {
  // import repositories user and bcrypt hash functions
  constructor(
    private userRepository: UserRepository,
    private hashProvider: IHashProvider,
  ) {}

  async execute({
    name,
    email,
    password,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(email);
    // verify client already exists

    if (userWithSameEmail) {
      return failure(new AlreadyExistsError("User"));
    }

    // hash password
    const hashedPassword = await this.hashProvider.hash(password);

    //create user
    const user = User.create({
      name,
      email,
      password: hashedPassword,
      provider: AuthProvider.local,
    });

    // pass to repository
    await this.userRepository.create(user);

    return success({
      user,
    });
  }
}
