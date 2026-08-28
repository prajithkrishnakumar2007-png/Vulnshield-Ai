"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, AlertCircle } from "lucide-react";

export default function IngestionPage() {
  const [scannerType, setScannerType] = useState("snyk");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scanner_type", scannerType);

      const token = localStorage.getItem("vulnshield_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/ingestion/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to upload scanner data");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-cyan" />
          Scanner Data Ingestion Console
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Upload raw Snyk or Nessus JSON exports to execute normalization & deduplication algorithms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-surface-border space-y-6">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-300">Scanner Engine Source</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScannerType("snyk")}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all text-left ${
                    scannerType === "snyk"
                      ? "bg-cyan/10 border-cyan text-cyan glow-cyan"
                      : "bg-surface border-surface-border text-gray-400 hover:text-white"
                  }`}
                >
                  <div>Snyk Security</div>
                  <div className="text-[10px] text-gray-500 font-normal mt-0.5">SAST & Dependency Scan</div>
                </button>

                <button
                  type="button"
                  onClick={() => setScannerType("nessus")}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all text-left ${
                    scannerType === "nessus"
                      ? "bg-cyan/10 border-cyan text-cyan glow-cyan"
                      : "bg-surface border-surface-border text-gray-400 hover:text-white"
                  }`}
                >
                  <div>Tenable Nessus</div>
                  <div className="text-[10px] text-gray-500 font-normal mt-0.5">Infrastructure DAST Scan</div>
                </button>
              </div>
            </div>

            {/* File Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-300">Raw Scanner JSON File</label>
              <div className="border-2 border-dashed border-surface-border hover:border-cyan/50 rounded-xl p-8 text-center space-y-3 transition-colors bg-surface/50">
                <FileText className="w-8 h-8 text-cyan mx-auto opacity-70" />
                <div className="text-xs text-gray-300">
                  {file ? <span className="font-mono text-cyan font-bold">{file.name}</span> : "Select or drag a raw JSON scanner export"}
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="inline-block px-4 py-2 rounded-lg bg-surface border border-surface-border hover:border-cyan/40 text-xs font-mono text-gray-300 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-6 py-2.5 rounded-xl bg-cyan text-black font-bold font-mono text-xs hover:bg-cyan/90 glow-cyan transition-all disabled:opacity-50"
              >
                {uploading ? "Ingesting & Normalizing..." : "Process Ingestion"}
              </button>
            </div>
          </form>
        </div>

        {/* Ingestion Results Output */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
          <h3 className="text-sm font-bold font-sans text-white border-b border-surface-border pb-3">
            Ingestion Pipeline Status
          </h3>

          {error && (
            <div className="p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Ingestion Error</div>
              <p>{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-xs space-y-2">
                <div className="font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Ingestion Successful
                </div>
                <p className="text-gray-300 font-sans">{result.message}</p>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-surface-border space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Engine:</span>
                  <span className="text-white font-bold">{result.scanner_type?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Imported Findings:</span>
                  <span className="text-cyan font-bold">{result.imported_count}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Merged Deduplications:</span>
                  <span className="text-warning font-bold">{result.merged_count}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-gray-500">
              No recent ingestion job executed. Select a file above to execute the normalization pipeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
