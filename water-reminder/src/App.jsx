import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // -----------------------------
  // BASIC APP STATE
  // -----------------------------

  const [glasses, setGlasses] = useState(() => {
    const saved = localStorage.getItem("waterGlasses");
    return saved ? Number(saved) : 0;
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem("waterGoal");
    return saved ? Number(saved) : 8;
  });

  const [reminderMinutes, setReminderMinutes] = useState(() => {
    const saved = localStorage.getItem("reminderMinutes");
    return saved ? Number(saved) : 60;
  });

  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const saved = localStorage.getItem("remindersEnabled");
    return saved === "true";
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  const [nextReminder, setNextReminder] = useState(null);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
  if (!remindersEnabled) return;

  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  return () => clearInterval(timer);
}, [remindersEnabled]);

  // -----------------------------
  // CALCULATIONS
  // -----------------------------

  const progress = Math.min((glasses / dailyGoal) * 100, 100);

  const remaining = Math.max(dailyGoal - glasses, 0);

  // -----------------------------
  // SAVE DATA
  // -----------------------------

  useEffect(() => {
    localStorage.setItem("waterGlasses", glasses);
  }, [glasses]);

  useEffect(() => {
    localStorage.setItem("waterGoal", dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("reminderMinutes", reminderMinutes);
  }, [reminderMinutes]);

  useEffect(() => {
    localStorage.setItem("remindersEnabled", remindersEnabled);
  }, [remindersEnabled]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // -----------------------------
  // ADD WATER
  // -----------------------------

  const addGlass = () => {
    if (glasses < dailyGoal) {
      setGlasses(glasses + 1);
    }
  };

  // -----------------------------
  // REMOVE WATER
  // -----------------------------

  const removeGlass = () => {
    if (glasses > 0) {
      setGlasses(glasses - 1);
    }
  };

  // -----------------------------
  // RESET
  // -----------------------------

  const resetProgress = () => {
    setGlasses(0);
  };

  // -----------------------------
  // NOTIFICATION PERMISSION
  // -----------------------------

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Your browser does not support notifications.");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();

    return permission === "granted";
  };

  // -----------------------------
  // SEND NOTIFICATION
  // -----------------------------

  const sendReminder = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💧 Water Reminder", {
        body: "Time to drink some water and stay hydrated!",
      });
    }
  };

  // -----------------------------
  // START / STOP REMINDERS
  // -----------------------------

  // -----------------------------
  // NEXT REMINDER COUNTDOWN
  // -----------------------------
useEffect(() => {
  if (!remindersEnabled) {
    setNextReminder(null);
    return;
  }

  if (!nextReminder) {
    setNextReminder(
      Date.now() + reminderMinutes * 60 * 1000
    );
    return;
  }

  const checkReminder = setInterval(() => {
    if (Date.now() >= nextReminder) {
      sendReminder();

      setNextReminder(
        Date.now() + reminderMinutes * 60 * 1000
      );
    }
  }, 1000);

  return () => clearInterval(checkReminder);
}, [remindersEnabled, reminderMinutes, nextReminder]);

  const getRemainingTime = () => {
    if (!nextReminder) return "--:--";

    const difference = Math.max(nextReminder - currentTime, 0);

    const minutes = Math.floor(difference / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // -----------------------------
  // ENABLE REMINDERS
  // -----------------------------

  const toggleReminders = async () => {
    if (!remindersEnabled) {
      const allowed = await requestNotificationPermission();

      if (!allowed) {
        alert(
          "Please allow notifications in your browser settings to use reminders."
        );
        return;
      }

      setRemindersEnabled(true);
    } else {
      setRemindersEnabled(false);
    }
  };

  // -----------------------------
  // DARK MODE
  // -----------------------------

  return (
    <main className={darkMode ? "app dark" : "app"}>
      <div className="container">

        {/* HEADER */}

        <header className="header">

          <div className="header-top">
            <div className="logo">
              💧
              <span>Quench</span>
            </div>

            <button
              className="theme-button"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <p className="eyebrow">DAILY HYDRATION</p>

          <h1>Water Reminder</h1>

          <p className="subtitle">
            Build healthier hydration habits, one glass at a time.
          </p>

        </header>

        {/* MAIN TRACKER */}

        <section className="card tracker">

          <div className="progress-header">

            <div>
              <p className="label">Today's Progress</p>

              <h2>
                {glasses} / {dailyGoal} glasses
              </h2>
            </div>

            <div className="percentage">
              {Math.round(progress)}%
            </div>

          </div>

          <div className="progress-background">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="water-display">

            <div className="glass-icon">
              🥛
            </div>

            <div className="glass-number">
              {glasses}
            </div>

            <p>glasses consumed today</p>

          </div>

          {/* MESSAGE */}

          {glasses >= dailyGoal ? (
            <div className="success">
              🎉 Amazing! You've reached today's hydration goal.
            </div>
          ) : (
            <p className="remaining">
              {remaining} more{" "}
              {remaining === 1 ? "glass" : "glasses"} to reach your goal.
            </p>
          )}

          {/* BUTTONS */}

          <div className="action-buttons">

            <button
              className="secondary-button"
              onClick={removeGlass}
            >
              −
            </button>

            <button
              className="primary-button"
              onClick={addGlass}
            >
              + Add Glass
            </button>

            <button
              className="secondary-button"
              onClick={resetProgress}
            >
              Reset
            </button>

          </div>

        </section>

        {/* REMINDER CARD */}

        <section className="card reminder-card">

          <div className="card-heading">

            <div>
              <p className="label">HYDRATION REMINDERS</p>
              <h2>Stay on track</h2>
            </div>

            <div className="notification-icon">
              🔔
            </div>

          </div>

          <div className="reminder-settings">

            <label>
              Remind me every
            </label>

            <select
              value={reminderMinutes}
              onChange={(e) =>
                setReminderMinutes(Number(e.target.value))
              }
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>

          </div>

          <button
            className={
              remindersEnabled
                ? "reminder-toggle active"
                : "reminder-toggle"
            }
            onClick={toggleReminders}
          >
            {remindersEnabled
              ? "🔔 Reminders On"
              : "🔕 Turn On Reminders"}
          </button>

          {remindersEnabled && (
            <div className="next-reminder">

              <span>Next reminder</span>

              <strong>{getRemainingTime()}</strong>

            </div>
          )}

          <p className="notification-note">
            Browser notifications must be allowed for reminders to work.
          </p>

        </section>

        {/* GOAL SETTINGS */}

        <section className="card settings-card">

          <p className="label">YOUR GOAL</p>

          <div className="goal-setting">

            <div>
              <h2>{dailyGoal} glasses</h2>
              <p>Daily hydration target</p>
            </div>

            <div className="goal-buttons">

              <button
                onClick={() =>
                  setDailyGoal(Math.max(1, dailyGoal - 1))
                }
              >
                −
              </button>

              <button
                onClick={() =>
                  setDailyGoal(dailyGoal + 1)
                }
              >
                +
              </button>

            </div>

          </div>

        </section>

        {/* TIP */}

        <section className="tip">

          <span>💡</span>

          <div>
            <strong>Hydration tip</strong>

            <p>
              Don't wait until you're thirsty. Sip water regularly
              throughout the day.
            </p>
          </div>

        </section>

        <footer>
          <p>Stay Refreshed. Stay on Track.</p>
        </footer>

      </div>
    </main>
  );
}

export default App;