import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SchoolStrategy } from './auth.strategy';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt/jwt.constants';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserService } from 'src/user/user.service';

@Module({
	imports: [
		PassportModule.register(SchoolStrategy),
		TypeOrmModule.forFeature([User]),
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
