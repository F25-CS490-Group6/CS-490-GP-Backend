function getSalonNameFallback(salon) {
  if (!salon) return "the salon";
  return salon.name || salon.salon_name || "the salon";
}

function formatReminderMessage(salon, when) {
  const name = getSalonNameFallback(salon);
  const date = when instanceof Date ? when : new Date(when);
  return `Reminder: You have an appointment at ${name} on ${date.toLocaleString()}`;
}

module.exports = { getSalonNameFallback, formatReminderMessage };
