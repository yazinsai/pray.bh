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
              pray.bh provides Bahrain prayer times in a simple app and widget. The service is designed to avoid collecting personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Information we collect</h2>
            <p className="mt-2">
              The iOS app does not require an account and does not collect names, email addresses, precise location, contacts, photos, or payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Prayer time requests</h2>
            <p className="mt-2">
              The app and widget request today’s Bahrain prayer times from pray.bh. Standard server logs may include technical request information such as IP address, user agent, and timestamp for security and reliability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Third parties</h2>
            <p className="mt-2">
              The app does not sell personal data and does not use third-party advertising tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              For privacy questions, contact: <a className="text-emerald-700 underline" href="mailto:shamsdotbh@gmail.com">shamsdotbh@gmail.com</a>
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
