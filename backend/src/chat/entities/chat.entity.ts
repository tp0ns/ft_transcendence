import { User } from "src/user/user.entity";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('chat')

export class Chat extends BaseEntity {

	@PrimaryGeneratedColumn("uuid")
	channelId: string;

	@Column({
		type: 'boolean',
		default: false,
	})
	isPrivate: boolean;

	@Column("text", { 
		default: ""
	})
	title: string;

	@Column("text", {
		default: ""
	})
	password: string;

	// @ManyToMany((type) => User, (user) => user.memberChannels, {
	//   })
	//   @JoinTable()
	//   public members: User[];

	//faire la date de crea 
	//faire le time de la derniere activite sur le chan
	//faire bannedUsers
	//faire MuttedUsers
	//faire AdminUsers
	//faire UsersIn





}