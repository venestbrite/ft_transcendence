import {
	BeforeInsert,
	Column,
	Entity,
	JoinTable,
	ManyToMany, ManyToOne,
	OneToMany,
	PrimaryColumn,
	Unique,
	PrimaryGeneratedColumn,
} from "typeorm";


@Entity("private-message")
export class PrivateMessage {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	user_from: number;

	@Column()
	user_to: number;

	@Column()
	body: string;

	@Column()
	date: Date;

	@Column({default: false})
	read: Boolean

	@Column({default: false})
	gif: Boolean;

	@Column({default: null, nullable: true})
	gif_url: String;

}
