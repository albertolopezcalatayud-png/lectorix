/**
 * Which tools are free and which belong to the paid plan.
 * Change a value to 'premium' to put that tool behind the subscription.
 * During the closed test everything new is free so testers can try it.
 */
export type FeaturePlan = 'free' | 'premium';

export const FEATURE_PLAN = {
  fluency: 'free',          // timed reading (words per minute)
  homework: 'free',         // adapt any text or a photo of a page
  together: 'free',         // family "Together" mode
  familyLanguages: 'free',  // family panel in more languages
} as Record<'fluency' | 'homework' | 'together' | 'familyLanguages', FeaturePlan>;

export type Feature = keyof typeof FEATURE_PLAN;

export function featureLocked(feature: Feature, isPremium: boolean): boolean {
  return FEATURE_PLAN[feature] === 'premium' && !isPremium;
}
