import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);

export class User {
  uid: number;
  username: string;
  email: string;
  role: UserRole;
  isEmailActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
