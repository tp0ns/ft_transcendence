import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestEntity } from 'src/user/models/friend-request.entity';
import { UserController } from 'src/user/user.controller';
import User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { TwoFAController } from './twoFA.controller';
import { TwoFAService } from './twoFA.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, FriendRequestEntity]),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: process.env.SIGN_CD },
		}),
	],
	controllers: [TwoFAController, UserController],
	providers: [TwoFAService, UserService, ConfigService, JwtService],
})
export class TwoFAModule {}
