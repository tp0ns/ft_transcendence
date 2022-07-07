import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { ConfigService } from '@nestjs/config';
import { User } from "src/user/user.entity";
import { authenticator } from "otplib";
import { toFileStream } from "qrcode";
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor (
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {}

	public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			this.configService.get('2FA_APP_NAME'),
			secret
		);
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
		return {
			secret,
			otpauthUrl
		}
	}
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}
	public is2FACodeValid(twoFACode: string, user: User) {
		return authenticator.verify({
			token: twoFACode,
			secret: user.twoFactorAuthenticationSecret
		})
	}
}
