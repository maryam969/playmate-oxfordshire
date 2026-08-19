import LegalPageHeader from "@/components/LegalPageHeader";

export const metadata = {
  title: "Delete Your Account — OxSporties",
  description: "How to request deletion of your OxSporties account and data.",
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LegalPageHeader />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-black tracking-tight">Delete Your Account</h1>
        <p className="mt-3 text-slate-600">
          You can request deletion of your OxSporties account and all associated data at any time.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="font-semibold text-slate-950">How to request deletion</p>
          <p className="mt-2 text-slate-700">
            Email{" "}
            <a href="mailto:info@oxsporties.com?subject=Account%20deletion%20request" className="font-semibold text-[#1D9E75] hover:underline">
              info@oxsporties.com
            </a>{" "}
            from the email address associated with your account, with the subject line "Account deletion request."
            We'll verify your identity and process the deletion.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">What gets deleted</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-700">
              <li>Your account and profile information (name, email, profile picture)</li>
              <li>Games you've created or joined</li>
              <li>Messages you've sent in group chats</li>
              <li>Polls and votes you've created or cast</li>
              <li>Your push notification device token</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">Timeline</h2>
            <p className="mt-2 text-slate-700">
              We aim to process deletion requests within 30 days. Some information may be retained for a short
              period afterward where we're required to for legal, security, or fraud-prevention purposes, but it
              will no longer be linked to your identifiable account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">Questions?</h2>
            <p className="mt-2 text-slate-700">
              See our full{" "}
              <a href="/privacy" className="font-semibold text-[#1D9E75] hover:underline">
                Privacy Policy
              </a>{" "}
              for more detail on what data we collect and how it's used, or contact{" "}
              <a href="mailto:info@oxsporties.com" className="font-semibold text-[#1D9E75] hover:underline">
                info@oxsporties.com
              </a>{" "}
              with any questions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
