"use client";

import { useModeratorMode } from "./useModeratorMode";

export default function ModeratorModeToggle() {
  const { isModeratorMode, setModeratorMode, isReady } = useModeratorMode();

  return (
    <div className="moderator-dock">
      <div>
        <strong>Moderator UI</strong>
        <div className="muted">
          {isReady
            ? isModeratorMode
              ? "ON: moderator controls are visible"
              : "OFF: standard user interface"
            : "Loading preference..."}
        </div>
      </div>

      <button
        type="button"
        className={`toggle-switch${isModeratorMode ? " active" : ""}`}
        aria-pressed={isModeratorMode}
        onClick={() => setModeratorMode(!isModeratorMode)}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}
