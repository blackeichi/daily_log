import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(
    email: string,
    name: string,
    password: string,
    secretKey: string,
  ) {
    if (
      !process.env.SIGN_UP_SECRET_KEY ||
      secretKey !== process.env.SIGN_UP_SECRET_KEY
    ) {
      throw new BadRequestException('유효하지 않은 시크릿 키입니다.');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.findByEmail(email);
    if (user)
      throw new ConflictException(
        '이미 존재하는 이메일입니다. 다시 확인해주세요.',
      );
    this.usersService.createUser({ email, name, password: hashed });
    return {
      message: '회원가입이 완료되었습니다. 로그인을 해주세요.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException(
        '존재하지 않는 계정입니다. 이메일을 다시 확인해주세요.',
      );

    const pwMatches = await bcrypt.compare(password, user.password);
    if (!pwMatches)
      throw new UnauthorizedException(
        '비밀번호가 틀렸습니다. 다시 확인해주세요.',
      );

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: number) {
    return this.usersService.updateUser(userId, { refreshToken: undefined });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new ForbiddenException('접근이 거부되었습니다.');
      }

      const matches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!matches) throw new ForbiddenException('접근이 거부되었습니다.');

      const tokens = await this.getTokens(user.id, user.email);
      return tokens.accessToken;
    } catch (e) {
      throw new ForbiddenException(
        '토큰이 유효하지 않습니다. 다시 로그인 해주세요.',
      );
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('비정상적인 접근입니다.');
    const pwMatches = await bcrypt.compare(oldPassword, user.password);
    if (!pwMatches)
      throw new BadRequestException(
        '비밀번호가 틀렸습니다. 다시 확인해주세요.',
      );

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUser(userId, { password: hashed });
  }

  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateUser(userId, { refreshToken: hashed });
  }
}
