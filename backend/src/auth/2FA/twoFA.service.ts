import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './interfaces/token.interface';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
	Strategy,
	'jwt-two-factor',
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.Authentication;
				},
			]),
			secretOrKey: configService.get('TOKEN_SECRET'),
		});
	}

	async validate(payload: TokenPayload) {
		const user = await this.userService.getUserById(payload.userId);
		if (!user.isTwoFAEnabled) {
			return user;
		}
		if (payload.isSecondFactorAuthenticated) {
			return user;
		}
	}
}

@Injectable()
export class TwoFAService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	public getCookieWithToken(
		userId: string,
		isSecondFactorAuthenticated = false,
	) {
		const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
		const token = this.jwtService.sign(payload, {
			secret: this.configService.get('TOKEN_SECRET'),
			expiresIn: `${this.configService.get('TOKEN_EXPIRATION_TIME')}s`,
		});
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
			'TOKEN_EXPIRATION_TIME',
		)}`;
	}

	public async generateTwoFASecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.username,
			this.configService.get('2FA_APP_NAME'),
			secret,
		);
		await this.userService.setTwoFASecret(secret, user.id);
		return {
			secret,
			otpauthUrl,
		};
	}
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}
	public is2FACodeValid(twoFACode: string, user: User) {
		return authenticator.verify({
			token: twoFACode,
			secret: user.twoFASecret,
		});
	}
}
