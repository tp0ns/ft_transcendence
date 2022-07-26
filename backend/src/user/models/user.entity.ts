import { ChannelEntity } from 'src/chat/channel/channel.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { RelationEntity } from '../relations/models/relations.entity';

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn('uuid')
	userId: string;

	@Column({
		type: 'int',
		unique: true,
	})
	schoolId: number;

	@Column({
		type: 'varchar',
	})
	username: string;

	@Column({ nullable: true })
	public twoFASecret?: string;

	@Column({ default: false })
	public isTwoFAEnabled: boolean;
	@Column({
		type: 'varchar',
	})
	image_url: string;

	@Column({
		nullable: true,
		type: 'varchar',
	})
	profileImage: string;

	@Column({
		default: false,
	})
	twoFa: boolean;

	@OneToMany(() => RelationEntity, (RelationEntity) => RelationEntity.creator)
	sentRelations: RelationEntity[];

	@OneToMany(() => RelationEntity, (RelationEntity) => RelationEntity.receiver)
	receivedRelations: RelationEntity[];

	@ManyToMany(() => ChannelEntity, (channel) => channel.members, {
		eager: false,
	})
	channels: ChannelEntity[];
}

export default UserEntity;
