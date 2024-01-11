import { Expose } from "class-transformer";
import { IsString } from "class-validator";
import {
	BeforeInsert,
	Column,
	Entity,
	JoinTable,
	ManyToMany, ManyToOne,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	Unique
} from "typeorm";

@Entity()
export class LiveGame {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	user_1_id: number;

	@Column()
	user_2_id: number;
 
    @Column()
    @Expose()
    game_id: string;


}
