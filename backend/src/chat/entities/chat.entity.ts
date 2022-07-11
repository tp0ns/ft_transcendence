import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

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

	//faire la date de crea 
	//faire le time de la derniere activite sur le chan
	//faire bannedUsers
	//faire MuttedUsers
	//faire AdminUsers
	//faire UsersIn





}