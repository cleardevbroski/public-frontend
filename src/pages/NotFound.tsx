import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import { PublicErrorState } from "@/components/acres/PublicPageState";

export default function NotFound() {
  return (
    <>
      <Header />
      <PublicErrorState title="Page not found" description="The address may be incorrect or the page may have moved. Return home or continue browsing available Bangalore properties." actionHref="/" actionLabel="Back to home" />
      <Footer />
    </>
  );
}
