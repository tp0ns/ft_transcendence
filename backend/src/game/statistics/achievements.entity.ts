import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity('achievements')
export class AchievementsEntity extends BaseEntity {

	@PrimaryColumn()
	userId: string;

	@Column({
		default: false,
	})
	name: string;

	@Column({
		default: false,
	})
	Victoryx3: boolean;

	@Column({
		default: false,
	})
	Victoryx5: boolean;

	@Column({
		default: false,
	})
	Victoryx10: boolean;

	@Column({
		default: false,
	})
	Defeatx3: boolean;

	@Column({
		default: false,
	})
	FirstMatch: boolean;
}
