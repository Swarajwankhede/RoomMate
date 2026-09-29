// Free, keyless time API — used to show a live, server-verified IST clock
// on the dashboard rather than trusting the visitor's device clock.
const TIME_API = "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata";

export async function fetchIndiaTime() {
  const res = await fetch(TIME_API);
  if (!res.ok) throw new Error("Time service unavailable");
  const data = await res.json();
  return new Date(data.dateTime);
}
