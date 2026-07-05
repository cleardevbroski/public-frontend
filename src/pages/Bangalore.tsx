import { useParams } from "react-router-dom";
import BangalorePageRenderer from "@/components/acres/BangalorePages";
import { getRouteBySlug } from "@/components/acres/bangalore-data";
import { useDocumentTitle } from "@/useDocumentTitle";
import NotFound from "@/pages/NotFound";

export default function BangalorePage() {
  const params = useParams();
  const slug = params["*"] ?? "";
  const route = getRouteBySlug(slug);

  useDocumentTitle(
    route ? `${route.title} - cleartitleone Bangalore` : undefined,
    route?.subtitle,
  );

  if (!route) {
    return <NotFound />;
  }

  return <BangalorePageRenderer route={route} />;
}
