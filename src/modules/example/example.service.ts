import { ExampleRepository } from './example.repository';
import { ExampleCreateInput, ExampleUpdateInput } from './example.type';
import { AppError, PaginationInput } from '../../utils';

export const ExampleService = {
  async create(data: ExampleCreateInput) {
    const existing = await ExampleRepository.getByEmail(data.email);
    if (existing) {
      throw new AppError(409, `Example with email ${data.email} already exists`, 'email');
    }
    return ExampleRepository.create(data);
  },

  async getAll() {
    return ExampleRepository.getAll();
  },

  async getPaginated(pagination: PaginationInput) {
    return ExampleRepository.getPaginated(pagination);
  },

  async getById(id: string) {
    const item = await ExampleRepository.getById(id);
    if (!item) {
      throw new AppError(404, 'Example not found');
    }
    return item;
  },

  async update(id: string, data: ExampleUpdateInput) {
    await this.getById(id);
    return ExampleRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return ExampleRepository.delete(id);
  },
};
