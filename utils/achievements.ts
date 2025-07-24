export enum AchievementString {
  ACHIEVEMENT_INVALID = "ACHIEVEMENT_INVALID",
}

export function achieve(name: AchievementString) {
  window?.electronAPI?.steamworks?.achievement?.activate &&
    window?.electronAPI?.steamworks?.achievement?.activate(name);
  console.log(`ACHIEVEMENT UNLOCKED: ${name}`);
}

export function unachieve(name: AchievementString) {
  window?.electronAPI?.steamworks?.achievement?.clear &&
    window?.electronAPI?.steamworks?.achievement?.clear(name);
  console.log(`ACHIEVEMENT CLEARED: ${name}`);
}
