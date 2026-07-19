export function updateStats(total, capacity, activeAlertsCount) {
  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-occ').innerText = Math.round((total / capacity) * 100) + '%';
  
  const alertsEl = document.getElementById('stat-alerts');
  alertsEl.innerText = activeAlertsCount;
  
  if (activeAlertsCount > 0) {
    alertsEl.classList.remove('val-safe');
    alertsEl.classList.add('val-crit');
  } else {
    alertsEl.classList.remove('val-crit');
    alertsEl.classList.add('val-safe');
  }
}

export function updateAlertsPanel(alerts) {
  const panel = document.getElementById('alerts-panel');
  if (alerts.length === 0) {
    panel.innerHTML = '<div class="alert-empty"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg> All zones normal</div>';
    return;
  }
  
  panel.innerHTML = alerts.map(a => \`
    <div class="alert-card \${a.level === 'critical' ? 'alert-critical' : 'alert-warning'}">
      <div class="alert-time">\${a.time}</div>
      <div class="alert-msg"><strong>\${a.id}</strong><br>\${a.msg.replace(a.id + ' ', '')}</div>
    </div>
  \`).join('');
}