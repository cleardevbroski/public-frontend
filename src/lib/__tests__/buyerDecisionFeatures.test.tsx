import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AskProjectAssistant from "@/components/acres/AskProjectAssistant";
import FamilyWorkspaceDock from "@/components/acres/FamilyWorkspaceDock";
import PropertyTrustSummary from "@/components/acres/PropertyTrustSummary";
import PropertyChargesFields from "@/components/admin/PropertyChargesFields";
import { getParticipantId, getStoredWorkspace, storeWorkspace, workspaceHref } from "@/lib/decisionWorkspace";

describe("buyer decision features", () => {
  it("renders a source-restricted project question form without contact fields", () => {
    const html = renderToStaticMarkup(<AskProjectAssistant propertyId="property-1" propertyTitle="Trusted Heights" />);
    expect(html).toContain("Ask this project");
    expect(html).toContain("saved details and document records");
    expect(html).not.toContain("Phone Number");
  });

  it("renders project-level fixed and percentage charge controls", () => {
    const html = renderToStaticMarkup(<PropertyChargesFields
      charges={[{ name: "Parking", code: "parking", calculationType: "fixed", value: 500000, basis: "base_price", paymentTiming: "initial", sourceType: "developer_supplied" }]}
      priceSourceType="developer_supplied"
      onChargesChange={() => undefined}
      onPriceUpdatedAtChange={() => undefined}
      onPriceSourceTypeChange={() => undefined}
    />);
    expect(html).toContain("Affordability and developer charges");
    expect(html).toContain("Parking");
    expect(html).toContain("Percentage");
    expect(html).toContain("Monthly");
  });

  it("stores workspace secrets locally and keeps the access token in the URL fragment", () => {
    const workspace = { id: "workspace-1", ownerToken: "owner-secret", shareToken: "share-secret", expiresAt: "2099-01-01T00:00:00.000Z" };
    storeWorkspace(workspace);
    expect(getStoredWorkspace()).toEqual(workspace);
    expect(workspaceHref(workspace.id, workspace.shareToken)).toBe("/family-workspace/workspace-1#share-secret");
    expect(getParticipantId()).toBe(getParticipantId());
  });

  it("keeps an understandable family decision entry point visible on public pages", () => {
    const html = renderToStaticMarkup(<FamilyWorkspaceDock />);
    expect(html).toContain("Decide together");
    expect(html).toContain("Compare · vote · chat");
  });

  it("shows missing trust information instead of manufacturing verification", () => {
    const html = renderToStaticMarkup(<PropertyTrustSummary property={{
      id: "property-2", title: "Source First Homes", subtitle: "Bangalore", price: "", configs: [], area: "", image: "",
      reraRegistered: true,
    }} />);
    expect(html).toContain("Verification not confirmed");
    expect(html).toContain("Phase number missing");
    expect(html).toContain("Exact pin not verified");
    expect(html).not.toContain("Verified Pin");
  });
});
