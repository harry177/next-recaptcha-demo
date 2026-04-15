declare global {
  interface GRecaptcha {
    ready: (callback: () => void) => void;

    execute(siteKey: string, options: { action: string }): Promise<string>;
    execute(widgetId?: number): void;

    render: (
      container: HTMLElement,
      parameters: {
        sitekey: string;
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        size?: "invisible";
      },
    ) => number;

    reset: (widgetId?: number) => void;
  }

  interface Window {
    grecaptcha?: GRecaptcha;
  }
}

export {};