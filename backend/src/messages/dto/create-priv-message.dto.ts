import { IsDate, IsNumber, IsString } from "class-validator"

export class CreatePrivateMessageDto {
	@IsNumber()
    user_from: number;

	@IsNumber()
    user_to: number;

	@IsString()
	body: string;

	gif: Boolean;

	@IsDate()
	date: Date;
}
