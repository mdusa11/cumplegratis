import type { Channel } from "./availability";

export type ChannelPick = Channel | "todas";

export function countChannels<T>(list: T[], of: (x: T) => ChannelPick): Record<ChannelPick, number> {
  const counts: Record<ChannelPick, number> = { todas: list.length, local: 0, sucursal: 0, "en-linea": 0 };
  list.forEach((x) => counts[of(x)]++);
  return counts;
}
