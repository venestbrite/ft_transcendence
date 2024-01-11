import { IsOptional, IsString } from "class-validator";

export class CreateAchiDto {

	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsString()
	image: string;


}
