"use client";

import Script from "next/script";
import { SubmitEvent, useEffect, useRef, useState } from "react";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? "";

export function RecaptchaV2InvisibleDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const submitRequestedRef = useRef(false);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [result, setResult] = useState("");
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
      size: "invisible",
      callback: async (token: string) => {
        if (!submitRequestedRef.current) return;

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
        } catch (error) {
          console.error(error);
          setResult("Request failed");
        } finally {
          submitRequestedRef.current = false;
          setIsSubmitting(false);

          if (window.grecaptcha && widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current);
          }
        }
      },
      "expired-callback": () => {
        submitRequestedRef.current = false;
      },
      "error-callback": () => {
        submitRequestedRef.current = false;
        setResult("Invisible reCAPTCHA widget error");
      },
    });
  }, [scriptLoaded]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!window.grecaptcha || widgetIdRef.current === null) {
      setResult("reCAPTCHA is not ready yet");
      return;
    }

    submitRequestedRef.current = true;
    window.grecaptcha.execute(widgetIdRef.current);
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
        <h2 className="text-2xl font-semibold">reCAPTCHA v2 invisible demo</h2>

        <p className="text-sm text-gray-600">
          Clicking the button triggers invisible reCAPTCHA. Google may return a
          token immediately or show a challenge only when needed.
        </p>

        <input
          type="text"
          placeholder="Type something to simulate a form"
          className="rounded border px-3 py-2"
        />

        <div ref={containerRef} />

        <button
          type="submit"
          disabled={isSubmitting || !scriptLoaded}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Submit with invisible v2"}
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