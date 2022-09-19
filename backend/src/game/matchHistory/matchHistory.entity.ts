import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('matchHistory')
export class MatchHistoryEntity extends BaseEntity {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	winnerUsername: string;

	@Column()
	winnerScore: number;	
	
	@Column()
	loserUsername: string;

	@Column()
	loserScore: number;
}
