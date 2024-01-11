import { IsOptional, IsString } from "class-validator";
import { Achievement } from "../entities/achievement.entity";
import { User } from "../entities/user.entity";

export class CreateUserDto {

	@IsString()
	username: string;

	@IsString()
	oauthToken: string;

	@IsString()
	@IsOptional()
	avatar: string;

	@IsString()
	@IsOptional()
	custom_username: string;

	@IsString()
	@IsOptional()
	twoFactorAuthCode: string;

	@IsOptional()
	twoFactorEnabled: boolean;
	
	friends: number[];

	is_first_login: boolean;
	

}
