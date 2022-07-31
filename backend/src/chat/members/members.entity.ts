import UserEntity from "src/user/models/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";
// import { Channel } from "../channel/channel.entity";

@Entity('members') 
export class MembersEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid') 
	memberId : string

	@Column({
		default: false,
	})
	ban : boolean

	@Column({
		default: false,
	})
	mute : boolean

	@Column({
		default: false,
	})
	admin: boolean

	/**
	 * Un membre peut avoir plusieurs channels
	 */
	@ManyToOne(() => ChannelEntity, (channel) => channel.channelId, {
		eager: true,
	})
	channel : ChannelEntity

	/**
	 * Un type de membre peut avoir plusieurs users
	 */
	@ManyToOne(() => UserEntity, (user) => user.userId, {
	})
	user: UserEntity

}