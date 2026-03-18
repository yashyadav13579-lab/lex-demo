import { prisma } from '@/lib/prisma'

async function callModel(prompt: string): Promise<string> {
  // TODO: integrate real LLM provider. This is a placeholder deterministic response.
  return `Draft generated based on prompt:\n${prompt}\n\n[Placeholder output – requires counsel validation]`
}

export async function generateDraft(params: {
  matterId: string
  createdById: string
  title: string
  template?: string
  context?: Record<string, unknown> | unknown[] | string | number | boolean | null
}) {
  const content = await callModel(`Title: ${params.title}\nContext: ${JSON.stringify(params.context)}`)
  const draft = await prisma.draftDocument.create({
    data: {
      matterId: params.matterId,
      createdById: params.createdById,
      title: params.title,
      template: params.template,
      content,
      status: 'NEEDS_REVIEW',
      aiMeta: params.context
    }
  })
  return draft
}
