import { Injectable } from '@nestjs/common';
import { PrivateMessage } from './entities/private-message.entity';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrivateMessageDto } from './dto/create-priv-message.dto';
import * as sanitizeHtml from 'sanitize-html';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MessagesService {
	constructor(@InjectRepository(PrivateMessage) private privMessageRepository: Repository<PrivateMessage>,
				@InjectRepository(Notification) private notificationRepository: Repository<Notification>) {}


	async findAll() {
		return await this.privMessageRepository.find();
	}

	async saveMessage(messageDto: CreatePrivateMessageDto) {
		// console.log(messageDto);
		if (!messageDto.body || !messageDto.date || !messageDto.user_from || !messageDto.user_to)
			return 'failed';
		const save = await this.privMessageRepository.save(messageDto);
		const notif = await this.notificationRepository.save({
			user_from: messageDto.user_from,
			user_to: messageDto.user_to,
			body: messageDto.body,
			type: messageDto.gif == true ? "Gif" : "Message",
			message_id: save.id
		}); 
		return 'OK'; 
	}

	async findById(id) {
		return await this.privMessageRepository.findOne(id);
	}

	async findMessagesByUserId(id) {
		return await this.privMessageRepository.find({
			where: [
				{ user_from: id},
				{ user_to: id },
			],
			order: {
				id: "DESC"
			}
		});
	}

	async readMessages(from_id, messages) {
		for (let i = 0; i < messages.length; i++) {
			if (messages[i].user_to == from_id) {
				this.privMessageRepository.save({
					id: messages[i].id,
					read: true
				})
				this.notificationRepository.delete({message_id: messages[i].id}); 
				// this.notificationRepository.save({
				// 	user_from: messages[i].user_from,
				// 	user_to: messages[i].user_to,
				// 	body: messages[i].body,
				// 	message_id: messages[i].id,
				// 	delivered: true
				// })
				// console.log('from id', from_id);
			}
		}
		return ;
	}

	async findMessagesBetweenTwoUsers(id_from, id_2) {
		const messages = await this.privMessageRepository.find({
			where: [
				{ user_from: id_from, user_to: id_2},
				{ user_from: id_2, user_to: id_from },
			],
			order: {
				id: "DESC"
			}
		});
		// read messsages 
		this.readMessages(id_from, messages);
		return messages;
	}

	async findUnreadMessages(user_id: number) {
		let id: number = parseInt(sanitizeHtml(user_id.toString()));
		let messages = await this.privMessageRepository.find({
			where: [
				{user_to: id, read: false}
			],
			order: {
				id: "DESC"
			}
		})
		return (messages);
	}

	async findNotification(user_id: number) {
		let id: number = parseInt(sanitizeHtml(user_id.toString()));
		let notifications = await this.notificationRepository.find({
			where: [
				{user_to: id, delivered: false}
			],
			order: {
				id: "DESC"
			}
		})
		let notif_to_read = notifications;
		for(let i = 0; i < notif_to_read.length; i++) {
			notif_to_read[i].delivered = true;
			this.notificationRepository.save(notif_to_read[i])
		}
		return (notifications);
	}


	async readNotifications(user, id: number) {
		let notif = await this.notificationRepository.findOne(id);
		if (!notif || notif.user_to != user.user_id)
			return ;
		notif.delivered = true;
		return await this.notificationRepository.save(notif);
	}
}
