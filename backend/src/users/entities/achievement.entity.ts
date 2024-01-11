import { Expose } from "class-transformer";
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
export class Achievement {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	@Column()
	image: string;


}
