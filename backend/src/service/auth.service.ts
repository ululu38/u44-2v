import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../interface/dtos/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAndLogin(dto: LoginDto) {
    const { username, password } = dto;
    const user = await this.userService.findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.uid, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }
}
