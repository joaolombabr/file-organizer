# 🗂 file-organizer

> A zero-dependency CLI tool to automatically organize files into categorized folders — built with Node.js.

[![Node.js](https://img.shields.io/badge/Node.js-≥18-green?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-16%20passing-brightgreen)](#testing)

---

## ✨ Features

- 📁 Organizes files into **10 categories**: Images, Videos, Audio, Documents, Text, Code, Archives, Fonts, Executables, and Others
- 🔍 **Dry-run mode** — preview changes before applying them
- 🎯 **Custom output directory** — organize files to a different destination
- ⚡ **Zero dependencies** — uses only Node.js built-ins
- 🔄 **Duplicate handling** — automatically renames files to avoid overwrites
- 🧪 **Fully tested** — 16 unit and integration tests

---

## 📦 Installation

**Clone and run directly:**

```bash
git clone https://github.com/your-username/file-organizer.git
cd file-organizer
```

**Install globally (optional):**

```bash
npm install -g .
```

---

## 🚀 Usage

```bash
# Organize the current directory
node bin/cli.js

# Organize a specific folder
node bin/cli.js ~/Downloads

# Preview without moving anything (dry run)
node bin/cli.js ~/Downloads --dry-run

# Organize into a different destination folder
node bin/cli.js ~/Downloads --output ~/Organized

# Show each file being processed
node bin/cli.js ~/Downloads --verbose

# If installed globally
file-organizer ~/Downloads --dry-run --verbose
```

---

## 📂 Output Structure

```
Organized/
├── Images/
│   ├── photo.jpg
│   └── screenshot.png
├── Videos/
│   └── tutorial.mp4
├── Documents/
│   └── report.pdf
├── Code/
│   └── script.js
├── Audio/
│   └── song.mp3
└── Others/
    └── unknownfile.xyz
```

---

## 🗂 File Categories

| Category    | Extensions                                           |
|-------------|------------------------------------------------------|
| Images      | `.jpg` `.jpeg` `.png` `.gif` `.svg` `.webp` ...      |
| Videos      | `.mp4` `.mkv` `.avi` `.mov` `.webm` ...              |
| Audio       | `.mp3` `.wav` `.flac` `.aac` `.ogg` ...              |
| Documents   | `.pdf` `.doc` `.docx` `.xls` `.ppt` ...              |
| Text        | `.txt` `.md` `.csv` `.json` `.yaml` ...              |
| Code        | `.js` `.ts` `.py` `.java` `.go` `.html` `.css` ...   |
| Archives    | `.zip` `.tar` `.gz` `.rar` `.7z` ...                 |
| Fonts       | `.ttf` `.otf` `.woff` `.woff2` ...                   |
| Executables | `.exe` `.dmg` `.deb` `.rpm` ...                      |
| Others      | Anything not matched above                           |

---

## 🧪 Testing

This project uses Node.js's built-in test runner (`node:test`) — no extra packages needed.

```bash
npm test
```

```
# tests  16
# pass   16
# fail    0
```

---

## 📋 Options

| Option             | Alias | Description                                         |
|--------------------|-------|-----------------------------------------------------|
| `--output <dir>`   | `-o`  | Destination directory (default: same as source)     |
| `--dry-run`        | `-d`  | Simulate without moving files                       |
| `--verbose`        | `-v`  | Show each file being processed                      |
| `--help`           | `-h`  | Show help message                                   |

---

## 🛠 Project Structure

```
file-organizer/
├── bin/
│   └── cli.js          # CLI entry point
├── src/
│   ├── categories.js   # File type definitions
│   └── organizer.js    # Core logic (scan, group, move)
├── tests/
│   └── organizer.test.js
├── package.json
└── README.md
```

---

## 📄 License

MIT © [Your Name](https://github.com/your-username)
