// UseCase (Nest 의존성 ❌)
import { Notifier, NotificationPayload } from '@domain/notification/ports/notifier.port';

export class SendNotificationUseCase {
  constructor(private readonly notifier: Notifier) {}

  async execute(payload: NotificationPayload): Promise<void> {
    await this.notifier.send(payload);
  }
}
