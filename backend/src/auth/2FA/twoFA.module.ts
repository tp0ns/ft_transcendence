import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationEntity } from 'src/relations/models/relations.entity';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { TwoFAController } from './twoFA.controller';
import { TwoFAService } from './twoFA.service';
import { UserModule } from 'src/user/user.module';
import UserEntity from 'src/user/models/user.entity';
import { ChannelService } from 'src/chat/channel/channel.service';
import { ChannelEntity } from 'src/chat/channel/channel.entity';
import { MessageService } from 'src/chat/messages/messages.service';
import { MessagesEntity } from 'src/chat/messages/messages.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, RelationEntity, ChannelEntity, MessagesEntity]),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: process.env.SIGN_CD },
		}),
	],
	controllers: [TwoFAController, UserController],
	providers: [TwoFAService, UserService, ConfigService, JwtService, ChannelService, MessageService],
})
export class TwoFAModule {}
