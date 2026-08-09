import Link from "next/link";

export const metadata = {
  title: "Accessibility — OxSporties",
  description: "Our commitment to making OxSporties accessible to everyone.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#F0F0F0] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-black">OxSporties</Link>
          <Link href="/" className="text-sm font-semibold text-[#1D9E75] hover:underline">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-black tracking-tight">Accessibility</h1>

        <div className="mt-10 space-y-6 text-slate-700">
          <p>
            We want OxSporties to be usable by everyone in the Oxfordshire sports
            community, including players with disabilities. We're actively working
            to improve the accessibility of our website and mobile apps.
          </p>
          <p>
            If you encounter an accessibility barrier while using OxSporties, or have
            suggestions on how we can improve, please let us know — we take this
            feedback seriously and will work to address it.
          </p>
          <p>
            Contact us at{" "}
            <a href="mailto:info@oxsporties.com" className="font-semibold text-[#1D9E75] hover:underline">
              info@oxsporties.com
            </a>{" "}
            with any accessibility concerns.
          </p>
        </div>
      </main>
    </div>
  );
}
