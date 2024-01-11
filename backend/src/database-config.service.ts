import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {

    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: this.configService.get<any>("DB_DRIVER"),
            host: this.configService.get<string>("DB_HOST"),
            port: this.configService.get<number>("DB_PORT"),
            username: this.configService.get<string>("DB_USERNAME"),
            password: this.configService.get<string>("DB_PASSWORD"),
            database: this.configService.get<string>("DB_NAME"),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            // synchronize: this.configService.get<boolean>("DB_SYNC"),
            synchronize: true
        };
    }
}
