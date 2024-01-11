import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator"
import { LiveGame } from "../entities/live-game.entity";

export class LiveGameDto {

	@Expose()
	@IsNumber()
	user_1_id: number;

	@Expose()
	@IsNumber()
	user_2_id: number;

	@Expose()
	game_id: string;

	@Expose()
	@IsNumber()
	winner_id: number;

	@Expose()
	@IsNumber()
	loser_id: number;

	@Expose()
	@IsString()
	final_score: string;


}
