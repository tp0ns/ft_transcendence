import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class Message extends BaseEntity {

	@PrimaryGeneratedColumn("uuid")
	messageId : string;

	@Column({
		type: 'varchar'
	})
	text: string;
}
