CREATE TABLE IF NOT EXISTS "ApiIdempotencyKey" (
  "id" TEXT NOT NULL,
  "actorKey" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "responseBody" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApiIdempotencyKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ApiIdempotencyKey_actorKey_route_key_key" ON "ApiIdempotencyKey"("actorKey", "route", "key");
