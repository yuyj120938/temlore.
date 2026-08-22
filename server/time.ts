export function serverNow() { return new Date(); }
export function opensAtFromPreset(preset: '10s' | '1d' | '7d' | '30d' | '1y', now = serverNow()) {
  const ms = { '10s': 10_000, '1d': 86_400_000, '7d': 604_800_000, '30d': 2_592_000_000, '1y': 31_536_000_000 }[preset];
  return new Date(now.getTime() + ms).toISOString();
}
