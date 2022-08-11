import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/user/models/user.entity';
import { authenticator } from 'otplib';
import { toDataURL, toFileStream } from 'qrcode';
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
	public getCookieWithToken(userId: string, twoFAAuthenticated = true) {
		const payload: TokenPayload = {
			sub: userId,
			twoFAAuthenticated: twoFAAuthenticated,
		};
		const token = this.jwtService.sign(payload, {
			secret: jwtConstants.secret,
			expiresIn: jwtConstants.expire,
		});
		return `Authentication=${token}; Path=/; Max-Age=${jwtConstants.expire}`;
	}
	/**
	 * Generate the secret key used to authenticate the user
	 */
	public async generateTwoFASecret(user: UserEntity) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			this.configService.get('2FA_APP_NAME'),
			secret,
		);
		await this.userService.setTwoFASecret(secret, user.userId);
		return [secret, otpauthUrl];
	}

	/**
	 * Display the QR code to access google auth
	 */
	public async pipeQrCodeStream(otpauthUrl: string) {
		return (await toDataURL(otpauthUrl)).toString();
	}

	/**
	 * Check if the code given by the user is right or not
	 */
	public is2FACodeValid(twoFACode: string, user: any) {
		const valide = authenticator.verify({
			token: twoFACode,
			secret: user.twoFASecret,
		});
		return valide;
	}
}
