import { PLAN_META, REHAB_PHASE, RUNNING_WEEKS, WorkoutSession } from '../data/trainingPlan';

export interface AlarmConfig {
  hour: number; // 0 - 23
  minute: number; // 0 - 59
  joinedAt: string;
  customNote?: string;
}

export function format24Hour(hour: number, minute: number): string {
  const h = String(Math.max(0, Math.min(23, hour))).padStart(2, '0');
  const m = String(Math.max(0, Math.min(59, minute))).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Generates an iCalendar (.ics) file string with native VALARM (Display + Audio)
 * for every training day from Oct 10, 2026 to Nov 22, 2026 at the user's selected 24h time.
 * On iOS Safari and Android browsers, opening this .ics triggers the system Calendar/Reminder
 * import sheet with native phone alerts at the exact HH:mm time.
 */
export function generateTrainingPlanICS(hour: number, minute: number, singleSession?: WorkoutSession): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(hour);
  const mm = pad(minute);
  const endHour = pad((hour + 1) % 24);

  const events: Array<{
    uid: string;
    dateCompact: string; // YYYYMMDD
    summary: string;
    description: string;
  }> = [];

  if (singleSession) {
    const dateCompact = singleSession.dateStr.replace(/-/g, '');
    events.push({
      uid: `zhaoyuan-half-${singleSession.id}@marathon.plan`,
      dateCompact,
      summary: `🏃【招远半马训练】${singleSession.workout} (${singleSession.pace})`,
      description: `山东招远黄金马拉松半马备赛计划\\n今日课表：${singleSession.workout}\\n目标配速：${singleSession.pace}\\n训练要点：${singleSession.notes || '跑前必做7分钟髋部激活，跑后8分钟髋部放松'}\\n安全红线：髋部刺痛或放射痛立即停止！`,
    });
  } else {
    // 1. Rehab Walking Phase: Oct 10 to Oct 16, 2026
    for (let day = 10; day <= 16; day++) {
      const dateCompact = `202610${pad(day)}`;
      const isStrengthDay = day === 10 || day === 12 || day === 14;
      events.push({
        uid: `zhaoyuan-rehab-202610${pad(day)}@marathon.plan`,
        dateCompact,
        summary: `🔥【招远半马·康复预备】每日快走30-45分 + 髋部激活/放松${isStrengthDay ? ' + 力量训练' : ''}`,
        description:
          `【山东招远黄金马拉松·走路康复预备期 (10.10~10.16)】\\n` +
          `1. 髋部激活 (7分钟)：蚌式、臀桥、侧步走（运动前必做）\\n` +
          `2. 每日快走 (30~45分钟)：配速9'00"~10'00"/公里，小步幅，能连贯说话\\n` +
          `3. 髋部放松 (8分钟)：臀部、大腿外侧、髋屈肌，痛点停留30秒\\n` +
          (isStrengthDay ? `4. 力量训练 (本周3次)：臀桥、单腿臀桥、平板支撑、髋屈肌拉伸\\n` : '') +
          `核心原则：先无伤恢复，再渐进备赛，安全完赛！`,
      });
    }

    // 2. Running Weeks: Oct 17 to Nov 21, 2026
    for (const week of RUNNING_WEEKS) {
      for (const session of week.sessions) {
        const dateCompact = session.dateStr.replace(/-/g, '');
        events.push({
          uid: `zhaoyuan-run-${session.id}@marathon.plan`,
          dateCompact,
          summary: `🏃【招远半马·${week.strategyTag}】${session.workout} (${session.pace})`,
          description:
            `【${PLAN_META.eventTitle}·第${week.weekNum}周：${week.title}】\\n` +
            `周跑量目标：${week.weeklyVolume} | 阶段策略：${week.strategyTag}\\n` +
            `今日训练：${session.workout}\\n` +
            `配速要求：${session.pace}\\n` +
            `执行细节：${session.notes || '跑前7分钟髋部激活，跑后8分钟髋部放松'}\\n` +
            `安全红线：每周跑量增幅不超过30%，髋部刺痛或放射痛立即停止！`,
        });
      }
    }

    // 3. Race Day: Nov 22, 2026
    events.push({
      uid: `zhaoyuan-raceday-20261122@marathon.plan`,
      dateCompact: '20261122',
      summary: `🏅【比赛日】山东招远黄金马拉松（半马21.0975公里）安全完赛！`,
      description:
        `【山东招远黄金马拉松·半马比赛日配速策略】\\n` +
        `• 0~5公里：7'20"~7'30"（压住起跑）\\n` +
        `• 5~15公里：7'10"~7'20"（稳定巡航，10公里处补给）\\n` +
        `• 15~21.0975公里：状态良好可小幅提速\\n` +
        `目标：无伤完赛 | 预期：约2:30~2:35完赛！`,
    });
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zhaoyuan Gold Marathon//Half Marathon Training Alarm//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:招远黄金马拉松·半马训练闹钟',
    'X-WR-TIMEZONE:Asia/Shanghai',
  ];

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}`,
      `DTSTAMP:20261010T000000Z`,
      `DTSTART;TZID=Asia/Shanghai:${ev.dateCompact}T${hh}${mm}00`,
      `DTEND;TZID=Asia/Shanghai:${ev.dateCompact}T${endHour}${mm}00`,
      `SUMMARY:${ev.summary}`,
      `DESCRIPTION:${ev.description}`,
      'STATUS:CONFIRMED',
      // Alarm 1: Exact time visual + audio alert
      'BEGIN:VALARM',
      'TRIGGER:PT0S',
      'ACTION:DISPLAY',
      `DESCRIPTION:${ev.summary}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:PT0S',
      'ACTION:AUDIO',
      'END:VALARM',
      // Alarm 2: 10 minutes advance warm-up alert
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      `DESCRIPTION:10分钟后开始训练：请准备髋部激活7分钟 (${ev.summary})`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers mobile device alarm / reminder import via .ics Calendar/Reminder stream
 */
export function triggerDeviceCalendarAlarm(hour: number, minute: number, singleSession?: WorkoutSession): void {
  const icsContent = generateTrainingPlanICS(hour, minute, singleSession);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const timeTag = `${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}`;
  link.setAttribute(
    'download',
    singleSession
      ? `招远半马训练闹钟_${singleSession.displayDate}_${timeTag}.ics`
      : `山东招远黄金马拉松_半马每日训练闹钟_${timeTag}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Builds Android Native Clock SET_ALARM Intent URI
 * Opens the native Android Clock app with Hour, Minute, and Training Message pre-populated.
 */
export function getAndroidAlarmIntentUri(hour: number, minute: number, message?: string): string {
  const label = encodeURIComponent(
    message || '【招远半马训练】先髋部激活7分钟 + 执行今日备赛课表（无伤完赛）'
  );
  // Days: Sunday(1) through Saturday(7)
  return `intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hour};i.android.intent.extra.alarm.MINUTES=${minute};S.android.intent.extra.alarm.MESSAGE=${label};B.android.intent.extra.alarm.SKIP_UI=false;end`;
}

/**
 * Plays an energetic athletic alarm chime & vibration pattern using Web Audio API
 */
export function playAthleticAlarmFeedback(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = [587.33, 783.99, 880, 1174.66]; // D5, G5, A5, D6 athletic chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.11);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + idx * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.11 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.11);
      osc.stop(ctx.currentTime + idx * 0.11 + 0.26);
    });
  } catch {
    // Ignore audio context restrictions if blocked
  }
}
