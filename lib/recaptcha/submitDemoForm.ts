import { RecaptchaVersion } from "./types";

export async function submitDemoForm(payload: {
  message: string;
  token: string;
  version: RecaptchaVersion;
  action?: string;
}) {
  const response = await fetch("/api/demo-form-submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return (await response.json()) as {
    success: boolean;
    message: string;
    submittedData?: {
      message: string;
      version: RecaptchaVersion;
    };
    googleResult?: unknown;
  };
}
