import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TwoFAModule } from './auth/2FA/twoFA.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
		}),
		UserModule,
		AuthModule,
		TwoFAModule,
		TypeOrmModule.forRoot(typeOrmConfig),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
