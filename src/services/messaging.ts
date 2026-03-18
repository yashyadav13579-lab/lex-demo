import { prisma } from '@/lib/prisma'

type ThreadType = 'DIRECT' | 'MATTER' | 'PANEL'

export async function createThread(params: {
  type: ThreadType
  subject?: string
  matterId?: string
  panelId?: string
}) {
  return prisma.messageThread.create({
    data: {
      type: params.type,
      subject: params.subject,
      matterId: params.matterId,
      panelId: params.panelId
    }
  })
}

export async function sendMessage(params: {
  threadId: string
  senderId: string
  content: string
}) {
  return prisma.message.create({
    data: {
      threadId: params.threadId,
      senderId: params.senderId,
      content: params.content
    }
  })
}
