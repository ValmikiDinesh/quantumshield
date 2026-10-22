import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldAlert, Info, Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { api } from '../../api/client';
import { ScanDetailDTO } from '../../types';

interface Props {
  projectId: string;
  projectName?: string;
  onScanCompleted: (scan: ScanDetailDTO) => void;
}

const LANGUAGE_GUIDE = [
  {
    lang: 'JavaScript / TypeScript',
    tag: 'npm / yarn / pnpm',
    exclude: 'node_modules/, dist/, .yarn/',
    manifests: 'package.json, package-lock.json, pnpm-lock.yaml',
  },
  {
    lang: 'Python',
    tag: 'pip / venv / poetry',
    exclude: '.venv/, venv/, env/, __pycache__/',
    manifests: 'requirements.txt, Pipfile, pyproject.toml',
  },
  {
    lang: 'Java / Kotlin / JVM',
    tag: 'Maven / Gradle',
    exclude: 'target/, build/, .gradle/',
    manifests: 'pom.xml, build.gradle, build.gradle.kts',
  },
  {
    lang: 'Rust',
    tag: 'Cargo',
    exclude: 'target/',
    manifests: 'Cargo.toml, Cargo.lock',
  },
  {
    lang: 'Go (Golang)',
    tag: 'Go Modules',
    exclude: 'bin/, vendor/',
    manifests: 'go.mod, go.sum',
  },
  {
    lang: 'PHP',
    tag: 'Composer',
    exclude: 'vendor/',
    manifests: 'composer.json, composer.lock',
  },
  {
    lang: 'C / C++ & C#',
    tag: 'CMake / .NET',
    exclude: 'bin/, obj/, out/',
    manifests: 'CMakeLists.txt, *.csproj',
  },
  {
    lang: 'All Projects',
    tag: 'Git Version Control',
    exclude: '.git/',
    manifests: 'All source code files & configs',
  },
];

const UNIVERSAL_ZIP_CMD = 'zip -r project.zip . -x "node_modules/*" "dist/*" ".yarn/*" ".venv/*" "venv/*" "env/*" "__pycache__/*" "vendor/*" "target/*" "build/*" ".gradle/*" "bin/*" ".git/*"';

export const ZipUploadZone: React.FC<Props> = ({ projectId, projectName, onScanCompleted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <span>Initiate Cryptographic Scan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload repository ZIP archive for {projectName || 'this project'}. Files are analyzed deterministically without code execution.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              showGuide
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showGuide ? 'Hide Zip Guide' : 'Zip Packaging Guide'}</span>
          </button>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg">
            Max 25MB • ZIP
          </span>
        </div>
      </div>

      {/* Sleek Compact 1-line Tip Bar */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-2.5 min-w-0 max-w-full">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <span className="text-amber-500 text-sm shrink-0">💡</span>
          <p className="text-xs text-slate-600 truncate">
            <strong className="text-slate-800">Pro-Tip:</strong> Exclude <code className="text-brand-600 font-mono font-medium bg-white px-1 py-0.5 rounded border border-slate-200">node_modules</code>, <code className="text-brand-600 font-mono font-medium bg-white px-1 py-0.5 rounded border border-slate-200">venv</code>, or <code className="text-brand-600 font-mono font-medium bg-white px-1 py-0.5 rounded border border-slate-200">target</code> to keep archives &lt;5MB and scan in seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => copyCommand(UNIVERSAL_ZIP_CMD)}
            className="px-3 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy universal command to zip repository without dependency directories"
          >
            {copiedCmd ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Zip Command</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Developer Packaging Guide */}
      {showGuide && (
        <div className="mb-5 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md min-w-0 max-w-full overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Universal Terminal Zip Command
              </h3>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700 shrink-0">
              JS/TS • Python • Java • Rust • Go • PHP • C/C++ • C#
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Heavy dependency directories consume excessive memory and cause upload timeouts. Run this command inside your project root before uploading:
          </p>

          {/* Terminal Command Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 mb-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto scrollbar-thin py-1">
                <span className="text-emerald-400 font-mono text-xs select-none pl-1">$</span>
                <code className="text-slate-200 font-mono text-xs select-all whitespace-nowrap">
                  {UNIVERSAL_ZIP_CMD}
                </code>
              </div>
              <button
                type="button"
                onClick={() => copyCommand(UNIVERSAL_ZIP_CMD)}
                className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Language Breakdown Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {LANGUAGE_GUIDE.map(item => (
              <div key={item.lang} className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-semibold text-slate-100 truncate text-[11px]">{item.lang}</span>
                  <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono shrink-0">{item.tag}</span>
                </div>
                <div className="text-[10px] text-slate-300 leading-tight">
                  <span className="text-rose-400 font-semibold">Exclude: </span>
                  <span className="font-mono text-slate-300 break-all">{item.exclude}</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-1">
                  <span className="text-emerald-400 font-semibold">Keep: </span>
                  <span className="font-mono text-slate-400 truncate block" title={item.manifests}>{item.manifests}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              or click to browse local files (Supports JS/TS, Python, Java, Go, Rust, PHP, C/C++, C# & manifests)
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center justify-center gap-1 flex-wrap">
              <span>⚡</span>
              <span>Exclude dependencies (<code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">node_modules</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">venv</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">target</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">vendor</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">build</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">.git</code>) for instant scans</span>
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
