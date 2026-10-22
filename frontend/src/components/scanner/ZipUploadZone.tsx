import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldAlert, Info, Copy, Check } from 'lucide-react';
import { api } from '../../api/client';
import { ScanDetailDTO } from '../../types';

interface Props {
  projectId: string;
  projectName?: string;
  onScanCompleted: (scan: ScanDetailDTO) => void;
}

export const ZipUploadZone: React.FC<Props> = ({ projectId, projectName, onScanCompleted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only .zip archives containing repository source code are supported.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Archive exceeds the 25MB maximum upload limit. Please exclude heavy folders like node_modules/ and .git/ before zipping.');
      return;
    }
    setSelectedFile(file);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const startUploadScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setError(null);

    try {
      setScanStep('Uploading source archive securely...');
      await new Promise(r => setTimeout(r, 400));
      setScanStep('Extracting files in isolated memory buffer & validating path traversal...');
      await new Promise(r => setTimeout(r, 500));
      setScanStep('Executing AST regex pattern rules & NIST PQC inspection...');

      const scanResult = await api.uploadAndScan(projectId, selectedFile);
      setScanStep('Scan complete! Generating report data...');
      await new Promise(r => setTimeout(r, 300));

      onScanCompleted(scanResult);
    } catch (err: any) {
      let msg = err.message || 'Scan failed. Ensure archive contains supported source files.';
      if (msg.includes('exceeding maximum allowed limit') || msg.includes('entries')) {
        msg += ' (Tip: Please exclude node_modules/ and .git/ when creating your ZIP archive).';
      }
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const startDemoScan = async (demoType: 'classical-vulnerable' | 'hybrid-pqc' | 'clean-app') => {
    setIsScanning(true);
    setError(null);
    try {
      setScanStep(`Loading pre-configured ${demoType} fixture...`);
      await new Promise(r => setTimeout(r, 400));
      setScanStep('Running cryptographic scanner engine...');
      const scanResult = await api.quickScanDemo(projectId, demoType);
      onScanCompleted(scanResult);
    } catch (err: any) {
      setError(err.message || 'Demo scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-navy-950">Initiate Cryptographic Scan</h2>
          <p className="text-xs text-slate-500">
            Upload repository ZIP archive for {projectName || 'this project'}. Files are analyzed deterministically without execution.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
            Max 25MB • ZIP only
          </span>
        </div>
      </div>

      {/* Optimization Notice: Exclude node_modules / build artifacts */}
      <div className="mb-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
        <div className="flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-amber-950">
                Important: Zip your project without <code className="bg-amber-100/90 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">node_modules</code>
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                Saves Memory & Accelerates Scans
              </span>
            </div>
            <p className="text-amber-800/90 leading-relaxed text-[11px] mt-1">
              Dependency folders (<code className="font-mono text-amber-950">node_modules/</code>, <code className="font-mono text-amber-950">vendor/</code>, <code className="font-mono text-amber-950">.git/</code>, <code className="font-mono text-amber-950">dist/</code>) contain thousands of files that consume high memory, bloat file sizes, and exceed security limits. QuantumShield scans your source code and manifests (<code className="font-mono text-amber-950">package.json</code>, <code className="font-mono text-amber-950">pom.xml</code>) directly, so omitting them keeps your ZIP small (&lt;5MB) and scans lightning-fast.
            </p>
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-[11px] text-amber-950 font-mono">
                <span className="font-sans text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Terminal command:</span>
                <code className="bg-white/90 border border-amber-300/80 px-2 py-0.5 rounded text-amber-950 select-all font-bold">
                  zip -r project.zip . -x "node_modules/*" ".git/*" "dist/*"
                </code>
              </div>
              <button
                type="button"
                onClick={() => copyCommand('zip -r project.zip . -x "node_modules/*" ".git/*" "dist/*"')}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200/80 text-amber-900 text-[11px] font-medium transition-colors cursor-pointer"
                title="Copy terminal command"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-800" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Scan Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isScanning && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-600 bg-blue-50/50'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-slate-300 hover:border-brand-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileChange}
          disabled={isScanning}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <FileArchive className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Drag and drop your repository .ZIP file here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              or click to browse local files (Supports JS/TS, Python, Java, Go, Rust, PHP, manifests)
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center justify-center gap-1">
              <span>⚠️</span>
              <span>Exclude <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">node_modules</code> and <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">.git</code> for instant processing</span>
            </p>
          </div>
        )}
      </div>

      {/* Action controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span>In-memory inspection only. Zero code execution.</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {selectedFile && !isScanning && (
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2"
            >
              Clear
            </button>
          )}

          <button
            onClick={startUploadScan}
            disabled={!selectedFile || isScanning}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              !selectedFile || isScanning
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{scanStep || 'Processing scan...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* One-click Test Fixture Demonstration */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Test: Scan Demo Repositories (One-Click)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Evaluate QuantumShield instantly without packaging your own code archive:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => startDemoScan('classical-vulnerable')}
            disabled={isScanning}
            className="p-3 text-left border border-slate-200 hover:border-brand-500 hover:bg-blue-50/30 rounded-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                Classical RSA/ECDH App
              </span>
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                High Risk
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Contains RSA keygen, ECDH key exchange, RS256 JWTs & MD5.
            </p>
          </button>

          <button
            onClick={() => startDemoScan('hybrid-pqc')}
            disabled={isScanning}
            className="p-3 text-left border border-slate-200 hover:border-brand-500 hover:bg-blue-50/30 rounded-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                Hybrid PQC Service
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                Prepared
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Features ML-KEM-768, ML-DSA-65 & X25519MLKEM768 hybrid KEX.
            </p>
          </button>

          <button
            onClick={() => startDemoScan('clean-app')}
            disabled={isScanning}
            className="p-3 text-left border border-slate-200 hover:border-brand-500 hover:bg-blue-50/30 rounded-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600">
                Clean Web Service
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                Clean (100)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Standard non-cryptographic utility app (zero false positives).
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
