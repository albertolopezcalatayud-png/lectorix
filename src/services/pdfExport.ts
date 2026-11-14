import type { UserProfile, StudentProgress } from '@/types';
import { calculateXPLevel, stickerCount, stickerText } from '@/services/gamification';
import {MODULES, MODULE_TEXT, levelNameKey } from '@/data/modules';
import { getTranslator } from '@/i18n';
import type { TranslationKey } from '@/i18n';

interface ExportData {
  user: UserProfile | null;
  progress: StudentProgress[];
  language: string;
  weekly?: string[];
  /** Skill map lines (to work on, strengths) */
  skills?: { title: string; lines: string[] };
  /** Levels per area in the practice language */
  levelCount?: number;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateParentReport({ user, progress, language, weekly, skills, levelCount = 5 }: ExportData): string {
  const t = getTranslator(language);
  const totalXP = user?.total_xp || 0;
  const { level } = calculateXPLevel(totalXP);
  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = MODULES.length * levelCount * 3;
  const completedLevels = progress.filter((p) => p.stars > 0).length;
  const totalLevels = MODULES.length * levelCount;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.best_score, 0) / progress.length)
    : 0;
  const totalAttempts = progress.reduce((s, p) => s + p.attempts, 0);
  const locale = language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-US' : 'es-ES';
  const date = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  const moduleRows = MODULES.map((mod) => {
    const mp = progress.filter((p) => p.module === mod.id);
    const completed = mp.filter((p) => p.stars > 0).length;
    const modStars = mp.reduce((s, p) => s + p.stars, 0);
    const modAvg = mp.length > 0
      ? Math.round(mp.reduce((s, p) => s + p.best_score, 0) / mp.length)
      : 0;
    const attempts = mp.reduce((s, p) => s + p.attempts, 0);
    const pct = Math.round((completed / levelCount) * 100);

    const levelDetails = mp.map((p) => `
      <tr class="level-row">
        <td style="padding-left:32px;">${t('pdf_level_row' as TranslationKey, { level: p.level, name: t(levelNameKey(p.level)) })}</td>
        <td>${'★'.repeat(p.stars)}${'☆'.repeat(3 - p.stars)}</td>
        <td>${p.best_score}%</td>
        <td>${p.attempts}</td>
      </tr>
    `).join('');

    return `
      <tr class="module-row">
        <td><strong>${mod.icon} ${escapeHtml(t(MODULE_TEXT[mod.id].name))}</strong></td>
        <td>${modStars}/${levelCount * 3} ★</td>
        <td>${modAvg}%</td>
        <td>${attempts}</td>
      </tr>
      <tr>
        <td colspan="4">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%; background:${mod.color};"></div>
          </div>
          <span class="progress-label">${t('pdf_levels_pct' as TranslationKey, { done: completed, total: levelCount, pct })}</span>
        </td>
      </tr>
      ${levelDetails}
    `;
  }).join('');

  const skillBars = MODULES.map((mod) => {
    const mp = progress.filter((p) => p.module === mod.id);
    const modAvg = mp.length > 0
      ? Math.round(mp.reduce((s, p) => s + p.best_score, 0) / mp.length)
      : 0;
    return `
      <div class="skill-bar-row">
        <span class="skill-label">${mod.icon} ${escapeHtml(t(MODULE_TEXT[mod.id].name).split(' ')[0])}</span>
        <div class="skill-bar">
          <div class="skill-fill" style="width:${modAvg}%; background:${mod.color};"></div>
        </div>
        <span class="skill-value">${modAvg}%</span>
      </div>
    `;
  }).join('');

  const recs: string[] = [];
  if (completedLevels === 0) {
    recs.push(t('pdf_rec_first' as TranslationKey));
  }
  if ((user?.streak_days || 0) < 3) {
    recs.push(t('pdf_rec_practice' as TranslationKey));
  }
  if (avgScore > 0 && avgScore < 70) {
    recs.push(t('pdf_rec_low' as TranslationKey));
  }
  if (avgScore >= 80) {
    recs.push(t('pdf_rec_great' as TranslationKey));
  }
  recs.push(t('pdf_rec_important' as TranslationKey));

  const langCode = language === 'ca' ? 'ca' : language === 'en' ? 'en' : 'es';

  return `<!DOCTYPE html>
<html lang="${langCode}">
<head>
<meta charset="UTF-8">
<title>${t('pdf_title' as TranslationKey)} — ${escapeHtml(user?.display_name || t('pdf_student' as TranslationKey))}</title>
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
    border-bottom: 3px solid #34437A;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: 22px;
    color: #34437A;
    font-weight: 800;
  }
  .header .date {
    font-size: 10px;
    color: #666;
  }
  .student-info {
    background: #FBF8F1;
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
    color: #34437A;
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
    <h1>📚 ${t('pdf_title' as TranslationKey)}</h1>
    <div class="date">${date}</div>
  </div>

  <div class="student-info">
    <div>
      <div class="student-name">${escapeHtml(user?.display_name || t('pdf_student' as TranslationKey))}</div>
      <div class="student-meta">${t('pdf_level_xp' as TranslationKey, { stickers: stickerText(t as never, stickerCount(level)), xp: totalXP, streak: user?.streak_days || 0 })}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${avgScore}%</div>
      <div class="stat-label">${t('pdf_avg_score' as TranslationKey)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#FBBF24;">★ ${totalStars}/${maxStars}</div>
      <div class="stat-label">${t('pdf_stars' as TranslationKey)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#34D399;">${completedLevels}/${totalLevels}</div>
      <div class="stat-label">${t('pdf_levels' as TranslationKey)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color:#38BDF8;">${totalAttempts}</div>
      <div class="stat-label">${t('pdf_sessions' as TranslationKey)}</div>
    </div>
  </div>

  ${skills && skills.lines.length ? `<div class="section">
    <h2>${escapeHtml(skills.title)}</h2>
    <ul>${skills.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
  </div>` : ''}
  ${weekly && weekly.length ? `<div class="section">
    <h2>🗓️ ${escapeHtml(t('wk_title' as TranslationKey))}</h2>
    <ul>${weekly.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
  </div>` : ''}

  <div class="section">
    <h2>📊 ${t('pdf_skill_map' as TranslationKey)}</h2>
    ${skillBars}
  </div>

  <div class="section">
    <h2>📋 ${t('pdf_detail' as TranslationKey)}</h2>
    <table>
      <thead>
        <tr><th>${t('pdf_col_module' as TranslationKey)}</th><th>${t('pdf_col_stars' as TranslationKey)}</th><th>${t('pdf_col_score' as TranslationKey)}</th><th>${t('pdf_col_attempts' as TranslationKey)}</th></tr>
      </thead>
      <tbody>${moduleRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>💡 ${t('pdf_recs' as TranslationKey)}</h2>
    <div class="recs">
      <ul style="padding-left:16px;">
        ${recs.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    ${t('pdf_footer' as TranslationKey, { date })}
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
  setTimeout(() => {
    win.print();
  }, 300);
}
