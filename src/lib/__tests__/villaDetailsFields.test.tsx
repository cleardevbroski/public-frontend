import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import VillaDetailsFields from "@/components/admin/VillaDetailsFields";
import { createVillaConfigurationDetail, initialVillaDetails } from "@/lib/villaDetails";

describe("VillaDetailsFields", () => {
  it("renders the Villa-specific table, plot controls, private features, and possession controls", () => {
    const details = initialVillaDetails();
    details.configurationDetails = [createVillaConfigurationDetail("3 BHK")];
    const html = renderToStaticMarkup(<VillaDetailsFields
      configInput=""
      setConfigInput={vi.fn()}
      addConfig={vi.fn()}
      removeConfig={vi.fn()}
      details={details}
      setDetails={vi.fn()}
      updateDetail={vi.fn()}
      possession={{ status: "Ready to Move", launchDate: "" }}
      setPossession={vi.fn()}
      errors={{}}
    />);
    for (const label of ["Villa Type", "Plot area", "Built-up area", "Plot Dimensions", "Corner Plot", "Private Garden / Lawn", "Private Pool", "Terrace", "Gated Community", "Ready Since"]) {
      expect(html).toContain(label);
    }
  });
});
