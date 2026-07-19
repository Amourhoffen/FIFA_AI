const fs = require('fs');
const path = require('path');

const replacements = [
  // Ticker Replacements
  { from: /Bumrah takes 3 wickets in the powerplay!/gi, to: 'Messi scores a bicycle kick in the finals!' },
  { from: /Pant reverse sweeps for four!/gi, to: 'Mbappe dribbles past three defenders!' },
  { from: /Dhoni walks out to bat, stadium erupts!/gi, to: 'Neymar substituted in, crowd goes wild!' },
  { from: /Kohli hits a massive 104m six into the stands!/gi, to: 'Ronaldo hits a top corner free kick!' },
  { from: /T20 BLAST/gi, to: 'FIFA 2026' },
  { from: /BREAKING:/gi, to: 'GOAL:' },
  { from: /BOUNDARY:/gi, to: 'HIGHLIGHT:' },
  
  // Dashboard UI Replacements
  { from: /Football live feed will land here/gi, to: 'Live FIFA Match Telemetry Active' },
  { from: /Predict & Win/gi, to: 'Crowd Flow Prediction' },
  { from: /Who will win today's featured match\?/gi, to: 'Which gate will experience the next congestion spike?' },
  { from: />Team 1</g, to: '>Gate A<' },
  { from: />Team 2</g, to: '>Gate B<' },
  { from: /Viral Moment/gi, to: 'Crowd Action Plan' },
  { from: /Viral Match-Moment/gi, to: 'Crowd Action Plan' },
  { from: /Match-Moment Synthesizer/gi, to: 'Crowd Action Plan Synthesizer' },
  { from: /AI Story Synth/gi, to: 'AI Crowd Plan' },
  { from: /Viral Match Story/gi, to: 'Crowd Action Plan' },
  { from: /SYNTHESIZE MOMENT/gi, to: 'GENERATE ACTION PLAN' },
  { from: /Synthesizing Match-Moment/gi, to: 'Generating Crowd Action Plan' },
  
  // Vibe Chips / Event Triggers
  { from: /High-Octane Thriller/gi, to: 'Goal Celebration Spike' },
  { from: /Nail-biter/gi, to: 'Congestion Alert' },
  { from: /Masterclass/gi, to: 'Concession Queue Spike' },
  { from: /Heartbreak/gi, to: 'Gate Influx' },
  { from: /Down to the wire/gi, to: 'Immediate action required' },
  { from: /Massive boundaries/gi, to: 'Crowd surges detected' },
  { from: /Pure dominance/gi, to: 'High queue times reported' },
  { from: /Tragic collapse/gi, to: 'Security bottleneck detected' },
  
  // Other text
  { from: /high energy, heart-pounding tension, extreme stadium volume/gi, to: 'high density, sudden crowd surges, extreme stadium volume' },
  { from: /last-over drama, maximum pressure, absolute disbelief/gi, to: 'gate bottleneck, maximum pressure, high wait times' },
  { from: /complete masterclass, absolute control, surgical precision/gi, to: 'food and beverage queue overload, long wait times' },
  { from: /tactical genius, clever death-bowling, high tension game of chess/gi, to: 'heavy influx of fans at security checkpoints' },
  { from: /Capture Your Sentiment Vibe/gi, to: 'Select Telemetry Anomaly' },
  { from: /How does the stadium energy feel right now\?/gi, to: 'What is the current crowd anomaly?' },
  { from: /Or type custom stadium vibe \(e\.g\. dramatic hat-trick tension\.\.\.\)/gi, to: 'Or type custom telemetry anomaly (e.g. VIP entrance overload...)' },
  { from: /CREATE NEW MOMENT/gi, to: 'GENERATE NEW PLAN' },
  { from: /Generate Script/gi, to: 'Generate Plan' }
];

const files = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'public', 'index.html'),
  path.join(__dirname, 'public', 'js', 'app.js'),
  path.join(__dirname, 'public', 'js', 'components', 'heroSection.js')
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
    } else {
      console.log(`No changes needed for ${file}`);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
});
