#!/usr/bin/env node

import path from 'path';
import { parseArgs } from 'util';
import { scanDirectory, groupFilesByCategory, moveFiles, formatReport } from '../src/organizer.js';

const HELP_TEXT = `
file-organizer — Automatically organize files into categorized folders

USAGE:
  file-organizer [source] [options]

ARGUMENTS:
  source          Directory to organize (default: current directory)

OPTIONS:
  --output, -o    Destination directory (default: same as source)
  --dry-run, -d   Simulate without moving files
  --verbose, -v   Show each file being processed
  --help, -h      Show this help message

EXAMPLES:
  file-organizer ~/Downloads
  file-organizer ~/Downloads --output ~/Organized --dry-run
  file-organizer . --verbose
`;

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      output: { type: 'string', short: 'o' },
      'dry-run': { type: 'boolean', short: 'd', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const sourceDir = path.resolve(positionals[0] || '.');
  const targetDir = path.resolve(values.output || sourceDir);
  const dryRun = values['dry-run'];
  const verbose = values.verbose;

  console.log('\n🗂  File Organizer');
  console.log(`   Source : ${sourceDir}`);
  console.log(`   Target : ${targetDir}`);
  if (dryRun) console.log('   Mode   : DRY RUN (no files will be moved)');
  console.log('');

  try {
    console.log('🔍 Scanning directory...');
    const files = await scanDirectory(sourceDir);

    if (files.length === 0) {
      console.log('  No files found in the source directory.');
      process.exit(0);
    }

    console.log(`   Found ${files.length} file(s)\n`);

    const groups = groupFilesByCategory(files);

    if (verbose || dryRun) {
      console.log('📦 Processing files:');
    }

    const report = await moveFiles(groups, targetDir, { dryRun, verbose });

    console.log(formatReport(report, dryRun));

    if (dryRun) {
      console.log('  ℹ️  Run without --dry-run to apply changes.\n');
    } else {
      console.log('  ✅ Done!\n');
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
