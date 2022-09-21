import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { globalExceptionFilter } from './globalException.filter';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalFilters(new globalExceptionFilter());
	app.use(cookieParser());
	app.useStaticAssets(join(__dirname, '..', 'uploads'), {
		prefix: '/uploads/',
	});
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
