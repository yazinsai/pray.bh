"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }
      
      if ('standalone' in window.navigator && (window.navigator as any).standalone) {
        setIsInstalled(true)
        return true
      }
      
      return false
    }

    if (checkIfInstalled()) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      const lastPromptTime = localStorage.getItem('pwa-prompt-dismissed')
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
      
      if (!lastPromptTime || parseInt(lastPromptTime) < oneDayAgo) {
        setTimeout(() => setShowInstallPrompt(true), 2000)
      }
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      setIsInstalled(true)
    }

    // Also show prompt after user has interacted with the app for 30 seconds
    const interactionTimer = setTimeout(() => {
      if (deferredPrompt && !showInstallPrompt) {
        const lastPromptTime = localStorage.getItem('pwa-prompt-dismissed')
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        
        if (!lastPromptTime || parseInt(lastPromptTime) < oneHourAgo) {
          setShowInstallPrompt(true)
        }
      }
    }, 30000)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      clearTimeout(interactionTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt, showInstallPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  if (isInstalled || !showInstallPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-lg rounded-lg shadow-2xl p-4 border border-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Install pray.bh</h3>
              <p className="text-sm text-gray-300 mb-3">
                Get quick access to prayer times right from your home screen
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Install App
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Not Now
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}