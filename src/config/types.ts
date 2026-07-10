export interface LinkItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface SocialLink extends LinkItem {
  ariaLabel: string;
}

export interface FeatureCard {
  title: string;
  description: string;
}
