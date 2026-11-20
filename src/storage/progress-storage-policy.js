export function validateStoredProgress({ completed, communityXp, streak }) {
  if (!Array.isArray(completed) || completed.length > 1000 ||
      completed.some((id) => typeof id !== 'string' || !id.trim() || id.length > 120)) {
    throw new TypeError('Progresso local inválido.');
  }
  const normalizedCompleted = [...new Set(completed)];
  if (!Number.isFinite(communityXp) || communityXp < 0 || !Number.isSafeInteger(communityXp)) {
    throw new TypeError('XP local inválido.');
  }
  if (!streak || typeof streak !== 'object' || Array.isArray(streak)) {
    throw new TypeError('Sequência local inválida.');
  }
  const count = streak.count ?? 1;
  const todayCompleted = streak.todayCompleted ?? 0;
  if (!Number.isSafeInteger(count) || count < 1 || count > 100000 ||
      !Number.isSafeInteger(todayCompleted) || todayCompleted < 0 || todayCompleted > 1000 ||
      typeof streak.lastActiveDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(streak.lastActiveDate) ||
      (() => { const parsed = new Date(streak.lastActiveDate + 'T00:00:00.000Z'); return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== streak.lastActiveDate; })()) {
    throw new TypeError('Sequência local inválida.');
  }
  return {
    completed: normalizedCompleted,
    communityXp,
    streak: { count, todayCompleted, lastActiveDate: streak.lastActiveDate }
  };
}
