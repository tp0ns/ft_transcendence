import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationEntity } from 'src/user/relations/models/relations.entity';
import { UserEntity } from 'src/user/models/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChannelController } from './channel/channel.controller';
import { ChannelEntity } from './channel/channel.entity';
import { ChannelService } from './channel/channel.service';
import { ChatGateway } from './chat.gateway';
import { MembersEntity } from './channelMembers/members.entity';
import { membersService } from './channelMembers/members.service';

@Module({
	imports: [TypeOrmModule.forFeature([ChannelEntity, UserEntity, RelationEntity, MembersEntity])],
	providers: [ChatGateway, JwtService, UserService, ChannelService, membersService],
	controllers: [ChannelController],
})
export class ChatModule {}
