import { IsDate, IsNumber, IsString } from "class-validator"

export class CreateChannelDto {

	@IsString()
	title: string;

	@IsString()
	admins: string;

	@IsString()
	members: string;

	@IsString()
	password: string;

	created: Date;

	
}
