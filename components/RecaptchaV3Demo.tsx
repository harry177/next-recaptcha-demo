"use client";

import Script from "next/script";
import { SubmitEvent, useState } from "react";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ?? "";
const actionName = "submit";

export function RecaptchaV3Demo() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function getV3Token(): Promise<string> {
    if (!window.grecaptcha) {
      throw new Error("grecaptcha is not loaded");
    }

    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha?.ready(async () => {
        try {
          const token = await window.grecaptcha?.execute(siteKey, {
            action: actionName,
          });

          if (!token) {
            reject(new Error("No token received"));
            return;
          }

          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setResult("");

    try {
      const token = await getV3Token();

      const response = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "v3",
          token,
          action: actionName,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        message: string;
        googleResult?: unknown;
      };

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setResult("Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!siteKey) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        Missing NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <h2 className="text-2xl font-semibold">reCAPTCHA v3 demo</h2>

        <p className="text-sm text-gray-600">
          This example requests a score-based token in the background and sends
          it to the server for verification.
        </p>

        <button
          type="submit"
          disabled={isSubmitting || !scriptLoaded}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Verify v3 token"}
        </button>

        {result ? (
          <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-sm">
            {result}
          </pre>
        ) : null}
      </form>
    </>
  );
}
