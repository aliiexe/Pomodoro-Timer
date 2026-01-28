import { useState, useEffect } from 'react';
import {
  MdWbSunny,
  MdBrightness3,
  MdPlayArrow,
  MdPause,
  MdRefresh,
  MdSettings,
  MdClose,
} from 'react-icons/md';

const STORAGE_KEYS = {
  theme: 'pomodoro_theme',
  workDuration: 'pomodoro_work_duration',
  breakTime: 'pomodoro_break_time',
  timerStyle: 'pomodoro_timer_style',
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;

  const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;

  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialWorkDuration = () => {
  if (typeof window === 'undefined') return 25;
  const value = parseInt(window.localStorage.getItem(STORAGE_KEYS.workDuration) || '', 10);
  return Number.isFinite(value) && value > 0 ? value : 25;
};

const getInitialBreakTime = () => {
  if (typeof window === 'undefined') return 5;
  const value = parseInt(window.localStorage.getItem(STORAGE_KEYS.breakTime) || '', 10);
  return Number.isFinite(value) && value > 0 ? value : 5;
};

const getInitialTimerStyle = () => {
  if (typeof window === 'undefined') return 'circle';
  const stored = window.localStorage.getItem(STORAGE_KEYS.timerStyle);
  return stored === 'pill' || stored === 'minimal' ? stored : 'circle';
};

const Pomodoro = () => {
  const [darkMode, setDarkMode] = useState(getInitialTheme);
  const [workDuration, setWorkDuration] = useState(getInitialWorkDuration); // in minutes
  const [breakTime, setBreakTime] = useState(getInitialBreakTime);
  const [timerStyle, setTimerStyle] = useState(getInitialTimerStyle);
  const [minutes, setMinutes] = useState(workDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    let interval;

    const startWork = () => {
      setIsBreak(false);
      setMinutes(workDuration);
      setSeconds(0);
      setIsActive(true);
    };

    const startBreak = () => {
      setIsBreak(true);
      setMinutes(breakTime);
      setSeconds(0);
      setIsActive(true);
    };

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);

            if (!isBreak) {
              // finished a focus session
              setSessionsCompleted((prev) => prev + 1);
              if (breakTime > 0) {
                startBreak();
              } else {
                startWork();
              }
            } else {
              // finished break, go back to focus
              startWork();
            }
          } else {
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, breakTime, isBreak, workDuration]);

  // Persist simple preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.theme, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.workDuration, String(workDuration));
  }, [workDuration]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.breakTime, String(breakTime));
  }, [breakTime]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.timerStyle, timerStyle);
  }, [timerStyle]);

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
  };

  const setBreakTimeHandler = (time) => {
    if (!isActive) {
      setBreakTime(time);
    }
  };

  const setWorkDurationHandler = (duration) => {
    if (!isActive) {
      setWorkDuration(duration);
      setMinutes(duration);
      setSeconds(0);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  const timerShapeClasses =
    timerStyle === 'pill'
      ? 'rounded-3xl w-full max-w-md h-44 md:h-48'
      : timerStyle === 'minimal'
        ? 'rounded-2xl w-full max-w-md h-32 md:h-36 border-none bg-transparent'
        : 'rounded-full w-64 h-64 md:w-72 md:h-72';

  const totalSeconds = (isBreak ? breakTime : workDuration) * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const rawProgress =
    totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const progress = Math.min(Math.max(rawProgress, 0), 1);
  const circleRadius = 52;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference * (1 - progress);
  const progressColorHex = isBreak ? '#22c55e' : '#38bdf8';

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center px-4 py-10 md:py-16 transition-colors duration-500 ${
        darkMode ? 'bg-neutral-950 text-neutral-50' : 'bg-neutral-50 text-neutral-900'
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-xl transition-all duration-500 ${
          darkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <header className="flex items-center justify-between px-6 pt-5 pb-3 md:px-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Pomodoro Timer</h1>
            <p className="mt-1 text-xs md:text-sm text-neutral-400">
              Clean focus sessions with gentle breaks.
            </p>
          </div>
          <button
            className={`inline-flex items-center justify-center rounded-full p-2.5 transition-colors duration-300 ${
              darkMode
                ? 'bg-neutral-800 text-amber-300 hover:bg-neutral-700'
                : 'bg-neutral-100 text-amber-500 hover:bg-neutral-200'
            }`}
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
          >
            {darkMode ? <MdBrightness3 size={20} /> : <MdWbSunny size={20} />}
          </button>
        </header>

        <main className="px-6 pb-6 pt-1 md:px-8 space-y-6 md:space-y-7">
          <section className="flex items-center justify-between text-xs md:text-sm text-neutral-400">
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isBreak ? 'bg-emerald-400' : 'bg-sky-400'
                }`}
              />
              <span className="font-medium text-neutral-200">
                {isBreak ? 'Break' : 'Focus'} mode
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-neutral-500">Sessions</span>
              <span className="text-base md:text-lg font-semibold text-neutral-100">
                {sessionsCompleted}
              </span>
            </span>
          </section>

          <section className="flex flex-col items-center gap-5">
            <div
              className={`relative flex flex-col items-center justify-center border text-center transition-colors duration-500 overflow-hidden ${timerShapeClasses} ${
                darkMode
                  ? 'border-neutral-700 bg-neutral-900/90'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              {timerStyle === 'circle' && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    stroke={darkMode ? '#262626' : '#e5e5e5'}
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    stroke={progressColorHex}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={circleOffset}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span className="text-5xl md:text-6xl font-mono tabular-nums tracking-tight">
                {formattedMinutes}:{formattedSeconds}
              </span>
              <span className="mt-2 text-xs md:text-sm text-neutral-400">
                {isActive ? 'Running' : 'Paused'}
              </span>
              {timerStyle !== 'circle' && (
                <div className="mt-3 w-3/4 h-1.5 rounded-full bg-neutral-800/40">
                  <div
                    className="h-full rounded-full transition-[width] duration-300 ease-linear"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: progressColorHex,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm md:text-base font-medium transition-colors duration-300 ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                    : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                }`}
                onClick={toggleTimer}
              >
                {isActive ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm md:text-base font-medium bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={resetTimer}
                disabled={minutes === workDuration && seconds === 0 && !isActive && !isBreak}
              >
                <MdRefresh size={18} />
                Reset
              </button>
            </div>
          </section>

          <p className="text-[11px] md:text-xs text-neutral-500">
            Tip: Use the settings button in the corner to adjust durations, style, and preferences.
          </p>
        </main>
      </div>

      {/* Settings button */}
      <button
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        className={`fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full p-3 shadow-md transition-colors duration-300 ${
          darkMode
            ? 'bg-neutral-900 border border-neutral-700 text-neutral-100 hover:bg-neutral-800'
            : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
        }`}
        aria-label="Open settings"
      >
        <MdSettings size={22} />
      </button>

      {/* Settings modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-xl px-5 py-4 md:px-6 md:py-5 ${
              darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Timer settings"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold">Settings</h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="inline-flex items-center justify-center rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800"
                aria-label="Close settings"
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="space-y-4 md:space-y-5 text-xs md:text-sm">
              <section>
                <p className="mb-2 font-medium text-neutral-400">Focus length</p>
                <div className="flex flex-wrap gap-2">
                  {[15, 25, 50].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      disabled={isActive}
                      onClick={() => setWorkDurationHandler(duration)}
                      className={`flex-1 rounded-full px-3.5 py-2.5 font-medium border transition-colors duration-200 disabled:cursor-not-allowed ${
                        workDuration === duration
                          ? 'bg-neutral-100 text-neutral-900 border-neutral-300'
                          : darkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2 font-medium text-neutral-400">Break length</p>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15].map((time) => (
                    <button
                      key={time}
                      type="button"
                      disabled={isActive}
                      onClick={() => setBreakTimeHandler(time)}
                      className={`flex-1 rounded-full px-3.5 py-2.5 font-medium border transition-colors duration-200 disabled:cursor-not-allowed ${
                        breakTime === time
                          ? 'bg-neutral-100 text-neutral-900 border-neutral-300'
                          : darkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {time} min
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2 font-medium text-neutral-400">Timer style</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'circle', label: 'Circle' },
                    { id: 'pill', label: 'Pill card' },
                    { id: 'minimal', label: 'Minimal' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTimerStyle(option.id)}
                      className={`flex-1 rounded-full px-3.5 py-2.5 font-medium border transition-colors duration-200 ${
                        timerStyle === option.id
                          ? 'bg-neutral-100 text-neutral-900 border-neutral-300'
                          : darkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;

