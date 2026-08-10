import Link from "next/link";
import LegalPageHeader from "@/components/LegalPageHeader";

export const metadata = {
  title: "Support — OxSporties",
  description: "Get help with OxSporties — FAQs and how to contact us.",
};

const faqs = [
  {
    question: "How do I join a game?",
    answer:
      "Head to the Explore tab, pick a sport, and browse upcoming games near you. Tap a game to see the details, then tap Join to reserve your spot.",
  },
  {
    question: "How do I create my own game?",
    answer:
      "Tap the + button at the bottom of the app, choose your sport, set the venue, date, time, and number of spots, then post it. Other players will be able to find and join it.",
  },
  {
    question: "Is OxSporties free to use?",
    answer:
      "Yes, joining and creating games on OxSporties is completely free. Venue booking costs (if any) are set by the venue itself, not OxSporties.",
  },
  {
    question: "How do group chats work?",
    answer:
      "Every sport has a group chat where you can message other players, ask questions, and organise games together. You can access it from the Groups tab.",
  },
  {
    question: "How do I turn on notifications?",
    answer:
      "On the mobile app, you'll be asked to allow notifications the first time you sign in. If you skipped it, you can enable notifications from your device's Settings app under OxSporties.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Email us at info@oxsporties.com from the email address on your account and we'll delete your account and associated data.",
  },
  {
    question: "I found a bug or have a suggestion — where do I send it?",
    answer:
      "We'd love to hear it. Email us at info@oxsporties.com with as much detail as you can (what happened, what device you're on, screenshots if you have them).",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LegalPageHeader />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-black tracking-tight">Support</h1>
        <p className="mt-3 text-slate-600">
          Need help with OxSporties? Check the FAQs below, or reach out directly —
          we're happy to help.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="font-semibold text-slate-950">Contact us</p>
          <p className="mt-2 text-slate-700">
            Email{" "}
            <a href="mailto:info@oxsporties.com" className="font-semibold text-[#1D9E75] hover:underline">
              info@oxsporties.com
            </a>{" "}
            and we'll get back to you as soon as we can.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <h2 className="text-xl font-bold text-slate-950">Frequently asked questions</h2>
          {faqs.map((faq) => (
            <div key={faq.question} className="border-b border-slate-100 pb-6">
              <p className="font-semibold text-slate-950">{faq.question}</p>
              <p className="mt-2 text-slate-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
