// File type categories and their extensions
export const CATEGORIES = {
  Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.heic'],
  Videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg'],
  Audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.opus'],
  Documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp'],
  Text: ['.txt', '.md', '.csv', '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.log'],
  Code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.sh', '.bash', '.zsh', '.html', '.css', '.scss', '.vue'],
  Archives: ['.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz', '.iso'],
  Fonts: ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
  Executables: ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage'],
};

export const OTHER_CATEGORY = 'Others';

/**
 * Returns the category name for a given file extension
 * @param {string} ext - File extension (e.g., '.jpg')
 * @returns {string} Category name
 */
export function getCategoryForExtension(ext) {
  const lowerExt = ext.toLowerCase();
  for (const [category, extensions] of Object.entries(CATEGORIES)) {
    if (extensions.includes(lowerExt)) {
      return category;
    }
  }
  return OTHER_CATEGORY;
}
