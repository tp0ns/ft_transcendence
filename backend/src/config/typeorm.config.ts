import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
        type: 'postgres',
        host: 'pong-db',
        port: 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
		synchronize: true,
		logging: true
  };
