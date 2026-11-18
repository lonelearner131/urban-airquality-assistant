import { type NextRequest, NextResponse } from "next/server";
import { RateLimitError, ValidationError, normalizeError } from "@/lib/errors";
import { planRateLimiter } from "@/lib/rateLimit";
import { ProfileSchema } from "@/schemas/profile";
import { planOrchestrator } from "@/services/planOrchestrator";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limit = planRateLimiter.consume(ip);
    if (!limit.allowed) {
      throw new RateLimitError(`Rate limit exceeded. Please wait ${limit.resetSeconds}s`);
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      const issueDetails = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new ValidationError(`Profile validation failed: ${issueDetails}`);
    }

    const plan = await planOrchestrator.generatePlan(parsed.data);
    return NextResponse.json(plan, { status: 200 });
  } catch (err: unknown) {
    const appError = normalizeError(err);
    return NextResponse.json(appError.toResponse(), { status: appError.httpStatus });
  }
}
