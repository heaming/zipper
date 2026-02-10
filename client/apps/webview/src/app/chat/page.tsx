/**
 * 채팅 목록
 */

import { Card, CardContent, Badge } from '@ui/index'

export default function ChatPage() {
  const chats = [
    {
      id: '1',
      type: '같이사요',
      title: '닭가슴살 공구',
      lastMessage: '제가 주문할게요!',
      time: '3분 전',
      unreadCount: 2,
    },
    {
      id: '2',
      type: '1:1',
      title: '민수님',
      lastMessage: '아기 옷 내일 드릴게요',
      time: '1시간 전',
      unreadCount: 0,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-text-primary">채팅</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-3">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">아직 채팅이 없어요</p>
          </div>
        ) : (
          chats.map((chat) => (
            <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-xs">
                        {chat.type}
                      </Badge>
                      <h3 className="font-semibold text-text-primary truncate">
                        {chat.title}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <div className="ml-2 flex flex-col items-end shrink-0">
                    <span className="text-xs text-text-tertiary mb-1">
                      {chat.time}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}
