import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LawyerConsultationModal from "@/components/acres/LawyerConsultationModal";
import { AuthProvider } from "@/components/acres/AuthContext";

describe("property lawyer consultation", () => {
  it("collects manual customer details before showing the lawyer workflow", () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <LawyerConsultationModal
          open
          propertyId="property-123"
          propertyTitle="Lakeview Heights"
          propertyLocation="Whitefield, Bengaluru"
          propertyPrice="₹1.2 Cr"
          onClose={() => {}}
        />
      </AuthProvider>,
    );

    expect(html).toContain("Consult a Lawyer on Title");
    expect(html).toContain("Lakeview Heights");
    expect(html).toContain("Full name");
    expect(html).toContain("Email / Gmail");
    expect(html).toContain("Mobile number");
    expect(html).toContain("Save details and view lawyers");
    expect(html).not.toContain("OTP");
    expect(html).not.toContain("Choose your lawyer");
  });
});
