export interface RehabModule {
  id: string;
  title: string;
  duration: string;
  durationSeconds?: number;
  subtitle: string;
  detail: string;
  category: string;
}

export interface WorkoutSession {
  id: string;
  dayLabel: string;
  dateStr: string; // YYYY-MM-DD in 2026
  displayDate: string; // e.g. 10.17
  workout: string;
  pace: string;
  distanceKm: number;
  notes?: string;
  isKeySession?: boolean;
}

export interface TrainingWeek {
  id: string;
  weekNum: number;
  dateRange: string;
  title: string;
  weeklyVolume: string;
  volumeMin: number;
  volumeMax: number;
  strategyTag: string;
  sessions: WorkoutSession[];
}

export interface PaceSegment {
  id: string;
  range: string;
  distanceRangeKm: [number, number];
  pace: string;
  paceSecondsMin: number;
  paceSecondsMax: number;
  strategy: string;
  detail: string;
}

export const PLAN_META = {
  eventTitle: '山东招远黄金马拉松',
  planTitle: '半马备赛训练计划',
  raceDate: '2026-11-22',
  raceDateLabel: '比赛日：11月22日',
  coreSlogan: '先无伤恢复，再渐进备赛，安全完赛',
  principles: ['髋部优先', '循序渐进', '安全完赛'],
  goalText: '无伤完赛',
  expectedFinishTime: '约2:30~2:35完赛',
  halfMarathonKm: 21.0975,
};

export const REHAB_PHASE = {
  title: '走路康复预备期',
  dateRange: '10.10~10.16',
  weeklyVolume: '0公里',
  description: '零跑量重启地基，优先消除髋部隐患，建立无痛运动模式',
  modules: [
    {
      id: 'rehab-walk',
      title: '每日快走',
      duration: '30~45分钟',
      durationSeconds: 1800,
      subtitle: '配速 9\'00"~10\'00"/公里',
      detail: '小步幅，能连贯说话',
      category: '有氧唤醒',
    },
    {
      id: 'rehab-release',
      title: '髋部放松',
      duration: '8分钟',
      durationSeconds: 480,
      subtitle: '臀部、大腿外侧、髋屈肌',
      detail: '痛点停留30秒',
      category: '筋膜松解',
    },
    {
      id: 'rehab-activate',
      title: '髋部激活',
      duration: '7分钟',
      durationSeconds: 420,
      subtitle: '蚌式、臀桥、侧步走',
      detail: '跑前必做',
      category: '神经募集',
    },
    {
      id: 'rehab-strength',
      title: '力量训练',
      duration: '每周3次',
      durationSeconds: 900,
      subtitle: '臀桥、单腿臀桥、平板支撑',
      detail: '配合髋屈肌拉伸',
      category: '核心稳定',
    },
  ] as RehabModule[],
};

export const RUNNING_WEEKS: TrainingWeek[] = [
  {
    id: 'week-1',
    weekNum: 1,
    dateRange: '10.17~10.23',
    title: '跑步重启适应周',
    weeklyVolume: '10~12公里',
    volumeMin: 10,
    volumeMax: 12,
    strategyTag: '宁慢勿快',
    sessions: [
      {
        id: 'w1-tue',
        dayLabel: '周二',
        dateStr: '2026-10-20',
        displayDate: '10.20',
        workout: '3公里轻松跑',
        pace: '7\'40"~8\'00"',
        distanceKm: 3,
        notes: '跑前必做7分钟髋部激活，步幅放小',
      },
      {
        id: 'w1-thu',
        dayLabel: '周四',
        dateStr: '2026-10-22',
        displayDate: '10.22',
        workout: '3~4公里轻松跑',
        pace: '7\'40"~8\'00"',
        distanceKm: 4,
        notes: '保持呼吸平稳，观察髋部反馈',
      },
      {
        id: 'w1-sat',
        dayLabel: '周六',
        dateStr: '2026-10-17',
        displayDate: '10.17',
        workout: '5公里轻松跑',
        pace: '7\'30"~7\'50"',
        distanceKm: 5,
        notes: '周末有氧适应，宁慢勿快',
        isKeySession: true,
      },
    ],
  },
  {
    id: 'week-2',
    weekNum: 2,
    dateRange: '10.24~10.30',
    title: '有氧基础重建周',
    weeklyVolume: '14~16公里',
    volumeMin: 14,
    volumeMax: 16,
    strategyTag: '稳步加量',
    sessions: [
      {
        id: 'w2-tue',
        dayLabel: '周二',
        dateStr: '2026-10-27',
        displayDate: '10.27',
        workout: '5公里轻松跑',
        pace: '7\'40"',
        distanceKm: 5,
        notes: '稳固基础有氧心率，保持轻松体感',
      },
      {
        id: 'w2-thu',
        dayLabel: '周四',
        dateStr: '2026-10-29',
        displayDate: '10.29',
        workout: '5~6公里轻松跑',
        pace: '7\'20"~7\'40"',
        distanceKm: 6,
        notes: '中段自然巡航，跑后8分钟髋部放松',
      },
      {
        id: 'w2-sat',
        dayLabel: '周六',
        dateStr: '2026-10-24',
        displayDate: '10.24',
        workout: '8公里长距离',
        pace: '7\'30"左右',
        distanceKm: 8,
        notes: '首次耐力拉长，稳步加量不冲刺',
        isKeySession: true,
      },
    ],
  },
  {
    id: 'week-3',
    weekNum: 3,
    dateRange: '10.31~11.6',
    title: '耐力提升+轻度节奏周',
    weeklyVolume: '20~22公里',
    volumeMin: 20,
    volumeMax: 22,
    strategyTag: '找回节奏',
    sessions: [
      {
        id: 'w3-tue',
        dayLabel: '周二',
        dateStr: '2026-11-03',
        displayDate: '11.03',
        workout: '6公里轻松跑',
        pace: '7\'20"~7\'40"',
        distanceKm: 6,
        notes: '轻松有氧，为周四节奏跑储备状态',
      },
      {
        id: 'w3-thu',
        dayLabel: '周四',
        dateStr: '2026-11-05',
        displayDate: '11.05',
        workout: '2公里热身 + 4公里节奏 + 2公里冷身',
        pace: '节奏段 6\'50"~7\'00"',
        distanceKm: 8,
        notes: '找回专注节奏感，热身与冷身不可省略',
        isKeySession: true,
      },
      {
        id: 'w3-sat',
        dayLabel: '周六',
        dateStr: '2026-10-31',
        displayDate: '10.31',
        workout: '10~12公里长距离',
        pace: '7\'10"~7\'30"',
        distanceKm: 12,
        notes: '突破10公里耐力关口，保持步频稳定',
        isKeySession: true,
      },
    ],
  },
  {
    id: 'week-4',
    weekNum: 4,
    dateRange: '11.7~11.13',
    title: '配速适应+峰值拉练周',
    weeklyVolume: '26~28公里',
    volumeMin: 26,
    volumeMax: 28,
    strategyTag: '模拟补给',
    sessions: [
      {
        id: 'w4-tue',
        dayLabel: '周二',
        dateStr: '2026-11-10',
        displayDate: '11.10',
        workout: '6公里轻松跑',
        pace: '7\'20"~7\'40"',
        distanceKm: 6,
        notes: '恢复性有氧，注意髋屈肌拉伸',
      },
      {
        id: 'w4-thu',
        dayLabel: '周四',
        dateStr: '2026-11-12',
        displayDate: '11.12',
        workout: '2公里热身 + 6公里目标配速 + 2公里冷身',
        pace: '目标段 7\'00"~7\'10"',
        distanceKm: 10,
        notes: '锁定半马比赛巡航体感',
        isKeySession: true,
      },
      {
        id: 'w4-sat',
        dayLabel: '周六',
        dateStr: '2026-11-07',
        displayDate: '11.07',
        workout: '12~14公里长距离（10公里处补给）',
        pace: '7\'10"~7\'20"',
        distanceKm: 14,
        notes: '备赛峰值拉练，10公里处实测能量胶/饮水补给',
        isKeySession: true,
      },
    ],
  },
  {
    id: 'week-5',
    weekNum: 5,
    dateRange: '11.14~11.21',
    title: '减量调整周',
    weeklyVolume: '12~15公里',
    volumeMin: 12,
    volumeMax: 15,
    strategyTag: '保存体能',
    sessions: [
      {
        id: 'w5-mon',
        dayLabel: '周一',
        dateStr: '2026-11-16',
        displayDate: '11.16',
        workout: '5公里轻松跑',
        pace: '7\'20"~7\'40"',
        distanceKm: 5,
        notes: '开启赛前减量，消除身体疲劳',
      },
      {
        id: 'w5-wed',
        dayLabel: '周三',
        dateStr: '2026-11-18',
        displayDate: '11.18',
        workout: '4公里轻松跑',
        pace: '7\'20"~7\'40"',
        distanceKm: 4,
        notes: '轻快摆臂，保持肌肉弹性',
      },
      {
        id: 'w5-pre3',
        dayLabel: '赛前3天',
        dateStr: '2026-11-19',
        displayDate: '11.19',
        workout: '2公里热身 + 3×1公里间歇 + 1公里冷身',
        pace: '间歇段 6\'40"~6\'50"',
        distanceKm: 6,
        notes: '刺激心肺唤醒神经，不产生乳酸堆积',
        isKeySession: true,
      },
      {
        id: 'w5-pre1',
        dayLabel: '赛前1天',
        dateStr: '2026-11-21',
        displayDate: '11.21',
        workout: '休息或散步20分钟',
        pace: '完全放松',
        distanceKm: 0,
        notes: '早睡蓄力，准备好比赛装备与号码布',
      },
    ],
  },
];

export const RACE_DAY_PACES: PaceSegment[] = [
  {
    id: 'pace-1',
    range: '0~5公里',
    distanceRangeKm: [0, 5],
    pace: '7\'20"~7\'30"',
    paceSecondsMin: 440,
    paceSecondsMax: 450,
    strategy: '压住起跑',
    detail: '发枪后人群拥挤切忌盲目跟跑，前5公里严格压住心率与步幅，让髋关节充分热身进入状态。',
  },
  {
    id: 'pace-2',
    range: '5~15公里',
    distanceRangeKm: [5, 15],
    pace: '7\'10"~7\'20"',
    paceSecondsMin: 430,
    paceSecondsMax: 440,
    strategy: '稳定巡航',
    detail: '进入黄金巡航区间，保持高步频小步幅，逢水站少量多次补水，10公里处按训练习惯补给。',
  },
  {
    id: 'pace-3',
    range: '15~21.0975公里',
    distanceRangeKm: [15, 21.0975],
    pace: '状态良好可小幅提速',
    paceSecondsMin: 415,
    paceSecondsMax: 430,
    strategy: '安全冲线',
    detail: '若髋部无任何不适且呼吸受控，可微提配速至7\'00"左右；若感疲劳则维持原配速稳健安全完赛。',
  },
];

export const SAFETY_RED_LINES = [
  {
    id: 'safety-1',
    rule: '每周跑量增幅不超过30%',
    reason: '严防组织应力超载，给肌腱与髋关节充足的重塑恢复窗口。',
    metric: '≤ 30%',
  },
  {
    id: 'safety-2',
    rule: '髋部刺痛或放射痛立即停止',
    reason: '一旦出现锐痛、卡顿或大腿放射痛，立即降级为慢走或停训休息，绝不硬撑。',
    metric: '0 容忍',
  },
  {
    id: 'safety-3',
    rule: '所有训练以髋部无持续不适为准',
    reason: '跑前7分钟髋部激活与跑后8分钟放松缺一不可，次日清晨髋部无僵痛方可推进课表。',
    metric: '100% 优先',
  },
];
