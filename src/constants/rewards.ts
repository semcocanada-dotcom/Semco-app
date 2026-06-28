import type { ImageSourcePropType } from 'react-native';

export type RewardTier = {
  id: string;
  level: number;
  name: string;
  sqft: number;
  reward: string;
  description: string;
  image?: ImageSourcePropType;
};

export type RewardProgress = {
  verifiedSqft: number;
  currentTier: RewardTier | null;
  nextTier: RewardTier | null;
  tierStartSqft: number;
  tierTargetSqft: number;
  sqftIntoTier: number;
  sqftNeededForTier: number;
  progressPercent: number;
};

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'starter',
    level: 1,
    name: 'Starter',
    sqft: 500,
    reward: '12" ProLite',
    description: 'First milestone reward for new installers.',
    image: require('../../assets/rewards/tier-1-pro-lite.jpg'),
  },
  {
    id: 'bronze',
    level: 2,
    name: 'Bronze',
    sqft: 1000,
    reward: '12" Bianko ProFlex',
    description: 'Premium trowel reward for continued use.',
    image: require('../../assets/rewards/tier-2-bianko-proflex.jpg'),
  },
  {
    id: 'silver',
    level: 3,
    name: 'Silver',
    sqft: 5000,
    reward: 'Full skim blade set with pole adapter',
    description: 'Built for larger surfaces and production work.',
    image: require('../../assets/rewards/tier-3-skim-blade-set.jpg'),
  },
  {
    id: 'gold',
    level: 4,
    name: 'Gold',
    sqft: 10000,
    reward: 'Gold-plated engraved trowel + website feature',
    description: 'Recognition for Semco project success.',
    image: require('../../assets/rewards/tier-4-gold-trowel.jpg'),
  },
  {
    id: 'platinum',
    level: 5,
    name: 'Platinum',
    sqft: 25000,
    reward: 'Platinum engraved kit + plaque + website feature',
    description: 'Premium recognition for high-volume installers.',
    image: require('../../assets/rewards/tier-5-platinum-kit.jpg'),
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

export function getRewardProgress(verifiedSqft: number): RewardProgress {
  const currentTier = getCurrentRewardTier(verifiedSqft);
  const nextTier = getNextRewardTier(verifiedSqft);
  const tierStartSqft = currentTier?.sqft ?? 0;
  const tierTargetSqft = nextTier?.sqft ?? currentTier?.sqft ?? REWARD_TIERS[0].sqft;
  const sqftNeededForTier = Math.max(tierTargetSqft - tierStartSqft, 1);
  const sqftIntoTier = Math.max(verifiedSqft - tierStartSqft, 0);
  const progressPercent = nextTier
    ? Math.min(100, Math.max(0, Math.round((sqftIntoTier / sqftNeededForTier) * 100)))
    : 100;

  return {
    verifiedSqft,
    currentTier,
    nextTier,
    tierStartSqft,
    tierTargetSqft,
    sqftIntoTier,
    sqftNeededForTier,
    progressPercent,
  };
}
