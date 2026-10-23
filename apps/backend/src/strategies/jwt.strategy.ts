import { PrismaService } from 'src/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { COOKIE_NAMES } from 'src/common/constants/cookie';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }
  // validate()에서 리턴하는 객체가 Passport가 req.user에 자동으로 붙이는 값
  async validate(payload: { sub: number; email: string; sessionId?: string }) {
    if (payload.sessionId) {
      const session = await this.prisma.mobileSession.findUnique({ where: { id: payload.sessionId } });
      if (!session || session.userId !== payload.sub || session.expiresAt <= new Date()) throw new UnauthorizedException();
    }
    return payload;
  }
}
