import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('channel')

export class Channel extends BaseEntity {

	@PrimaryGeneratedColumn("uuid")
	channelId: string;

	// @Column({
	// 	type: 'boolean',
	// 	default: false,
	// })
	// isPrivate: boolean;

	@Column("text", {
		default: ""
	})
	title: string;

	@Column("text")
	owner: string;

	// @Column("text", {
	// 	default: ""
	// })
	// password: string;

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
