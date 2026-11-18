import { type NextRequest, NextResponse } from "next/server";
import { RateLimitError, ValidationError, normalizeError } from "@/lib/errors";
import { chatRateLimiter } from "@/lib/rateLimit";
import { ChatRequestSchema } from "@/schemas/chat";
import { answerAirQualityChat } from "@/services/gemini";

const MAX_BODY_BYTES = 16_384;

function extractClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return "127.0.0.1";
  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp && firstIp.length > 0 ? firstIp : "127.0.0.1";
}

async function parseJsonSafely(request: NextRequest): Promise<unknown> {
  const rawText = await request.text().catch(() => "");
  if (!rawText || rawText.length > MAX_BODY_BYTES) {
    return null;
  }
  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = extractClientIp(request);
    const limit = chatRateLimiter.consume(ip);
    if (!limit.allowed) {
      throw new RateLimitError(`Rate limit exceeded. Please wait ${limit.resetSeconds}s`);
    }

    const body = await parseJsonSafely(request);
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid chat request payload or message length exceeded");
    }

    const reply = await answerAirQualityChat({
      userQuestion: parsed.data.message,
      aqi: parsed.data.context.aqi,
      riskTier: parsed.data.context.riskTier,
      locationName: parsed.data.context.locationName,
      planSummary: parsed.data.context.summary,
      language: parsed.data.context.language,
    });

    return NextResponse.json({ reply });
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
