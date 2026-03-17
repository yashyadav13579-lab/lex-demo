import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AvailabilityMode } from '@prisma/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || undefined
  const language = searchParams.get('language') || undefined
  const practice = searchParams.get('practice') || undefined
  const jurisdiction = searchParams.get('jurisdiction') || undefined
  const availability = searchParams.get('availability') as AvailabilityMode | null

  const advocates = await prisma.advocateProfile.findMany({
    where: {
      verificationStatus: 'VERIFIED',
      AND: [
        location ? { jurisdictions: { has: location } } : {},
        language ? { languages: { has: language } } : {},
        practice ? { practiceAreas: { has: practice } } : {},
        jurisdiction ? { jurisdictions: { has: jurisdiction } } : {}
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          availability: true
        }
      }
    }
  })

  const rotated = advocates.sort((a, b) => (a.id > b.id ? 1 : -1))

  const filtered = availability
    ? rotated.filter((a) => a.user.availability?.mode === availability)
    : rotated

  return NextResponse.json(
    filtered.map((a) => ({
      id: a.id,
      name: a.user.name,
      email: a.user.email,
      languages: a.languages,
      practiceAreas: a.practiceAreas,
      jurisdictions: a.jurisdictions,
      availability: a.user.availability?.mode ?? AvailabilityMode.AVAILABLE
    }))
  )
}
