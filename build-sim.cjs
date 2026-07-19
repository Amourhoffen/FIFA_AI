const fs = require('fs');
const path = require('path');

const css = `
  body { background-color: #0D0D12; margin: 0; font-family: 'Inter', sans-serif; color: white; overflow: hidden; }
  .dashboard { display: grid; grid-template-columns: 1fr 350px; grid-template-rows: 60px 1fr 80px; height: 100vh; }
  .top-bar { grid-column: 1 / -1; background: #141E27; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
  .canvas-container { grid-column: 1; grid-row: 2; position: relative; overflow: hidden; background: #0D0D12; }
  canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .sidebar { grid-column: 2; grid-row: 2; background: #141E27; border-left: 1px solid rgba(255,255,255,0.1); padding: 15px; overflow-y: auto; }
  .bottom-bar { grid-column: 1 / -1; grid-row: 3; background: #141E27; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 15px; padding: 0 20px; }
  
  .stat-box { display: flex; flex-direction: column; align-items: flex-end; }
  .stat-label { font-size: 0.65rem; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; }
  .stat-value { font-size: 1.2rem; font-weight: bold; }
  
  .alert-item { padding: 12px; border-radius: 8px; margin-bottom: 10px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1); }
  .alert-critical { background: rgba(226, 26, 34, 0.15); border-color: #E21A22; }
  .alert-warning { background: rgba(249, 160, 27, 0.15); border-color: #F9A01B; }
  
  .btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 0.75rem; }
  .btn-primary { background: #00A15D; color: white; }
  .btn-danger { background: #E21A22; color: white; }
  .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
  .btn:hover { filter: brightness(1.2); }
  
  .control-group { display: flex; align-items: center; gap: 10px; }
`;

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>FIFA 2026 Crowd Simulation</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/simulation.css" />
</head>
<body>
  <div class="dashboard">
    <div class="top-bar">
      <div style="display:flex; align-items:center; gap:15px;">
        <a href="../index.html" class="btn btn-secondary" style="text-decoration:none;">&larr; Back</a>
        <h1 style="font-size:1.1rem; margin:0;">2D Live Crowd Simulation</h1>
      </div>
      <div style="display:flex; gap: 20px;">
        <div class="stat-box"><span class="stat-label">Total People</span><span class="stat-value" id="stat-total">0</span></div>
        <div class="stat-box"><span class="stat-label">Occupancy</span><span class="stat-value" id="stat-occ">0%</span></div>
        <div class="stat-box"><span class="stat-label">Active Alerts</span><span class="stat-value" id="stat-alerts" style="color:#E21A22;">0</span></div>
      </div>
    </div>
    
    <div class="canvas-container" id="canvas-container">
      <canvas id="sim-canvas"></canvas>
    </div>
    
    <div class="sidebar">
      <h3 style="margin-top:0; font-size:0.9rem; text-transform:uppercase; color:#8E8E93;">Live Incident Alerts</h3>
      <div id="alerts-panel"></div>
    </div>
    
    <div class="bottom-bar">
      <div class="control-group">
        <button class="btn btn-secondary" id="btn-playpause">Pause</button>
        <button class="btn btn-secondary" id="btn-reset">Reset</button>
      </div>
      <div class="control-group" style="margin-left: auto;">
        <label style="font-size: 0.75rem; text-transform: uppercase; color:#8E8E93;">Scenario:</label>
        <button class="btn btn-primary" id="btn-scen-normal">Normal Flow</button>
        <button class="btn btn-warning" id="btn-scen-surge" style="background:#F9A01B;">Exit Surge</button>
        <button class="btn btn-danger" id="btn-scen-evac">Emergency Evac</button>
      </div>
    </div>
  </div>
  
  <script type="module" src="js/simulation/main.js"></script>
</body>
</html>
`;

const stadiumJs = `
export const stadium = {
  width: 1200,
  height: 800,
  pitch: { x: 400, y: 250, w: 400, h: 300 },
  gates: [
    { id: 'Gate_North', x: 600, y: 50, type: 'gate', capacity: 200, occupancy: 0 },
    { id: 'Gate_South', x: 600, y: 750, type: 'gate', capacity: 200, occupancy: 0 },
    { id: 'Gate_East', x: 1100, y: 400, type: 'gate', capacity: 150, occupancy: 0 },
    { id: 'Gate_West', x: 100, y: 400, type: 'gate', capacity: 150, occupancy: 0 }
  ],
  stands: [
    { id: 'Stand_North', x: 400, y: 120, w: 400, h: 100, type: 'stand', capacity: 100, occupancy: 0 },
    { id: 'Stand_South', x: 400, y: 580, w: 400, h: 100, type: 'stand', capacity: 100, occupancy: 0 },
    { id: 'Stand_East', x: 830, y: 250, w: 100, h: 300, type: 'stand', capacity: 80, occupancy: 0 },
    { id: 'Stand_West', x: 270, y: 250, w: 100, h: 300, type: 'stand', capacity: 80, occupancy: 0 }
  ]
};

export const getAllZones = () => [...stadium.gates, ...stadium.stands];
`;

const agentJs = `
import { stadium, getAllZones } from './stadium.js';

export class Agent {
  constructor(startGate, targetStand) {
    this.id = Math.random().toString(36).substring(7);
    this.x = startGate.x + (Math.random() * 40 - 20);
    this.y = startGate.y + (Math.random() * 40 - 20);
    this.baseSpeed = 1 + Math.random() * 1.5;
    this.target = targetStand;
    this.state = 'moving';
    this.color = Math.random() > 0.5 ? '#00A15D' : '#00E5FF';
    
    // Assign to initial zone
    this.currentZone = startGate;
    this.currentZone.occupancy++;
  }

  update(scenario) {
    if (this.state === 'seated' && scenario !== 'evac' && scenario !== 'surge') return;
    
    if (scenario === 'evac' || scenario === 'surge') {
      // Find nearest gate
      if (this.state !== 'exiting') {
        this.target = stadium.gates.reduce((prev, curr) => {
          let dp = Math.hypot(prev.x - this.x, prev.y - this.y);
          let dc = Math.hypot(curr.x - this.x, curr.y - this.y);
          return dc < dp ? curr : prev;
        });
        this.state = 'exiting';
      }
    }

    // Determine target coordinate (center of target zone)
    let tx = this.target.x + (this.target.w ? this.target.w/2 : 0);
    let ty = this.target.y + (this.target.h ? this.target.h/2 : 0);
    
    // Add some random scatter so they don't form a single line
    tx += Math.random() * 20 - 10;
    ty += Math.random() * 20 - 10;

    let dx = tx - this.x;
    let dy = ty - this.y;
    let dist = Math.hypot(dx, dy);

    // Congestion slowdown (if current zone is > 80% full, slow down)
    let speed = this.baseSpeed;
    if (this.currentZone) {
       let occRatio = this.currentZone.occupancy / this.currentZone.capacity;
       if (occRatio > 0.8) speed *= 0.3; // 70% speed reduction in high density
       else if (occRatio > 0.5) speed *= 0.7;
    }

    if (dist > 5) {
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    } else {
      if (this.state === 'moving') this.state = 'seated';
      if (this.state === 'exiting') this.state = 'gone'; // They left
    }

    // Update current zone based on coordinates
    this.updateCurrentZone();
  }

  updateCurrentZone() {
    let zones = getAllZones();
    let newZone = null;
    for (let z of zones) {
      if (z.w) {
         if (this.x >= z.x && this.x <= z.x + z.w && this.y >= z.y && this.y <= z.y + z.h) {
           newZone = z;
           break;
         }
      } else {
         if (Math.hypot(this.x - z.x, this.y - z.y) < 50) {
           newZone = z;
           break;
         }
      }
    }

    if (newZone !== this.currentZone) {
      if (this.currentZone) this.currentZone.occupancy--;
      if (newZone) newZone.occupancy++;
      this.currentZone = newZone;
    }
  }

  draw(ctx) {
    if (this.state === 'gone') return;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
`;

const heatmapJs = `
import { stadium, getAllZones } from './stadium.js';

export function drawStadium(ctx, canvasWidth, canvasHeight) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Pitch
  ctx.fillStyle = '#0a2e16';
  ctx.strokeStyle = '#ffffff33';
  ctx.lineWidth = 2;
  ctx.fillRect(stadium.pitch.x, stadium.pitch.y, stadium.pitch.w, stadium.pitch.h);
  ctx.strokeRect(stadium.pitch.x, stadium.pitch.y, stadium.pitch.w, stadium.pitch.h);
  
  // Center circle
  ctx.beginPath();
  ctx.arc(stadium.pitch.x + stadium.pitch.w/2, stadium.pitch.y + stadium.pitch.h/2, 40, 0, Math.PI*2);
  ctx.stroke();
  
  // Draw Zones (Heatmap overlay)
  let zones = getAllZones();
  zones.forEach(z => {
    let occRatio = z.occupancy / z.capacity;
    let color = 'rgba(255, 255, 255, 0.05)';
    
    if (occRatio > 0.85) color = 'rgba(226, 26, 34, 0.4)'; // Red
    else if (occRatio > 0.6) color = 'rgba(249, 160, 27, 0.4)'; // Yellow
    else if (occRatio > 0.1) color = 'rgba(0, 161, 93, 0.2)'; // Green
    
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff22';
    
    if (z.w) {
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeRect(z.x, z.y, z.w, z.h);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter';
      ctx.fillText(z.id + ' (' + z.occupancy + ')', z.x + 5, z.y + 15);
    } else {
      ctx.beginPath();
      ctx.arc(z.x, z.y, 40, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter';
      ctx.fillText(z.id, z.x - 20, z.y - 10);
      ctx.fillText(z.occupancy + '/' + z.capacity, z.x - 15, z.y + 5);
    }
  });
}
`;

const alertsJs = `
import { getAllZones } from './stadium.js';

let activeAlerts = {};

export function checkAlerts(uiUpdateCallback) {
  let zones = getAllZones();
  let time = new Date().toLocaleTimeString();
  let newAlertsCount = 0;

  zones.forEach(z => {
    let ratio = z.occupancy / z.capacity;
    if (ratio > 0.85) {
      if (!activeAlerts[z.id]) {
        activeAlerts[z.id] = { id: z.id, level: 'critical', msg: \`\${z.id} at \${Math.round(ratio*100)}% capacity — bottleneck risk!\`, time };
        newAlertsCount++;
      } else {
        activeAlerts[z.id].msg = \`\${z.id} at \${Math.round(ratio*100)}% capacity — bottleneck risk!\`;
      }
    } else if (ratio > 0.6) {
      if (!activeAlerts[z.id] || activeAlerts[z.id].level === 'critical') {
        activeAlerts[z.id] = { id: z.id, level: 'warning', msg: \`\${z.id} filling up (\${Math.round(ratio*100)}%).\`, time };
        newAlertsCount++;
      }
    } else {
      if (activeAlerts[z.id]) {
        delete activeAlerts[z.id];
        newAlertsCount++;
      }
    }
  });

  if (newAlertsCount > 0) {
    uiUpdateCallback(Object.values(activeAlerts));
  }
}
`;

const uiJs = `
export function updateStats(total, capacity, activeAlertsCount) {
  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-occ').innerText = Math.round((total / capacity) * 100) + '%';
  document.getElementById('stat-alerts').innerText = activeAlertsCount;
}

export function updateAlertsPanel(alerts) {
  const panel = document.getElementById('alerts-panel');
  if (alerts.length === 0) {
    panel.innerHTML = '<p style="color:#8E8E93; font-size:0.8rem;">No active incidents.</p>';
    return;
  }
  
  panel.innerHTML = alerts.map(a => \`
    <div class="alert-item \${a.level === 'critical' ? 'alert-critical' : 'alert-warning'}">
      <div style="font-size:0.7rem; color:rgba(255,255,255,0.6); margin-bottom:4px;">\${a.time}</div>
      <div><strong>\${a.level.toUpperCase()}</strong>: \${a.msg}</div>
    </div>
  \`).join('');
}
`;

const mainJs = `
import { stadium, getAllZones } from './stadium.js';
import { Agent } from './agent.js';
import { drawStadium } from './heatmap.js';
import { checkAlerts } from './alerts.js';
import { updateStats, updateAlertsPanel } from './ui.js';

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let agents = [];
let isPaused = false;
let scenario = 'normal'; 
let totalCapacity = 0;

function resize() {
  canvas.width = document.getElementById('canvas-container').clientWidth;
  canvas.height = document.getElementById('canvas-container').clientHeight;
}
window.addEventListener('resize', resize);
resize();

function init() {
  totalCapacity = getAllZones().reduce((acc, z) => acc + z.capacity, 0);
  spawnAgents(200);
  loop();
}

function spawnAgents(count) {
  for (let i = 0; i < count; i++) {
    let gate = stadium.gates[Math.floor(Math.random() * stadium.gates.length)];
    let stand = stadium.stands[Math.floor(Math.random() * stadium.stands.length)];
    agents.push(new Agent(gate, stand));
  }
}

function loop() {
  if (!isPaused) {
    // 1. Update agents
    agents.forEach(a => a.update(scenario));
    
    // Remove agents that have exited
    agents = agents.filter(a => a.state !== 'gone');
    
    // Occasionally spawn new ones if normal
    if (scenario === 'normal' && Math.random() < 0.05 && agents.length < 500) {
      spawnAgents(2);
    }
    
    // 2. Draw
    // Note: To map 1200x800 logical to canvas, we scale
    ctx.save();
    let scale = Math.min(canvas.width / 1200, canvas.height / 800);
    ctx.translate(canvas.width/2 - (1200*scale)/2, canvas.height/2 - (800*scale)/2);
    ctx.scale(scale, scale);
    
    drawStadium(ctx, 1200, 800);
    agents.forEach(a => a.draw(ctx));
    
    ctx.restore();
    
    // 3. Alerts & UI
    checkAlerts((alerts) => {
      updateAlertsPanel(alerts);
      updateStats(agents.length, totalCapacity, alerts.length);
    });
    // Force stat update every frame for total
    updateStats(agents.length, totalCapacity, document.querySelectorAll('.alert-item').length);
  }
  
  requestAnimationFrame(loop);
}

// Controls
document.getElementById('btn-playpause').addEventListener('click', (e) => {
  isPaused = !isPaused;
  e.target.innerText = isPaused ? 'Play' : 'Pause';
});
document.getElementById('btn-reset').addEventListener('click', () => {
  agents.forEach(a => { if (a.currentZone) a.currentZone.occupancy--; });
  agents = [];
  spawnAgents(200);
});
document.getElementById('btn-scen-normal').addEventListener('click', () => scenario = 'normal');
document.getElementById('btn-scen-surge').addEventListener('click', () => scenario = 'surge');
document.getElementById('btn-scen-evac').addEventListener('click', () => scenario = 'evac');

init();
`;

// Write all files
const write = (p, content) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim());
};

const base = path.join(__dirname, 'public');
write(path.join(base, 'simulation.html'), html);
write(path.join(base, 'css', 'simulation.css'), css);
write(path.join(base, 'js', 'simulation', 'stadium.js'), stadiumJs);
write(path.join(base, 'js', 'simulation', 'agent.js'), agentJs);
write(path.join(base, 'js', 'simulation', 'heatmap.js'), heatmapJs);
write(path.join(base, 'js', 'simulation', 'alerts.js'), alertsJs);
write(path.join(base, 'js', 'simulation', 'ui.js'), uiJs);
write(path.join(base, 'js', 'simulation', 'main.js'), mainJs);

console.log("All files created successfully!");
