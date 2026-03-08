import { faker } from "@faker-js/faker";
import { User, UserProps } from "../../src/core/entities/user";
import { PrismaUserMapper } from "../../src/infra/mappers/prisma-user-mapper";
import { getPrismaClient } from "../../src/infra/prisma/client";
import { AuthProvider } from "../../src/core/enum/AuthProvider";
import bcrypt from "bcryptjs";

export function makeUser(override?: Partial<UserProps>) {
  return User.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    provider: AuthProvider.local,
    ...override,
  });
}

export class UserFactory {
  private prisma = getPrismaClient();

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const password = data.password ?? "123456";

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = makeUser({
      ...data,
      password: hashedPassword,
      provider: AuthProvider.local,
    });

    await this.prisma.user.create({
      data: PrismaUserMapper.toPersistency(user),
    });

    return user;
  }
}
