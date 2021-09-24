import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import UserI from './user.interface';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Injectable()
export class UserService {
	constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
	private jwtService: JwtService
	) {}

	async findUser(id: number): Promise<UserI> {
		const user = await this.usersRepository.findOne({id}, {select: ['id', 'firstName', 'lastName', 'username', 'email']});
		if (!user)
			throw new HttpException('user Not Found', HttpStatus.NOT_FOUND);
		return user;
	}

	async editUser(id: number, data: UpdateUserDto): Promise<string> {
		const user = await this.usersRepository.findOne({id})
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
		await this.usersRepository.update({id}, data)
		return "User Updated"
	}

	async deleteUser(id: number): Promise<string> {
		const user = await this.usersRepository.findOne({id})
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
		await this.usersRepository.remove(user)
		return "user deleted";
	}

	async allUsers(): Promise<UserI[]> {
		return await this.usersRepository.find({select: ['id', 'firstName', 'lastName', 'username', 'email']});
	}

	async register(userDto: CreateUserDto) {
		if (!userDto.username || !userDto.email || !userDto.password || !userDto.firstName || !userDto.lastName)
			throw new HttpException('You must fill all info', HttpStatus.BAD_REQUEST)
			const already = await this.usersRepository.findOne({ username: userDto.username })
		if (already)
			throw new HttpException('You have an account, try to login', HttpStatus.BAD_REQUEST)
			
		userDto.password = await bcrypt.hash(userDto.password, 10)
		await this.usersRepository.create(userDto);
		const {password, friendRequest, id, ...newUser } = await this.usersRepository.save(userDto);
		return newUser;
	}

	async login(bd: LoginUserDto){
		const username: string = bd.username
		const user = await this.usersRepository.findOne({username})
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
		if (!await bcrypt.compare(bd.password, user.password))
			throw new HttpException('Password incorrect', HttpStatus.FORBIDDEN)

		const jwt = await this.jwtService.signAsync({id: user.id})
		const { password, friendRequest, ...rest }  = user;
		return {
			token: jwt,
			...rest
		};
	}

	async logout() {
		return "logout success"
	}

	async profile(req: Request) {
		try {
			const cookie = req.cookies['token'];
			const data = await this.jwtService.verifyAsync(cookie);
			const user = await this.findUser(data.id)
			return user;
		}
		catch (e) {
			throw new UnauthorizedException()
		}
	}

	async getByEmail(email: string): Promise<UserI> {
		const user = await this.usersRepository.findOne({email}, {select: ['id', 'username', 'email']})
		if (!user)
			throw new HttpException('no user exist with this email', HttpStatus.NOT_FOUND)
		return user;
	}

	async getByUsername(username: string) {
		const user = await this.usersRepository.findOne({username}, {select: ['id', 'username', 'email']})
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
		return user;
	}

	async deleteAll() {
		await this.usersRepository.clear()
		return "all Cleared"
	}

	async allRelations() {
		const users = await this.usersRepository.find({select: ['id', 'username', 'friendRequest', 'friends']})
		if (!users)
			throw new HttpException("no relation found", HttpStatus.NOT_FOUND)
		return users
	}
	
	async sendRequest(req: Request, bd: UserI) {
		const user = await this.usersRepository.findOne({id: (await this.profile(req)).id});
		const friend = await this.usersRepository.findOne({id: bd.id});
		if (!friend)
			throw new HttpException('user not found', HttpStatus.NOT_FOUND)
		if (user.friendRequest && await user.friendRequest.indexOf(friend))
			throw new HttpException('you already send friend request', HttpStatus.BAD_REQUEST)
		if (friend.friendRequest && await friend.friendRequest.indexOf(user) > -1)
			throw new HttpException('you already have friend request from this user', HttpStatus.BAD_REQUEST)
		if (friend.friends && await friend.friends.indexOf(user) > -1)
			throw new HttpException('you\'re already friend',HttpStatus.BAD_REQUEST)
		
		// await friend.friendRequest.push(user)
		friend.friendRequest = [user]
		await this.usersRepository.save(friend)

		return friend
	}

	async acceptRequest(req: Request, bd: UserI) {
		const user = await this.usersRepository.findOne({id: (await this.profile(req)).id});
		if (!bd.id)
			throw new HttpException('you must provid id', HttpStatus.BAD_REQUEST)

		let friend
		if (!(friend = await this.usersRepository.findOne({id: bd.id})))
			throw new HttpException('user not found', HttpStatus.NOT_FOUND)
		if (user.friends && await user.friends.indexOf(friend))
			throw new HttpException('you\'re already friend', HttpStatus.BAD_REQUEST)
		
		let index
		if (user.friendRequest) 
			index = await user.friendRequest.indexOf(friend)
		if (index == -1)
			throw new HttpException('you cant\'t accept someone doesn\'t sent you friend request', HttpStatus.BAD_REQUEST)
		
		// user.friends.push(friend)
		// user.friendRequest.slice(index)
		// friend.friends.push(user)
		// user.friends = [friend]
		user.friendRequest = []
		await this.usersRepository.save(user)
		friend.friends = [user]
		await this.usersRepository.save(friend)

		return friend
	}
	
}
