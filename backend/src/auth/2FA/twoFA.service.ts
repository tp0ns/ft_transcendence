import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './dto/token.interface';
import { jwtConstants } from '../jwt/jwt.constants';

@Injectable()
export class TwoFAService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Get the JWT token from the cookie
	 */
	public getCookieWithToken(
		userId: string,
		isSecondFactorAuthenticated = true,
	) {
		const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
		const token = this.jwtService.sign(payload, {
			secret: jwtConstants.secret,
			expiresIn: jwtConstants.expire,
		});
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${jwtConstants.expire}`;
	}
	/**
	 * Generate the secret key used to authenticate the user
	 */
	public async generateTwoFASecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			this.configService.get('2FA_APP_NAME'),
			secret,
		);
		await this.userService.setTwoFASecret(secret, user.userId);
		return {
			secret,
			otpauthUrl,
		};
	}

	/**
	 * Display the QR code to access google auth
	 */
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	/**
	 * Check if the code given by the user is right or not
	 */
	public is2FACodeValid(twoFACode, user: User) {
		return authenticator.verify({
			token: twoFACode,
			secret: user.twoFASecret,
		});
	}
}
