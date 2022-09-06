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

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, RelationEntity, ChannelEntity, MessagesEntity])],
	controllers: [UserController],
	providers: [UserService, ChannelService, MessageService],
	exports: [UserService, ChannelService, MessageService],
})
export class UserModule {}
