import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-3xl font-bold">Next.js reCAPTCHA demo</h1>

        <p className="text-gray-600">
          One repository with three separate examples.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/recaptcha-v2-checkbox"
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Open reCAPTCHA v2 checkbox
          </Link>

          <Link
            href="/recaptcha-v2-invisible"
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Open reCAPTCHA v2 invisible
          </Link>

          <Link
            href="/recaptcha-v3"
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Open reCAPTCHA v3
          </Link>
        </div>
      </div>
    </main>
  );
}
