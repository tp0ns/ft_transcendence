import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationEntity } from 'src/relations/models/relations.entity';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { ChannelEntity } from '../chat/channel/channel.entity';
import { ChannelService } from '../chat/channel/channel.service';
import { GeneralGateway } from './general.gateway';
import { MessagesEntity } from '../chat/messages/messages.entity';
import { MessageService } from '../chat/messages/messages.service';
import { GameService } from 'src/game/game.service';
import { RelationsService } from 'src/relations/relations.service';

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
		RelationsService,
		MessageService,
		GameService,
	],
})
export class GeneralModule {}
