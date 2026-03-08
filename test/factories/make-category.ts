import { Category, CategoryProps } from "../../src/core/entities/category";
import { faker } from "@faker-js/faker";
import { PrismaCategoryMapper } from "../../src/infra/mappers/prisma-category-mapper";
import { getPrismaClient } from "../../src/infra/prisma/client";

export function makeCategory(override?: Partial<CategoryProps>) {
  return Category.create({
    name: faker.food.ethnicCategory(),
    description: faker.food.description(),
    ...override,
  });
}

export class CategoryFactory {
  private prisma = getPrismaClient();

  async makePrismaCategory(data: Partial<CategoryProps> = {}): Promise<Category> {
    const category = makeCategory(data);

    await this.prisma.category.create({
      data: PrismaCategoryMapper.toPersistency(category),
    });

    return category;
  }
}
