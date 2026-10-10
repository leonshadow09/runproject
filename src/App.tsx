/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlarmClock,
  BellRing,
  Calendar,
  CheckCircle2,
  Flame,
  Medal,
  Timer,
} from 'lucide-react';
import heroRunnerImg from './assets/images/hero_marathon_runner_1791603173232.jpg';
import {
  PLAN_META,
  REHAB_PHASE,
  RUNNING_WEEKS,
  WorkoutSession,
} from './data/trainingPlan';
import {
  AlarmConfig,
  format24Hour,
  playAthleticAlarmFeedback,
} from './utils/alarmExporter';
import { AlarmModal } from './components/AlarmModal';
import { RehabSection } from './components/RehabSection';
import { RunningScheduleSection } from './components/RunningScheduleSection';
import { RaceStrategyAndSafety } from './components/RaceStrategyAndSafety';

const STORAGE_ALARM_KEY = 'zhaoyuan_half_marathon_alarm_v1';
const STORAGE_COMPLETED_KEY = 'zhaoyuan_half_marathon_completed_v1';

export default function App() {
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ALARM_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPLETED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [modalTargetSession, setModalTargetSession] = useState<WorkoutSession | null>(null);
  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [liveAlarmTriggered, setLiveAlarmTriggered] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  // Dynamic entrance loading bar animation
  useEffect(() => {
    const t1 = setTimeout(() => setLoadProgress(65), 60);
    const t2 = setTimeout(() => setLoadProgress(100), 320);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Save completed workouts
  const handleToggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Save alarm config
  const handleConfirmAlarm = (config: AlarmConfig) => {
    setAlarmConfig(config);
    try {
      localStorage.setItem(STORAGE_ALARM_KEY, JSON.stringify(config));
    } catch {
      // ignore storage errors
    }
  };

  // Monitor live 24h clock to trigger in-app reminder when time matches HH:mm
  useEffect(() => {
    if (!alarmConfig) return;
    let lastTriggeredMinute = '';

    const checkTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const key = `${now.toDateString()}-${h}:${m}`;
      if (
        h === alarmConfig.hour &&
        m === alarmConfig.minute &&
        lastTriggeredMinute !== key
      ) {
        lastTriggeredMinute = key;
        setLiveAlarmTriggered(true);
        playAthleticAlarmFeedback();
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          new Notification('🏃 招远黄金马拉松·训练时间到！', {
            body: '先做7分钟髋部激活，再开启今日备赛训练，安全完赛！',
          });
        }
      }
    };

    const interval = setInterval(checkTime, 15000);
    return () => clearInterval(interval);
  }, [alarmConfig]);

  // Calculate total completion stats
  const totalTasks =
    REHAB_PHASE.modules.length +
    RUNNING_WEEKS.reduce((acc, w) => acc + w.sessions.length, 0);
  const completedCount = completedIds.length;
  const completionPct = Math.round((completedCount / totalTasks) * 100);

  // Days until Race Day (2026-11-22)
  const daysUntilRace = (() => {
    const now = new Date();
    const race = new Date('2026-11-22T07:30:00+08:00');
    const diffMs = race.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 44;
  })();

  const openJoinPlanModal = () => {
    setModalTargetSession(null);
    setIsAlarmModalOpen(true);
  };

  const openSessionAlarmModal = (session: WorkoutSession) => {
    setModalTargetSession(session);
    setIsAlarmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#F5F7FA] pb-24">
      {/* Top Kinetic Progress Loader Line */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-[#FF5500] transition-all duration-300 ease-out"
          style={{
            width: `${loadProgress}%`,
            opacity: loadProgress === 100 ? 0 : 1,
          }}
        />
      </div>

      {/* Live Alarm Ringing Banner */}
      <AnimatePresence>
        {liveAlarmTriggered && alarmConfig && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="bg-[#FF5500] text-white px-4 py-3 relative z-40"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-sm font-bold">
                <BellRing className="w-5 h-5 animate-bounce shrink-0" />
                <span>
                  训练闹钟已响起（{format24Hour(alarmConfig.hour, alarmConfig.minute)}）！请先进行7分钟髋部激活，开启今日招远半马备赛课表。
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLiveAlarmTriggered(false)}
                className="px-3 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-semibold whitespace-nowrap shrink-0"
              >
                知道了
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 h-14 bg-[#0A0B0E]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg font-display font-extrabold tracking-wide text-white whitespace-nowrap shrink-0"
        >
          招远黄金马拉松 · 半马备赛
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
          <a
            href="#rehab"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            康复预备
          </a>
          <a
            href="#schedule"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            五周课表
          </a>
          <a
            href="#pacing"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            比赛配速
          </a>
          <a
            href="#safety"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            安全红线
          </a>
        </nav>

        {/* Zone 3: 1 primary action CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={openJoinPlanModal}
            className="min-h-[40px] px-4 py-2 text-xs font-bold text-white bg-[#FF5500] hover:bg-[#FF6B00] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <AlarmClock className="w-4 h-4" />
            <span>
              {alarmConfig
                ? `训练闹钟 ${format24Hour(alarmConfig.hour, alarmConfig.minute)}`
                : '加入计划'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-12">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden border border-white/12 bg-[#12151C]">
          {/* Hero Background Media + Measured Scrim */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left 7 Cols: High-Impact Athletic Typography & Primary Action */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative z-10">
              <div>
                {/* Unboxed Metadata Kicker */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#FF5500] tracking-wider mb-3">
                  <span>SHANDONG ZHAOYUAN GOLD MARATHON</span>
                  <span aria-hidden="true">·</span>
                  <span>21.0975 KM</span>
                  <span aria-hidden="true">·</span>
                  <span>{PLAN_META.raceDateLabel}</span>
                </div>

                {/* Main Display Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-[1.08]"
                  style={{ textWrap: 'balance' }}
                >
                  {PLAN_META.eventTitle}
                  <span className="block text-[#FF5500] mt-1">
                    {PLAN_META.planTitle}
                  </span>
                </motion.h1>

                {/* Core Philosophy */}
                <p className="text-base sm:text-lg font-bold text-[#F5F7FA] mt-4">
                  {PLAN_META.coreSlogan}
                </p>

                {/* Three Core Principles (Unboxed Typography with Separators) */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-[#94A3B8] mt-3 pt-3 border-t border-white/10">
                  {PLAN_META.principles.map((p, i) => (
                    <React.Fragment key={p}>
                      <span className="text-[#CBD5E1]">{p}</span>
                      {i < PLAN_META.principles.length - 1 && (
                        <span className="text-[#FF5500]" aria-hidden="true">
                          |
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="text-[#FF5500]" aria-hidden="true">
                    |
                  </span>
                  <span className="font-mono text-[#FF5500] tabular-nums">
                    距离比赛日 {daysUntilRace} 天
                  </span>
                </div>
              </div>

              {/* Primary CTA Block: 加入计划 */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="button"
                  onClick={openJoinPlanModal}
                  className="min-h-[54px] px-8 py-3.5 rounded-2xl bg-[#FF5500] hover:bg-[#FF6B00] active:scale-[0.98] text-white font-bold text-base shadow-xl shadow-[#FF5500]/25 transition-all flex items-center justify-center gap-3 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BellRing className="w-5 h-5" />
                  <div className="text-left">
                    <div className="leading-none">
                      {alarmConfig ? '已加入计划 · 修改训练提醒' : '加入计划'}
                    </div>
                    <div className="text-[11px] font-normal text-white/85 mt-1">
                      {alarmConfig
                        ? `每日 ${format24Hour(alarmConfig.hour, alarmConfig.minute)} 手机闹钟提醒已激活`
                        : '设置你的训练时间（24小时制 · 导入手机闹钟）'}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                  <div>
                    <div className="text-[#CBD5E1] font-semibold">
                      目标：{PLAN_META.goalText}
                    </div>
                    <div className="font-mono tabular-nums mt-0.5">
                      预期：{PLAN_META.expectedFinishTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Hero Visual with Resilient Fallback & Contrast Scrim */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-[#161A24]">
              {!heroImgError ? (
                <img
                  src={heroRunnerImg}
                  alt="山东招远黄金马拉松半马备赛跑者"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover object-center lg:h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#191D26] to-[#0A0B0E] text-center">
                  <Flame className="w-12 h-12 text-[#FF5500] mb-2" />
                  <span className="font-display text-2xl font-bold text-white">
                    ZHAOYUAN HALF MARATHON
                  </span>
                  <span className="text-xs font-mono text-[#94A3B8] mt-1">
                    21.0975 KM · TARGET 2:30~2:35
                  </span>
                </div>
              )}

              {/* Measured Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#12151C] via-[#12151C]/50 to-transparent" />

              {/* Bottom-Right Overlay Metric Card */}
              <div className="absolute bottom-4 right-4 left-4 sm:left-auto bg-[#0A0B0E]/85 backdrop-blur-md border border-white/12 rounded-2xl p-4">
                <div className="text-[11px] font-mono text-[#94A3B8]">
                  备赛课表完成进度
                </div>
                <div className="flex items-baseline justify-between gap-4 mt-1">
                  <span className="text-2xl font-mono font-bold text-white tabular-nums">
                    {completionPct}%
                  </span>
                  <span className="text-xs font-mono text-[#FF5500] tabular-nums">
                    {completedCount} / {totalTasks} 项已打卡
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#FF5500] transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column KPI Strip Below Hero Split */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-white/8 border-t border-white/10 bg-[#0E1117]">
            <div className="p-4 sm:px-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div>
                <div className="text-xs text-[#94A3B8]">决战比赛日</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  11月22日 (半马)
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div>
                <div className="text-xs text-[#94A3B8]">康复+备赛周期</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  10.10 ~ 11.21
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-6 flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div>
                <div className="text-xs text-[#94A3B8]">峰值周跑量</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  26~28 公里
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-6 flex items-center gap-3">
              <Medal className="w-5 h-5 text-[#FF5500] shrink-0" />
              <div>
                <div className="text-xs text-[#94A3B8]">预期完赛时间</div>
                <div className="text-base font-mono font-bold text-[#FF5500] tabular-nums">
                  约 2:30~2:35
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: 走路康复预备期 (10.10~10.16) */}
        <RehabSection
          completedIds={completedIds}
          onToggleComplete={handleToggleComplete}
        />

        {/* SECTION 2: 跑步备赛期 (10.17~11.21) */}
        <RunningScheduleSection
          completedIds={completedIds}
          onToggleComplete={handleToggleComplete}
          onOpenSessionAlarm={openSessionAlarmModal}
        />

        {/* SECTION 3 & 4: 比赛日配速建议 & 安全红线 */}
        <RaceStrategyAndSafety />
      </main>

      {/* Clean Minimal Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-8 text-xs text-[#94A3B8] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 mt-12">
        <div>
          山东招远黄金马拉松 · 半马备赛训练计划（先无伤恢复，再渐进备赛，安全完赛）
        </div>
        <div className="font-mono tabular-nums">
          目标：无伤完赛 · 预期：约2:30~2:35完赛
        </div>
      </footer>

      {/* Mobile-First Ergonomic Bottom CTA Bar (Strictly <= 15% viewport height) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/95 to-transparent sm:hidden">
        <button
          type="button"
          onClick={openJoinPlanModal}
          className="w-full h-12 rounded-xl bg-[#FF5500] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF5500]/30 transition-transform"
        >
          <Timer className="w-4 h-4" />
          <span>
            {alarmConfig
              ? `已设每日 ${format24Hour(alarmConfig.hour, alarmConfig.minute)} 训练闹钟 (点击修改)`
              : '加入计划 · 设置你的训练时间'}
          </span>
        </button>
      </div>

      {/* 24-Hour Alarm Time Picker & Mobile Device Alarm Exporter Modal */}
      <AlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        existingAlarm={alarmConfig}
        onConfirmAlarm={handleConfirmAlarm}
        targetSession={modalTargetSession}
      />
    </div>
  );
}
