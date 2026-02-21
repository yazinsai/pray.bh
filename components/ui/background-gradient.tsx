import { cn } from "@/lib/utils"

interface BackgroundGradientProps {
  isDarkMode: boolean
}

export function BackgroundGradient({ isDarkMode }: BackgroundGradientProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main background gradient */}
      <div
        className={cn("absolute inset-0 transition-opacity duration-1000", isDarkMode ? "opacity-100" : "opacity-0")}
        style={{
          background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
        }}
      />

      {/* Light mode gradient */}
      <div
        className={cn("absolute inset-0 transition-opacity duration-1000", isDarkMode ? "opacity-0" : "opacity-100")}
        style={{
          background: "radial-gradient(circle at center, #fff7ed 0%, #fffbeb 100%)",
        }}
      />

      {/* Ambient floating orbs */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-5 animate-float-orb-1"
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, rgba(13, 148, 136, 0.05) 70%, transparent 100%)"
            : "radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, rgba(13, 148, 136, 0.03) 70%, transparent 100%)",
        }}
      />

      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-5 animate-float-orb-2"
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at center, rgba(251, 146, 60, 0.2) 0%, rgba(251, 113, 133, 0.05) 70%, transparent 100%)"
            : "radial-gradient(circle at center, rgba(251, 146, 60, 0.15) 0%, rgba(251, 113, 133, 0.03) 70%, transparent 100%)",
        }}
      />
    </div>
  )
}
