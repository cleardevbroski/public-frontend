import Header from "@/components/acres/Header";
import HeroBanner from "@/components/acres/HeroBanner";
import RecommendedProperties from "@/components/acres/RecommendedProperties";
import LocalitiesYouMayLike from "@/components/acres/LocalitiesYouMayLike";
import PropertyTypeTiles from "@/components/acres/PropertyTypeTiles";
import HandpickedProjects from "@/components/acres/HandpickedProjects";
import WhyChooseClearTitle from "@/components/acres/WhyChooseClearTitle";
import LegalConsultationConsole from "@/components/acres/LegalConsultationConsole";
import RecommendedInsights from "@/components/acres/RecommendedInsights";
import NewlyLaunchedProjects from "@/components/acres/NewlyLaunchedProjects";
import SearchTrends from "@/components/acres/SearchTrends";
import OffersForYou from "@/components/acres/OffersForYou";
import FeaturedDealers from "@/components/acres/FeaturedDealers";
import BhkChoice from "@/components/acres/BhkChoice";
import PostedByAdvertiser from "@/components/acres/PostedByAdvertiser";
import PossessionTimeline from "@/components/acres/PossessionTimeline";
import BudgetChoice from "@/components/acres/BudgetChoice";
import NewlyListed from "@/components/acres/NewlyListed";
import PopularBuilders from "@/components/acres/PopularBuilders";
import ClearTitleAdvisor from "@/components/acres/ClearTitleAdvisor";
import Testimonials from "@/components/acres/Testimonials";
import GetInTouch from "@/components/acres/GetInTouch";
import Footer from "@/components/acres/Footer";
import CookieBanner from "@/components/acres/CookieBanner";
import PostPropertyRail from "@/components/acres/PostPropertyRail";
import ScrollReveal from "@/components/acres/ScrollReveal";
import { useDocumentTitle } from "@/useDocumentTitle";
import BuyerJourney from "@/components/acres/BuyerJourney";
import ProjectTrustStrip from "@/components/acres/ProjectTrustStrip";
import { useSyncExternalStore } from "react";

const mobileQuery = "(max-width: 767px)";
const isMobileViewport = () => typeof window.matchMedia === "function" && window.matchMedia(mobileQuery).matches;
const subscribeViewport = (onChange: () => void) => {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export default function Home() {
  const mobile = useSyncExternalStore(subscribeViewport, isMobileViewport, () => false);
  useDocumentTitle(
    "ClearTitle One | Property Research & Real Estate in Bangalore",
    "Explore apartments, villas, plots, commercial properties, and PG homes in Bangalore with visible project records and buying tools.",
    {
      canonical: "/",
      image: "https://cleartitleone.com/cleartitleone/logo.png",
      jsonLd: { "@context": "https://schema.org", "@type": "RealEstateAgent", name: "ClearTitle One", url: "https://cleartitleone.com", logo: "https://cleartitleone.com/cleartitleone/logo.png", areaServed: "Bangalore" },
    },
  );
  return (
    <>
      <Header />
      <main className="home-main flex-1">
        {/* Cinematic navy hero with search */}
        <HeroBanner showTrustStrip={!mobile} />

        {!mobile && <BuyerJourney />}

        {/* Curated recommendations + guest activity sidebar */}
        <ScrollReveal direction="up" className="home-band-white">
          <RecommendedProperties />
        </ScrollReveal>

        {/* Locality price/YoY insight cards */}
        <ScrollReveal direction="up" className="home-band-accent">
          <LocalitiesYouMayLike />
        </ScrollReveal>

        {/* Apartments, Villas and more — type tiles */}
        <ScrollReveal direction="up" className="home-band-white">
          <PropertyTypeTiles />
        </ScrollReveal>

        {mobile && <ProjectTrustStrip placement="below-properties" />}
        {mobile && <BuyerJourney />}

        {/* Handpicked featured projects */}
        <ScrollReveal direction="up" className="home-band-accent">
          <HandpickedProjects />
        </ScrollReveal>

        {/* ClearTitle Legal Shield — submit legal consultation queries */}
        <ScrollReveal direction="up" className="home-band-white">
          <LegalConsultationConsole />
        </ScrollReveal>

        {/* Newly launched projects */}
        <ScrollReveal direction="up" className="home-band-accent">
          <NewlyLaunchedProjects />
        </ScrollReveal>

        {/* Based on search trends */}
        <ScrollReveal direction="up" className="home-band-white">
          <SearchTrends />
        </ScrollReveal>

        {/* Offers for you */}
        <ScrollReveal direction="up" className="home-band-accent">
          <OffersForYou />
        </ScrollReveal>

        {/* Featured dealers (View all -> /dealers) */}
        <ScrollReveal direction="up" className="home-band-white">
          <FeaturedDealers />
        </ScrollReveal>

        {/* BHK choice */}
        <ScrollReveal direction="up" className="home-band-accent">
          <BhkChoice />
        </ScrollReveal>

        {/* Properties posted by advertiser type */}
        <ScrollReveal direction="up" className="home-band-white">
          <PostedByAdvertiser />
        </ScrollReveal>

        {/* Move in now / possession timeline */}
        <ScrollReveal direction="up" className="home-band-accent">
          <PossessionTimeline />
        </ScrollReveal>

        {/* Budget choice */}
        <ScrollReveal direction="up" className="home-band-white">
          <BudgetChoice />
        </ScrollReveal>

        {/* Newly listed — live admin + curated listings */}
        <ScrollReveal direction="up" className="home-band-accent">
          <NewlyListed />
        </ScrollReveal>

        {/* Popular builders — grouped from live listings */}
        <ScrollReveal direction="up" className="home-band-white">
          <PopularBuilders />
        </ScrollReveal>

        {/* Recommended locality insights */}
        <ScrollReveal direction="up" className="home-band-accent">
          <RecommendedInsights />
        </ScrollReveal>

        {/* Advisory / tools console */}
        <ScrollReveal direction="up" className="home-band-white">
          <ClearTitleAdvisor />
        </ScrollReveal>

        {/* Trust pillars (brand theme) */}
        <ScrollReveal direction="up" className="home-band-accent">
          <WhyChooseClearTitle />
        </ScrollReveal>

        {/* Editorial customer reviews */}
        <ScrollReveal direction="up" delay={80} className="home-band-white">
          <Testimonials />
        </ScrollReveal>

        {/* Contact / get in touch */}
        <ScrollReveal direction="up">
          <GetInTouch />
        </ScrollReveal>
      </main>

      <ScrollReveal direction="fade">
        <Footer />
      </ScrollReveal>

      <CookieBanner />
      <PostPropertyRail />
    </>
  );
}
