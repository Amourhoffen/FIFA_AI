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
  
  panel.innerHTML = alerts.map(a => `
    <div class="alert-item ${a.level === 'critical' ? 'alert-critical' : 'alert-warning'}">
      <div style="font-size:0.7rem; color:rgba(255,255,255,0.6); margin-bottom:4px;">${a.time}</div>
      <div><strong>${a.level.toUpperCase()}</strong>: ${a.msg}</div>
    </div>
  `).join('');
}