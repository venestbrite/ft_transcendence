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
import { Message } from "../../rooms/entities/message.entity";
import { Achievement } from "./achievement.entity";
import { ConfigService } from "@nestjs/config";

const service = new ConfigService();

@Entity("users")
@Unique(["username"])
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column({nullable: true})
	custom_username: string;

	@Column({ nullable: true, default: service.get<string>("BASE_URL") + "/default.png" })
	avatar: string;

	@Column({ nullable: true })
	twoFactorAuthCode: string;

	@Column()
	oauthToken: string;

	@Column({ nullable: true }) 
	twoFactorEnabled: boolean;

	@Column("int", {array: true, nullable: true, default: []})
	achievements: number[];

	@Column("int", {array: true, nullable: true, default: []})
	friends: number[];

	@Column({default: 'offline'})
	status: string;

	@Column({default: 0})
	num_wins: number;

	@Column("int", { array: true , default: []})
	blocked_users: number[];


	@Column({default: true})
	is_first_login: boolean;


	// @ManyToMany((type) => User, (user) => user.friends, {
	// 	onUpdate: "CASCADE"
	// })
	// @JoinTable({
	// 	schema: "public",
	// 	name: "users_friends_users",
	// 	joinColumn: {
	// 		name: "usersId_1"
	// 	}
	// })
	// friends: User[]

	@BeforeInsert()
	handleInsertion() {
		if (!this.avatar)
			this.avatar = process.env.AVATAR_PATH + "/default.png"
	}

}
