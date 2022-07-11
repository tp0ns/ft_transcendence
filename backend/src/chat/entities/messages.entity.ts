import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class Message extends BaseEntity {

	@PrimaryGeneratedColumn("uuid")
	messageId : string;

	//faire un manytoone pour relationner avec le channel 
	
}