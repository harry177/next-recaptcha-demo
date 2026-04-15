"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { submitDemoForm } from "@/lib/recaptcha/submitDemoForm";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ?? "";
const actionName = "submit_form";

export function RecaptchaV3Demo() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.grecaptcha) {
      setScriptLoaded(true);
    }
  }, []);

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

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    if (!message.trim()) {
      setResult("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    setResult("");

    try {
      const token = await getV3Token();

      const data = await submitDemoForm({
        message,
        token,
        version: "v3",
        action: actionName,
      });

      setResult(JSON.stringify(data, null, 2));
      setMessage("");
    } catch (error) {
      console.error(error);
      setResult("Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        onReady={() => setScriptLoaded(true)}
      />

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <h2 className="text-2xl font-semibold">reCAPTCHA v3 demo</h2>

        <p className="text-sm text-gray-600">
          Submit the form. reCAPTCHA v3 will validate the request in the
          background.
        </p>

        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          placeholder="Enter your message"
          className="rounded border px-3 py-2"
        />

        <button
          type="submit"
          disabled={isSubmitting || !scriptLoaded}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit with v3"}
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
