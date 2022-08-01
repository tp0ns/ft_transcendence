import UserEntity from "src/user/models/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";

@Entity('messages')
export class MessagesEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	channelId: string;

	@Column({
		default: "",
	})
	message: string

	@ManyToOne(() => ChannelEntity, (channel) => channel.channelId, {
		eager: true,
	})
	channel : ChannelEntity

	@ManyToOne(() => UserEntity, (user) => user.userId, {
	})
	user: UserEntity
}
