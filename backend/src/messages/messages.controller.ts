import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import * as sanitizeHtml from 'sanitize-html';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('messages')
// @Serialize(GameDto) 
export class MessagesController {
	constructor(private readonly messageService: MessagesService) {}

	@Post('/new_message')
	createNewMessage(@Body() details) {
		const msg_obj = {
			"user_from": details.user_from,
			"user_to": details.user_to,
			"date": new Date(),
			"body": sanitizeHtml(details.body), // PERFORM SOME VALIDATION HERE! ✅ DONE
			"read": false,
			"gif": details.gif,
			"gif_url": sanitizeHtml(details.gif_url)
		};
		return this.messageService.saveMessage(msg_obj);
	}           

	@Get()
	findAll() {
		return this.messageService.findAll();
	}

	@Get('/:id')
	findMessageById(@Param('id') id: string) {
	  return this.messageService.findById(+id);
	}

	@Get('/users/:id')
	findAllMessagesByUserId(@Param('id') id) {
		return this.messageService.findMessagesByUserId(id);
	}

	@Get('/singlechat/find') // to use guard for security reasons
	@UseGuards(JwtAuthGuard)
	findAllMessagesWithUserId(@Req() req, @Query('from_id') from_id, @Query('to_id') to_id) {
		return this.messageService.findMessagesBetweenTwoUsers(req.user.user_id, to_id);
	}

	@Get('/messages/unread')
	@UseGuards(JwtAuthGuard)
	findUnreadMessages(@Req() req) {
		return this.messageService.findUnreadMessages(req.user.user_id);
		return 'okay';
	}

	@Get('/lollo/find')
	@UseGuards(JwtAuthGuard)
	findNotification(@Req() req) {
		return this.messageService.findNotification(req.user.user_id);
		return 'okay';
	}

	@Post('/notifications/read')
	@UseGuards(JwtAuthGuard)
	readNotification(@Req() req, @Body('id') id) {
		return this.messageService.readNotifications(req.user, parseInt(id));
	}
}
