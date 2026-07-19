const fs = require('fs');
const path = require('path');

const replacements = [
  // Team Names
  { from: /Chennai Super Kings/g, to: 'Argentina' },
  { from: /Mumbai Indians/g, to: 'France' },
  { from: /Royal Challengers Bengaluru/g, to: 'Brazil' },
  { from: /Kolkata Knight Riders/g, to: 'England' },
  { from: /Sunrisers Hyderabad/g, to: 'Spain' },
  { from: /Rajasthan Royals/g, to: 'Portugal' },
  { from: /Delhi Capitals/g, to: 'Germany' },
  { from: /Gujarat Titans/g, to: 'Italy' },
  { from: /Punjab Kings/g, to: 'Netherlands' },
  { from: /Lucknow Super Giants/g, to: 'Croatia' },
  
  // Team Abbreviations
  { from: /\bCSK\b/g, to: 'ARG' },
  { from: /\bMI\b/g, to: 'FRA' },
  { from: /\bRCB\b/g, to: 'BRA' },
  { from: /\bKKR\b/g, to: 'ENG' },
  { from: /\bSRH\b/g, to: 'ESP' },
  { from: /\bRR\b/g, to: 'POR' },
  { from: /\bDC\b/g, to: 'GER' },
  { from: /\bGT\b/g, to: 'ITA' },
  { from: /\bPBKS\b/g, to: 'NED' },
  { from: /\bLSG\b/g, to: 'CRO' },

  // Scores and text
  { from: /70\/1 \(8\.4 Ov\)/g, to: "2 - 1 (68')" },
  { from: /18\/0 \(2\.1 Ov\)/g, to: "0 - 0 (12')" },
  { from: /Yashasvi Jaiswal vs Ravi Bishnoi/g, to: "Ronaldo vs Modric" },
  { from: /Virat Kohli vs Jasprit Bumrah/g, to: "Vinicius Jr vs Mbappe" },
  { from: /Sawai Mansingh Stadium/g, to: "Estadio Azteca" },
  { from: /Wankhede Stadium/g, to: "MetLife Stadium" },
  { from: /Jaipur/g, to: "Mexico City" },
  { from: /Mumbai/g, to: "New Jersey" },
  { from: /building momentum — Yashasvi Jaiswal playing aggressively!/g, to: 'building momentum — Ronaldo playing aggressively!' },
  { from: /early domination from Virat Kohli!/g, to: 'early domination from Vinicius Jr!' },
  { from: /Batting/g, to: 'Attacking' }
];

const files = [
  path.join(__dirname, 'server', 'footballApi.js'),
  path.join(__dirname, 'public', 'js', 'app.js'),
  path.join(__dirname, 'app.js')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(rep => {
      content = content.replace(rep.from, rep.to);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
