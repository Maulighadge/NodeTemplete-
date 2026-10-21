import { Role } from '@prisma/client';

export interface ExampleCreateInput {
  name: string;
  email: string;
  phone: string;
  role?: Role;
}

export type ExampleUpdateInput = Partial<ExampleCreateInput>;
