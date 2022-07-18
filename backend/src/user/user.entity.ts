import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}

export default User;
