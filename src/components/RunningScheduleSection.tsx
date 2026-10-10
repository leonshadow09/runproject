import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlarmClock, Check, TrendingUp } from 'lucide-react';
import { RUNNING_WEEKS, WorkoutSession } from '../data/trainingPlan';

interface RunningScheduleSectionProps {
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  onOpenSessionAlarm: (session: WorkoutSession) => void;
}

export const RunningScheduleSection: React.FC<RunningScheduleSectionProps> = ({
  completedIds,
  onToggleComplete,
  onOpenSessionAlarm,
}) => {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');

  const visibleWeeks =
    selectedWeekId === 'all'
      ? RUNNING_WEEKS
      : RUNNING_WEEKS.filter((w) => w.id === selectedWeekId);

  return (
    <section id="schedule" className="scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[#FF5500] tracking-wider">
            02. STAGE TWO · 10.17~11.21 · 五周渐进式拉练
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white mt-1">
            跑步备赛期课表
          </h2>
        </div>

        {/* Interactive Week Filter Controls (Functional Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-[#12151C] border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedWeekId('all')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedWeekId === 'all'
                ? 'bg-[#FF5500] text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            全部五周
          </button>
          {RUNNING_WEEKS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWeekId(w.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedWeekId === w.id
                  ? 'bg-[#FF5500] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              第{w.weekNum}周 · {w.strategyTag}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Mileage Progression Strip */}
      <div className="rounded-2xl bg-[#12151C] border border-white/10 p-5 mb-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF5500]" />
            <span className="text-xs font-semibold text-white">
              五周跑量负荷曲线（严守每周增幅 ≤ 30% 安全红线）
            </span>
          </div>
          <span className="text-xs font-mono text-[#94A3B8] tabular-nums">
            峰值：26~28 KM/周
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-28 pt-4">
          {RUNNING_WEEKS.map((w) => {
            const heightPercent = Math.round((w.volumeMax / 28) * 100);
            const isSelected = selectedWeekId === 'all' || selectedWeekId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() =>
                  setSelectedWeekId((prev) => (prev === w.id ? 'all' : w.id))
                }
                className="group flex flex-col items-center h-full justify-end text-center focus:outline-none"
              >
                <span className="text-[11px] font-mono text-[#F5F7FA] font-semibold tabular-nums mb-1">
                  {w.volumeMin}~{w.volumeMax}k
                </span>
                <div className="w-full max-w-[56px] bg-[#191D26] rounded-t-lg overflow-hidden flex items-end h-16">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${heightPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full rounded-t-lg transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-t from-[#FF5500]/70 to-[#FF5500]'
                        : 'bg-white/15 group-hover:bg-white/30'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-[#94A3B8] mt-1.5 font-mono tabular-nums whitespace-nowrap">
                  {w.dateRange.split('~')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Cards List */}
      <div className="space-y-4">
        {visibleWeeks.map((week, wIdx) => {
          const completedInWeek = week.sessions.filter((s) =>
            completedIds.includes(s.id)
          ).length;

          return (
            <motion.div
              key={week.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.25, delay: wIdx * 0.04 }}
              className="rounded-2xl bg-[#12151C] border border-white/10 overflow-hidden"
            >
              {/* Week Header Bar */}
              <div className="px-5 py-4 bg-[#161A23] border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-sm font-bold text-[#FF5500] tabular-nums">
                    {week.dateRange}
                  </span>
                  <span className="text-white/25" aria-hidden="true">
                    |
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {week.title}
                  </h3>
                  <span className="text-white/25" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-[#FF5500]">
                    核心策略：{week.strategyTag}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#94A3B8] tabular-nums">
                  <span>
                    周跑量 <strong className="text-white font-mono">{week.weeklyVolume}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">
                    已完成 {completedInWeek}/{week.sessions.length}
                  </span>
                </div>
              </div>

              {/* Sessions Grid / Rows */}
              <div className="divide-y divide-white/8">
                {week.sessions.map((session) => {
                  const isDone = completedIds.includes(session.id);
                  return (
                    <div
                      key={session.id}
                      className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isDone ? 'bg-[#FF5500]/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        {/* Day & Date Column */}
                        <div className="w-16 shrink-0">
                          <div className="text-sm font-bold text-white">
                            {session.dayLabel}
                          </div>
                          <div className="text-xs font-mono text-[#94A3B8] tabular-nums">
                            {session.displayDate}
                          </div>
                        </div>

                        {/* Workout & Pace Info */}
                        <div>
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                            <span
                              className={`text-base font-bold ${
                                isDone ? 'line-through text-[#94A3B8]' : 'text-white'
                              }`}
                            >
                              {session.workout}
                            </span>
                            <span className="text-white/20" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-sm font-mono font-semibold text-[#FF5500] tabular-nums">
                              配速 {session.pace}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-xs text-[#94A3B8] mt-1">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: Set Single Day Alarm & Check Complete */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenSessionAlarm(session)}
                          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#191D26] hover:bg-white/10 text-xs font-medium text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                        >
                          <AlarmClock className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>设闹钟</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleComplete(session.id)}
                          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                            isDone
                              ? 'bg-[#FF5500] text-white'
                              : 'bg-[#191D26] hover:bg-white/10 text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDone ? '已完成' : '打卡'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
