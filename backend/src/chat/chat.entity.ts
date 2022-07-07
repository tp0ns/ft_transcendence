import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chats')

export class Chat extends BaseEntity {

	@PrimaryGeneratedColumn({
		comment: "prout",
	})

	id : number;

}