import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { getCategoryForExtension } from '../src/categories.js';
import { scanDirectory, groupFilesByCategory, moveFiles } from '../src/organizer.js';

// ─── Category Tests ────────────────────────────────────────────────────────

describe('getCategoryForExtension', () => {
  it('returns "Images" for .jpg', () => {
    assert.equal(getCategoryForExtension('.jpg'), 'Images');
  });

  it('returns "Images" for uppercase .PNG', () => {
    assert.equal(getCategoryForExtension('.PNG'), 'Images');
  });

  it('returns "Videos" for .mp4', () => {
    assert.equal(getCategoryForExtension('.mp4'), 'Videos');
  });

  it('returns "Code" for .js', () => {
    assert.equal(getCategoryForExtension('.js'), 'Code');
  });

  it('returns "Documents" for .pdf', () => {
    assert.equal(getCategoryForExtension('.pdf'), 'Documents');
  });

  it('returns "Archives" for .zip', () => {
    assert.equal(getCategoryForExtension('.zip'), 'Archives');
  });

  it('returns "Others" for unknown extension', () => {
    assert.equal(getCategoryForExtension('.xyz123'), 'Others');
  });

  it('returns "Others" for no extension', () => {
    assert.equal(getCategoryForExtension(''), 'Others');
  });
});

// ─── groupFilesByCategory Tests ────────────────────────────────────────────

describe('groupFilesByCategory', () => {
  it('groups files by their categories', () => {
    const files = [
      '/tmp/photo.jpg',
      '/tmp/movie.mp4',
      '/tmp/script.js',
      '/tmp/document.pdf',
    ];

    const groups = groupFilesByCategory(files);

    assert.ok(groups.has('Images'));
    assert.ok(groups.has('Videos'));
    assert.ok(groups.has('Code'));
    assert.ok(groups.has('Documents'));
  });

  it('groups multiple files of the same type together', () => {
    const files = ['/tmp/a.jpg', '/tmp/b.png', '/tmp/c.gif'];
    const groups = groupFilesByCategory(files);
    assert.equal(groups.get('Images').length, 3);
  });

  it('handles empty array', () => {
    const groups = groupFilesByCategory([]);
    assert.equal(groups.size, 0);
  });
});

// ─── scanDirectory Tests ───────────────────────────────────────────────────

describe('scanDirectory', () => {
  let tmpDir;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-organizer-test-'));
    await fs.writeFile(path.join(tmpDir, 'test.txt'), 'hello');
    await fs.writeFile(path.join(tmpDir, 'image.jpg'), 'fake-image');
    await fs.mkdir(path.join(tmpDir, 'subdir'));
  });

  after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns only files, not directories', async () => {
    const files = await scanDirectory(tmpDir);
    assert.equal(files.length, 2);
    assert.ok(files.every(f => !f.endsWith('subdir')));
  });

  it('returns full paths', async () => {
    const files = await scanDirectory(tmpDir);
    assert.ok(files.every(f => path.isAbsolute(f)));
  });
});

// ─── moveFiles (dry-run) Tests ─────────────────────────────────────────────

describe('moveFiles (dry-run)', () => {
  let tmpDir;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-organizer-move-'));
    await fs.writeFile(path.join(tmpDir, 'photo.jpg'), 'img');
    await fs.writeFile(path.join(tmpDir, 'notes.txt'), 'txt');
  });

  after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('does not move files in dry-run mode', async () => {
    const files = await scanDirectory(tmpDir);
    const groups = groupFilesByCategory(files);
    await moveFiles(groups, tmpDir, { dryRun: true });

    // Files should still be in the original location
    const remaining = await scanDirectory(tmpDir);
    assert.equal(remaining.length, 2);
  });

  it('reports correct number of files in dry-run', async () => {
    const files = await scanDirectory(tmpDir);
    const groups = groupFilesByCategory(files);
    const report = await moveFiles(groups, tmpDir, { dryRun: true });

    assert.equal(report.totalFiles, 2);
    assert.equal(report.moved.length, 2);
    assert.equal(report.errors.length, 0);
  });
});

// ─── moveFiles (real) Tests ────────────────────────────────────────────────

describe('moveFiles (real)', () => {
  let sourceDir, targetDir;

  before(async () => {
    sourceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-organizer-src-'));
    targetDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-organizer-dst-'));
    await fs.writeFile(path.join(sourceDir, 'photo.jpg'), 'img');
    await fs.writeFile(path.join(sourceDir, 'code.js'), 'js');
  });

  after(async () => {
    await fs.rm(sourceDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
  });

  it('moves files to the correct category folders', async () => {
    const files = await scanDirectory(sourceDir);
    const groups = groupFilesByCategory(files);
    const report = await moveFiles(groups, targetDir);

    assert.equal(report.errors.length, 0);
    assert.equal(report.totalFiles, 2);

    // Check files were moved
    const imgPath = path.join(targetDir, 'Images', 'photo.jpg');
    const codePath = path.join(targetDir, 'Code', 'code.js');

    await assert.doesNotReject(fs.access(imgPath));
    await assert.doesNotReject(fs.access(codePath));
  });
});
