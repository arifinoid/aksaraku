import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GLYPH_ITEMS, REWARDS } from "../data";
import {
  emptyStats,
  newlyUnlocked,
  statsFromMastery,
  type ModuleKind,
  type ProfileId,
  type ProgressStats,
  type Reward,
  type RewardDefinition,
  type RewardId,
} from "../domain";
import { runTask } from "../platform/task";
import { listMastery, listRewards, saveRewards } from "../storage";

export interface RewardsValue {
  readonly stats: ProgressStats;
  readonly unlockedIds: readonly RewardId[];
  readonly definitions: readonly RewardDefinition[];
  readonly celebration: readonly RewardDefinition[];
  readonly isUnlocked: (id: RewardId) => boolean;
  readonly refresh: () => Promise<void>;
  readonly dismissCelebration: () => void;
}

const KIND_BY_ITEM = new Map<string, ModuleKind>(
  GLYPH_ITEMS.map((item) => [item.id, item.kind]),
);

const RewardsContext = createContext<RewardsValue | null>(null);

export interface RewardsProviderProps {
  readonly profileId: ProfileId;
  readonly children: ReactNode;
}

export function RewardsProvider({ profileId, children }: RewardsProviderProps) {
  const [stats, setStats] = useState<ProgressStats>(emptyStats);
  const [unlocked, setUnlocked] = useState<readonly Reward[]>([]);
  const [celebration, setCelebration] = useState<readonly RewardDefinition[]>(
    [],
  );

  const refresh = useCallback(async () => {
    const masteryResult = await runTask(listMastery(profileId));
    const rewardsResult = await runTask(listRewards(profileId));
    if (masteryResult._tag === "Left" || rewardsResult._tag === "Left") return;

    const nextStats = statsFromMastery({
      mastery: masteryResult.right,
      kindByItemId: KIND_BY_ITEM,
    });
    const owned = rewardsResult.right;
    const fresh = newlyUnlocked(
      REWARDS,
      owned.map((reward) => reward.id),
      nextStats,
    );

    setStats(nextStats);
    setUnlocked(owned);

    if (fresh.length === 0) return;

    const now = Date.now();
    const rows: readonly Reward[] = fresh.map((definition) => ({
      profileId,
      id: definition.id,
      kind: definition.kind,
      unlockedAt: now,
    }));

    const saved = await runTask(saveRewards(rows));
    if (saved._tag === "Left") return;

    setUnlocked([...owned, ...rows]);
    setCelebration(fresh);
  }, [profileId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dismissCelebration = useCallback(() => setCelebration([]), []);

  const value = useMemo<RewardsValue>(
    () => ({
      stats,
      unlockedIds: unlocked.map((reward) => reward.id),
      definitions: REWARDS,
      celebration,
      isUnlocked: (id) => unlocked.some((reward) => reward.id === id),
      refresh,
      dismissCelebration,
    }),
    [stats, unlocked, celebration, refresh, dismissCelebration],
  );

  return (
    <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>
  );
}

export const useRewards = (): RewardsValue => {
  const value = useContext(RewardsContext);
  if (!value) {
    throw new Error("useRewards must be used within RewardsProvider");
  }
  return value;
};
