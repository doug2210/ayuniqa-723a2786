import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
  type LucideProps,
} from "lucide-react";

export type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "github"
  | "discord"
  | "website";

const map: Record<SocialPlatform, React.ComponentType<LucideProps>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
  github: Github,
  discord: MessageCircle,
  website: Globe,
};

export function SocialIcon({
  platform,
  ...props
}: { platform: SocialPlatform } & LucideProps) {
  const Icon = map[platform] ?? Globe;
  return <Icon {...props} />;
}