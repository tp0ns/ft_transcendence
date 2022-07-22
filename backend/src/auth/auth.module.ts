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
import { RelationEntity } from 'src/user/relations/models/relations.entity';

@Module({
	imports: [
		PassportModule.register(SchoolStrategy),
		TypeOrmModule.forFeature([UserEntity, RelationEntity]),
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: jwtConstants.expire },
		}),
		HttpModule,
	],
	providers: [SchoolStrategy, AuthService, UserService, JwtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
