export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for pray.bh.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 text-slate-900 px-6 py-12">
      <article className="mx-auto max-w-2xl rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <p className="text-sm text-emerald-700 font-medium">pray.bh</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: July 27, 2026</p>

        <div className="mt-8 space-y-6 leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
            <p className="mt-2">
              pray.bh provides Bahrain prayer times in a simple iOS app and Home Screen widget. The iOS app is designed to work fully offline and to avoid collecting personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Information we collect</h2>
            <p className="mt-2">
              The iOS app does not require an account or MyGov sign-in and does not collect names, email addresses, precise location, contacts, photos, or payment information. It does not request location, camera, microphone, contacts, tracking, or similar permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">How prayer times work</h2>
            <p className="mt-2">
              The iOS app and widget calculate today’s Bahrain prayer times on-device using a fixed Bahrain reference location. Prayer times do not require an internet connection and are not fetched from a server. Opening optional website links in Safari is user-initiated and separate from core prayer times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Third parties</h2>
            <p className="mt-2">
              The app does not sell personal data and does not use third-party advertising or analytics tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              For privacy questions, contact: <a className="text-emerald-700 underline" href="mailto:help@pray.bh">help@pray.bh</a>
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
