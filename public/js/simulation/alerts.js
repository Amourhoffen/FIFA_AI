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
        activeAlerts[z.id] = { id: z.id, level: 'critical', msg: `${z.id} at ${Math.round(ratio*100)}% capacity — bottleneck risk!`, time };
        newAlertsCount++;
      } else {
        activeAlerts[z.id].msg = `${z.id} at ${Math.round(ratio*100)}% capacity — bottleneck risk!`;
      }
    } else if (ratio > 0.6) {
      if (!activeAlerts[z.id] || activeAlerts[z.id].level === 'critical') {
        activeAlerts[z.id] = { id: z.id, level: 'warning', msg: `${z.id} filling up (${Math.round(ratio*100)}%).`, time };
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