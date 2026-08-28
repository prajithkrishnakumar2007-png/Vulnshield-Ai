"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Sliders, History, Key, Check, ShieldAlert, ArrowLeft } from "lucide-react";
import { fetchApi } from "../../../lib/api";
import { User, AuditLog } from "../../../lib/types";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [weightCvss, setWeightCvss] = useState(0.4);
  const [weightEpss, setWeightEpss] = useState(0.4);
  const [weightKev, setWeightKev] = useState(0.2);
  const [savedWeights, setSavedWeights] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savedApiKey, setSavedApiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;

    async function loadAdminData() {
      setLoading(true);
      try {
        const u = await fetchApi<User[]>("/admin/users");
        const logs = await fetchApi<AuditLog[]>("/admin/audit-logs");
        setUsers(u);
        setAuditLogs(logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [isAdmin]);

  // Access Guard for Non-Admins (e.g. Analysts)
  if (!isAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-alert/30 text-center space-y-4 glow-alert">
          <div className="w-12 h-12 rounded-xl bg-alert/10 border border-alert/30 text-alert flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-sans text-white">Access Restricted</h2>
          <p className="text-xs text-gray-300 font-mono leading-relaxed">
            The Admin Control console requires <strong>Administrator</strong> privileges. You are currently signed in as an <strong>Analyst ({user?.email || "analyst"})</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan text-black font-bold font-mono text-xs hover:bg-cyan/90 glow-cyan transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Triage Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveWeights = async () => {
    try {
      await fetchApi("/admin/risk-weights", {
        method: "POST",
        body: JSON.stringify({
          weight_cvss: weightCvss,
          weight_epss: weightEpss,
          weight_kev: weightKev
        })
      });
      setSavedWeights(true);
      setTimeout(() => setSavedWeights(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveApiKey = () => {
    setSavedApiKey(true);
    setTimeout(() => setSavedApiKey(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan" />
          Admin & Governance Control Panel
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          System user management, risk formula weight customization, API key configuration, and security audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Score Weight Customizer Sliders */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-cyan/30 glow-cyan space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan" />
              <h3 className="text-sm font-bold text-white font-sans">Composite Risk Weight Sliders</h3>
            </div>
            {savedWeights && (
              <span className="text-xs font-mono text-success flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300">CVSS Base Severity Weight</span>
                <span className="text-cyan font-bold">{weightCvss.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weightCvss}
                onChange={(e) => setWeightCvss(parseFloat(e.target.value))}
                className="w-full accent-cyan"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300">EPSS Exploit Probability Weight</span>
                <span className="text-violet font-bold">{weightEpss.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weightEpss}
                onChange={(e) => setWeightEpss(parseFloat(e.target.value))}
                className="w-full accent-violet"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300">CISA KEV Active Exploitation Weight</span>
                <span className="text-alert font-bold">{weightKev.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weightKev}
                onChange={(e) => setWeightKev(parseFloat(e.target.value))}
                className="w-full accent-alert"
              />
            </div>

            <button
              onClick={handleSaveWeights}
              className="w-full py-2.5 rounded-xl bg-cyan text-black font-bold font-mono text-xs hover:bg-cyan/90 glow-cyan transition-all mt-4"
            >
              Apply Weight Formula Settings
            </button>
          </div>
        </div>

        {/* API Key Management */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-violet" />
              <h3 className="text-sm font-bold text-white font-sans">Anthropic Claude API Key</h3>
            </div>
            {savedApiKey && (
              <span className="text-xs font-mono text-success flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Key Saved
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs font-mono">
            <p className="text-gray-400">Configure key for AI remediation generation & investigation agents.</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-white focus:outline-none focus:border-cyan/50"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-lg bg-surface border border-surface-border hover:border-cyan/40 text-cyan text-xs font-mono font-bold transition-all"
            >
              Save API Key
            </button>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-panel p-6 rounded-xl border border-surface-border space-y-4">
        <h3 className="text-sm font-bold text-white font-sans border-b border-surface-border pb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan" /> User Accounts ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-surface-border text-gray-400">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-gray-300">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 px-3">{u.id}</td>
                  <td className="py-2.5 px-3 text-white font-bold">{u.full_name}</td>
                  <td className="py-2.5 px-3">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${u.role === "admin" ? "text-cyan border-cyan/30 bg-cyan/10" : "text-gray-400 border-gray-400/30 bg-gray-400/10"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Viewer */}
      <div className="glass-panel p-6 rounded-xl border border-surface-border space-y-4">
        <h3 className="text-sm font-bold text-white font-sans border-b border-surface-border pb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-warning" /> Audit Trail Log Stream ({auditLogs.length})
        </h3>

        <div className="max-h-64 overflow-y-auto space-y-2 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-surface p-2.5 rounded-lg border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-cyan font-bold">[{log.action}]</span>
                <span className="text-gray-300">Target: {log.target_type} ({log.target_id || "N/A"})</span>
              </div>
              <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
