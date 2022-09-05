import UserEntity from 'src/user/models/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelEntity } from '../channel/channel.entity';

@Entity('messages')
export class MessagesEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		default: '',
	})
	message: string;

	@ManyToOne(() => ChannelEntity, (channel) => channel.messages, {
		eager: true,
		cascade: true,
		onDelete: 'CASCADE',
	})
	channel: ChannelEntity;

	@ManyToOne(() => UserEntity, (user) => user.userId, {})
	user: UserEntity;
}
