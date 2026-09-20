import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private sanitize(user: User) {
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone };
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET || 'octane_refresh_secret_2026' });
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.save(user);
    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.issueTokens(user);
    return { message: 'Login successful', ...tokens, user: this.sanitize(user) };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token is required');
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'octane_refresh_secret_2026' });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshToken || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const tokens = await this.issueTokens(user);
    return { message: 'Token refreshed successfully', ...tokens, user: this.sanitize(user) };
  }

  async logout(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null as any;
      await this.userRepository.save(user);
    }
    return { message: 'Logout successful' };
  }

  async createAdmin(dto: { fullName: string; email: string; password: string; phone?: string }) {
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email is already registered');
    const admin = this.userRepository.create({ ...dto, password: await bcrypt.hash(dto.password, 10), role: UserRole.ADMIN });
    const saved = await this.userRepository.save(admin);
    return { message: 'Admin account created successfully', user: this.sanitize(saved) };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitize(user);
  }
}
