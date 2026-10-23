import { Body, Controller, HttpCode, Post, UnauthorizedException, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
@Controller('auth/mobile')
@UseGuards(ThrottlerGuard)
export class MobileAuthController {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  private accessToken(userId: number, email: string, sessionId: string) {
    return this.jwt.signAsync({ sub: userId, email, sessionId }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });
  }
  @Post('login') @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('이메일 또는 비밀번호를 확인해 주세요.');
    const refreshToken = randomBytes(32).toString('hex');
    const session = await this.prisma.mobileSession.create({ data: { userId: user.id, tokenHash: hash(refreshToken), expiresAt: new Date(Date.now() + 30 * 86400000) } });
    return { accessToken: await this.accessToken(user.id, user.email, session.id), refreshToken };
  }
  @Post('refresh') @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    const session = await this.prisma.mobileSession.findUnique({ where: { tokenHash: hash(dto.refreshToken) }, include: { user: true } });
    if (!session || session.expiresAt <= new Date()) throw new UnauthorizedException('다시 로그인해 주세요.');
    return { accessToken: await this.accessToken(session.userId, session.user.email, session.id) };
  }
  @Post('logout') @HttpCode(200)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.prisma.mobileSession.deleteMany({ where: { tokenHash: hash(dto.refreshToken) } });
    return { message: '로그아웃되었습니다.' };
  }
}
