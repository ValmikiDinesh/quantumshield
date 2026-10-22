import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Github,
  GitBranch,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
} from 'lucide-react';
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
  // Mode selection
  const [activeTab, setActiveTab] = useState<'github' | 'zip'>('github');

  // GitHub scan state
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showTokenText, setShowTokenText] = useState(false);

  // ZIP upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Drag and drop handlers
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
    if (file.size > 250 * 1024 * 1024) {
      setError('Archive exceeds the 250MB maximum upload limit. Please exclude heavy folders like node_modules/ and .git/ before zipping.');
      return;
    }
    setSelectedFile(file);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Launch GitHub scan
  const startGitHubScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL or shorthand (e.g. owner/repo).');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      setScanStep('Connecting to repository & shallow-cloning latest commit (--depth 1)...');
      await new Promise(r => setTimeout(r, 400));
      setScanStep('Collecting active source code & package manifests (ignoring node_modules)...');
      await new Promise(r => setTimeout(r, 400));
      setScanStep('Executing 34 Post-Quantum cryptographic AST inspection rules...');

      const scanResult = await api.scanGitHubRepo(
        projectId,
        repoUrl.trim(),
        branch.trim() || undefined,
        githubToken.trim() || undefined
      );

      setScanStep('Computing NIST FIPS 203/204 readiness score & CBOM...');
      await new Promise(r => setTimeout(r, 300));

      onScanCompleted(scanResult);
    } catch (err: any) {
      setError(err.message || 'GitHub repository scan failed. Please check the URL and permissions.');
    } finally {
      setIsScanning(false);
    }
  };

  // Launch ZIP upload scan
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

  // Demo scans
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <span>Initiate Cryptographic Scan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan {projectName || 'this project'} for post-quantum readiness and legacy cipher vulnerabilities.
          </p>
        </div>

        {/* Tab Selection Switcher */}
        <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-100/80 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('github'); setError(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'bg-white text-navy-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-navy-950" />
            <span>GitHub Repository</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Recommended</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('zip'); setError(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'zip'
                ? 'bg-white text-navy-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload ZIP</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Scan Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GITHUB REPOSITORY SCAN (RECOMMENDED) */}
      {/* ========================================================================= */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          <form onSubmit={startGitHubScan} className="space-y-4">
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-navy-950 text-white flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-navy-950">
                      Scan Remote Git Repository
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Directly clones active source files and package manifests at <code className="font-mono bg-white px-1 py-0.2 rounded border border-slate-200">--depth 1</code>. Dependency folders like <code className="font-mono text-slate-600">node_modules/</code> and <code className="font-mono text-slate-600">.venv/</code> are automatically excluded.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 px-2 py-0.5 rounded-full self-start sm:self-auto shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Zero Code Retention
                </span>
              </div>

              {/* URL & Branch Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    GitHub Repository URL or Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/ValmikiDinesh/quantumshield or owner/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={isScanning}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Branch <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="main (auto-detected if empty)"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isScanning}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Fill Suggestion Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] font-medium text-slate-500">Quick Test Samples:</span>
                <button
                  type="button"
                  onClick={() => setRepoUrl('ValmikiDinesh/quantumshield')}
                  className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-brand-700 font-mono cursor-pointer transition-colors"
                >
                  ValmikiDinesh/quantumshield
                </button>
                <button
                  type="button"
                  onClick={() => setRepoUrl('https://github.com/facebook/react')}
                  className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono cursor-pointer transition-colors"
                >
                  facebook/react
                </button>
                <button
                  type="button"
                  onClick={() => setRepoUrl('https://github.com/expressjs/express')}
                  className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono cursor-pointer transition-colors"
                >
                  expressjs/express
                </button>
              </div>

              {/* Private Repository Section */}
              <div className="pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="text-xs font-semibold text-slate-600 hover:text-navy-950 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Scanning a Private Repository?</span>
                  {showTokenInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTokenInput && (
                  <div className="mt-2.5 p-3 rounded-lg bg-white border border-slate-200 space-y-2 animate-in fade-in duration-150">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      GitHub Personal Access Token (PAT)
                    </label>
                    <div className="relative">
                      <input
                        type={showTokenText ? 'text' : 'password'}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        disabled={isScanning}
                        className="w-full pl-3 pr-9 py-1.5 text-xs rounded border border-slate-300 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTokenText(!showTokenText)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showTokenText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Tokens are processed strictly in-memory during the shallow clone operation and are <strong>never stored</strong> in the database or written to disk.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* GitHub Action controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Deterministic AST & manifest inspection. Memory buffer cleaned immediately.</span>
              </div>

              <button
                type="submit"
                disabled={!repoUrl.trim() || isScanning}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  !repoUrl.trim() || isScanning
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-navy-950 hover:bg-navy-900 text-white shadow-sm'
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>{scanStep || 'Cloning & analyzing repository...'}</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span>Clone & Scan Repository</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ZIP ARCHIVE UPLOAD (OFFLINE / AIR-GAPPED FALLBACK) */}
      {/* ========================================================================= */}
      {activeTab === 'zip' && (
        <div className="space-y-4">
          {/* Sleek Compact 1-line Tip Bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-2.5 min-w-0 max-w-full">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
              <span className="text-amber-500 text-sm shrink-0">💡</span>
              <p className="text-xs text-slate-600 truncate">
                <strong className="text-slate-800">Pro-Tip:</strong> Exclude <code className="text-brand-600 font-mono font-medium bg-white px-1 py-0.5 rounded border border-slate-200">node_modules</code>, <code className="text-brand-600 font-mono font-medium bg-white px-1 py-0.5 rounded border border-slate-200">venv</code>, or <code className="text-brand-600 font-mono font-medium bg-white px-1 py-0.5 rounded border border-slate-200">target</code> to keep archives &lt;5MB and scan in seconds.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  showGuide
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>{showGuide ? 'Hide Guide' : 'Zip Command'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyCommand(UNIVERSAL_ZIP_CMD)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
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
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md min-w-0 max-w-full overflow-hidden transition-all">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>In-memory inspection only. Zero code execution.</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {selectedFile && !isScanning && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={startUploadScan}
                disabled={!selectedFile || isScanning}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
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
        </div>
      )}

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
            type="button"
            onClick={() => startDemoScan('classical-vulnerable')}
            disabled={isScanning}
            className="p-3 text-left border border-slate-200 hover:border-brand-500 hover:bg-blue-50/30 rounded-lg transition-all group cursor-pointer"
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
            type="button"
            onClick={() => startDemoScan('hybrid-pqc')}
            disabled={isScanning}
            className="p-3 text-left border border-slate-200 hover:border-brand-500 hover:bg-blue-50/30 rounded-lg transition-all group cursor-pointer"
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
            type="button"
            onClick={() => startDemoScan('clean-app')}
            disabled={isScanning}
            className="p-3 text-left border border-slate-200 hover:border-brand-500 hover:bg-blue-50/30 rounded-lg transition-all group cursor-pointer"
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
