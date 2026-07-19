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
    
    let strokeColor = 'rgba(255, 255, 255, 0.2)';
    
    if (occRatio > 0.85) { color = 'rgba(239, 68, 68, 0.3)'; strokeColor = '#ef4444'; } // Red
    else if (occRatio > 0.6) { color = 'rgba(234, 179, 8, 0.3)'; strokeColor = '#eab308'; } // Yellow
    else if (occRatio > 0.1) { color = 'rgba(34, 197, 94, 0.15)'; strokeColor = '#22c55e'; } // Green
    
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    
    if (z.w) {
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeRect(z.x, z.y, z.w, z.h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 11px Inter';
      ctx.fillText(z.id.toUpperCase(), z.x + 8, z.y + 20);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(Math.round(occRatio*100) + '% FULL', z.x + 8, z.y + 36);
    } else {
      ctx.beginPath();
      ctx.arc(z.x, z.y, 40, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 10px Inter';
      ctx.fillText(z.id.toUpperCase(), z.x - 22, z.y - 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(z.occupancy + '/' + z.capacity, z.x - 18, z.y + 5);
    }
  });
}