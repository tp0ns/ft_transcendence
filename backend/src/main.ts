import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { UnauthorizedExceptionFilter } from './unauthorized-exception.filter';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'static'));
  app.use(cookieParser());
	app.useGlobalFilters(new UnauthorizedExceptionFilter());
  await app.listen(3000);
}
bootstrap();
