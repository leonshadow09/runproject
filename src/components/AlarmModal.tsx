import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlarmClock,
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  Smartphone,
  Volume2,
  X,
} from 'lucide-react';
import { WorkoutSession } from '../data/trainingPlan';
import {
  AlarmConfig,
  format24Hour,
  getAndroidAlarmIntentUri,
  playAthleticAlarmFeedback,
  triggerDeviceCalendarAlarm,
} from '../utils/alarmExporter';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAlarm: AlarmConfig | null;
  onConfirmAlarm: (config: AlarmConfig) => void;
  targetSession?: WorkoutSession | null;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => i);

const QUICK_PRESETS = [
  { label: '06:00 晨跑黄金档', hour: 6, minute: 0 },
  { label: '07:00 晨间唤醒档', hour: 7, minute: 0 },
  { label: '18:30 下班夜跑档', hour: 18, minute: 30 },
  { label: '20:00 晚间燃脂档', hour: 20, minute: 0 },
];

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  existingAlarm,
  onConfirmAlarm,
  targetSession,
}) => {
  const [hour, setHour] = useState<number>(existingAlarm?.hour ?? 6);
  const [minute, setMinute] = useState<number>(existingAlarm?.minute ?? 30);
  const [step, setStep] = useState<'pick' | 'confirmed'>('pick');

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('pick');
      if (existingAlarm) {
        setHour(existingAlarm.hour);
        setMinute(existingAlarm.minute);
      }
    }
  }, [isOpen, existingAlarm]);

  // Center selected hour/minute in the scrollable wheel when opened
  useEffect(() => {
    if (isOpen && step === 'pick') {
      const timer = setTimeout(() => {
        if (hourListRef.current) {
          const el = hourListRef.current.querySelector(`[data-hour="${hour}"]`) as HTMLElement;
          if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        if (minuteListRef.current) {
          const el = minuteListRef.current.querySelector(`[data-minute="${minute}"]`) as HTMLElement;
          if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step, hour, minute]);

  const adjustHour = (delta: number) => {
    setHour((prev) => (prev + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setMinute((prev) => (prev + delta + 60) % 60);
  };

  const handleConfirm = () => {
    const config: AlarmConfig = {
      hour,
      minute,
      joinedAt: new Date().toISOString(),
      customNote: targetSession
        ? `${targetSession.displayDate} ${targetSession.workout} (${targetSession.pace})`
        : '山东招远黄金马拉松·半马备赛全周期课表',
    };

    // 1. Play athletic audio/vibration feedback
    playAthleticAlarmFeedback();

    // 2. Request browser Notification permission if supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    // 3. Save to parent state & localStorage
    onConfirmAlarm(config);

    // 4. Immediately invoke device alarm / calendar reminder import (.ics with VALARM)
    triggerDeviceCalendarAlarm(hour, minute, targetSession || undefined);

    // 5. If on Android mobile device, also offer/trigger native Clock SET_ALARM intent
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    if (/Android/i.test(ua)) {
      const intentUri = getAndroidAlarmIntentUri(
        hour,
        minute,
        targetSession
          ? `【招远半马训练】${targetSession.workout} 配速${targetSession.pace}`
          : '【招远半马备赛】髋部激活7分钟 + 今日训练课表（安全完赛）'
      );
      setTimeout(() => {
        window.location.href = intentUri;
      }, 450);
    }

    setStep('confirmed');
  };

  const formattedTime = format24Hour(hour, minute);

  const alarmMessagePreview = targetSession
    ? `【招远半马训练】${targetSession.displayDate} ${targetSession.dayLabel}：${targetSession.workout} · 配速 ${targetSession.pace}`
    : '【山东招远黄金马拉松】每日准时训练：跑前7分钟髋部激活 + 当日备赛课表 + 跑后8分钟髋部放松';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#12151C] border border-white/12 shadow-2xl overflow-hidden"
          >
            {/* Top Grab Handle for mobile */}
            <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <AlarmClock className="w-5 h-5 text-[#FF5500]" />
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {targetSession ? '设置单日训练闹钟' : '加入半马备赛计划'}
                  </h2>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 font-medium">
                  设置你的训练时间 · 24小时制准时唤醒并导入手机闹钟提醒
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭窗口"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'pick' ? (
              <div className="p-6 space-y-5">
                {/* Quick Presets */}
                <div>
                  <div className="text-xs text-[#94A3B8] mb-2 font-medium">
                    常用训练时段快选
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_PRESETS.map((preset) => {
                      const isSelected = hour === preset.hour && minute === preset.minute;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setHour(preset.hour);
                            setMinute(preset.minute);
                          }}
                          className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                            isSelected
                              ? 'bg-[#FF5500]/15 border-[#FF5500] text-[#FF5500]'
                              : 'bg-[#191D26] border-white/8 text-[#CBD5E1] hover:border-white/20'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 24-Hour Interactive Drum & Stepper Picker */}
                <div className="rounded-2xl bg-[#0A0B0E] border border-white/10 p-4">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3 px-2">
                    <span>选择小时 (00–23)</span>
                    <span className="font-mono text-[#FF5500] font-semibold">
                      当前设定：{formattedTime} (24小时制)
                    </span>
                    <span>选择分钟 (00–59)</span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    {/* HOUR COLUMN */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => adjustHour(-1)}
                        aria-label="减少一小时"
                        className="w-full min-h-[44px] flex items-center justify-center rounded-lg bg-[#161922] hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>

                      {/* Scrollable 24h Drum */}
                      <div
                        ref={hourListRef}
                        className="h-36 w-full overflow-y-auto no-scrollbar my-1.5 rounded-xl bg-[#12151C] border border-white/8 divide-y divide-white/5"
                      >
                        {HOURS_24.map((h) => {
                          const active = h === hour;
                          return (
                            <button
                              key={h}
                              type="button"
                              data-hour={h}
                              onClick={() => setHour(h)}
                              className={`w-full min-h-[44px] flex items-center justify-center font-mono text-lg tabular-nums transition-colors ${
                                active
                                  ? 'bg-[#FF5500] text-white font-bold'
                                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {String(h).padStart(2, '0')}{' '}
                              <span className="text-xs font-sans ml-1 opacity-75">时</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => adjustHour(1)}
                        aria-label="增加一小时"
                        className="w-full min-h-[44px] flex items-center justify-center rounded-lg bg-[#161922] hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* COLON SEPARATOR */}
                    <div className="font-mono text-4xl font-bold text-[#FF5500] select-none pb-2">
                      :
                    </div>

                    {/* MINUTE COLUMN */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => adjustMinute(-5)}
                        aria-label="减少分钟"
                        className="w-full min-h-[44px] flex items-center justify-center rounded-lg bg-[#161922] hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>

                      {/* Scrollable 60m Drum */}
                      <div
                        ref={minuteListRef}
                        className="h-36 w-full overflow-y-auto no-scrollbar my-1.5 rounded-xl bg-[#12151C] border border-white/8 divide-y divide-white/5"
                      >
                        {MINUTES_60.map((m) => {
                          const active = m === minute;
                          return (
                            <button
                              key={m}
                              type="button"
                              data-minute={m}
                              onClick={() => setMinute(m)}
                              className={`w-full min-h-[44px] flex items-center justify-center font-mono text-lg tabular-nums transition-colors ${
                                active
                                  ? 'bg-[#FF5500] text-white font-bold'
                                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {String(m).padStart(2, '0')}{' '}
                              <span className="text-xs font-sans ml-1 opacity-75">分</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => adjustMinute(5)}
                        aria-label="增加分钟"
                        className="w-full min-h-[44px] flex items-center justify-center rounded-lg bg-[#161922] hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alarm Content Preview */}
                <div className="rounded-xl bg-[#191D26] border border-white/8 p-3.5">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                    <span>将导入手机闹钟/日程的训练内容</span>
                    <span className="font-mono text-[#FF5500] tabular-nums">每日 {formattedTime} 提醒</span>
                  </div>
                  <p className="text-xs text-[#F5F7FA] leading-relaxed">
                    {alarmMessagePreview}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[48px] px-5 rounded-xl bg-[#191D26] hover:bg-white/10 text-sm font-semibold text-[#CBD5E1] transition-colors whitespace-nowrap shrink-0"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 min-h-[48px] px-6 rounded-xl bg-[#FF5500] hover:bg-[#FF6B00] active:scale-[0.99] text-sm font-bold text-white shadow-lg shadow-[#FF5500]/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BellRing className="w-4 h-4" />
                    <span>确定并调取手机闹钟 ({formattedTime})</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmed State with direct Mobile System Clock & Calendar actions */
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FF5500]/12 border border-[#FF5500]/40">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#FF5500] font-semibold">
                      已生成并触发手机端训练提醒
                    </div>
                    <div className="text-2xl font-display font-bold text-white tabular-nums tracking-wide">
                      每日 {formattedTime} 准时开练
                    </div>
                    <div className="text-xs text-[#CBD5E1] mt-0.5">
                      请在系统弹出的日程/闹钟确认框中点击“添加”或“保存”
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs text-[#94A3B8] font-medium">
                    手机端导入方式（若浏览器拦截自动拉起，可手动点按）：
                  </div>

                  {/* Option 1: Universal iOS / Android Calendar + VALARM (.ics) */}
                  <button
                    type="button"
                    onClick={() => triggerDeviceCalendarAlarm(hour, minute, targetSession || undefined)}
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#191D26] hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="w-5 h-5 text-[#FF5500] shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          导入全周期训练课表提醒 (.ics 闹钟)
                        </div>
                        <div className="text-xs text-[#94A3B8]">
                          支持 iPhone / 安卓系统日历与提醒事项强提醒
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#FF5500] whitespace-nowrap shrink-0 ml-2">
                      再次导入
                    </span>
                  </button>

                  {/* Option 2: Direct Android Clock App SET_ALARM Intent */}
                  <a
                    href={getAndroidAlarmIntentUri(
                      hour,
                      minute,
                      targetSession
                        ? `【招远半马训练】${targetSession.workout} (${targetSession.pace})`
                        : '【招远半马备赛】跑前7分钟髋部激活 + 今日训练课表'
                    )}
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#191D26] hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-[#FF5500] shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          调起手机系统时钟 App (Android 闹钟)
                        </div>
                        <div className="text-xs text-[#94A3B8]">
                          自动填入 {formattedTime} 及当日训练课表备注
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#FF5500] whitespace-nowrap shrink-0 ml-2">
                      立即调起
                    </span>
                  </a>

                  {/* Option 3: Test Alarm Audio & Vibration */}
                  <button
                    type="button"
                    onClick={playAthleticAlarmFeedback}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0A0B0E] hover:bg-white/5 border border-white/8 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-[#94A3B8]" />
                      <span className="text-xs text-[#CBD5E1]">
                        试听网页端训练闹钟提示音与震动
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#94A3B8]">试听</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('pick')}
                    className="min-h-[48px] px-4 rounded-xl bg-[#191D26] hover:bg-white/10 text-xs font-semibold text-[#CBD5E1] transition-colors whitespace-nowrap shrink-0"
                  >
                    修改时间
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 min-h-[48px] px-6 rounded-xl bg-[#FF5500] hover:bg-[#FF6B00] text-sm font-bold text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    完成设置
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
