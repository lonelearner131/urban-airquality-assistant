import { type NextRequest, NextResponse } from "next/server";
import { RateLimitError, ValidationError, normalizeError } from "@/lib/errors";
import { chatRateLimiter } from "@/lib/rateLimit";
import { ChatRequestSchema } from "@/schemas/chat";
import { answerAirQualityChat } from "@/services/gemini";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limit = chatRateLimiter.consume(ip);
    if (!limit.allowed) {
      throw new RateLimitError(`Rate limit exceeded. Please wait ${limit.resetSeconds}s`);
    }

    const body: unknown = await request.json().catch(() => null);
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
    return NextResponse.json(appError.toResponse(), { status: appError.httpStatus });
  }
}
