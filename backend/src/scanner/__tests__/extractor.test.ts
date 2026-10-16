import { describe, it, expect } from 'vitest';
import AdmZip from 'adm-zip';
import { SafeZipExtractor } from '../extractor';

describe('SafeZipExtractor Security & Processing Tests', () => {
  it('successfully extracts valid code files from ZIP buffer', async () => {
    const zip = new AdmZip();
    zip.addFile('src/index.ts', Buffer.from('console.log("hello world");', 'utf-8'));
    zip.addFile('package.json', Buffer.from(JSON.stringify({ name: 'test-app' }), 'utf-8'));
    zip.addFile('assets/logo.png', Buffer.from('binary-mock-data', 'utf-8')); // should be skipped

    const zipBuffer = zip.toBuffer();
    const result = await SafeZipExtractor.extractAndCollectFiles(zipBuffer);

    expect(result.totalEntriesCount).toBe(3);
    expect(result.supportedFilesCount).toBe(2);
    expect(result.ignoredFilesCount).toBe(1);
    expect(result.files.map(f => f.relativePath)).toContain('src/index.ts');
    expect(result.files.map(f => f.relativePath)).toContain('package.json');
  });

  it('rejects zip files containing path traversal sequences', async () => {
    const zip = new AdmZip();
    zip.addFile('valid.txt', Buffer.from('safe payload', 'utf-8'));
    // Explicitly modify entry name to simulate an attacker crafting a Zip Slip traversal archive
    zip.getEntries()[0].entryName = '../../etc/passwd';
    const zipBuffer = zip.toBuffer();

    await expect(SafeZipExtractor.extractAndCollectFiles(zipBuffer)).rejects.toThrow(
      /Path traversal security violation/
    );
  });

  it('rejects archives exceeding maximum file count', async () => {
    const zip = new AdmZip();
    for (let i = 0; i < 15; i++) {
      zip.addFile(`file_${i}.txt`, Buffer.from(`content ${i}`, 'utf-8'));
    }
    const zipBuffer = zip.toBuffer();

    await expect(
      SafeZipExtractor.extractAndCollectFiles(zipBuffer, {
        maxFiles: 10,
        maxTotalBytes: 100000,
        maxFileSizeBytes: 10000,
      })
    ).rejects.toThrow(/ZIP contains 15 entries, exceeding maximum allowed limit of 10/);
  });

  it('rejects entries exceeding individual file size limits', async () => {
    const zip = new AdmZip();
    const largeBuffer = Buffer.alloc(2000, 'A');
    zip.addFile('large.js', largeBuffer);
    const zipBuffer = zip.toBuffer();

    await expect(
      SafeZipExtractor.extractAndCollectFiles(zipBuffer, {
        maxFiles: 50,
        maxTotalBytes: 50000,
        maxFileSizeBytes: 1000, // 1KB limit
      })
    ).rejects.toThrow(/uncompressed size .* exceeds maximum permitted single file size/);
  });
});
