import { UserRepository } from './user.repository';
import { UserCreateInput, UserUpdateInput } from './user.type';
import { AppError, PaginationInput } from '../../utils';

export const UserService = {
  async create(data: UserCreateInput) {
    const existing = await UserRepository.getByEmail(data.email);
    if (existing) {
      throw new AppError(409, `User with email ${data.email} already exists`, 'email');
    }
    return UserRepository.create(data);
  },

  async getAll() {
    return UserRepository.getAll();
  },

  async getPaginated(pagination: PaginationInput) {
    return UserRepository.getPaginated(pagination);
  },

  async getById(id: string) {
    const user = await UserRepository.getById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  },

  async update(id: string, data: UserUpdateInput) {
    await this.getById(id);
    return UserRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return UserRepository.delete(id);
  },
};
