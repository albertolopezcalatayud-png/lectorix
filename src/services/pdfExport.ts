import type { UserProfile, StudentProgress } from '@/types';
import { calculateXPLevel } from '@/services/gamification';
import { MODULES, LEVEL_NAMES } from '@/data/modules';

interface ExportData {
  user: UserProfile | null;
  progress: StudentProgress[];
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateParentReport({ user, progress }: ExportData): string {
  const totalXP = user?.total_xp || 0;
  const { level } = calculateXPLevel(totalXP);
  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = MODULES.reduce((sum, m) => sum + m.levels * 3, 0);
  const completedLevels = progress.filter((p) => p.stars > 0).length;
  const totalLevels = MODULES.reduce((sum, m) => sum + m.levels, 0);
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.best_score, 0) / progress.length)
    : 0;
  const totalAttempts = progress.reduce((s, p) => s + p.attempts, 0);
  const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const moduleRows = MODULES.map((mod) => {
    const mp = progress.filter((p) => p.module === mod.id);
    const completed = mp.filter((p) => p.stars > 0).length;
    const modStars = mp.reduce((s, p) => s + p.stars, 0);
    const modAvg = mp.length > 0
      ? Math.round(mp.reduce((s, p) => s + p.best_score, 0) / mp.length)
      : 0;
    const attempts = mp.reduce((s, p) => s + p.attempts, 0);
    const pct = Math.round((completed / mod.levels) * 100);

    const levelDetails = mp.map((p) => `
      <tr class="level-row">
        <td style="padding-left:32px;">Nivel ${p.level} — ${LEVEL_NAMES[p.level] || ''}</td>
        <td>${'★'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</td>
        <td>${p.best_score}%</td>
        <td>${p.attempts}</td>
      </tr>
    `).join('');

    return `
      <tr class="module-row">
        <td><strong>${mod.icon} ${escapeHtml(mod.name)}</strong></td>
        <td>${modStars}/${mod.levels * 3} ★</td>
        <td>${modAvg}%</td>
        <td>${attempts}</td>
      </tr>
      <tr>
        <td colspan="4">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%; background:${mod.color};"></div>
          </div>
          <span class="progress-label">${completed}/${mod.levels} niveles (${pct}%)</span>
        </td>
      </tr>
      ${levelDetails}
    `;
  }).join('');

  // Skill chart as simple bar representation
  const skillBars = MODULES.map((mod) => {
    const mp = progress.filter((p) => p.module === mod.id);
    const modAvg = mp.length > 0
      ? Math.round(mp.reduce((s, p) => s + p.best_score, 0) / mp.length)
      : 0;
    return `
      <div class="skill-bar-row">
        <span class="skill-label">${mod.icon} ${escapeHtml(mod.name.split(' ')[0])}</span>
        <div class="skill-bar">
          <div class="skill-fill" style="width:${modAvg}%; background:${mod.color};"></div>
        </div>
        <span class="skill-value">${modAvg}%</span>
      </div>
    `;
  }).join('');

  // Recommendations
  const recs: string[] = [];
  if (completedLevels === 0) {
    recs.push('Anima a tu hijo/a a completar su primer nivel para comenzar a ver progreso.');
  }
  if ((user?.streak_days || 0) < 3) {
    recs.push('Practicar 10-15 minutos diarios mejora significativamente la lectura.');
  }
  if (avgScore > 0 && avgScore < 70) {
    recs.push('La puntuacion media esta por debajo del 70%. Repetir niveles ayuda a reforzar.');
  }
  if (avgScore >= 80) {
    recs.push('Excelente rendimiento. El estudiante esta progresando muy bien.');
  }
  recs.push('Los modulos de Fonologia y Comprension Lectora son los mas importantes para la dislexia.');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe Lectorix — ${escapeHtml(user?.display_name || 'Estudiante')}</title>
<style>
  @page { margin: 20mm 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11px;
    color: #1a1a2e;
    line-height: 1.5;
    padding: 24px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #8B5CF6;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: 22px;
    color: #8B5CF6;
    font-weight: 800;
  }
  .header .date {
    font-size: 10px;
    color: #666;
  }
  .student-info {
    background: #F7F5FF;
    border: 1px solid #E4DEFF;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .student-name { font-size: 16px; font-weight: 700; }
  .student-meta { font-size: 10px; color: #666; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  .stat-box {
    text-align: center;
    background: #f9f9fb;
    border: 1px solid #e5e5ea;
    border-radius: 8px;
    padding: 10px 6px;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 800;
    color: #8B5CF6;
  }
  .stat-label { font-size: 9px; color: #888; text-transform: uppercase; }
  .section { margin-bottom: 16px; }
  .section h2 {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;
  }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { text-align: left; padding: 6px 8px; background: #f3f0ff; font-weight: 700; font-size: 9px; text-transform: uppercase; }
  td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; }
  .module-row td { background: #fafafe; font-weight: 600; }
  .level-row td { font-size: 9px; color: #666; }
  .progress-bar {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
    margin: 4px 0 2px;
  }
  .progress-fill { height: 100%; border-radius: 3px; }
  .progress-label { font-size: 9px; color: #888; }
  .skill-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .skill-label { width: 90px; font-size: 10px; font-weight: 600; }
  .skill-bar { flex: 1; height: 12px; background: #eee; border-radius: 6px; overflow: hidden; }
  .skill-fill { height: 100%; border-radius: 6px; }
  .skill-value { width: 36px; text-align: right; font-size: 10px; font-weight: 700; }
  .recs {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 12px;
  }
  .recs li { margin-bottom: 4px; font-size: 10px; }
  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 9px;
    color: #aaa;
    border-top: 1px solid #eee;
    padding-top: 10px;
  }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>📚 Informe Lectorix</h1>
    <div class="date">${date}</div>
  </div>

  <div class="student-info">
    <div>
      <div class="student-name">${escapeHtml(user?.display_name || 'Estudiante')}</div>
      <div class="student-meta">Nivel ${level} · ${totalXP} XP · Racha: ${user?.streak_days || 0} dias</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${avgScore}%</div>
      <div class="stat-label">Puntuacion media</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#FBBF24;">★ ${totalStars}/${maxStars}</div>
      <div class="stat-label">Estrellas</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#34D399;">${completedLevels}/${totalLevels}</div>
      <div class="stat-label">Niveles</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#38BDF8;">${totalAttempts}</div>
      <div class="stat-label">Sesiones</div>
    </div>
  </div>

  <div class="section">
    <h2>📊 Mapa de habilidades</h2>
    ${skillBars}
  </div>

  <div class="section">
    <h2>📋 Detalle por modulo</h2>
    <table>
      <thead>
        <tr><th>Modulo / Nivel</th><th>Estrellas</th><th>Puntuacion</th><th>Intentos</th></tr>
      </thead>
      <tbody>${moduleRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>💡 Recomendaciones</h2>
    <div class="recs">
      <ul style="padding-left:16px;">
        ${recs.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    Generado por Lectorix · ${date} · lectorix.app
  </div>
</body>
</html>`;
}

export function downloadReport(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printReport(html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  // Small delay to let styles load
  setTimeout(() => {
    win.print();
  }, 300);
}
