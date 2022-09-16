import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SchoolStrategy } from './auth.strategy';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/models/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt/jwt.constants';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserService } from 'src/user/user.service';
import { RelationEntity } from 'src/relations/models/relations.entity';
import { ChannelService } from 'src/chat/channel/channel.service';
import { MessageService } from 'src/chat/messages/messages.service';
import { ChannelEntity } from 'src/chat/channel/channel.entity';
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { RelationsService } from 'src/relations/relations.service';
import { GameService } from 'src/game/game.service';
import InvitationEntity from 'src/game/invitations/invitations.entity';
import { AchievementsEntity } from 'src/game/statistics/achievements.entity';

@Module({
	imports: [
		PassportModule.register(SchoolStrategy),
		TypeOrmModule.forFeature([UserEntity, RelationEntity, ChannelEntity, MessagesEntity, InvitationEntity, AchievementsEntity]),
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: jwtConstants.expire },
		}),
		HttpModule,
	],
	providers: [SchoolStrategy, AuthService, UserService, JwtStrategy, ChannelService, MessageService, RelationsService, GameService],
	controllers: [AuthController],
})
export class AuthModule {}
