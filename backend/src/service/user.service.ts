import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from '../infrastructure/db/connector.js';
import { users } from '../infrastructure/db/schema.js';
import { eq, count } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UpdateMyAccountDto } from '../interface/dtos/user.dto.js';

@Injectable()
export class UserService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds', 10);
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
    const result = await this.drizzle.db.insert(users).values({
      ...dto,
      password: hashedPassword,
    }).returning();
    
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async updateProfile(uid: number, dto: UpdateMyAccountDto) {
    const { email, isEmailActive } = dto;
    
    // Only update if there are fields to update
    if (email === undefined && isEmailActive === undefined) {
      const user = await this.drizzle.db.query.users.findFirst({
        where: eq(users.uid, uid)
      });
      if (!user) throw new NotFoundException('User not found');
      return user;
    }

    const result = await this.drizzle.db.update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.uid, uid))
      .returning();
      
    if (result.length === 0) throw new NotFoundException('User not found');
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async update(id: number, dto: UpdateUserDto) {
    const updateData: any = { ...dto, updatedAt: new Date() };
    
    if (dto.password) {
      const saltRounds = this.configService.get<number>('bcrypt.saltRounds', 10);
      updateData.password = await bcrypt.hash(dto.password, saltRounds);
    }

    const result = await this.drizzle.db.update(users)
      .set(updateData)
      .where(eq(users.uid, id))
      .returning();
      
    if (result.length === 0) throw new NotFoundException('User not found');
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const [data, totalCount] = await Promise.all([
      this.drizzle.db.select().from(users).limit(limit).offset(offset),
      this.drizzle.db.select({ value: count() }).from(users),
    ]);

    return {
      data: data.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      }),
      meta: {
        total: totalCount[0].value,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].value / limit),
      },
    };
  }

  async remove(id: number) {
    const result = await this.drizzle.db.delete(users).where(eq(users.uid, id)).returning();
    if (result.length === 0) throw new NotFoundException('User not found');
    return result;
  }

  async findByUsername(username: string) {
    return this.drizzle.db.query.users.findFirst({
      where: eq(users.username, username),
    });
  }
}
