import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SchoolStrategy } from './auth.strategy';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

@Module({
	imports:[	PassportModule.register(SchoolStrategy),
						TypeOrmModule.forFeature([User]),
						HttpModule
					],
	providers: [SchoolStrategy, UserService],
	controllers: [AuthController]
})
export class AuthModule {}
