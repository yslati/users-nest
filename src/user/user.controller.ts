import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import UserI from './user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}
	// UseGuard(JWT)

	@Put(':id')
	async editUser(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<string> {
		return this.userService.editUser(Number(id), data);
	}

	@Delete('all')
	async deleteAll() {
		return this.userService.deleteAll();
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string): Promise<string> {
		return this.userService.deleteUser(Number(id));
	}

	@Post('register')
	async register(@Body() bd: CreateUserDto) {
		return this.userService.register(bd);
	}

	@Post('login')
	async login(@Body() bd: LoginUserDto, @Res({passthrough: true}) res: Response) {
		const result = await this.userService.login(bd);
		res.cookie('token', result.token, { httpOnly: true})
		
		res.json(result)
	}

	@Post('logout')
	async logout(@Res({passthrough: true}) res: Response) {
		res.clearCookie('token')
		return this.userService.logout()
	}

	@Get('profile')
	async profile(@Req() req: Request) {
		return this.userService.profile(req);
	}

	@Get('relations')
	async allRelations() {
		return this.userService.allRelations()
	}

	@Get(':id')
  	findUser(@Param('id') id: string): Promise<UserI> {
    	return this.userService.findUser(Number(id));
  	}

	@Get()
	async allUsers(): Promise<UserI[]> {
		return this.userService.allUsers();
	}

	@Post('add')
	async sendRequest(@Req() req: Request, @Body() bd: UserI) {
		return this.userService.sendRequest(req, bd)
	}
	
	@Post('accept')
	async acceptRequest(@Req() req: Request, @Body() bd: UserI) {
		return this.userService.acceptRequest(req, bd)
	}
}
