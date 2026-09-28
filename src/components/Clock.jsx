import React, { useEffect, useRef, useState } from "react";
import { fetchIndiaTime } from "../api/datetime.js";

// Syncs once against a live time API, then ticks locally every second using
// the offset — so the clock stays accurate without hammering the API.
export default function Clock() {
  const [now, setNow] = useState(new Date());
  const [synced, setSynced] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchIndiaTime()
      .then((serverDate) => {
        if (cancelled) return;
        offsetRef.current = serverDate.getTime() - Date.now();
        setSynced(true);
      })
      .catch(() => {
        if (!cancelled) setSynced(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date(Date.now() + offsetRef.current)), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="clock-badge">
      <span className={`clock-dot ${synced ? "live" : ""}`} />
      <div>
        <div className="clock-date">{dateStr}</div>
        <div className="clock-time">{timeStr} IST</div>
      </div>
    </div>
  );
}
