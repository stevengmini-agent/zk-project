import { PageShell } from "@/components/ui";
import {
  HomeFlow,
  HomeGoals,
  HomeHero,
  HomeMarket,
  HomePrinciples,
  HomeReputation,
  HomeStalls,
  HomeSummary,
  HomeWorld,
} from "@/components/home";

export default function HomePage() {
  return (
    <PageShell>
      <HomeHero />
      <HomeGoals />
      <HomePrinciples />
      <HomeWorld />
      <HomeReputation />
      <HomeMarket />
      <HomeFlow />
      <HomeStalls />
      <HomeSummary />
    </PageShell>
  );
}
