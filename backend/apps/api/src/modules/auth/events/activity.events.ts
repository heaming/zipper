export class PostCreatedEvent {
  constructor(public readonly userId: number) {}
}

export class CommentCreatedEvent {
  constructor(public readonly userId: number) {}
}

export class PostLikedEvent {
  constructor(public readonly postAuthorId: number) {}
}

export class UserReportedEvent {
  constructor(public readonly reportedUserId: number) {}
}
