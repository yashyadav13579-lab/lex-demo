import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const AVAILABILITY_MODES = ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'] as const
type AvailabilityMode = (typeof AVAILABILITY_MODES)[number]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || undefined
  const language = searchParams.get('language') || undefined
  const practice = searchParams.get('practice') || undefined
  const jurisdiction = searchParams.get('jurisdiction') || undefined
  const rawAvailability = searchParams.get('availability')
  const availability =
    rawAvailability && AVAILABILITY_MODES.includes(rawAvailability as AvailabilityMode)
      ? (rawAvailability as AvailabilityMode)
      : null

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

  type AdvocateResult = (typeof advocates)[number]
  const rotated = advocates.sort((a: AdvocateResult, b: AdvocateResult) => (a.id > b.id ? 1 : -1))

  const filtered = availability
    ? rotated.filter((a: AdvocateResult) => a.user.availability?.mode === availability)
    : rotated

  return NextResponse.json(
    filtered.map((a: AdvocateResult) => ({
      id: a.id,
      name: a.user.name,
      email: a.user.email,
      languages: a.languages,
      practiceAreas: a.practiceAreas,
      jurisdictions: a.jurisdictions,
      availability: a.user.availability?.mode ?? 'AVAILABLE'
    }))
  )
}
