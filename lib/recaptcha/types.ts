export type RecaptchaVersion = "v2" | "v3";

export interface VerifyRequestBody {
  token: string;
  version: RecaptchaVersion;
  action?: string;
}

export interface GoogleVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}
