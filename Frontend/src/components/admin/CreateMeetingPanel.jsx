import React, { useState } from "react";

const CreateMeetingPanel = () => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Future: POST to backend
    console.log("Meeting Scheduled:", form);
  };

  return (
    <div className="sched-meeting">
      {/* Title */}
      <div className="sched-meeting__header">
        <span className="material-symbols-outlined sched-meeting__header-icon">
          add_circle
        </span>
        <h2 className="sched-meeting__title">Create New Meeting</h2>
      </div>

      {/* Form */}
      <form className="sched-meeting__form" onSubmit={handleSubmit}>
        {/* Meeting Title */}
        <div className="sched-meeting__field">
          <label className="sched-meeting__label">MEETING TITLE</label>
          <div className="sched-meeting__input-wrapper">
            <input
              type="text"
              className="sched-meeting__input"
              placeholder="e.g. Product Strategy Review"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
        </div>

        {/* Date & Time Row */}
        <div className="sched-meeting__row">
          <div className="sched-meeting__field sched-meeting__field--half">
            <label className="sched-meeting__label">DATE</label>
            <div className="sched-meeting__input-wrapper">
              <input
                type="text"
                className="sched-meeting__input"
                placeholder="dd-mm"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
              <span className="material-symbols-outlined sched-meeting__input-icon">
                calendar_today
              </span>
            </div>
          </div>
          <div className="sched-meeting__field sched-meeting__field--half">
            <label className="sched-meeting__label">TIME</label>
            <div className="sched-meeting__input-wrapper">
              <input
                type="text"
                className="sched-meeting__input"
                placeholder="--:--"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
              />
              <span className="material-symbols-outlined sched-meeting__input-icon">
                schedule
              </span>
            </div>
          </div>
        </div>

        {/* Venue / Link */}
        <div className="sched-meeting__field">
          <label className="sched-meeting__label">VENUE OR MEETING LINK</label>
          <div className="sched-meeting__input-wrapper">
            <input
              type="text"
              className="sched-meeting__input"
              placeholder="https://meet.google.com/..."
              value={form.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
            />
            <span className="material-symbols-outlined sched-meeting__input-icon">
              link
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="sched-meeting__field">
          <label className="sched-meeting__label">DESCRIPTION</label>
          <div className="sched-meeting__input-wrapper sched-meeting__input-wrapper--textarea">
            <textarea
              className="sched-meeting__textarea"
              placeholder="Briefly outline the agenda..."
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        {/* CTA */}
        <button type="submit" className="sched-meeting__cta">
          <span>Schedule Meeting</span>
          <span className="material-symbols-outlined sched-meeting__cta-icon">
            send
          </span>
        </button>
      </form>
    </div>
  );
};

export default CreateMeetingPanel;
