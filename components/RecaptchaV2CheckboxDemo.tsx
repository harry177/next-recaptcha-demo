"use client";

import Script from "next/script";
import { SubmitEvent, useEffect, useRef, useState } from "react";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? "";

export function RecaptchaV2CheckboxDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [token, setToken] = useState("");
  const [result, setResult] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.grecaptcha) {
      return;
    }

    if (widgetIdRef.current !== null) {
      return;
    }

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (receivedToken: string) => {
        setToken(receivedToken);
      },
      "expired-callback": () => {
        setToken("");
      },
      "error-callback": () => {
        setToken("");
        setResult("reCAPTCHA widget error");
      },
    });
  }, [scriptLoaded]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setResult("Please complete reCAPTCHA v2 first");
      return;
    }

    setIsSubmitting(true);
    setResult("");

    try {
      const response = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "v2",
          token,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        message: string;
        googleResult?: unknown;
      };

      setResult(JSON.stringify(data, null, 2));

      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      setToken("");
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
        Missing NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <h2 className="text-2xl font-semibold">reCAPTCHA v2 demo</h2>

        <p className="text-sm text-gray-600">
          This example renders a checkbox widget and sends the returned token to
          the server for verification.
        </p>

        <div ref={containerRef} />

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Verify v2 token"}
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
