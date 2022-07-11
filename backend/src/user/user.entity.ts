import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId: string;

	@Column({
		type: 'int',
		unique: true
	})
	schoolId: number;

  @Column({
		type: 'varchar'
	})
  username: string;

	@Column({
		type: 'varchar'
	})
	image_url: string;

}
