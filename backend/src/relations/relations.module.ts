import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { RelationEntity } from './models/relations.entity';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';

@Module({
	imports: [TypeOrmModule.forFeature([RelationEntity]), forwardRef(() => UserModule)],
	exports: [RelationsService],
	controllers: [RelationsController],
	providers: [RelationsService],
})
export class RelationsModule {}
