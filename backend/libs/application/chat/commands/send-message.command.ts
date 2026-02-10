// Command DTO (순수 TypeScript)
export class SendMessageCommand {
  constructor(
    public readonly roomId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly messageType: string = 'TEXT',
    public readonly imageUrl?: string,
  ) {}
}
