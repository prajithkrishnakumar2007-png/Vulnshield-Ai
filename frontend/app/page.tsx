"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Shield, ArrowRight, Zap, Cpu, Sparkles, FileBarChart } from "lucide-react";

// Dynamic imports with ssr: false for WebGL/Three.js Canvas
const ThreatGlobe = dynamic(() => import("../components/three/ThreatGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-cyan animate-pulse">
      Initializing 3D Threat Mesh...
    </div>
  )
});

const ParticleField = dynamic(() => import("../components/three/ParticleField"), {
  ssr: false
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <ParticleField />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan glow-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-sans tracking-wide">
            VulnShield <span className="text-cyan font-mono">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-cyan text-black font-bold font-mono text-xs hover:bg-cyan/90 glow-cyan transition-all flex items-center gap-2"
          >
            Launch Ops Console <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan font-mono text-xs glow-cyan">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Powered Vulnerability Intelligence Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sans leading-tight">
            Cut Scanner Noise. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-violet to-alert">
              Prioritize Real Cyber Threats.
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            VulnShield AI ingests raw findings from Snyk and Nessus, deduplicates asset hashes, computes a composite risk score (CVSS + EPSS + CISA KEV), and delivers 1-click Claude remediation playbooks.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-cyan text-black font-bold font-mono text-sm hover:bg-cyan/90 glow-cyan transition-all flex items-center gap-2 shadow-lg"
            >
              Explore Live Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vulnerabilities"
              className="px-6 py-3.5 rounded-xl glass-panel text-cyan border border-cyan/40 hover:bg-cyan/10 font-mono text-sm transition-all flex items-center gap-2"
            >
              View Triage Matrix <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Metric Chips */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-surface-border font-mono">
            <div>
              <div className="text-2xl font-bold text-cyan">0.4x</div>
              <div className="text-[11px] text-gray-400">CVSS Weighting</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet">0.4x</div>
              <div className="text-[11px] text-gray-400">EPSS Exploitation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-alert">0.2x</div>
              <div className="text-[11px] text-gray-400">CISA KEV Active</div>
            </div>
          </div>
        </div>

        {/* 3D ThreatGlobe Canvas */}
        <div className="lg:col-span-5 h-[420px] glass-panel rounded-2xl border border-cyan/30 glow-cyan p-4 relative flex items-center justify-center">
          <ThreatGlobe />
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-surface/90 border border-surface-border text-xs font-mono text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Threat Globe Mesh Active
            </span>
            <span className="text-cyan font-bold">10 Live Nodes</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-surface-border space-y-3">
            <div className="p-3 rounded-lg bg-cyan/10 text-cyan w-fit border border-cyan/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Composite Risk Score</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Combines CVSS severity, EPSS real-time exploitation probability, and CISA KEV active exploitation status into one deterministic composite index.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-surface-border space-y-3">
            <div className="p-3 rounded-lg bg-violet/10 text-violet w-fit border border-violet/30">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Claude AI Fix Playbooks</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Generates structured step-by-step remediation steps and plain-English risk summaries tailored to your exact package and operating environment.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-surface-border space-y-3">
            <div className="p-3 rounded-lg bg-success/10 text-success w-fit border border-success/30">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">SOC2 & ISO Compliance</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automates MTTR calculations and produces audit-ready SOC2 Trust Services Criteria and ISO 27001 compliance export payloads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
