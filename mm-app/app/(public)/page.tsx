import Hero from "@/components/ui/hero";
import { PageViewTracker } from '@/components/analytics/page-view-tracker';

export default function Home() {
  return (
    <div className="container max-w-7xl mx-auto">
      <PageViewTracker pathname="/" />
      <Hero />
    </div>
  );
}
