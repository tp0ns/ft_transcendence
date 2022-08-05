import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { ChatModule } from './websocket/general.module';
import { AuthModule } from './auth/auth.module';
import { TwoFAModule } from './auth/2FA/twoFA.module';
import { ConfigModule } from '@nestjs/config';
import { RelationsModule } from './user/relations/relations.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
		}),
		UserModule,
		RelationsModule,
		AuthModule,
		TwoFAModule,
		ChatModule,
		TypeOrmModule.forRoot(typeOrmConfig),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
