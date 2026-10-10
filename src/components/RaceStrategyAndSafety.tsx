import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Gauge, ShieldAlert, Trophy } from 'lucide-react';
import { PLAN_META, RACE_DAY_PACES, SAFETY_RED_LINES } from '../data/trainingPlan';

export const RaceStrategyAndSafety: React.FC = () => {
  const [selectedPaceSec, setSelectedPaceSec] = useState<number>(435); // 7'15" default average (~2:33 finish)
  const [acknowledgedRules, setAcknowledgedRules] = useState<string[]>([
    'safety-1',
    'safety-2',
    'safety-3',
  ]);

  const toggleRule = (id: string) => {
    setAcknowledgedRules((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatPace = (secPerKm: number) => {
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return `${m}'${String(s).padStart(2, '0')}"`;
  };

  const formatTotalTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.round(totalSeconds % 60);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const split5k = formatTotalTime(5 * 445); // ~7'25" for first 5k
  const split15k = formatTotalTime(5 * 445 + 10 * selectedPaceSec);
  const finishTime = formatTotalTime(
    5 * 445 + 10 * selectedPaceSec + 6.0975 * (selectedPaceSec - 5)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Columns: Race Day Pace Strategy */}
      <section
        id="pacing"
        className="lg:col-span-7 scroll-mt-20 rounded-2xl bg-[#12151C] border border-white/10 p-6 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10">
            <div>
              <div className="text-xs font-mono text-[#FF5500] tracking-wider">
                03. RACE DAY STRATEGY · 11月22日 21.0975 KM
              </div>
              <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mt-1">
                比赛日配速建议
              </h2>
            </div>
            <Gauge className="w-6 h-6 text-[#FF5500] shrink-0" />
          </div>

          {/* 3 Segment Cards */}
          <div className="space-y-3">
            {RACE_DAY_PACES.map((seg, idx) => (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: idx * 0.06 }}
                className="rounded-xl bg-[#171B24] border border-white/8 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#FF5500] tabular-nums">
                      0{idx + 1}
                    </span>
                    <span className="text-base font-bold text-white tabular-nums">
                      {seg.range}
                    </span>
                    <span className="text-white/25" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-mono text-base font-bold text-[#FF5500] tabular-nums">
                      {seg.pace}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-white bg-white/8 px-2.5 py-1 rounded-md whitespace-nowrap">
                    {seg.strategy}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  {seg.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive Split Time Simulator */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-[#CBD5E1]">
              巡航配速完赛时间推演（拖动调节中段巡航配速）：
            </span>
            <span className="font-mono text-sm font-bold text-[#FF5500] tabular-nums">
              巡航 {formatPace(selectedPaceSec)}/公里 → 预计 {finishTime} 完赛
            </span>
          </div>

          <input
            type="range"
            min={415}
            max={450}
            step={1}
            value={selectedPaceSec}
            onChange={(e) => setSelectedPaceSec(Number(e.target.value))}
            aria-label="调节巡航配速"
            className="w-full accent-[#FF5500] h-2 bg-[#0A0B0E] rounded-lg cursor-pointer"
          />

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl bg-[#0A0B0E] border border-white/8 p-3 text-center">
              <div className="text-[11px] text-[#94A3B8]">5公里打卡点</div>
              <div className="text-base font-mono font-bold text-white tabular-nums mt-0.5">
                {split5k}
              </div>
            </div>
            <div className="rounded-xl bg-[#0A0B0E] border border-white/8 p-3 text-center">
              <div className="text-[11px] text-[#94A3B8]">15公里打卡点</div>
              <div className="text-base font-mono font-bold text-white tabular-nums mt-0.5">
                {split15k}
              </div>
            </div>
            <div className="rounded-xl bg-[#FF5500]/12 border border-[#FF5500]/40 p-3 text-center">
              <div className="text-[11px] text-[#FF5500] font-semibold">
                21.0975公里冲线
              </div>
              <div className="text-base font-mono font-bold text-white tabular-nums mt-0.5">
                {finishTime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right 5 Columns: Safety Red Lines */}
      <section
        id="safety"
        className="lg:col-span-5 scroll-mt-20 rounded-2xl bg-[#12151C] border border-white/10 p-6 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10">
            <div>
              <div className="text-xs font-mono text-[#FF5500] tracking-wider">
                04. SAFETY RED LINES · 伤病零容忍
              </div>
              <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mt-1">
                安全红线准则
              </h2>
            </div>
            <ShieldAlert className="w-6 h-6 text-[#FF5500] shrink-0" />
          </div>

          <div className="space-y-3">
            {SAFETY_RED_LINES.map((item) => {
              const isChecked = acknowledgedRules.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleRule(item.id)}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    isChecked
                      ? 'bg-[#171B24] border-[#FF5500]/40'
                      : 'bg-[#14171F] border-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {item.rule}
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-mono text-xs font-bold text-[#FF5500] tabular-nums">
                        {item.metric}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isChecked ? 'text-[#FF5500]' : 'text-white/25'
                          }`}
                        />
                        {isChecked ? '已确认守则' : '点击确认'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Goal Banner */}
        <div className="mt-6 rounded-xl bg-gradient-to-r from-[#FF5500]/20 via-[#FF5500]/10 to-transparent border border-[#FF5500]/40 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#CBD5E1]">
                终极备赛目标：<strong className="text-white">{PLAN_META.goalText}</strong>
              </div>
              <div className="text-sm font-bold text-[#FF5500] tabular-nums mt-0.5">
                预期：{PLAN_META.expectedFinishTime}
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-white/80 tabular-nums whitespace-nowrap">
            21.0975 KM
          </span>
        </div>
      </section>
    </div>
  );
};
