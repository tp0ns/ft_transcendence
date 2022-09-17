import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { UserService } from './user.service';
import { RelationEntity } from '../relations/models/relations.entity';
import { ChannelService } from 'src/chat/channel/channel.service';
import { ChannelEntity } from 'src/chat/channel/channel.entity';
import { MessageService } from 'src/chat/messages/messages.service';
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { RelationsService } from 'src/relations/relations.service';
import { GameService } from 'src/game/game.service';
import { AchievementsEntity } from 'src/game/achievements/achievements.entity';
import InvitationEntity from 'src/game/invitations/invitations.entity';
import { MatchHistoryEntity } from 'src/game/matchHistory/matchHistory.entity';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, RelationEntity, ChannelEntity, MessagesEntity, AchievementsEntity, InvitationEntity, MatchHistoryEntity])],
	controllers: [UserController],
	providers: [UserService, ChannelService, MessageService, RelationsService, GameService],
	exports: [UserService, ChannelService, MessageService, GameService],
})
export class UserModule {}
