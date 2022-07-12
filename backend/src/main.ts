import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UnauthorizedExceptionFilter } from './unauthorized-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.useGlobalFilters(new UnauthorizedExceptionFilter());
	const config = new DocumentBuilder()
		.setTitle('ft_transcendance')
		.setDescription('All frontend requests listed by category')
		.setVersion('1.0')
		.addTag('users')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(3000);
}
bootstrap();
