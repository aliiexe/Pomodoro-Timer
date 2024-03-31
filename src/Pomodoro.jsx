import { useState, useEffect } from 'react';
import { MdWbSunny, MdBrightness3 } from 'react-icons/md';

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breakTime, setBreakTime] = useState(5);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    let interval;

    const startBreak = () => {
      setIsActive(true);
      setMinutes(breakTime);
      setSeconds(0);
    };

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            if (breakTime > 0) {
              startBreak();
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
  }, [isActive, minutes, seconds, breakTime]);

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  const setBreakTimeHandler = (time) => {
    if (!isActive) {
      setBreakTime(time);
      resetTimer();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-all duration-500 ${
        darkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">Pomodoro Timer</h1>
      <div className="text-4xl md:text-9xl mb-4">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <button
          className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
          } px-4 md:px-6 py-2 md:py-3 rounded-md hover:text-white hover:bg-gray-600 transition`}
          onClick={toggleTimer}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
          } px-4 md:px-6 py-2 md:py-3 rounded-md hover:text-white hover:bg-gray-600 transition`}
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <button
          className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
          } px-4 md:px-6 py-2 md:py-3 rounded-md hover:text-white hover:bg-gray-600 transition ${
            breakTime === 5 ? 'border-2 border-white' : ''
          }`}
          onClick={() => setBreakTimeHandler(5)}
        >
          5 min Break
        </button>
        <button
          className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
          } px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-600 hover:text-white transition ${
            breakTime === 10 ? 'border-2 border-white' : ''
          }`}
          onClick={() => setBreakTimeHandler(10)}
        >
          10 min Break
        </button>
      </div>
      <div className="mt-4 text-lg">
        Break Time Chosen : {breakTime} minutes
      </div>
      <button
        className={`${
          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
        } fixed bottom-4 right-4 p-2 md:p-3 rounded-full hover:bg-gray-600 transition`}
        onClick={toggleDarkMode}
      >
        {darkMode ? <MdBrightness3 size={20} /> : <MdWbSunny size={20} />}
      </button>
    </div>
  );
};

export default Pomodoro;
