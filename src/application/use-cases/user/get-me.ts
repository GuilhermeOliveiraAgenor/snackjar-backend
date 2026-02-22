import { Either, failure, success } from "../../../core/either";
import { User } from "../../../core/entities/user";
import { NotFoundError } from "../../errors/resource-not-found-error";
import { UserRepository } from "../../repositories/user-repository";

interface GetMeUseCaseRequest {
  userId: string;
}

type GetMeUseCaseResponse = Either<
  NotFoundError,
  {
    user: User;
  }
>;

export class GetMeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: GetMeUseCaseRequest): Promise<GetMeUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    // verify if user exists

    if (!user) {
      return failure(new NotFoundError("User"));
    }

    return success({
      user,
    });
  }
}
