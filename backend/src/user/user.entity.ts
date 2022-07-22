import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
		type: 'boolean',
		default: false,
	})
	owner: boolean;

	// @ManyToMany((type) => Channel)
	// public memberOfChannels: Channel[];

}

export default User;
