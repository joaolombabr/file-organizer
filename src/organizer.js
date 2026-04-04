import fs from 'fs/promises';
import path from 'path';
import { getCategoryForExtension } from './categories.js';

/**
 * Scans a directory and returns all files (non-recursive)
 * @param {string} dirPath - Directory to scan
 * @returns {Promise<string[]>} Array of file paths
 */
export async function scanDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => path.join(dirPath, entry.name));
}

/**
 * Organizes files into category groups
 * @param {string[]} filePaths - Array of file paths
 * @returns {Map<string, string[]>} Map of category -> file paths
 */
export function groupFilesByCategory(filePaths) {
  const groups = new Map();

  for (const filePath of filePaths) {
    const ext = path.extname(filePath);
    const category = getCategoryForExtension(ext);

    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category).push(filePath);
  }

  return groups;
}

/**
 * Moves or simulates moving files to organized folders
 * @param {Map<string, string[]>} groups - Grouped files by category
 * @param {string} targetDir - Destination base directory
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, only simulate the operation
 * @param {boolean} options.verbose - If true, log each file
 * @returns {Promise<Object>} Report of operations
 */
export async function moveFiles(groups, targetDir, { dryRun = false, verbose = false } = {}) {
  const report = {
    moved: [],
    skipped: [],
    errors: [],
    totalFiles: 0,
  };

  for (const [category, files] of groups.entries()) {
    const categoryDir = path.join(targetDir, category);

    if (!dryRun) {
      await fs.mkdir(categoryDir, { recursive: true });
    }

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const destPath = path.join(categoryDir, fileName);
      report.totalFiles++;

      try {
        // Check if destination already exists
        if (!dryRun) {
          const finalDest = await getUniqueDestination(destPath);
          await fs.rename(filePath, finalDest);
          report.moved.push({ from: filePath, to: finalDest, category });
          if (verbose) console.log(`  ✔ ${fileName} → ${category}/`);
        } else {
          report.moved.push({ from: filePath, to: destPath, category });
          if (verbose) console.log(`  [DRY RUN] ${fileName} → ${category}/`);
        }
      } catch (err) {
        report.errors.push({ file: filePath, error: err.message });
        if (verbose) console.error(`  ✘ ${fileName}: ${err.message}`);
      }
    }
  }

  return report;
}

/**
 * Returns a unique file path by appending a number if file already exists
 * @param {string} destPath
 * @returns {Promise<string>}
 */
async function getUniqueDestination(destPath) {
  try {
    await fs.access(destPath);
    // File exists, find a unique name
    const ext = path.extname(destPath);
    const base = destPath.slice(0, -ext.length);
    let counter = 1;
    let newPath;
    do {
      newPath = `${base}_${counter}${ext}`;
      counter++;
      try {
        await fs.access(newPath);
      } catch {
        return newPath;
      }
    } while (true);
  } catch {
    // File doesn't exist, use original path
    return destPath;
  }
}

/**
 * Generates a human-readable report string
 * @param {Object} report
 * @param {boolean} dryRun
 * @returns {string}
 */
export function formatReport(report, dryRun = false) {
  const lines = [];
  const prefix = dryRun ? '[DRY RUN] ' : '';

  lines.push('');
  lines.push('━'.repeat(50));
  lines.push(`📋 ${prefix}ORGANIZATION REPORT`);
  lines.push('━'.repeat(50));

  if (report.moved.length === 0) {
    lines.push('  No files to organize.');
  } else {
    // Group by category for display
    const byCategory = {};
    for (const item of report.moved) {
      if (!byCategory[item.category]) byCategory[item.category] = 0;
      byCategory[item.category]++;
    }

    lines.push('  Files by category:');
    for (const [cat, count] of Object.entries(byCategory)) {
      lines.push(`    📁 ${cat}: ${count} file${count !== 1 ? 's' : ''}`);
    }
  }

  if (report.skipped.length > 0) {
    lines.push(`\n  ⚠️  Skipped: ${report.skipped.length} file(s)`);
  }

  if (report.errors.length > 0) {
    lines.push(`\n  ❌ Errors: ${report.errors.length} file(s)`);
    for (const err of report.errors) {
      lines.push(`    - ${path.basename(err.file)}: ${err.error}`);
    }
  }

  lines.push('━'.repeat(50));
  lines.push(`  Total: ${report.totalFiles} file(s) ${dryRun ? 'would be' : ''} processed`);
  lines.push('━'.repeat(50));
  lines.push('');

  return lines.join('\n');
}
