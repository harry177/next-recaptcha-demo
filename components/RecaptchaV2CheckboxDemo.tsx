"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_CHECKBOX_SITE_KEY ?? "";

export function RecaptchaV2CheckboxDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [token, setToken] = useState("");
  const [result, setResult] = useState("");

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
        console.error("grecaptcha.render is unavailable", window.grecaptcha);
        setResult("grecaptcha.render is unavailable");
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
    });
  }, [scriptLoaded]);

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="flex flex-col gap-4">
        <div ref={containerRef} />
        <div>Token: {token ? "received" : "not received"}</div>
        {result ? <pre>{result}</pre> : null}
      </div>
    </>
  );
}