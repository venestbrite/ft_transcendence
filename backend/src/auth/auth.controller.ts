import
{
	Controller,
	Get,
	Post,
	Request,
	Res,
	Req,
	Query,
	Session,
	UseGuards,
} from '@nestjs/common';


import { HttpService } from '@nestjs/axios'
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { Api42Strategy } from './api42.strategy';
import { UsersService } from 'src/users/users.service';
import { stringify } from 'querystring';
import { Serialize } from 'src/users/users.interceptor';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from "@nestjs/config";
// In ES modules
import * as sanitizeHtml from 'sanitize-html';

@Controller('auth')
export class AuthController
{
	constructor(
		private authService: AuthService,
		private jwtService: JwtService,
		private service: ConfigService
	) {}

	@Get('api42')
	@UseGuards(AuthGuard('api42'))
	async getUserFromLogin(@Req() req): Promise<any> {
		return req.user;
	}

	@Get('/generate-qr')
	@UseGuards(JwtAuthGuard)
	generateQr(@Request() req, @Res() res: Response) {
		// const username = DOMPurify.sanitize(req.user.username);
		const username = sanitizeHtml(req.user.username);
		const secret_code = this.authService.generateRandomString(10);
		const data = this.authService.generateQrCode(username, secret_code);
		this.authService.updateUserAuthCode(req.user.user_id, secret_code);
		// save this secret generated code into database 
		data.subscribe((value) => {
			res.send(value.data);
		});
	}

	@Post('remove-2FA')
	@UseGuards(JwtAuthGuard)
	async removeQr(@Request() req, @Res() res: Response) {
		const user = await this.authService.findUserByName(sanitizeHtml(req.user.username));
		if (!user) {
			res.send('FAILED');
			return ;
		}
		this.authService.removeUser2FA(user.id);
		res.send('success');
	}

	@Get('/logout')
	logout(@Request() req, @Res() res: Response) {
		res.cookie('token', ' ');
		res.redirect(this.service.get<string>("CORS_URL"));
	}

	@Get('/verify-g-code')
	@UseGuards(JwtAuthGuard)
	async verifyQrCode(@Request() req, @Res() res: Response, @Query('code') code: string) {
		// code = DOMPurify.sanitize(code);
		code = sanitizeHtml(code);
		const user = await this.authService.findUserByName(sanitizeHtml(req.user.username));
		const secret_code = user.twoFactorAuthCode; // this should be retrieved from db 
		const data = this.authService.verifyGCode(code, secret_code);
		data.subscribe((value: any) => {
			if (value.data == 'True') {
				this.authService.updateUser2fa(user.id);
				res.send('approved');
			}
			else {
				res.send('FAILED');
			}
		});
	}

	@Get('/verify-login-2fa')
	async verifyLogin2fa(@Request() req, @Res() res: Response, @Query('code') code: string, @Query('username') username: string) {
		// code = DOMPurify.sanitize(code);
		// username = DOMPurify.sanitize(username);
		code = sanitizeHtml(code);
		username = sanitizeHtml(username);
		const user = await this.authService.findUserByName(username);
		const secret_code = user.twoFactorAuthCode; // this should be retrieved from db 
		const data = this.authService.verifyGCode(code, secret_code);
		data.subscribe((value: any) => {
			if (value.data !== "True") {
				res.send('FAILED');
			}
			else {
				const jwt = this.jwtService.sign({username: user.username, id: user.id});
				this.authService.updateUserStatus(user.id);
				res.cookie('token', jwt, { httpOnly: true });
				res.send('approved');
				
			}
		});
	}

	@Get('/success')
	@UseGuards(AuthGuard('api42'))
	async parseCode(@Request() req, @Res() res: Response) {
		const user = await this.authService.findUserByName(sanitizeHtml(req.user.username));
		if (user.twoFactorEnabled) {
			res.redirect(`${this.service.get<string>("CORS_URL")}/validation_code?username=${user.username}`);
			return ;
		}
		else
		{
			const jwt = this.jwtService.sign({username: req.user.username, id: req.user.id});
			res.cookie('token', jwt, { httpOnly: true });
			res.redirect(`${this.service.get<string>("CORS_URL")}/profile`);
			return jwt;
		}
	}

	@Get('/test')
	@UseGuards(JwtAuthGuard)
	async testService(@Request() req) {
		const user = await this.authService.findUserById(req.user.user_id);
		return 'youre inside guard';
	}

}

