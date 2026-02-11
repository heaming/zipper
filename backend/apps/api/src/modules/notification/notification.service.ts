import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './domain/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
  ) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return null;
    }

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number) {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return {
      message: '모든 알림이 읽음 처리되었습니다.',
      readCount: result.affected || 0,
    };
  }

  async createNotification(data: {
    userId: number;
    type: NotificationType;
    title: string;
    content: string;
    relatedPostId?: number;
    relatedCommentId?: number;
    relatedChatRoomId?: number;
  }) {
    const notification = this.notificationRepository.create(data);
    return await this.notificationRepository.save(notification);
  }
}
