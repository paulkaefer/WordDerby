import { useState } from "react";
import type { ReminderPreference } from "../../engine/types";

interface ReminderSettingsProps {
  preference: ReminderPreference;
  onChange: (next: ReminderPreference) => void;
}

/** Explicit opt-in reminder controls — never assumed (FR-019/FR-020). */
export function ReminderSettings({ preference, onChange }: ReminderSettingsProps) {
  const [optedIn, setOptedIn] = useState(preference.optedIn);

  return (
    <div className="reminder-settings">
      <label>
        <input
          type="checkbox"
          checked={optedIn}
          onChange={(e) => {
            setOptedIn(e.target.checked);
            onChange({ ...preference, optedIn: e.target.checked });
          }}
        />
        Send me gentle reminders to keep skating
      </label>
      <p>
        You can turn this off any time. We'll never send more than{" "}
        {preference.frequencyCap} reminders a day, and never during your quiet hours.
      </p>
    </div>
  );
}
