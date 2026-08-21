export const formatIstDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);
  const istDate = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });

  return istDate.replace(",", " ||").replace(/\b(am|pm)\b/i, (match) => match.toLowerCase());
};
