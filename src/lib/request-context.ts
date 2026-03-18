import { randomUUID } from 'crypto'

export type RequestContext = {
  requestId: string
  startedAt: number
  method: string
  route: string
}

export function createRequestContext(request: Request, route: string): RequestContext {
  return {
    requestId: request.headers.get('x-request-id') || randomUUID(),
    startedAt: Date.now(),
    method: request.method,
    route
  }
}

export function finalizeRequest(
  context: RequestContext,
  response: Response,
  meta?: Record<string, string | number | boolean | null | undefined>
) {
  response.headers.set('x-request-id', context.requestId)
  const durationMs = Date.now() - context.startedAt

  console.info(
    JSON.stringify({
      event: 'api_request',
      requestId: context.requestId,
      method: context.method,
      route: context.route,
      status: response.status,
      durationMs,
      ...meta
    })
  )

  return response
}
