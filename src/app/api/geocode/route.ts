import { type NextRequest, NextResponse } from "next/server";
import { RateLimitError, ValidationError, normalizeError } from "@/lib/errors";
import { geocodeRateLimiter } from "@/lib/rateLimit";
import { geocodingService } from "@/services/geocoding";

const MAX_QUERY_LENGTH = 100;

function extractClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return "127.0.0.1";
  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp && firstIp.length > 0 ? firstIp : "127.0.0.1";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = extractClientIp(request);
    const limit = geocodeRateLimiter.consume(ip);
    if (!limit.allowed) {
      throw new RateLimitError(`Rate limit exceeded. Try again in ${limit.resetSeconds}s`);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2 || query.length > MAX_QUERY_LENGTH) {
      throw new ValidationError("Search query must be between 2 and 100 characters");
    }

    const results = await geocodingService.search(query);
    return NextResponse.json({ results });
  } catch (err: unknown) {
    const appError = normalizeError(err);
    const headers: HeadersInit =
      appError.httpStatus === 429 ? { "Retry-After": "60" } : {};
    return NextResponse.json(appError.toResponse(), {
      status: appError.httpStatus,
      headers,
    });
  }
}
