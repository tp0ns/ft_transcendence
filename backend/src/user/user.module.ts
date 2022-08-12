import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { UserService } from './user.service';
import { RelationEntity } from '../relations/models/relations.entity';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, RelationEntity])],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
