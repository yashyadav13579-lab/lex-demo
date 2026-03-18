import { prisma } from '@/lib/prisma'

export async function createSOSIncident(params: {
  advocateId: string
  description?: string
  latitude?: number
  longitude?: number
}) {
  return prisma.sosIncident.create({
    data: {
      advocateId: params.advocateId,
      description: params.description,
      latitude: params.latitude,
      longitude: params.longitude,
      status: 'OPEN'
    }
  })
}

export async function closeSOSIncident(id: string, closedById?: string) {
  return prisma.sosIncident.update({
    where: { id },
    data: {
      status: 'CLOSED',
      closedAt: new Date()
    }
  })
}
