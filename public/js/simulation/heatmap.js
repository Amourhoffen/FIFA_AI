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