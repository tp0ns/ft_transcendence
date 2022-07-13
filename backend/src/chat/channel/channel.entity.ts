import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chat')
export class Channel extends BaseEntity {

	@PrimaryGeneratedColumn("uuid")
	channelId: string;

	@Column({
		type: 'varchar',
	})
	title: string;

}
