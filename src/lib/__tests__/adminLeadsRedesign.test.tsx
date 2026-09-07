import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LeadDetailsPanel from "@/components/admin/leads/LeadDetailsPanel";
import LeadMetrics from "@/components/admin/leads/LeadMetrics";
import LeadMobileList from "@/components/admin/leads/LeadMobileList";
import LeadTable from "@/components/admin/leads/LeadTable";
import type { Lead } from "@/components/admin/leads/types";

const lead: Lead = {
  _id: "lead-one",
  type: "property_interest",
  source: "property_interest",
  name: "Ananya Rao",
  phone: "9876543210",
  email: "ananya@example.com",
  propertyId: "sobha-galera",
  propertyTitle: "Sobha Galera",
  propertyLocation: "Kannamangala, Bengaluru",
  message: "Looking for a 4 BHK home for my family.",
  status: "qualified",
  qualificationScore: 76,
  qualificationLevel: "high",
  qualificationReasons: ["Viewed the project repeatedly"],
  activity: {
    visitCount: 4,
    totalActiveSeconds: 640,
    totalPropertyViews: 11,
    engagementScore: 76,
    lastActivityAt: "2026-09-01T10:00:00.000Z",
    topProperty: { propertyId: "sobha-galera", propertyTitle: "Sobha Galera", location: "Kannamangala" },
  },
  createdAt: "2026-08-30T10:00:00.000Z",
};

describe("Admin Leads redesign", () => {
  it("renders real lead metrics and the responsive lead records", () => {
    const metrics = renderToStaticMarkup(<LeadMetrics metrics={{ total: 128, new: 34, contacted: 52, qualified: 29, closed: 13, needsAttention: 34 }} loading={false} />);
    const table = renderToStaticMarkup(<LeadTable leads={[lead]} busyId="" onOpen={() => undefined} onStatus={() => undefined} />);
    const mobile = renderToStaticMarkup(<LeadMobileList leads={[lead]} onOpen={() => undefined} />);

    expect(metrics).toContain("Total leads");
    expect(metrics).toContain("128");
    expect(table).toContain("Sobha Galera");
    expect(table).toContain("76/100");
    expect(mobile).toContain("Ananya Rao");
  });

  it("shows enquiry, engagement, qualification and private notes without calling controls", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LeadDetailsPanel lead={lead} saving={false} onClose={() => undefined} onStatus={async () => undefined} onQualification={async () => undefined} onNote={async () => undefined} onDelete={() => undefined} />
      </MemoryRouter>,
    );

    expect(html).toContain("Website engagement");
    expect(html).toContain("Admin qualification");
    expect(html).toContain("Internal follow-up notes");
    expect(html).not.toContain("AI call");
    expect(html).not.toContain("Schedule callback");
  });
});
