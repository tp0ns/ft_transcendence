import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationEntity } from 'src/user/relations/models/relations.entity';
import { UserEntity } from 'src/user/models/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChannelController } from './chat/channel/channel.controller';
import { ChannelEntity } from './chat/channel/channel.entity';
import { ChannelService } from './chat/channel/channel.service';
import { GeneralGateway } from 'src/general.gateway';
import { MessagesEntity } from './chat/messages/messages.entity';
import { MessageService } from './chat/messages/messages.service';
import { GameService } from 'src/game/game.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			ChannelEntity,
			UserEntity,
			RelationEntity,
			MessagesEntity,
		]),
	],
	providers: [
		GeneralGateway,
		JwtService,
		UserService,
		ChannelService,
		MessageService,
		GameService,
	],
	controllers: [ChannelController],
})
export class ChatModule {}
