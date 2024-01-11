import { Body, Controller, Get, Post, Req, UseGuards, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import * as sanitizeHtml from 'sanitize-html';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService) {}


	@Get()
	saiHi() {
		return this.channelService.findAll();
	}

	@Post('/new_channel')
	@UseGuards(JwtAuthGuard)
	createNewChannel(@Req() req, @Body() { password_protected, password, title, is_private }) {
		// password_protected = DOMPurify.sanitize(password_protected);
		// password = DOMPurify.sanitize(password);
		// title = DOMPurify.sanitize(title);
		// is_private = DOMPurify.sanitize(is_private);
		if (!title)
			return 'failed';
		return this.channelService.createNewChannel({password_protected, password, title, is_private}, req.user );
	}

	@Post('/create-invitation')
	@UseGuards(JwtAuthGuard)
	inviteUser(@Req() req, @Body() { user_id, channelId }) { // TODO VERIFY THAT USER_ID IS OF A VALID USER
		// user_id = DOMPurify.sanitize(user_id);
		// channelId = DOMPurify.sanitize(channelId);
		if (!user_id || !channelId)
			return null;
		channelId = parseInt(sanitizeHtml(channelId));
		user_id = parseInt(sanitizeHtml(user_id));
		return this.channelService.inviteUserToChannel(user_id, channelId, req.user);
	}

	@Get('join_channel')
	@UseGuards(JwtAuthGuard)
	joinChannel(@Req() req, @Body() {password}) {

		// return this.channelService.verify_password('6', password);
	}

	@Get('/id/:id')
	// @UseGuards(JwtAuthGuard)
	async findById(@Param('id') id) {
		// id = DOMPurify.sanitize(id);
		id = parseInt(sanitizeHtml(id));
		return await this.channelService.findById(+id);
	}

	@Get('check/:id')
	@UseGuards(JwtAuthGuard)
	async checkIfUserIsInChannel(@Req() req, @Param('id') id) {
		//  id = DOMPurify.sanitize(id);
		return await this.channelService.checkIfUserIsInChannel(id, req.user);
	}

	@Get('is-private/:id')
	// @UseGuards(JwtAuthGuard)
	async checkIfPrivate(@Param('id') id) {
		//  id = DOMPurify.sanitize(id);
		return await this.channelService.checkIfPrivate(id);
	}

	@Get('/infos/:id')
	@UseGuards(JwtAuthGuard)
	async getSingleChannelInfo(@Req() req, @Param('id') id) {

	}

	@Post('test') // joins channel given the id and the users id TODO: use guards to subscribe user to channel
	@UseGuards(JwtAuthGuard)
	test(@Req() req, @Body() { channel_id }) {
		// channel_id = DOMPurify.sanitize(channel_id);
		return this.channelService.addToChannel(channel_id, req.user);
	}

	@Post('/join/private')
	@UseGuards(JwtAuthGuard)
	joinPrivateChannel(@Req() req, @Body() { channel_id, password}) {
		// channel_id = DOMPurify.sanitize(channel_id);
		// password = DOMPurify.sanitize(password);
		return this.channelService.addToPrivateChannel(channel_id, req.user, password);
	}

	@Post('/:id/send-message')
	@UseGuards(JwtAuthGuard)
	async sendMessage(@Req() req, @Body() { channel_id, body  }) {
		// channel_id = DOMPurify.sanitize(channel_id);
		// body = DOMPurify.sanitize(body);
		return await this.channelService.sendMessageToChannel({channel_id, body}, req.user);
	}

	@Get('/singlechannel/find/:id')
	@UseGuards(JwtAuthGuard)
	async getMessages(@Req() req, @Param('id') id) {
		// id = DOMPurify.sanitize(id);
		return await this.channelService.getMessages(id, req.user);
	}

	@Get('/singlechannel/is-user-member')
	@UseGuards(JwtAuthGuard)
	async isUserInside() {
		
	}

	@Post('/leave/:id')
	@UseGuards(JwtAuthGuard)
	async leaveChannel(@Req() req, @Param('id') id) {
		// id = DOMPurify.sanitize(id);
		return await this.channelService.leaveChannel(id, req.user);
	}
	
	@Patch('/ban')
	@UseGuards(JwtAuthGuard)
	async banUser(@Req() req, @Body() {userId, channelId}) {
		// userId = DOMPurify.sanitize(userId);
		// channelId = DOMPurify.sanitize(channelId);
		return await this.channelService.removeUserFromChannel(userId, channelId, req.user);
	}

	@Patch('/mute')
	@UseGuards(JwtAuthGuard)
	async muteUser(@Req() req, @Body() {userId, channelId}) {
		// userId = DOMPurify.sanitize(userId);
		// channelId = DOMPurify.sanitize(channelId);
		return await this.channelService.muteUserFromChannel(userId, channelId, req.user);
	}

	@Patch('/remove-mute')
	@UseGuards(JwtAuthGuard)
	async unMuteUser(@Req() req, @Body() {userId, channelId}) {
		// userId = DOMPurify.sanitize(userId);
		// channelId = DOMPurify.sanitize(channelId);
		return await this.channelService.unMuteUserFromChannel(userId, channelId, req.user);
	}

	@Patch('set-password')
	@UseGuards(JwtAuthGuard)
	async setChannelPassword(@Req() req, @Body() {password, channelId}) {
		return await this.channelService.setChannelPassword(password, channelId, req.user);
	}

	@Patch('/:id/make-admin')
	@UseGuards(JwtAuthGuard)
	async makeAdmin(@Req() req, @Param('id') channelId, @Body() {userToAddId}) {
		// channelId = DOMPurify.sanitize(channelId);
		// userToAddId = DOMPurify.sanitize(userToAddId);
		return await this.channelService.makeAdmin(channelId, userToAddId, req.user.user_id);
	}

	@Patch('/:id/remove-admin')
	@UseGuards(JwtAuthGuard)
	async removeAdmin(@Req() req, @Param('id') channelId, @Body() {userToAddId}) {
		// channelId = DOMPurify.sanitize(channelId);
		// userToAddId = DOMPurify.sanitize(userToAddId);
		return await this.channelService.removeAdmin(channelId, userToAddId, req.user.user_id);
	}



}
