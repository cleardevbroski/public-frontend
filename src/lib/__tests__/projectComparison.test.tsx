import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectComparison from "@/components/acres/ProjectComparison";
import type { Property } from "@/components/acres/mock-data";

const property = (id: string, title: string, reraNumber: string): Property => ({
  id,
  title,
  subtitle: "Jakkur, Bangalore",
  price: "₹1.25 Cr",
  configs: ["2 BHK", "3 BHK"],
  area: "1200–1650 sqft",
  image: `https://example.com/${id}.jpg`,
  possession: "Dec 2028",
  reraRegistered: true,
  reraNumber,
  projectArea: { totalAcres: 12 },
  totalUnits: 480,
});

describe("ProjectComparison", () => {
  it("uses self-contained property columns without a separate metric column", () => {
    const current = property("current", "Century Jakkur", "PRM/KA/RERA/0001");
    const candidate = property("candidate", "Jakkur Heights", "PRM/KA/RERA/0002");
    const html = renderToStaticMarkup(<ProjectComparison current={current} matches={[{ property: candidate, score: 70, reasons: ["same locality"] }]} />);

    expect(html).not.toContain(">Metric<");
    expect(html.match(/>Price<\/dt>/g)).toHaveLength(2);
    expect(html.match(/>Configuration<\/dt>/g)).toHaveLength(2);
    expect(html.match(/>RERA No\.<\/dt>/g)).toHaveLength(2);
    expect(html).toContain("PRM/KA/RERA/0001");
    expect(html).toContain("PRM/KA/RERA/0002");
    expect(html.match(/<article/g)).toHaveLength(2);
  });

  it("omits comparison rows that are missing from either property", () => {
    const current = property("current", "Century Jakkur", "PRM/KA/RERA/0001");
    const candidate = { ...property("candidate", "Jakkur Heights", "PRM/KA/RERA/0002"), price: "", configs: [], area: "", possession: "", projectArea: undefined, totalUnits: undefined };
    const html = renderToStaticMarkup(<ProjectComparison current={current} matches={[{ property: candidate, score: 70, reasons: ["same locality"] }]} />);

    expect(html).toContain("RERA No.");
    expect(html).not.toContain(">Price</dt>");
    expect(html).not.toContain(">Configuration</dt>");
    expect(html).not.toContain("Not provided");
  });
});
