export interface SleepRecord {
  id: string
  day: string
  average_breath: number
  average_heart_rate: number
  average_hrv: number
  awake_time: number // in seconds
  bedtime_end: string // ISO datetime string
  bedtime_start: string // ISO datetime string
  deep_sleep_duration: number // in seconds
  efficiency: number // percentage
  heart_rate: TimeSeriesData
  hrv: TimeSeriesData
  latency: number // in seconds
  light_sleep_duration: number // in seconds
  low_battery_alert: boolean
  lowest_heart_rate: number
  movement_30_sec: string // raw movement string
  period: number
  readiness: ReadinessData
  readiness_score_delta: number
  rem_sleep_duration: number // in seconds
  restless_periods: number
  sleep_phase_5_min: string // encoded phases string
  sleep_score_delta: number
  sleep_algorithm_version: string
  time_in_bed: number // in seconds
  total_sleep_duration: number // in seconds
  type: string
}

export interface TimeSeriesData {
  interval: number // seconds per sample
  items: (number | null)[]
  timestamp: string // ISO datetime string (start time)
}

export interface ReadinessData {
  contributors: {
    activity_balance: number
    body_temperature: number
    hrv_balance: number
    previous_day_activity: number
    previous_night: number
    recovery_index: number
    resting_heart_rate: number
    sleep_balance: number
  }
  score: number
  temperature_deviation: number
  temperature_trend_deviation: number | null
}
