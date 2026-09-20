import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'octane_super_secret_key_2026',
    });
  }

  validate(payload: {
    sub: number;
    email: string;
    role: string;
  }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}