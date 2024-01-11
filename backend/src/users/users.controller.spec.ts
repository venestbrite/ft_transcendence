import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import module from "node:module";
import { CreateUserDto } from "./dto/create-user.dto";

describe('UsersController', () => {
  let controller: UsersController;
  let repository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'db',
          port: 5432,
          username: 'postgres',
          password: 'password',
          database: 'e2e_test',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User])],
      controllers: [UsersController],
      providers: [UsersService]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    repository = module.get("UserRepository")

    try {
      await repository.query("CREATE DATABASE e2e_test;")
    } catch (e){}
  });

  afterAll(async () => {
    await repository.query("DELETE FROM public.user;")
    await repository.query("ALTER SEQUENCE public.user_id_seq RESTART WITH 1;")
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create user', async () => {
    const test: any = expect(await controller.create({
      username: "prova",
      oauthToken: "asdhowuhu3rh2ud3423423HDFEU",
      avatar: "default.jpg",
      twoFactorAuthCode: "asfdsfdd"
    }))

    test.toHaveProperty("id")
    test.toHaveProperty("username")
    test.toHaveProperty("oauthToken")
    test.toHaveProperty("avatar")
    test.toHaveProperty("twoFactorAuthCode")

  })
});
