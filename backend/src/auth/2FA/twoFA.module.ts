import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationEntity } from 'src/user/relations/models/relations.entity';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { TwoFAController } from './twoFA.controller';
import { TwoFAService } from './twoFA.service';
import { UserModule } from 'src/user/user.module';
import UserEntity from 'src/user/models/user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, RelationEntity]),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: process.env.SIGN_CD },
		}),
	],
	controllers: [TwoFAController, UserController],
	providers: [TwoFAService, UserService, ConfigService, JwtService],
})
export class TwoFAModule {}
