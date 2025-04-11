"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BackgroundGradientProps {
  isDarkMode: boolean
}

export function BackgroundGradient({ isDarkMode }: BackgroundGradientProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main background gradient */}
      <motion.div
        className={cn("absolute inset-0 transition-opacity duration-1000", isDarkMode ? "opacity-100" : "opacity-0")}
        style={{
          background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
        }}
      />

      {/* Light mode gradient */}
      <motion.div
        className={cn("absolute inset-0 transition-opacity duration-1000", isDarkMode ? "opacity-0" : "opacity-100")}
        style={{
          background: "radial-gradient(circle at center, #fff7ed 0%, #fffbeb 100%)",
        }}
      />

      {/* Interactive gradient that follows mouse */}
      <motion.div
        className="absolute w-[50vw] h-[50vh] rounded-full blur-3xl opacity-15"
        animate={{
          x: `calc(${mousePosition.x * 100}vw - 25vw)`,
          y: `calc(${mousePosition.y * 100}vh - 25vh)`,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 50 }}
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, rgba(13, 148, 136, 0.05) 70%, transparent 100%)"
            : "radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(13, 148, 136, 0.03) 70%, transparent 100%)",
        }}
      />

      {/* Ambient floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-5"
        animate={{
          x: ["-10%", "60%", "20%", "70%", "-10%"],
          y: ["20%", "70%", "30%", "10%", "20%"],
        }}
        transition={{
          duration: 60,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, rgba(13, 148, 136, 0.05) 70%, transparent 100%)"
            : "radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, rgba(13, 148, 136, 0.03) 70%, transparent 100%)",
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-5"
        animate={{
          x: ["80%", "10%", "70%", "30%", "80%"],
          y: ["10%", "40%", "80%", "30%", "10%"],
        }}
        transition={{
          duration: 50,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at center, rgba(251, 146, 60, 0.2) 0%, rgba(251, 113, 133, 0.05) 70%, transparent 100%)"
            : "radial-gradient(circle at center, rgba(251, 146, 60, 0.15) 0%, rgba(251, 113, 133, 0.03) 70%, transparent 100%)",
        }}
      />
    </div>
  )
}
