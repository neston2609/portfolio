// Bulk-import gallery photos from a ZIP file. Walks every entry, filters
// to supported image types, stores each as media for the child, and returns
// gallery-item shapes the admin form can append to data.gallery.items.
//
// Items aren't persisted to the portfolio JSON here — the admin merges the
// returned items into the form's local state and saves explicitly. If the
// admin abandons the import without saving, the next portfolio save will
// sweep the orphaned media via sweepOrphans() (services/media.js).

const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const media = require('./media');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const MAX_FILES_PER_IMPORT = 100;
const MAX_BYTES_PER_FILE = 20 * 1024 * 1024;

// Pretty tile colors — cycles through gallery items so the masonry layout
// has some variation even before the admin tweaks anything.
const TILE_PALETTE = ['#3b82f6', '#fb923c', '#10b981', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16'];

async function importGalleryZip(childId, zipPath) {
  const items = [];
  const errors = [];
  const skipped = [];

  let directory;
  try {
    directory = await unzipper.Open.file(zipPath);
  } catch (e) {
    throw new Error('Could not open ZIP: ' + e.message);
  }

  // Sort by path so the resulting gallery order matches the user's mental
  // file-system ordering rather than the random ZIP central-directory order.
  const files = (directory.files || [])
    .filter((f) => f.type === 'File')
    .sort((a, b) => a.path.localeCompare(b.path));

  for (const entry of files) {
    const original = entry.path;
    const filename = path.basename(original);

    // Skip macOS metadata, hidden files, and any path-traversal attempts.
    if (!filename || filename.startsWith('.') || filename.startsWith('._') || original.includes('__MACOSX')) {
      continue;
    }

    const ext = path.extname(filename).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) {
      skipped.push(`${filename} (unsupported type)`);
      continue;
    }
    if (entry.uncompressedSize > MAX_BYTES_PER_FILE) {
      errors.push(`${filename}: too large (${Math.round(entry.uncompressedSize / 1024 / 1024)} MB)`);
      continue;
    }
    if (items.length >= MAX_FILES_PER_IMPORT) {
      errors.push(`reached ${MAX_FILES_PER_IMPORT}-file cap — remaining entries ignored`);
      break;
    }

    let buffer;
    try { buffer = await entry.buffer(); }
    catch (e) { errors.push(`${filename}: ${e.message}`); continue; }

    try {
      const stored = await media.storeMedia(childId, {
        originalname: filename,
        mimetype: MIME_BY_EXT[ext] || 'application/octet-stream',
        size: buffer.length,
        buffer,
      }, filename);
      items.push({
        kind: 'photo',
        size: 'sm',
        // Strip the original-case extension (path.basename's match is
        // case-sensitive, so "foo.PNG" with ".png" passed would not strip).
        label: { en: path.basename(filename, path.extname(filename)) },
        emoji: '🖼️',
        bg: TILE_PALETTE[items.length % TILE_PALETTE.length],
        file_url: stored.url,
      });
    } catch (e) {
      errors.push(`${filename}: ${e.message}`);
    }
  }

  return { items, errors, skipped };
}

module.exports = { importGalleryZip };
