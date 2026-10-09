export type Founder = { name: string; title: string; linkedin: string; instagram: string; headshot: string };
export type Stat = { value: string; label: string };
export type ProfileLink = { label: string; url: string };
export type Profile = {
  slug: string;
  venture: string;
  oneLiner: string;
  tier: string;
  residency: string;
  movedIn: string;
  daysInSpace: string;
  founders: Founder[];
  story: string[];
  stats: Stat[];
  needs: string[];
  ask: string;
  links: ProfileLink[];
  logo: string;
};
