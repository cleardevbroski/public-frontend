import { useParams, useSearchParams } from "react-router-dom";
import BangalorePageRenderer from "@/components/acres/BangalorePages";
import { getRouteBySlug } from "@/components/acres/bangalore-data";
import { useDocumentTitle } from "@/useDocumentTitle";
import NotFound from "@/pages/NotFound";

export default function BangalorePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const slug = params["*"] ?? "";
  const query = searchParams.get("q") ?? "";
  const route = getRouteBySlug(slug);

  useDocumentTitle(
    route ? `${route.title} - cleartitleone Bangalore` : undefined,
    route?.subtitle,
  );

  if (!route) {
    return <NotFound />;
  }

  return <BangalorePageRenderer route={route} query={query} />;
}
