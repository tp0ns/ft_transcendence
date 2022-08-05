import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { UnauthorizedExceptionFilter } from './unauthorized.filter';


async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.use(cookieParser());
	app.setGlobalPrefix('backend');
	const config = new DocumentBuilder()
		.setTitle('ft_transcendence')
		.setDescription('All frontend requests listed by category')
		.setVersion('1.0')
		.addTag('users')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('backend/api', app, document);
	await app.listen(3000);
}
bootstrap();
