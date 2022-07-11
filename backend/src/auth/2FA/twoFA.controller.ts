// eslint-disable-next-line prettier/prettier
import { Body, ClassSerializerInterceptor, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { TwoFAService } from './twoFA.service';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { TwoFACodeDto } from './twoFACodeDto';
import JwtTwoFactorGuard from './jwt-two-factor.guard';
import RequestWithUser from '../interfaces/requestWithUser.interface';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
	constructor(
		private readonly twoFAService: TwoFAService,
		private readonly userService: UserService,
		private readonly authService: TwoFAService,
	) {}

	@Post('authenticate')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	async authenticate(
		@Req() request: RequestWithUser,
		@Body() { twoFACode }: TwoFACodeDto,
	) {
		const isCodeValid = this.twoFAService.is2FACodeValid(
			twoFACode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		const accessTokenCookie = this.authService.getCookieWithToken(
			request.user.userId,
			true,
		);
		request.res.setHeader('Set-Cookie', [accessTokenCookie]);
		return request.user;
	}

	@Post('turn-on')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	async turnOnTwoFA(
		@Req() request: RequestWithUser,
		@Body() { twoFACode }: TwoFACodeDto,
	) {
		const isCodeValid = this.twoFAService.is2FACodeValid(
			twoFACode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.turnOnTwoFA(request.user.userId);
	}

	@Post('generate')
	@UseGuards(JwtTwoFactorGuard)
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(
			request.user,
		);

		return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
	}
}
