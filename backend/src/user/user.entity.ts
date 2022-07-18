import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { FriendRequestEntity } from './models/friend-request.entity';

@Entity()
export class User {
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

	@Column({
		type: 'varchar',
	})
	image_url: string;

	@Column({
		nullable: true,
		type: 'varchar',
	})
	profileImage: string;

	// @Column()
	// @OneToMany(
	// 	() => FriendRequestEntity,
	// 	(friendRequestEntity) => friendRequestEntity.creator,
	// )
	// sentFriendRequests: FriendRequestEntity[];

	// @Column()
	// @OneToMany(
	// 	() => FriendRequestEntity,
	// 	(friendRequestEntity) => friendRequestEntity.receiver,
	// )
	// receivedFriendRequests: FriendRequestEntity[];
}
