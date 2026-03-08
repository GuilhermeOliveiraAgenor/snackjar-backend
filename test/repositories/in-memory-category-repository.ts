import { CategoryRepository } from "../../src/application/repositories/category-repository";
import { Category } from "../../src/core/entities/category";

export class InMemoryCategoryRepository implements CategoryRepository {
  public items: Category[] = []; // array data

  async create(category: Category): Promise<void> {
    this.items.push(category);
  }
  async save(category: Category): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === category.id);
    this.items[itemIndex] = category;
  }
  async findMany(): Promise<Category[]> {
    return this.items;
  }
  async findByName(name: string): Promise<Category | null> {
    const category = this.items.find((item) => item.name == name);
    if (!category) {
      return null;
    }
    return category;
  }

  async findById(id: string): Promise<Category | null> {
    const category = this.items.find((item) => item.id.toString() == id);
    if (!category) {
      return null;
    }
    return category;
  }
}
