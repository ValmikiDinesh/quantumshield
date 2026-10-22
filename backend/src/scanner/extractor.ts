import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { FileScanInput } from '../types';

export interface ExtractionLimits {
  maxFiles: number;
  maxTotalBytes: number;
  maxFileSizeBytes: number;
}

export const DEFAULT_EXTRACTION_LIMITS: ExtractionLimits = {
  maxFiles: 10000,
  maxTotalBytes: 500 * 1024 * 1024, // 500MB
  maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
};

const SUPPORTED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.java', '.kt', '.scala', '.groovy',
  '.go',
  '.rs',
  '.php',
  '.c', '.cpp', '.cc', '.h', '.hpp',
  '.cs',
  '.sh', '.bash', '.zsh',
  '.json', '.yaml', '.yml', '.toml', '.xml',
  '.conf', '.ini', '.cfg', '.env',
]);

const SUPPORTED_EXACT_NAMES = new Set([
  'package.json', 'requirements.txt', 'pipfile', 'go.mod', 'go.sum',
  'cargo.toml', 'pom.xml', 'dockerfile', 'sshd_config', '.env', '.env.example',
  'composer.json', 'build.gradle', 'build.gradle.kts', 'packages.config'
]);

const IGNORED_DIRECTORIES = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'target', '.idea', '.vscode', '__pycache__', 'vendor',
  '.venv', 'venv', 'env', '.yarn', '.gradle', 'bin',
  // Exclude test suites, mocks, and fixtures from production cryptographic assessment (standard SAST practice)
  '__tests__', 'test', 'tests', 'spec', 'specs', '__mocks__', 'fixtures', 'test-fixtures'
]);

const IGNORED_BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.exe', '.dll', '.so', '.dylib', '.class', '.pyc', '.o', '.a',
  '.zip', '.tar', '.gz', '.tgz', '.bz2', '.7z',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.mp3', '.mp4', '.avi', '.mov', '.webm',
]);

export class SafeZipExtractor {
  /**
   * Safely inspects and extracts text files from a ZIP buffer into memory structures without writing dangerous files to disk.
   */
  public static async extractAndCollectFiles(
    zipBuffer: Buffer,
    limits: ExtractionLimits = DEFAULT_EXTRACTION_LIMITS
  ): Promise<{
    files: FileScanInput[];
    totalEntriesCount: number;
    supportedFilesCount: number;
    ignoredFilesCount: number;
  }> {
    let zip: AdmZip;
    try {
      zip = new AdmZip(zipBuffer);
    } catch (err: any) {
      throw new Error(`Failed to parse ZIP archive: ${err.message || 'Corrupted file'}`);
    }

    const zipEntries = zip.getEntries();
    const totalEntriesCount = zipEntries.length;

    if (totalEntriesCount > limits.maxFiles) {
      throw new Error(
        `Security Limit Exceeded: ZIP contains ${totalEntriesCount} entries, exceeding maximum allowed limit of ${limits.maxFiles}. Please exclude dependency directories like "node_modules/", "venv/", "target/", "vendor/", "build/", or ".git/" before creating your ZIP archive.`
      );
    }

    let totalExtractedBytes = 0;
    const collectedFiles: FileScanInput[] = [];
    let supportedCount = 0;
    let ignoredCount = 0;

    for (const entry of zipEntries) {
      if (entry.isDirectory) {
        continue;
      }

      const entryName = entry.entryName;

      // 1. Defend against path traversal / Zip Slip
      if (
        entryName.includes('..') ||
        entryName.startsWith('/') ||
        entryName.startsWith('\\') ||
        /^[a-zA-Z]:/.test(entryName) ||
        entryName.includes('\0')
      ) {
        throw new Error(`Path traversal security violation detected in archive entry: "${entryName}"`);
      }

      // Check for path segments in ignored directories
      const normalizedPath = entryName.replace(/\\/g, '/');
      const segments = normalizedPath.split('/');
      const inIgnoredDir = segments.some(segment => IGNORED_DIRECTORIES.has(segment.toLowerCase()));
      if (inIgnoredDir) {
        ignoredCount++;
        continue;
      }

      const fileName = segments[segments.length - 1] || '';
      const ext = path.extname(fileName).toLowerCase();

      // Check if it's a known binary file
      if (IGNORED_BINARY_EXTENSIONS.has(ext)) {
        ignoredCount++;
        continue;
      }

      // Check if file is a test/spec file (standard SAST exclusion)
      const isTestFile =
        /\.(test|spec)\.[a-zA-Z0-9]+$/i.test(fileName) ||
        /^test_.*\.py$/i.test(fileName) ||
        /.*_test\.go$/i.test(fileName);
      if (isTestFile) {
        ignoredCount++;
        continue;
      }

      // Check if file is supported
      const isSupported = SUPPORTED_EXTENSIONS.has(ext) || SUPPORTED_EXACT_NAMES.has(fileName.toLowerCase());
      if (!isSupported) {
        ignoredCount++;
        continue;
      }

      // 2. Defend against zip bomb / individual file size limits
      const uncompressedSize = entry.header.size;
      if (uncompressedSize > limits.maxFileSizeBytes) {
        throw new Error(
          `Security Limit Exceeded: Entry "${entryName}" uncompressed size (${(uncompressedSize / 1024 / 1024).toFixed(1)}MB) exceeds maximum permitted single file size (${limits.maxFileSizeBytes / 1024 / 1024}MB).`
        );
      }

      totalExtractedBytes += uncompressedSize;
      if (totalExtractedBytes > limits.maxTotalBytes) {
        throw new Error(
          `Security Limit Exceeded: Total uncompressed content (${(totalExtractedBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit (${limits.maxTotalBytes / 1024 / 1024}MB).`
        );
      }

      // Safely read text content as UTF-8
      const rawData = entry.getData();
      const content = rawData.toString('utf-8');

      supportedCount++;
      collectedFiles.push({
        filePath: normalizedPath,
        relativePath: normalizedPath,
        content,
        extension: ext,
        sizeBytes: uncompressedSize,
      });
    }

    return {
      files: collectedFiles,
      totalEntriesCount,
      supportedFilesCount: supportedCount,
      ignoredFilesCount: ignoredCount,
    };
  }

  /**
   * Reads a local directory on disk safely for test fixtures and local scan directories.
   */
  public static async collectFilesFromDirectory(
    dirPath: string,
    basePath: string = dirPath
  ): Promise<FileScanInput[]> {
    const results: FileScanInput[] = [];
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
          const subFiles = await this.collectFilesFromDirectory(fullPath, basePath);
          results.push(...subFiles);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IGNORED_BINARY_EXTENSIONS.has(ext)) continue;

        const isTestFile =
          /\.(test|spec)\.[a-zA-Z0-9]+$/i.test(entry.name) ||
          /^test_.*\.py$/i.test(entry.name) ||
          /.*_test\.go$/i.test(entry.name);
        if (isTestFile) continue;

        const isSupported = SUPPORTED_EXTENSIONS.has(ext) || SUPPORTED_EXACT_NAMES.has(entry.name.toLowerCase());
        if (isSupported) {
          const stat = await fs.promises.stat(fullPath);
          if (stat.size <= DEFAULT_EXTRACTION_LIMITS.maxFileSizeBytes) {
            const content = await fs.promises.readFile(fullPath, 'utf-8');
            results.push({
              filePath: fullPath,
              relativePath,
              content,
              extension: ext,
              sizeBytes: stat.size,
            });
          }
        }
      }
    }

    return results;
  }
}
