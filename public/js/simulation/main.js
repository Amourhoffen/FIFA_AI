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