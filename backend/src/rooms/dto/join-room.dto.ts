import { IsString } from "class-validator"

export class JoinRoomDto {
    @IsString()
    name: string

    @IsString()
    password: string
}
