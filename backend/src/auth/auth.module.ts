import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { schoolStrategy } from './auth.strategy';

@Module({
	imports: [PassportModule.register(schoolStrategy)],
})
export class AuthModule {}
