import prisma from '../../common/prisma';
import { ExampleCreateInput, ExampleUpdateInput } from './example.type';
import { PaginationInput, buildPaginatedResponse } from '../../utils';

export const ExampleRepository = {
  async create(data: ExampleCreateInput) {
    return prisma.example.create({ data });
  },

  async getAll() {
    return prisma.example.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async getPaginated(pagination: PaginationInput) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.example.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.example.count(),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  },

  async getById(id: string) {
    return prisma.example.findUnique({ where: { id } });
  },

  async getByEmail(email: string) {
    return prisma.example.findUnique({ where: { email } });
  },

  async update(id: string, data: ExampleUpdateInput) {
    return prisma.example.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.example.delete({ where: { id } });
  },
};
