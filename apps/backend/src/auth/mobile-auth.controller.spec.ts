import { MobileAuthController } from './mobile-auth.controller';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
describe('Mobile sessions', () => {
  const response = { setHeader: jest.fn() } as any;
  it('hashes per-device refresh tokens without touching the web token', async () => {
    const user = {
      id: 7,
      email: 'test@example.com',
      password: await bcrypt.hash('secret', 4),
      refreshToken: 'web-session',
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
      mobileSession: {
        create: jest.fn().mockResolvedValue({ id: 'session-1' }),
      },
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('access') };
    const result = await new MobileAuthController(
      prisma as any,
      jwt as any,
    ).login({ email: user.email, password: 'secret' }, response);
    expect(prisma.mobileSession.create.mock.calls[0][0].data.tokenHash).toBe(
      createHash('sha256').update(result.refreshToken).digest('hex'),
    );
    expect(user.refreshToken).toBe('web-session');
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'session-1', sub: 7 }),
      expect.anything(),
    );
  });
  it('rejects expired refresh sessions', async () => {
    const prisma = {
      mobileSession: {
        findUnique: jest.fn().mockResolvedValue({ expiresAt: new Date(0) }),
      },
    };
    await expect(
      new MobileAuthController(prisma as any, {} as any).refresh(
        { refreshToken: 'old' },
        response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects access tokens from revoked mobile sessions and preserves web authentication', async () => {
    process.env.JWT_ACCESS_SECRET = 'unit-test-only';
    const strategy = new JwtStrategy({
      mobileSession: { findUnique: jest.fn().mockResolvedValue(null) },
    } as any);
    await expect(
      strategy.validate({
        sub: 7,
        email: 'test@example.com',
        sessionId: 'revoked',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      strategy.validate({ sub: 7, email: 'test@example.com' }),
    ).resolves.toEqual({ sub: 7, email: 'test@example.com' });
  });
  it('revokes only the requested device', async () => {
    const prisma = {
      mobileSession: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    await new MobileAuthController(prisma as any, {} as any).logout({
      refreshToken: 'device-a',
    });
    expect(prisma.mobileSession.deleteMany).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash('sha256').update('device-a').digest('hex'),
      },
    });
  });
});
