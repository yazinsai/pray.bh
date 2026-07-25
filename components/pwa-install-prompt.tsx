"use client"

import { useEffect, useMemo, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "pwa-prompt-dismissed-at"
const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIosDevice(): boolean {
  if (typeof window === "undefined") return false

  const ua = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform?.toLowerCase() ?? ""
  const touchPoints = window.navigator.maxTouchPoints || 0

  return /iphone|ipad|ipod/.test(ua) || (platform === "macintel" && touchPoints > 1)
}

function wasRecentlyDismissed(): boolean {
  try {
    const dismissedAt = window.localStorage.getItem(DISMISS_KEY)
    if (!dismissedAt) return false
    return Number(dismissedAt) > Date.now() - DISMISS_WINDOW_MS
  } catch {
    return false
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, Date.now().toString())
  } catch {
    // Ignore storage failures; the prompt is still dismissible in memory.
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const installed = isStandaloneDisplay()
    setIsInstalled(installed)
    setIsIos(isIosDevice())

    if (installed || wasRecentlyDismissed()) return

    const showTimer = window.setTimeout(() => setShowInstallPrompt(true), 1800)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      setIsInstalled(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.clearTimeout(showTimer)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const installSteps = useMemo(() => {
    if (isIos) {
      return ["Tap Share", "Choose Add to Home Screen", "Open pray.bh from the new icon"]
    }

    if (deferredPrompt) {
      return ["Tap Install", "Confirm in your browser", "Open pray.bh from your home screen"]
    }

    return ["Open your browser menu", "Choose Install app or Add to Home screen", "Open pray.bh from the new icon"]
  }, [deferredPrompt, isIos])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    rememberDismissal()
  }

  if (isInstalled || !showInstallPrompt) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-sm animate-fade-in-up md:hidden">
      <div className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/95 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50/80">Best experience</p>
              <h3 className="mt-1 text-lg font-bold">Add pray.bh to your Home Screen</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Dismiss install prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 text-slate-800">
          <p className="text-sm leading-6 text-slate-600">
            Faster launch, full-screen view, and fresher prayer times without stale browser tabs.
          </p>

          <ol className="grid gap-2">
            {installSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="flex gap-2">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Install app
              </button>
            ) : null}
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
