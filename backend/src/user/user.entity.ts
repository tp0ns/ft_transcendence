import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

	@Column({ nullable: true })
	public twoFASecret?: string;

	@Column({ default: false })
	public isTwoFAEnabled: boolean;
}

export default User;
