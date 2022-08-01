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

	@ManyToOne(() => ChannelEntity, (channel) => channel.channelId, {
		eager: true,
	})
	channel : ChannelEntity

	@ManyToOne(() => UserEntity, (user) => user.userId, {
	})
	user: UserEntity

}