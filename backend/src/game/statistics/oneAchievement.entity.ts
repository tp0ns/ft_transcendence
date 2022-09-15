import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity('achievements')
export class AchievementsEntity extends BaseEntity {

	@PrimaryColumn()
	name: string;

	@Column({
		default: false,
	})
	path: string;
}
