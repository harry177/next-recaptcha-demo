import { GoogleVerifyResponse, RecaptchaVersion } from "./types";

function getSecretKey(version: RecaptchaVersion): string {
  switch (version) {
    case "v2-checkbox": {
      const secret = process.env.RECAPTCHA_V2_CHECKBOX_SECRET_KEY;
      if (!secret) {
        throw new Error("Missing RECAPTCHA_V2_CHECKBOX_SECRET_KEY");
      }
      return secret;
    }

    case "v2-invisible": {
      const secret = process.env.RECAPTCHA_V2_INVISIBLE_SECRET_KEY;
      if (!secret) {
        throw new Error("Missing RECAPTCHA_V2_INVISIBLE_SECRET_KEY");
      }
      return secret;
    }

    case "v3": {
      const secret = process.env.RECAPTCHA_V3_SECRET_KEY;
      if (!secret) {
        throw new Error("Missing RECAPTCHA_V3_SECRET_KEY");
      }
      return secret;
    }

    default:
      throw new Error(
        `Unsupported reCAPTCHA version: ${version satisfies never}`,
      );
  }
}

export async function verifyRecaptchaToken(params: {
  token: string;
  version: RecaptchaVersion;
  remoteIp?: string | null;
}) {
  const { token, version, remoteIp } = params;
  const secret = getSecretKey(version);

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.append("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Google verify request failed with ${response.status}`);
  }

  return (await response.json()) as GoogleVerifyResponse;
}
