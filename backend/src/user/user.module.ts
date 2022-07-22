import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { FriendRequestEntity } from './models/friend-request.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, FriendRequestEntity])],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
