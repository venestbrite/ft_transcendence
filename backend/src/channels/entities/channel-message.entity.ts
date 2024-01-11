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


@Entity("channel-message")
export class ChannelMessage {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	user_from: number;

	@Column()
	channel_id: number;

	@Column()
	body: string;

	@Column()
	date: Date

}
