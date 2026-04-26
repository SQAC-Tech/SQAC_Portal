import React, { useState, useMemo } from "react";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Sample events data
const EVENTS = {
  "2023-10-3": [{ color: "#6c7bff" }],
  "2023-10-5": [{ color: "#f183ff" }],
  "2023-10-9": [{ color: "#f183ff" }, { color: "#6c7bff" }],
  "2023-10-12": [{ color: "#ff6c95" }],
  "2023-10-18": [{ color: "#6c7bff" }],
};

const UPCOMING_TODAY = [
  {
    id: 1,
    title: "Weekly Design Critique",
    time: "10:00 AM — 11:30 AM",
    color: "#f183ff",
    category: "Design",
  },
  {
    id: 2,
    title: "Quarterly Roadmap Sync",
    time: "02:00 PM — 03:00 PM",
    color: "#ff8c42",
    category: "Roadmap",
  },
  {
    id: 3,
    title: "Sprint Retrospective",
    time: "04:00 PM — 04:45 PM",
    color: "#6c7bff",
    category: "Engineering",
  },
];

const CalendarModule = () => {
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2023);
  const [selectedDate, setSelectedDate] = useState(5);

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        key: `prev-${prevMonthDays - i}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${currentYear}-${currentMonth + 1}-${i}`;
      days.push({
        date: i,
        isCurrentMonth: true,
        events: EVENTS[dateKey] || [],
        key: `curr-${i}`,
      });
    }

    // Fill remaining cells to complete the grid (up to 35 or 42)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  return (
    <div className="sched-calendar">
      {/* Calendar Card */}
      <div className="sched-calendar__card">
        {/* Header */}
        <div className="sched-calendar__header">
          <h2 className="sched-calendar__month-title">
            {monthName} {currentYear}
          </h2>
          <div className="sched-calendar__nav-arrows">
            <button
              type="button"
              className="sched-calendar__arrow"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              className="sched-calendar__arrow"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="sched-calendar__day-headers">
          {DAYS.map((day) => (
            <div key={day} className="sched-calendar__day-label">
              {day}
            </div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="sched-calendar__grid">
          {calendarDays.map((day) => {
            const isSelected = day.isCurrentMonth && day.date === selectedDate;
            const hasEvents = day.events && day.events.length > 0;

            return (
              <button
                key={day.key}
                type="button"
                className={`sched-calendar__date-cell ${
                  !day.isCurrentMonth ? "is-outside" : ""
                } ${isSelected ? "is-selected" : ""}`}
                onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
              >
                {/* Bloom glow layer behind selected date */}
                {isSelected && <span className="sched-calendar__date-bloom" />}
                <span className="sched-calendar__date-number">{day.date}</span>
                {hasEvents && (
                  <span className="sched-calendar__event-dots">
                    {day.events.map((evt, idx) => (
                      <span
                        key={idx}
                        className="sched-calendar__event-dot"
                        style={{ backgroundColor: evt.color }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Today Section */}
      <div className="sched-calendar__upcoming">
        <div className="sched-calendar__upcoming-header">
          <h3 className="sched-calendar__upcoming-title">Upcoming Today</h3>
          <span className="sched-calendar__upcoming-badge">
            {UPCOMING_TODAY.length} Events
          </span>
        </div>

        <div className="sched-calendar__upcoming-list">
          {UPCOMING_TODAY.map((event) => (
            <div
              key={event.id}
              className="sched-calendar__upcoming-item"
              style={{ "--event-color": event.color }}
            >
              <div className="sched-calendar__upcoming-item-border" />
              <div className="sched-calendar__upcoming-item-content">
                <span className="sched-calendar__upcoming-item-title">
                  {event.title}
                </span>
                <span className="sched-calendar__upcoming-item-time">
                  {event.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarModule;
