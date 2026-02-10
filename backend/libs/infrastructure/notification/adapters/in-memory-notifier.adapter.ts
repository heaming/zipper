// Notifier Adapter (MVP용 간단 구현)
import { Injectable, Logger } from '@nestjs/common';
import { Notifier, NotificationPayload } from '@domain/notification/ports/notifier.port';

@Injectable()
export class InMemoryNotifierAdapter implements Notifier {
  private readonly logger = new Logger(InMemoryNotifierAdapter.name);

  async send(payload: NotificationPayload): Promise<void> {
    // MVP: 로그만 출력 (추후 FCM/APNs로 교체)
    this.logger.log(`[Notification] ${payload.type} to ${payload.userId}`);
    this.logger.log(`Title: ${payload.title}`);
    this.logger.log(`Content: ${payload.content}`);
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload);
    }
  }
}
