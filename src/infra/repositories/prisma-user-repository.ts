import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../application/repositories/user-repository";
import { User } from "../../core/entities/user";
import { PrismaUserMapper } from "../mappers/prisma-user-mapper";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: PrismaUserMapper.toPersistency(user),
    });
  }
  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: user.id.toString(),
      },
      data: PrismaUserMapper.toPersistency(user),
    });
  }
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return PrismaUserMapper.toDomain(user);
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return PrismaUserMapper.toDomain(user);
  }
  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) return null;

    return PrismaUserMapper.toDomain(user);
  }
}
