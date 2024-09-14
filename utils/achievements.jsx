export function achieve(name) {
  window?.electronAPI?.steamworks?.achievement?.activate &&
    window?.electronAPI?.steamworks?.achievement?.activate(name);
  console.log(`ACHIEVEMENT UNLOCKED: ${name}`);
}

export function unachieve(name) {
  window?.electronAPI?.steamworks?.achievement?.clear &&
    window?.electronAPI?.steamworks?.achievement?.clear(name);
  console.log(`ACHIEVEMENT CLEARED: ${name}`);
}
