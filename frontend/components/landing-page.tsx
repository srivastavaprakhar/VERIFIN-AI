"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"

interface LandingPageProps {
  onEnter: () => void
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false)
      setShowContent(true)
    }, 3500)

    return () => clearTimeout(welcomeTimer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Welcome Overlay */}
      {showWelcome && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 3 }}
        >
          <div className="text-center">
            {/* Animated Logo */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <span className="text-white font-bold text-4xl">V</span>
              </div>
            </motion.div>

            {/* Welcome Text - Character by character animation */}
            <div className="flex justify-center gap-1 mb-4 h-16">
              {Array.from("Welcome to VeriFin AI").map((char, index) => (
                <motion.span
                  key={index}
                  className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-slate-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              Enterprise Document Verification
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              className="mt-8 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Landing Content */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Navigation */}
          <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-white font-bold text-lg">V</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      VeriFin AI
                    </h1>
                  </div>
                </motion.div>
                <motion.button
                  onClick={onEnter}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Launch App
                </motion.button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div className="text-center mb-16" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium">
                  Powered by Advanced AI
                </span>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight"
              >
                Intelligent Invoice & PO Verification
              </motion.h2>

              <motion.p variants={itemVariants} className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Automate your financial document verification with enterprise-grade AI. Detect discrepancies, ensure
                compliance, and streamline your procurement process.
              </motion.p>

              <motion.button
                variants={itemVariants}
                onClick={onEnter}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid md:grid-cols-3 gap-8 mt-20"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description: "Bank-grade encryption and compliance with financial regulations",
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Process hundreds of documents in seconds with AI acceleration",
                },
                {
                  icon: TrendingUp,
                  title: "Real-time Analytics",
                  description: "Comprehensive dashboards with actionable insights",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                  whileHover={{ y: -5 }}
                >
                  <feature.icon className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="grid md:grid-cols-4 gap-6 mt-20 pt-20 border-t border-slate-800/50"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: "Documents Processed", value: "10M+" },
                { label: "Accuracy Rate", value: "99.8%" },
                { label: "Processing Speed", value: "<2s" },
                { label: "Enterprise Clients", value: "500+" },
              ].map((stat, index) => (
                <motion.div key={index} variants={itemVariants} className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              className="rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h3 className="text-3xl font-bold text-slate-100 mb-4">Ready to Transform Your Document Verification?</h3>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Join leading financial institutions using VeriFin AI to automate their verification processes.
              </p>
              <motion.button
                onClick={onEnter}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch VeriFin AI <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="border-t border-slate-800/50 bg-slate-950/50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
              <p>© 2025 VeriFin AI. Enterprise Document Verification Platform.</p>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  )
}
