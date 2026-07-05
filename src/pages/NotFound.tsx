import Link from "@/components/Link";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F1F5FF] flex items-center justify-center py-32">
        <div className="text-center px-5">
          <p className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#D4AF37]">404</p>
          <h1 className="text-[28px] md:text-[36px] font-bold text-[#1E3A8A] mt-2">Page not found</h1>
          <p className="text-[14px] text-[#6E7488] mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <Link href="/" className="inline-block mt-6 btn-gold px-6 py-3 rounded-xl text-[13px] font-bold">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
