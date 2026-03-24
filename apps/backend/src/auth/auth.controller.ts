import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { SignupDto, LoginDto } from './dto/auth.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';
import type { Response, Request } from 'express';
import { COOKIE_NAMES } from 'src/common/constants/cookie';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입이 성공적으로 완료되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효성 검증 실패 또는 잘못된 시크릿 키)',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일입니다.',
  })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(
      dto.email,
      dto.name,
      dto.password,
      dto.secretKey,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // 200 return code
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인이 성공적으로 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '로그인이 완료되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (잘못된 이메일 또는 비밀번호)',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isGuestLogin = dto.email === process.env.GUEST_EMAIL;
    const { accessToken, refreshToken } = await this.authService.login(
      dto.email,
      isGuestLogin ? process.env.GUEST_PASSWORD || '' : dto.password,
    );

    // accessToken 쿠키 설정
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15분
    });

    // refreshToken 쿠키 설정
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    return { message: '로그인이 완료되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃이 성공적으로 완료되었습니다.',
  })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });
    return { message: '로그아웃 되었습니다.' };
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰이 성공적으로 갱신되었습니다.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '유효하지 않은 리프레시 토큰입니다.',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] as string;
    if (!refreshToken) {
      throw new ForbiddenException('리프레시 토큰이 없습니다.');
    }
    const accessToken = await this.authService.refreshToken(refreshToken);

    // accessToken 쿠키 갱신
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15분
    });

    return { message: '토큰이 갱신되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string', description: '기존 비밀번호' },
        newPassword: { type: 'string', description: '새 비밀번호' },
      },
      required: ['oldPassword', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 성공적으로 변경되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '기존 비밀번호가 틀렸습니다.',
  })
  async changePassword(
    @Body() dto: { oldPassword: string; newPassword: string },
    @Req() req: AuthenticatedRequest,
  ) {
    await this.authService.changePassword(
      req.user.sub,
      dto.oldPassword,
      dto.newPassword,
    );
    return {
      message: '비밀번호가 변경이 완료되었습니다.',
    };
  }
}
