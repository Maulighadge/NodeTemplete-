import { Role } from '@prisma/client';

export interface UserCreateInput {
  name: string;
  email: string;
  phone: string;
  role?: Role;
  password?: string;
}

export type UserUpdateInput = Partial<Omit<UserCreateInput, 'email'>>;

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
