const fs = require('fs');

let markdown = fs.readFileSync('.Jules/palette.md', 'utf8');
markdown = markdown.replace(/## 2024-07-28 - Destructive Action Confirmations\n\*\*Learning:\*\*/g, '## 2024-07-28 - Destructive Action Confirmations\n\n**Learning:**');
fs.writeFileSync('.Jules/palette.md', markdown);
