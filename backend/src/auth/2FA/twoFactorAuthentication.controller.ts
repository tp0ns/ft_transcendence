import { Body, ClassSerializerInterceptor, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { TwoFactorAuthenticationService } from "./twoFactorAuthentication.service";
import { Response } from 'express';
import { UserService } from "src/user/user.service";
import { TwoFACodeDto } from "./twoFACodeDto";

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UserService,
    private readonly authenticationService: TwoFactorAuthenticationService
		) {}

		@Post('authenticate')
		@HttpCode(200)
		@UseGuards(JwtAuthenticationGuard)
		async authenticate(
			@Req() request: RequestWithUser,
			@Body() { twoFACode }: TwoFACodeDto
		) {
			const isCodeValid = this.twoFactorAuthenticationService.is2FACodeValid(
				twoFACode, request.user
			);
			if (!isCodeValid) {
				throw new UnauthorizedException('Wrong authentication code');
			}
			const accessTokenCookie =  this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true);
			request.res.setHeader('Set-Cookie', [accessTokenCookie]);
			return request.user;
		}

	@Post('turn-on')
	@HttpCode(200)
	@UseGuards(JwtAuthenticationGuard)
	async turnOnTwoFactorAuthentication(
		@Req() request: RequestWithUser,
		@Body() { twoFACode }: TwoFACodeDto
	) {
		const isCodeValid = this.twoFactorAuthenticationService.is2FACodeValid(
			twoFACode, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.turnOnTwoFactorAuthentication(request.user.id);
	}

	@Post('generate')
	@UseGuards(JwAuthenticationGuard)
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}
}
