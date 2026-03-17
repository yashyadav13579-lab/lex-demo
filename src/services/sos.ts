import { prisma } from '@/lib/prisma'
import { IncidentStatus } from '@prisma/client'

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
      status: IncidentStatus.OPEN
    }
  })
}

export async function closeSOSIncident(id: string, closedById?: string) {
  return prisma.sosIncident.update({
    where: { id },
    data: {
      status: IncidentStatus.CLOSED,
      closedAt: new Date()
    }
  })
}
