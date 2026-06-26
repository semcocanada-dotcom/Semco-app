export type RewardTier = {
  id: string;
  level: number;
  name: string;
  sqft: number;
  reward: string;
  description: string;
};

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'starter',
    level: 1,
    name: 'Starter',
    sqft: 500,
    reward: '12" ProLite',
    description: 'First milestone reward for new installers.',
  },
  {
    id: 'bronze',
    level: 2,
    name: 'Bronze',
    sqft: 1000,
    reward: '12" Bianko ProFlex',
    description: 'Premium trowel reward for continued use.',
  },
  {
    id: 'silver',
    level: 3,
    name: 'Silver',
    sqft: 5000,
    reward: 'Full skim blade set with pole adapter',
    description: 'Built for larger surfaces and production work.',
  },
  {
    id: 'gold',
    level: 4,
    name: 'Gold',
    sqft: 10000,
    reward: 'Gold-plated engraved trowel + website feature',
    description: 'Recognition for Semco project success.',
  },
  {
    id: 'platinum',
    level: 5,
    name: 'Platinum',
    sqft: 25000,
    reward: 'Platinum engraved kit + plaque + website feature',
    description: 'Premium recognition for high-volume installers.',
  },
  {
    id: 'elite',
    level: 6,
    name: 'Elite',
    sqft: 50000,
    reward: 'Semco Elite Installer jacket + professional promo video',
    description: 'Business-building recognition for proven installers.',
  },
  {
    id: '100k-club',
    level: 7,
    name: '100K Club',
    sqft: 100000,
    reward: 'Las Vegas recognition trip + travel allowance + Semco HQ visit + custom hand-painted trowel',
    description: 'Signature reward for top Semco installers.',
  },
];

export function formatSqft(value: number): string {
  return `${value.toLocaleString('en-CA')} sq ft`;
}

export function getCurrentRewardTier(verifiedSqft: number): RewardTier | null {
  return [...REWARD_TIERS].reverse().find((tier) => verifiedSqft >= tier.sqft) ?? null;
}

export function getNextRewardTier(verifiedSqft: number): RewardTier | null {
  return REWARD_TIERS.find((tier) => verifiedSqft < tier.sqft) ?? null;
}
