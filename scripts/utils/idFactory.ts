const { nanoid } = require('nanoid');

function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

module.exports = { generateId };

export {}; // Ensure this file is treated as a module
