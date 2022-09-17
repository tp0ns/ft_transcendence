import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('matchHistory')
export class MatchHistoryEntity extends BaseEntity {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		nullable: true,
	})
	winnerUsername: string;

	@Column({
		nullable: true,
	})
	winnerScore: number;	
	
	@Column({
		nullable: true,
	})
	loserUsername: string;

	@Column({
		nullable: true,
	})
	loserScore: number;
}
