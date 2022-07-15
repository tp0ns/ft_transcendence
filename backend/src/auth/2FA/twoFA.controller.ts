// eslint-disable-next-line prettier/prettier
import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { TwoFAService } from './twoFA.service';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { TwoFACodeDto } from './dto/twoFACodeDto';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { JwtAuthGuard } from '../jwt/jwt.guard';

/**
 * Creating 2fa route
 */
@Controller('auth/2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
	constructor(
		private readonly twoFAService: TwoFAService,
		private readonly userService: UserService,
		private readonly authService: TwoFAService,
	) {}

	/**
	 * Check if the user has been correctly authenticated with 2FA.
	 * @param request interface containing the user.
	 * @param twoFACode class containing the 2FA secret code.
	 * @returns the user if everything is right or an exception.
	 */
	@Post('authenticate')
	@HttpCode(200)
	@UsePipes(ValidationPipe)
	@UseGuards(JwtAuthGuard)
	async authenticate(
		@Req() request: RequestWithUser,
		@Body() twoFACode: TwoFACodeDto,
	) {
		console.log('before 2FACODE IN AUTHENTICATE.');
		const isCodeValid = this.twoFAService.is2FACodeValid(
			twoFACode.twoFACode,
			request.user,
		);
		console.log('2FACODE PASSED IN AUTHENTICATE.');
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

	/**
	 * Check if the code given is right, if so, turn on the boolean user.isTwoFAEnabled
	 * @param request interface containing the user.
	 * @param twoFACode class containing the 2FA secret code.
	 */
	@Post('turn-on')
	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	async turnOnTwoFA(
		@Req() request: RequestWithUser,
		@Body() { twoFACode }: TwoFACodeDto,
	) {
		console.log('before 2FACODE IN TURN-ON.');
		const isCodeValid = this.twoFAService.is2FACodeValid(
			twoFACode,
			request.user,
		);
		console.log('2FACODE PASSED IN TURN-ON.');
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.turnOnTwoFA(request.user.userId);
	}

	/**
	 * Generate a QR code to add the account on google auth
	 * @param response the QR code
	 * @param request current user
	 * @returns the QR code for the user
	 */
	@Get('generate')
	@UseGuards(JwtAuthGuard)
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(
			request.user,
		);

		return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
	}
}
