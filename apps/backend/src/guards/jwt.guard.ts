import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// @UseGuards(JwtAuthGuard)는 accessToken을 읽고 검증하기 위해 사용하는 것
export class JwtAuthGuard extends AuthGuard('jwt') {}
