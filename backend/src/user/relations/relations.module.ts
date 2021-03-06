import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { UserModule } from '../user.module';
import { UserService } from '../user.service';
import { RelationEntity } from './models/relations.entity';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';

@Module({
	imports: [TypeOrmModule.forFeature([RelationEntity]), UserModule],
	controllers: [RelationsController],
	providers: [RelationsService],
})
export class RelationsModule {}
