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

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F7FA]">
        {/* Cinematic navy hero with search */}
        <HeroBanner />

        {/* Curated recommendations + guest activity sidebar */}
        <ScrollReveal direction="up">
          <RecommendedProperties />
        </ScrollReveal>

        {/* Locality price/YoY insight cards */}
        <ScrollReveal direction="up">
          <LocalitiesYouMayLike />
        </ScrollReveal>

        {/* Apartments, Villas and more — type tiles */}
        <ScrollReveal direction="up">
          <PropertyTypeTiles />
        </ScrollReveal>

        {/* Handpicked featured projects */}
        <ScrollReveal direction="up">
          <HandpickedProjects />
        </ScrollReveal>

        {/* ClearTitle Legal Shield — submit legal consultation queries */}
        <ScrollReveal direction="up">
          <LegalConsultationConsole />
        </ScrollReveal>

        {/* Trust pillars (brand theme) */}
        <ScrollReveal direction="up">
          <WhyChooseClearTitle />
        </ScrollReveal>

        {/* Recommended locality insights */}
        <ScrollReveal direction="up">
          <RecommendedInsights />
        </ScrollReveal>

        {/* Newly launched projects */}
        <ScrollReveal direction="up">
          <NewlyLaunchedProjects />
        </ScrollReveal>

        {/* Based on search trends */}
        <ScrollReveal direction="up">
          <SearchTrends />
        </ScrollReveal>

        {/* Offers for you */}
        <ScrollReveal direction="up">
          <OffersForYou />
        </ScrollReveal>

        {/* Featured dealers (View all -> /dealers) */}
        <ScrollReveal direction="up">
          <FeaturedDealers />
        </ScrollReveal>

        {/* BHK choice */}
        <ScrollReveal direction="up">
          <BhkChoice />
        </ScrollReveal>

        {/* Properties posted by advertiser type */}
        <ScrollReveal direction="up">
          <PostedByAdvertiser />
        </ScrollReveal>

        {/* Move in now / possession timeline */}
        <ScrollReveal direction="up">
          <PossessionTimeline />
        </ScrollReveal>

        {/* Budget choice */}
        <ScrollReveal direction="up">
          <BudgetChoice />
        </ScrollReveal>

        {/* Newly listed — live admin + curated listings */}
        <ScrollReveal direction="up">
          <NewlyListed />
        </ScrollReveal>

        {/* Popular builders — grouped from live listings */}
        <ScrollReveal direction="up">
          <PopularBuilders />
        </ScrollReveal>

        {/* Advisory / tools console */}
        <ScrollReveal direction="up">
          <ClearTitleAdvisor />
        </ScrollReveal>

        {/* Editorial customer reviews */}
        <ScrollReveal direction="up" delay={80}>
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
