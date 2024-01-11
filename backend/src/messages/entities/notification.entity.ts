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


@Entity("notification")
export class Notification {
	@PrimaryGeneratedColumn()
	id: number;

    @Column({default: 'Message'})
    type: String

	@Column({nullable: true})
	user_from: number;

    @Column({nullable: true})
	user_to: number;

	@Column()
	body: String;

	@Column({nullable: true})
	message_id: number;

    @Column({default: false})
    delivered: Boolean;


}
