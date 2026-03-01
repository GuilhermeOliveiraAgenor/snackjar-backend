import { Category } from "../../core/entities/category";

export interface CategoryRepository {
  create(category: Category): Promise<void>;
  save(category: Category): Promise<void>;
  findMany(): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
  findById(id: string): Promise<Category | null>;
}
