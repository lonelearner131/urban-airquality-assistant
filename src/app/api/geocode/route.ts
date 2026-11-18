import { type NextRequest, NextResponse } from "next/server";
import { geocodeRateLimiter } from "@/lib/rateLimit";
import { geocodingService } from "@/services/geocoding";
import { RateLimitError, ValidationError, normalizeError } from "@/lib/errors";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limit = geocodeRateLimiter.consume(ip);
    if (!limit.allowed) {
      throw new RateLimitError(`Rate limit exceeded. Try again in ${limit.resetSeconds}s`);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      throw new ValidationError("Search query must be at least 2 characters");
    }

    const results = await geocodingService.search(query);
    return NextResponse.json({ results });
  } catch (err: unknown) {
    const appError = normalizeError(err);
    return NextResponse.json(appError.toResponse(), { status: appError.httpStatus });
  }
}
