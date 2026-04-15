"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { submitDemoForm } from "@/lib/recaptcha/submitDemoForm";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY ?? "";

export function RecaptchaV2InvisibleDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const submitRequestedRef = useRef(false);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageRef = useRef("");

  useEffect(() => {
    if (window.grecaptcha) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.grecaptcha) {
      return;
    }

    if (widgetIdRef.current !== null) {
      return;
    }

    window.grecaptcha.ready(() => {
      if (!containerRef.current || !window.grecaptcha) {
        return;
      }

      if (widgetIdRef.current !== null) {
        return;
      }

      if (typeof window.grecaptcha.render !== "function") {
        setResult("grecaptcha.render is unavailable");
        return;
      }

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        size: "invisible",
        callback: async (token: string) => {
          if (!submitRequestedRef.current) {
            return;
          }

          setIsSubmitting(true);
          setResult("");

          try {
            const data = await submitDemoForm({
              message: messageRef.current,
              token,
              version: "v2-invisible",
            });

            setResult(JSON.stringify(data, null, 2));
            setMessage("");
          } catch (error) {
            console.error(error);
            setResult("Request failed");
          } finally {
            submitRequestedRef.current = false;
            setIsSubmitting(false);

            if (
              window.grecaptcha &&
              typeof window.grecaptcha.reset === "function" &&
              widgetIdRef.current !== null
            ) {
              window.grecaptcha.reset(widgetIdRef.current);
            }
          }
        },
        "expired-callback": () => {
          submitRequestedRef.current = false;
        },
        "error-callback": () => {
          submitRequestedRef.current = false;
          setIsSubmitting(false);
          setResult("Invisible reCAPTCHA widget error");
        },
      });
    });
  }, [scriptLoaded]);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!message.trim()) {
      setResult("Please enter a message");
      return;
    }

    if (!window.grecaptcha || widgetIdRef.current === null) {
      setResult("reCAPTCHA is not ready yet");
      return;
    }

    window.grecaptcha.ready(() => {
      if (!window.grecaptcha || widgetIdRef.current === null) {
        setResult("reCAPTCHA is not ready yet");
        return;
      }

      if (typeof window.grecaptcha.execute !== "function") {
        setResult("grecaptcha.execute is unavailable");
        return;
      }

      submitRequestedRef.current = true;
      window.grecaptcha.execute(widgetIdRef.current);
    });
  };

  if (!siteKey) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        Missing NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
      />

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <h2 className="text-2xl font-semibold">reCAPTCHA v2 invisible demo</h2>

        <p className="text-sm text-gray-600">
          Submit the form. Invisible reCAPTCHA will run automatically.
        </p>

        <input
          type="text"
          value={message}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setMessage(value);
            messageRef.current = value;
          }}
          placeholder="Enter your message"
          className="rounded border px-3 py-2"
        />

        <div ref={containerRef} />

        <button
          type="submit"
          disabled={isSubmitting || !scriptLoaded}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit with invisible v2"}
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
