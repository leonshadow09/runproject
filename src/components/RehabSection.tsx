import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Play, Pause, RotateCcw, Footprints, Flame, Activity, Dumbbell } from 'lucide-react';
import { REHAB_PHASE, RehabModule } from '../data/trainingPlan';
import { playAthleticAlarmFeedback } from '../utils/alarmExporter';

interface RehabSectionProps {
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}

export const RehabSection: React.FC<RehabSectionProps> = ({
  completedIds,
  onToggleComplete,
}) => {
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playAthleticAlarmFeedback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleStartModuleTimer = (mod: RehabModule) => {
    if (activeTimerId === mod.id) {
      setIsRunning((prev) => !prev);
    } else {
      setActiveTimerId(mod.id);
      setSecondsLeft(mod.durationSeconds || 420);
      setIsRunning(true);
    }
  };

  const handleResetTimer = (mod: RehabModule) => {
    setActiveTimerId(mod.id);
    setSecondsLeft(mod.durationSeconds || 420);
    setIsRunning(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'rehab-walk':
        return <Footprints className="w-5 h-5 text-[#FF5500]" />;
      case 'rehab-release':
        return <Activity className="w-5 h-5 text-[#FF5500]" />;
      case 'rehab-activate':
        return <Flame className="w-5 h-5 text-[#FF5500]" />;
      default:
        return <Dumbbell className="w-5 h-5 text-[#FF5500]" />;
    }
  };

  return (
    <section id="rehab" className="scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[#FF5500] tracking-wider">
            01. STAGE ONE · 10.10~10.16 · 周跑量 0 公里
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white mt-1">
            {REHAB_PHASE.title}
          </h2>
        </div>
        <p className="text-sm text-[#94A3B8] max-w-md">
          {REHAB_PHASE.description}
        </p>
      </div>

      {/* 4 Rehab Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REHAB_PHASE.modules.map((mod, idx) => {
          const isCompleted = completedIds.includes(mod.id);
          const isThisTimerActive = activeTimerId === mod.id;

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className={`rounded-2xl p-5 border transition-colors flex flex-col justify-between ${
                isCompleted
                  ? 'bg-[#141821] border-[#FF5500]/50'
                  : 'bg-[#12151C] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Top Metadata Line (Unboxed) */}
                <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8] mb-3">
                  <div className="flex items-center gap-1.5">
                    {getModuleIcon(mod.id)}
                    <span>{mod.category}</span>
                  </div>
                  <span className="font-mono text-[#FF5500] font-semibold tabular-nums">
                    {mod.duration}
                  </span>
                </div>

                {/* Title & Big Duration */}
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {mod.title}
                </h3>

                {/* Details */}
                <div className="mt-3 pt-3 border-t border-white/8 space-y-1">
                  <p className="text-sm font-semibold text-[#F5F7FA]">
                    {mod.subtitle}
                  </p>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {mod.detail}
                  </p>
                </div>
              </div>

              {/* Interactive Controls: Live Timer & Check-off */}
              <div className="mt-5 pt-3 border-t border-white/8 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartModuleTimer(mod)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-mono font-semibold tabular-nums flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                      isThisTimerActive && isRunning
                        ? 'bg-[#FF5500] text-white'
                        : 'bg-[#191D26] hover:bg-white/10 text-[#CBD5E1]'
                    }`}
                  >
                    {isThisTimerActive && isRunning ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isThisTimerActive ? formatTimer(secondsLeft) : '计时训练'}
                    </span>
                  </button>

                  {isThisTimerActive && (
                    <button
                      type="button"
                      onClick={() => handleResetTimer(mod)}
                      aria-label="重置计时"
                      className="min-w-[40px] min-h-[40px] rounded-xl bg-[#191D26] hover:bg-white/10 text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleComplete(mod.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    isCompleted
                      ? 'bg-[#FF5500]/20 text-[#FF5500]'
                      : 'bg-[#191D26] hover:bg-white/10 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCompleted ? '已打卡' : '打卡'}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
