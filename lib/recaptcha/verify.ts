import { GoogleVerifyResponse, RecaptchaVersion } from "./types";

function getSecretKey(version: RecaptchaVersion): string {
  const secret =
    version === "v2"
      ? process.env.RECAPTCHA_V2_SECRET_KEY
      : process.env.RECAPTCHA_V3_SECRET_KEY;

  if (!secret) {
    throw new Error(`Missing secret key for reCAPTCHA ${version}`);
  }

  return secret;
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

  const data = (await response.json()) as GoogleVerifyResponse;
  return data;
}
