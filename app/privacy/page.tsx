import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — OxSporties",
  description: "How OxSporties collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-10 text-slate-700">
          <section>
            <p>
              OxSporties ("we," "us," "our") operates the OxSporties website and mobile
              apps (together, the "Service"), a platform that helps players in
              Oxfordshire find games, join groups, and connect around sport. This
              policy explains what information we collect, how we use it, and the
              choices you have.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Information we collect</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-950">Account information</h3>
                <p className="mt-1">
                  When you sign up or sign in with Google, we receive your name, email
                  address, and profile picture from Google. We use this to create and
                  identify your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Profile and activity information</h3>
                <p className="mt-1">
                  Information you add to your profile, the sports and skill levels you
                  select, games you create or join, and groups you participate in.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Messages</h3>
                <p className="mt-1">
                  Messages you send in game or group chats are stored so that
                  conversations can be displayed to participants and so you can access
                  message history.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Location and venue information</h3>
                <p className="mt-1">
                  When you create a game at a custom venue, the address you enter is
                  converted to map coordinates (geocoded) so the venue can be shown on
                  a map to other players.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Push notification tokens</h3>
                <p className="mt-1">
                  If you enable notifications in the mobile app, we store a device
                  token (a unique identifier for your device, provided by Apple or
                  Google) so we can deliver push notifications about games and
                  messages relevant to you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Technical information</h3>
                <p className="mt-1">
                  Standard technical data such as IP address, device and browser
                  type, and general usage logs, collected automatically as part of
                  operating the Service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">How we use your information</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>To create and maintain your account</li>
              <li>To operate core features: creating and joining games, group chats, and venue discovery</li>
              <li>To send you email and push notifications about games, messages, and account activity</li>
              <li>To keep the Service secure and to detect abuse or policy violations</li>
              <li>To improve and maintain the Service</li>
            </ul>
            <p className="mt-4">We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Service providers we use</h2>
            <p className="mt-4">
              We use the following third-party providers to operate OxSporties. Each
              processes data on our behalf under their own security and privacy
              commitments:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><span className="font-semibold text-slate-950">Supabase</span> — our database, authentication, and backend infrastructure provider.</li>
              <li><span className="font-semibold text-slate-950">Google</span> — for Google sign-in, and for map/geocoding services used to locate venues.</li>
              <li><span className="font-semibold text-slate-950">Firebase Cloud Messaging</span> — used to deliver push notifications to the mobile apps.</li>
              <li><span className="font-semibold text-slate-950">Resend</span> — used to send transactional emails (e.g. game notifications, account emails).</li>
              <li><span className="font-semibold text-slate-950">Vercel</span> — hosts the OxSporties website and application.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Data sharing with other users</h2>
            <p className="mt-4">
              Your name, profile picture, and the sports/games you join are visible to
              other players as part of how the platform works (for example, other
              members of a game can see who has joined). Messages you send in a group
              or game chat are visible to other participants in that chat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Data retention</h2>
            <p className="mt-4">
              We retain your account information for as long as your account is
              active. If you delete your account, we delete or anonymize your
              personal information within a reasonable period, except where we are
              required to retain it for legal or security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Your choices and rights</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>You can update your profile information at any time from within the app.</li>
              <li>You can disable push notifications from your device's system settings, or within the app.</li>
              <li>You can request a copy of your data, or request deletion of your account and associated data, by contacting us using the details below.</li>
              <li>If you are in the UK or EU, you have rights under GDPR/UK GDPR, including the right to access, correct, or erase your personal data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Children's privacy</h2>
            <p className="mt-4">
              OxSporties is not directed at children under 16, and we do not knowingly
              collect personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Changes to this policy</h2>
            <p className="mt-4">
              We may update this policy from time to time. If we make material
              changes, we will update the "Last updated" date above and, where
              appropriate, notify you directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Contact us</h2>
            <p className="mt-4">
              If you have questions about this policy or want to exercise your data
              rights, contact us at{" "}
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
