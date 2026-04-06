"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "slashnews-moderator-mode";

export function useModeratorMode() {
  const [isModeratorMode, setIsModeratorMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    setIsModeratorMode(storedValue === "on");
    setIsReady(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setIsModeratorMode(event.newValue === "on");
      }
    };

    const handleCustomEvent = () => {
      setIsModeratorMode(window.localStorage.getItem(STORAGE_KEY) === "on");
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("moderator-mode-change", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("moderator-mode-change", handleCustomEvent);
    };
  }, []);

  function setModeratorMode(nextValue: boolean) {
    window.localStorage.setItem(STORAGE_KEY, nextValue ? "on" : "off");
    window.dispatchEvent(new Event("moderator-mode-change"));
    setIsModeratorMode(nextValue);
  }

  return { isModeratorMode, setModeratorMode, isReady };
}
