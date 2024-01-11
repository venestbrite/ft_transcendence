import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Channel } from './entities/channel.entity'
import * as bcrypt from 'bcrypt';
import { ChannelMessage } from './entities/channel-message.entity';
import { ConfigService } from "@nestjs/config";
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class ChannelsService {
	constructor(@InjectRepository(Channel) private channelRepository: Repository<Channel>,
				@InjectRepository(ChannelMessage) private messageRepository: Repository<ChannelMessage>,
				private configService: ConfigService) {}


	async findAll() {
	//	return await this.channelRepository.find();
		const channels = await this.channelRepository.find();
		let data_to_ret = [];
		for (let i = 0; i < channels.length; i++) {
			const obj = {
				"title": channels[i].title,
				"private": channels[i].private == true ? 'Yes' : 'No',
				"password_protected": channels[i].password_protected == true ? 'Yes' : 'No',
				"created": this.calcDate(channels[i].created, new Date()),
				"members": channels[i].members.length,
				"link": `${this.configService.get<string>("CORS_URL")}/join-channel?id=${channels[i].id}`
			}
			data_to_ret.push(obj);
		}
		return data_to_ret;
	}

	calcDate(date_1, date_2): string {
		let to_return = '';
		const diff = date_2 - date_1;
		const num_of_days = diff / (1000 * 60 * 60 * 24);   
		if (num_of_days < 1) {
			const num_of_minutes = Math.floor((diff / 1000 / 60));
			if (num_of_minutes < 2)
				to_return = 'Few Seconds ago';
			else if (num_of_minutes > 2 && num_of_minutes < 61)
				to_return = num_of_minutes + ' minutes ago';
			else {
				const num_of_hours = Math.floor(num_of_minutes / 60);
				if (num_of_hours < 2)
					to_return = '1 hour ago';
				else
					to_return = num_of_hours + ' hours ago';
			}
		}
		else {
			if (Math.floor(num_of_days) < 2)
				to_return = 'Yesterday';
			else
				to_return = Math.floor(num_of_days).toString() + ' days ago';
		}
		return to_return; 
	}

	async createNewChannel({password_protected, password, title, is_private}, user) {
		const channel = await this.channelRepository.find({title: sanitizeHtml(title)});
		if (channel.length > 0) // found 
			return 'NOT UNIQUE';
		const saltOrRounds = 10;
		let hash;
		let to_insert;
		if (password_protected) {
			hash = await bcrypt.hash(password, saltOrRounds);
		}
		else
			hash = null;

		let members: number[] = [];
		members.push(user.user_id);
		to_insert = {
			"admins": members,
			"members": members,
			"owner": parseInt(sanitizeHtml(user.user_id.toString())),
			"title": sanitizeHtml(title), // SANITIZE
			"private": is_private, 
			"created": new Date(),
			"password_protected": password_protected,
			"password": hash
		}
		try {
			this.channelRepository.save(to_insert);
		} catch (error) {
			return error.detail;
		}
		return 'OK';
		// return await this.channelRepository.save(createChannelDto);
	}

	async verify_password(id, password: string) {
		const channel = await this.channelRepository.findByIds(id);
		return await bcrypt.compare(password, channel[0].password);
	}

	async checkIfPrivate(id) {
		const channel = await this.channelRepository.findOne(id);
		if (!channel)
			return false;
		if (channel.password_protected == true || channel.private == true)
			return true;
		return false;
	}

	async addToChannel(channel_id, user) {
		const channel = await this.channelRepository.findByIds(channel_id);
		if (channel.length < 1) // DONT KNOW IF THIS WORKS
			return 'failed';
		const channel_update = {
			"members": this.checkAndAdd(channel[0].members, parseInt(user.user_id)),
		}
		return await this.channelRepository.update(channel[0].id, channel_update);
	}

	async addToPrivateChannel(channel_id, user, password) {
		const channel = await this.channelRepository.findByIds(channel_id);
		if (channel.length < 1) // DONT KNOW IF THIS WORKS
			return 'failed';
		const correct = await bcrypt.compare(password, channel[0].password);
		if (!correct) {
			return 'wrong password';
		}
		const channel_update = {
			"members": this.checkAndAdd(channel[0].members, user.user_id)
		}
		return await this.channelRepository.update(channel[0].id, channel_update);
	}

	checkAndAdd(members, user_id: number) {
		if (!user_id)
			return members;
		if (members.includes(user_id))
			return members;
		else
			members.push(user_id);
		return members;
	}

	async findById(id) {
		return await this.channelRepository.findOne(id);
	}

	async checkIfUserIsInChannel(channel_id, user) 
	{
		const channel = await this.findById(channel_id);
		if (channel) {
			const users = channel.members;
			if (users.includes(parseInt(user.user_id)) || channel.admins.includes(parseInt(user.user_id)))
				return channel;
			else
				return false;
		}
		else {
			return 'failed';
		}
	}

	async checkIfMuted(channel_id, user_id) {
		const channel = await this.findById(channel_id);
		if (!channel)
			return true;
		if (channel.muted.includes(parseInt(user_id)))
			return true;
		return false;
	}

	async sendMessageToChannel({channel_id, body}, user) {
		const check_res = await this.checkIfUserIsInChannel(channel_id, user);
		const is_muted = await this.checkIfMuted(channel_id, user.user_id);
		if (check_res == false || check_res == 'failed')
			return ;
		if (is_muted) 
			return 'muted';
		const message_dto = {
			"user_from": user.user_id,
			"channel_id": channel_id,
			"body": body,
			"date": new Date()
		}
		return await this.messageRepository.save(message_dto);
	}

	async getMessages(channel_id, user) {
		const check_res = await this.checkIfUserIsInChannel(channel_id, user);
		if (check_res == false || check_res == 'failed')
			return ;
		return this.messageRepository.find({
			where: [
				{ channel_id: channel_id},
			],
			order: {
				id: "DESC"
			},
			take: 10,
		});
	}

	async leaveChannel(channel_id, user) {
		const channel = await this.channelRepository.findByIds(channel_id);
		if (channel.length < 1) // DONT KNOW IF THIS WORKS
			return 'failed';
		let members = channel[0].members;
		let new_members: number[];
		if (members.includes(parseInt(user.user_id))) {
			const index = members.indexOf(parseInt(user.user_id));
			if (index > -1) {
				members.splice(index, 1); // 2nd parameter means remove one item only
			}
			new_members = members;
		}
		else
			return 'failed';
		const channel_update = {
			"members": new_members,
		}
		return await this.channelRepository.update(channel[0].id, channel_update);
	}

	async makeAdmin(channelId, userId, adminId) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel)
			return 'failed';
		let admins = channel.admins;
		if (!admins.includes(parseInt(adminId)))
			return 'failed';
		if (!admins.includes(parseInt(userId))) {
			channel.admins.push(parseInt(userId));
			this.channelRepository.update(channelId, {admins: channel.admins});
			return 'OK';
		}
		return 'failed';
	}

	async removeAdmin(channelId, userId, adminId) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel || !channel.admins)
			return 'failed';
		if (!(channel.admins.includes(parseInt(adminId)))) {
			return 'Not admin';
		}
		if (channel.admins.includes(parseInt(userId))) {
			let index = channel.admins.indexOf(parseInt(userId));
			channel.admins.splice(index, 1);
			this.channelRepository.update(channelId, {admins: channel.admins});
			return 'OK';
		}
		return 'failed';
	}

	async inviteUserToChannel(user_id, channelId, user_from) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel || !channel.admins)
			return 'failed';
		if (!(channel.admins.includes(user_from.user_id))) {
			return 'Not admin';
		}
		channel.members = this.checkAndAdd(channel.members, parseInt(user_id));
		try {
			this.channelRepository.update(channelId, {members: channel.members}); 
		}
		catch(error) {
			return 'FAILED';
		}
		return 'OK';
		/* 
		const user_to_add = await this.userService.findByNameOrUsername(username);
		if (!user_to_add)
			return 'failed';
		channel.members = this.checkAndAdd(channel.members, user_to_add.id.toString());
		return await this.channelRepository.update(channelId, {members: channel.members}); */
	}

	async removeUserFromChannel(user_id, channelId, user_from) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel || !channel.admins)
			return 'failed';
		if (!(channel.admins.includes(user_from.user_id))) {
			return 'Not admin';
		}
		if (channel.members.includes(parseInt(user_id))) {
			let index = channel.members.indexOf(parseInt(user_id));
			channel.members.splice(index, 1);
			this.channelRepository.update(channelId, {members: channel.members});
			return 'OK';
		}
		return 'failed';
	}

	async muteUserFromChannel(user_id, channelId, user_from) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel || !channel.admins)
			return 'failed';
		if (!(channel.admins.includes(user_from.user_id))) {
			return 'Not admin';
		}
		if (!channel.muted.includes(parseInt(user_id))) {
			channel.muted.push(parseInt(user_id));
			this.channelRepository.update(channelId, {muted: channel.muted});
			return 'OK';
		}	
		return 'failed';
	}

	async unMuteUserFromChannel(user_id, channelId, user_from) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel || !channel.admins)
			return 'failed';
		if (!(channel.admins.includes(user_from.user_id))) {
			return 'Not admin';
		}
		if (channel.muted.includes(parseInt(user_id))) {
			let index = channel.muted.indexOf(parseInt(user_id));
			channel.muted.splice(index, 1);
			this.channelRepository.update(channelId, {muted: channel.muted});
			return 'OK';
		}	
		return 'failed';
	}

	async setChannelPassword(password: string, channelId, user_from) {
		const channel = await this.channelRepository.findOne(channelId);
		if (!channel || !channel.admins)
			return 'failed';
		if (!(channel.owner == user_from.user_id)) {
			return 'Not admin';
		}
		const saltOrRounds = 10;
		
		const hash = await bcrypt.hash(password, saltOrRounds);
		this.channelRepository.update(channelId, {password: hash, password_protected: true});
		return 'OK';
	}

	
}

