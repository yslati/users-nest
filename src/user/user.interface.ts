export default interface UserI {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
}