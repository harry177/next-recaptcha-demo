import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify";
import { VerifyRequestBody } from "@/lib/recaptcha/types";

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyRequestBody;
    const { token, version, action } = body;

    if (!token || !version) {
      return NextResponse.json(
        { success: false, message: "token and version are required" },
        { status: 400 },
      );
    }

    if (version !== "v2" && version !== "v3") {
      return NextResponse.json(
        { success: false, message: "invalid version" },
        { status: 400 },
      );
    }

    const remoteIp = getClientIp(request);
    const googleResult = await verifyRecaptchaToken({
      token,
      version,
      remoteIp,
    });

    if (!googleResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Google verification failed",
          googleResult,
        },
        { status: 400 },
      );
    }

    if (version === "v3") {
      const expectedAction = action ?? "submit";
      const score = googleResult.score ?? 0;

      if (googleResult.action !== expectedAction) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid reCAPTCHA action",
            googleResult,
          },
          { status: 400 },
        );
      }

      if (score < 0.5) {
        return NextResponse.json(
          {
            success: false,
            message: "reCAPTCHA score is too low",
            googleResult,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `reCAPTCHA ${version} verified successfully`,
      googleResult,
    });
  } catch (error) {
    console.error("reCAPTCHA verify error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
