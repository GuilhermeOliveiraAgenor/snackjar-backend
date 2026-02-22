import { UniqueEntityID } from "../../core/domain/value-objects/unique-entity-id";
import { User } from "../../core/entities/user";
import { Prisma, User as PrismaUser } from "@prisma/client";
import { AuthProvider } from "../../core/enum/AuthProvider";

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        googleId: raw.googleId,
        provider: raw.provider as AuthProvider,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPersistency(raw: User): Prisma.UserUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      name: raw.name,
      email: raw.email,
      password: raw.password ? raw.password.toString() : null,
      googleId: raw.googleId ? raw.googleId.toString() : null,
      provider: raw.provider,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
