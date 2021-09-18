import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	username: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@ManyToMany(() => UserEntity)
	@JoinTable()
	friendRequest: UserEntity[];

	@ManyToMany(() => UserEntity)
	@JoinTable()
	friends: UserEntity[];

}