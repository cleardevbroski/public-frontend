// Run against a local Vite server. API responses are synthetic; no live records are changed.
// PLAYWRIGHT_MODULE may point to an existing Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const base = process.env.BASE_URL || "http://127.0.0.1:5173";
const output = process.env.SCREENSHOT_DIR || "/tmp/cleartitle-responsive";
const metrics = { total: 305, assigned: 305, pending: 305, unassigned: 0, active: 0, inactive: 0, callback: 0, overdue: 0, unreachable: 0, interested: 0, notInterested: 0, completed: 0, contacted: 0, callResults: 0, callbacksScheduled: 0, callbacksDueToday: 0, callbacksOverdue: 0, callbacksCompleted: 0, whatsappOpened: 0, whatsappSent: 0 };
const employee = { id: "employee-1", employeeId: "EMP-01", name: "Sample Employee", role: "employee", isActive: true, permissions: [], phone: "", email: "", metrics };
const prospects = Array.from({ length: 305 }, (_, i) => ({
  id: "contact-" + (i + 1), prospectType: "channel_partner", importBatchId: "batch-1", sourceRowNumber: i + 2,
  batch: { id: "batch-1", name: "Sample import", originalFileName: "sample.xlsx" },
  assignedEmployee: employee, assignedEmployeeId: employee.id, verificationStatus: "pending",
  profileCompletion: 53, callAttempts: 0, whatsappOpened: 0, whatsappSent: 0, partnerType: "individual",
  company: { name: i ? "Sample Contact " + (i + 1) : "Sample Coastal Property Services Private Limited", businessType: "individual", yearEstablished: "", panMasked: "", gstNumber: "", reraNumber: "ORA/0001/2026" },
  contact: { name: "Sample Partner", designation: "", mobile: String(9000000000 + i), alternateMobile: "", whatsappMobile: "", email: "" },
  address: { line1: "191 Sample Road", line2: "", city: i % 2 ? "Puri" : "Khordha", state: "Odisha", pinCode: "752002" },
  business: { areasOfOperation: ["Puri"], currentProjects: "", developerAssociations: "", teamStrength: "", preferredSegments: ["plots"] },
  bank: { accountHolderName: "", bankName: "", branch: "", accountNumberMasked: "", ifscCode: "" },
  signatory: { name: "", designation: "", signedDate: null }, broker: { lastCallOutcome: "", projectInterest: "", followUpAgenda: "" }
}));
const templates = [{ id: "template-1", kind: "project", name: "Project message", audience: "all", body: "Hello {{cp_name}}, please review this project.", attachments: [], isActive: true }];
const profile = { id: "profile-1", partner: { id: "partner-1", applicationNumber: "CP-2026-0020", companyName: "Sample Registered Partner", contactName: "Sample Partner", mobile: "9000000000", alternateMobile: "", email: "", city: "Puri", state: "Odisha", areasOfOperation: ["Puri"], preferredSegments: ["plots"], status: "active" }, stage: "new", priority: "normal", assignedEmployee: employee, assignedEmployeeId: employee.id, callAttempts: 0, completedCalls: 0, whatsappOpened: 0, whatsappSent: 0, whatsappMobile: "" };
const partner = { id: "partner-1", name: "Sample Coastal Property Services Private Limited", companyName: "Sample Coastal Property Services Private Limited", applicationNumber: "CP-2026-0020", code: "CT0001", mobile: "9000000000", email: "sample@example.test", type: "individual", contactName: "Sample Partner", city: "Puri", state: "Odisha" };
const clients = ["pending", "approved", "successful"].map((status, i) => ({ id: "client-" + i, leadNumber: "LEAD-2026-" + i, clientName: "Sample Client " + (i + 1), mobile: "9000000001", mobileMasked: "******0001", projectTitle: "Sample Published Project", requirementType: "specific_project", status, registeredAt: "2026-09-23", ownershipExpiresAt: "2026-12-23", bookingAdvanceAmountPaise: i ? 5000000 : 0, initialCpAmountPaise: i ? 500000 : 0, finalSettlementCpAmountPaise: i === 2 ? 100000 : 0, channelPartner: partner, statusHistory: [] }));
const counts = { total: 3, pending: 1, approved: 1, successful: 1, rejected: 0, expired: 0, clashes: 0 };
const property = { id: "responsive-sample", title: "Sample Residential Project", subtitle: "Whitefield, Bangalore", price: "1.25 Cr", pricePerSqft: "8,000/sqft", configs: ["2 BHK", "3 BHK"], configurationDetails: [{ configuration: "2 BHK", price: "1.25 Cr", superBuiltUpArea: "1500 sqft", carpetArea: "1100 sqft", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"] }], area: "1500 sqft", possession: "Ready to Move", builder: "Sample Builder", image: "/cleartitleone/tile-buy.webp", heroImages: ["/cleartitleone/tile-buy.webp"], images: ["/cleartitleone/tile-buy.webp"], amenities: ["Parking", "Gym"], published: true, status: "published", propertyType: "Apartment", city: "Bangalore", locality: "Whitefield", listingType: "buy" };
Object.assign(property, { image: base + property.image, heroImages: property.heroImages.map((url) => base + url), images: property.images.map((url) => base + url) });
function fixture(url) {
  const p = url.pathname;
  const empty = { metrics, counts, pagination: { page: 1, pages: 1, total: 0, limit: 100 }, partner, templates, unreadCount: 0 };
  for (const key of ["properties", "builders", "dealers", "leads", "lawyers", "testimonials", "insights", "advertisements", "partners", "reports", "notifications", "batches", "tasks", "clients", "items", "placements", "submissions", "conflicts", "visitors", "questions", "interactions", "followUps", "locations", "employeeProgress"]) empty[key] = [];
  if (p === "/api/properties/responsive-sample") return { property };
  if (p === "/api/properties") return { properties: [property], pagination: { page: 1, pages: 1, total: 1 } };
  if (p.endsWith("/auth/me")) return { employee };
  if (p.endsWith("/mine/dashboard") && p.includes("cp-crm")) return { employee, metrics, tasks: [] };
  if (p.endsWith("/prospects")) {
    const q = url.searchParams.get("search") || "";
    const records = prospects.filter((item) => !q || (/^\d+$/.test(q) ? String(item.sourceRowNumber - 1) === q : item.company.name.toLowerCase().includes(q.toLowerCase())));
    const page = Number(url.searchParams.get("page") || 1), limit = Number(url.searchParams.get("limit") || 100);
    return { prospects: records.slice((page - 1) * limit, page * limit), metrics, pagination: { page, limit, total: records.length, pages: Math.ceil(records.length / limit) } };
  }
  if (p.includes("/prospects/contact-")) return { prospect: prospects.find((item) => p.endsWith("/" + item.id)) || prospects[0], templates, interactions: [], followUps: [] };
  if (p.includes("cp-crm") && p.endsWith("/partners")) return { partners: [profile], metrics, pagination: { page: 1, pages: 1, total: 1 } };
  if (p.includes("cp-crm") && p.includes("/partners/")) return { profile, templates, interactions: [], followUps: [], clientsCount: 0 };
  if (p.includes("/channel-partner-leads/")) {
    if (p.endsWith("/dashboard")) return { partner, counts, serverNow: "2026-09-23T10:00:00Z", earnings: { totalCreditedPaise: 600000, awaitingInitialPaise: 0, creditedInitialPaise: 500000, finalSettlementCreditedPaise: 100000, nearestInitialCreditAt: null } };
    if (p.endsWith("/profile")) return { partner };
    if (p.endsWith("/projects")) return { projects: [] };
    return { partner, clients, clashes: [], counts, pagination: { page: 1, pages: 1, total: 3 } };
  }
  if (p.endsWith("/employees")) return { employees: [employee] };
  if (p.endsWith("/analytics") && p.includes("cp-prospects")) return { ...empty, states: ["Odisha"], cities: ["Puri", "Khordha"], areas: ["Puri"] };
  return empty;
}
const routes = (process.env.ROUTES || "/cp-verification,/broker-verification,/cp-management,/channel-partner,/cp-registration,/cp-dashboard,/admin/employees,/admin/cp-clients,/admin/cp-imports,/admin/cp-management,/admin/channel-partners,/,/property-in-bangalore-ffid,/property/responsive-sample,/account,/account/saved-properties,/postproperty,/find-my-home,/dealers,/privacy-policy").split(",");
async function run() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const failures = [];
  try {
    for (const width of (process.env.WIDTHS || "360,430,768,1280,1440,1920").split(",").map(Number)) {
      const context = await browser.newContext({ viewport: { width, height: width < 768 ? 800 : 950 }, isMobile: width < 768, hasTouch: width < 768 });
      await context.addInitScript(() => {
        if (location.pathname !== "/employee-login") localStorage.setItem("cleartitle_crm_staff_token", "responsive-test");
        else localStorage.removeItem("cleartitle_crm_staff_token");
        localStorage.setItem("cleartitle_admin_token", "responsive-test");
        localStorage.setItem("cleartitle_admin_auth", "1");
        sessionStorage.setItem("cleartitle_channel_partner_token", "responsive-test");
      });
      await context.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith("/api/")) return route.fulfill({ json: fixture(url) });
        if (url.origin !== new URL(base).origin) return route.abort();
        return route.continue();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      let errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      async function check(name) {
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
        assert.ok(dimensions.width <= width + 1, name + " overflow: " + JSON.stringify(dimensions));
        assert.deepEqual(errors, [], name + " runtime errors");
        assert.equal(await page.getByText("Sorry, this section couldn't be displayed.", { exact: true }).count(), 0, name + " render boundary");
        await page.screenshot({ path: output + "/" + width + "-" + name.replace(/[^a-z0-9]+/gi, "-") + ".png", animations: "disabled" });
      }
      for (const path of routes) {
        errors = [];
        try {
          await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 60000 });
          await page.waitForTimeout(1200);
          if (path === "/cp-verification" || path === "/broker-verification") {
            await page.locator(".employee-queue-scroll button").last().waitFor();
            assert.equal(await page.locator(".employee-queue-scroll button").count(), 305);
            await check(path + "-queue");
            await page.getByRole("button", { name: "Open filters and employee menu" }).click();
            await check(path + "-menu");
            await page.keyboard.press("Escape");
            await page.locator(".employee-queue-scroll button").first().click();
            await page.getByText("WhatsApp project message", { exact: true }).first().waitFor();
            await check(path + "-detail");
            if (width < 1280) {
              await page.getByRole("button", { name: /Back to assigned/ }).click();
              await page.getByRole("searchbox").fill("20");
              await page.waitForFunction(() => document.querySelectorAll(".employee-queue-scroll button").length === 1);
              assert.match(await page.locator(".employee-queue-scroll").innerText(), /20/);
              await check(path + "-serial-search");
            }
          } else if (path === "/channel-partner") {
            await page.locator('input[name="partnerType"][value="individual"]').check();
            await check(path + "-form");
            await page.getByText("Draw", { exact: true }).click();
            const canvas = page.getByLabel("Signature drawing area");
            await canvas.scrollIntoViewIfNeeded();
            const rect = await canvas.boundingBox();
            await page.mouse.move(rect.x + 20, rect.y + 30);
            await page.mouse.down();
            await page.mouse.move(rect.x + 100, rect.y + 70, { steps: 12 });
            await page.mouse.up();
            const ink = () => canvas.evaluate((node) => node.getContext("2d").getImageData(0, 0, node.width, node.height).data.some((v, i) => i % 4 === 3 && v > 0));
            assert.ok(await ink(), "signature is drawn");
            await page.setViewportSize({ width: width + 30, height: 800 });
            await page.waitForTimeout(200);
            assert.ok(await ink(), "signature survives resize");
            await page.setViewportSize({ width, height: width < 768 ? 800 : 950 });
            await canvas.screenshot({ path: output + "/" + width + "-signature.png" });
          } else if (path === "/cp-registration") {
            if (width < 1024) {
              await page.getByRole("tab", { name: /My clients/ }).click();
              assert.equal(await page.locator("#client-registration-form").isVisible(), false);
              await check(path + "-clients");
              await page.getByRole("tab", { name: "Register client" }).click();
            }
            await check(path);
          } else if (path === "/") {
            await page.getByRole("button", { name: "Open menu", exact: true }).click();
            await check("public-navigation");
            await page.keyboard.press("Escape");
            assert.equal(await page.getByRole("dialog", { name: "Site navigation" }).count(), 0);
            await check("home");
          } else if (path === "/property/responsive-sample") {
            await page.waitForFunction(() => Array.from(document.images).some((img) => img.alt.includes("photo 1") && img.naturalWidth > 0));
            const overlaps = await page.evaluate(() => {
              const dock = document.querySelector(".public-family-dock")?.getBoundingClientRect();
              if (!dock) return false;
              return Array.from(document.querySelectorAll("button, a")).some((node) => {
                if (!node.textContent.includes("Enquire Now")) return false;
                const rect = node.getBoundingClientRect();
                return rect.width > 0 && rect.top < dock.bottom && rect.bottom > dock.top && rect.left < dock.right && rect.right > dock.left;
              });
            });
            assert.equal(overlaps, false, "family dock must not cover enquiry controls");
            await check(path);
          } else {
            await check(path);
          }
          console.log("PASS", width, path);
        } catch (error) {
          failures.push(width + " " + path + ": " + error.message);
          console.error("FAIL", failures[failures.length - 1]);
          await page.screenshot({ path: output + "/" + width + "-FAIL-" + path.replace(/[^a-z0-9]+/gi, "-") + ".png" }).catch(() => {});
        }
      }
      await context.close();
    }
  } finally { await browser.close(); }
  if (failures.length) throw new Error(failures.join("\n"));
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
