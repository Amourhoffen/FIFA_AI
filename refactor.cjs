const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) { 
        if (f !== '.git' && f !== 'node_modules') {
            walk(dirPath, callback); 
        }
    } else {
        if (dirPath.endsWith('.js') || dirPath.endsWith('.html') || dirPath.endsWith('.md') || dirPath.endsWith('.json')) {
            callback(path.join(dir, f));
        }
    }
  });
}

walk(__dirname, (filePath) => {
    if (filePath.endsWith('refactor.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Mass text replacements
    content = content.replace(/Viral Match-Moment/g, 'Smart Stadium');
    content = content.replace(/Agentic Premier League/g, 'FIFA 2026 Crowd Management');
    content = content.replace(/Evexa Buddy/g, 'FIFA AI');
    content = content.replace(/Evexa/g, 'FIFA');
    content = content.replace(/evexa/g, 'fifa');
    content = content.replace(/IPL/g, 'FIFA 2026');
    content = content.replace(/cricket/g, 'football');
    content = content.replace(/Cricket/g, 'Football');
    
    // Colors
    content = content.replace(/'#1A1A24'/g, "'#141E27'"); // surface
    content = content.replace(/'#7B2CBF'/g, "'#00A15D'"); // glow -> green
    content = content.replace(/'#C77DFF'/g, "'#E21A22'"); // pink -> red
    content = content.replace(/'#FF4D9D'/g, "'#F9A01B'"); // magenta -> gold
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});
