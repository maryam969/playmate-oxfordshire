import Link from "next/link";

export const metadata = {
  title: "Terms of Service — OxSporties",
  description: "The terms that govern your use of OxSporties.",
};

export default function TermsPage() {
  const lastUpdated = "9 August 2026";

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
        <h1 className="text-3xl font-black tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-10 text-slate-700">
          <section>
            <p>
              These Terms of Service ("Terms") govern your use of OxSporties, the
              website and mobile apps operated by OxSporties ("we," "us," "our"). By
              creating an account or using OxSporties, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">1. Eligibility</h2>
            <p className="mt-4">
              You must be at least 16 years old to use OxSporties. By using the
              Service, you confirm that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">2. Your account</h2>
            <p className="mt-4">
              You are responsible for the accuracy of the information on your profile
              and for keeping your account secure. You're responsible for activity
              that happens under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">3. Community conduct</h2>
            <p className="mt-4">When using OxSporties, you agree not to:</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Harass, threaten, or abuse other users</li>
              <li>Post false, misleading, or impersonating profile information</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to disrupt or interfere with the Service's operation or security</li>
              <li>Create games or content that is fraudulent, dangerous, or violates venue rules</li>
            </ul>
            <p className="mt-4">
              We may suspend or remove accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">4. Games and venues</h2>
            <p className="mt-4">
              OxSporties helps players organize and find games. We do not own or
              operate the venues listed on the platform, and we are not responsible
              for the safety, availability, or condition of any venue. Attending games
              and booking venues is at your own discretion and risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">5. User content</h2>
            <p className="mt-4">
              You retain ownership of content you post (such as profile information
              and messages). By posting content, you grant OxSporties a license to
              display and distribute that content as necessary to operate the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">6. Termination</h2>
            <p className="mt-4">
              You may stop using OxSporties and delete your account at any time. We
              may suspend or terminate your access if you violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">7. Disclaimers</h2>
            <p className="mt-4">
              OxSporties is provided "as is." We do not guarantee that the Service
              will be uninterrupted, error-free, or that any particular game, venue,
              or player match will meet your expectations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">8. Limitation of liability</h2>
            <p className="mt-4">
              To the fullest extent permitted by law, OxSporties is not liable for
              any indirect, incidental, or consequential damages arising from your
              use of the Service, including injuries or losses that occur during a
              game or at a venue found through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">9. Changes to these Terms</h2>
            <p className="mt-4">
              We may update these Terms from time to time. If we make material
              changes, we'll update the "Last updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">10. Contact</h2>
            <p className="mt-4">
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:hello@oxsporties.com" className="font-semibold text-[#1D9E75] hover:underline">
                hello@oxsporties.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
