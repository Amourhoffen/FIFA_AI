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