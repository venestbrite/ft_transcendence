import {
	Column,
	Entity,
	JoinTable,
	ManyToMany, ManyToOne,
	OneToMany,
	PrimaryColumn,
	Unique,
	PrimaryGeneratedColumn,
} from "typeorm";


@Entity("channel")
@Unique(["title"])
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column("int", {array: true, default: []})
	admins: number[];

	@Column()
	title: string;

	@Column()
	owner: number;

	@Column("int", {array: true, default: []})
	members: number[];

	@Column("int", {array: true, default: []})
	banned: number[];

	@Column("int", {array: true, default: []})
	muted: number[];

	@Column()
	created: Date;

	@Column()
	private: boolean;

	@Column()
	password_protected: boolean;

	@Column({nullable: true})
	password: string;


}
