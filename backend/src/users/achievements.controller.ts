import {
	Controller,
	Get,
	Post,
	Body,
	Req,
	Res,
	Patch,
	Param,
	Delete,
	Request,
	UseGuards, UploadedFile, UseInterceptors, NotFoundException, BadRequestException, Logger
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { Serialize } from "./users.interceptor";
  import { UserDto } from "./dto/user.dto";
  import { AuthGuard } from '@nestjs/passport';
  import { response, Response } from 'express';
  import { FileInterceptor } from "@nestjs/platform-express";
  import * as fs from "fs";
  import { diskStorage } from "multer";
  import * as path from "path";
  import { JwtAuthGuard } from "../auth/jwt-auth.guard";
  import { CreateAchiDto } from './dto/create-achi.dto';
  import { AchievementDto } from './dto/achievement.dto';
  
  // const utils = {
  //   getFileExtension()
  // }
  
  @Controller('achievements')
  @Serialize(AchievementDto) 
  export class AchievementController {
  
  
	constructor(private readonly usersService: UsersService) {}
  
	@Post()
	createAchi(@Body() createAchiDto: CreateAchiDto) {
	  return this.usersService.createAchi(createAchiDto);
	}
	
	@Get()
	findAchi() {
	  return this.usersService.findAllAchivements();
	}
  
	@Get('/:id')
	findSingleAchi(@Param('id') id) {
		//  id = DOMPurify.sanitize(id);
	  return this.usersService.findAchiById(id);
	}
  
  
  }
  