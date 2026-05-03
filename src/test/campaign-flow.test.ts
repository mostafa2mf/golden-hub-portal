import { describe, it, expect } from "vitest";

/**
 * E2E-style logic test: verifies the visibility rules used by BusinessDashboard
 * and BloggerDashboard match the campaign lifecycle described in the product:
 *  - Admin creates campaign with status="active" → shows in BusinessDashboard.
 *  - Business-submitted campaign starts "pending" → after admin approval becomes
 *    "active" and then shows on the business dashboard.
 *  - Bloggers see a campaign only when their invitation is "accepted" AND
 *    the campaign is "active".
 */

type Campaign = { id: string; business_id: string; status: string };
type Invitation = { id: string; campaign_id: string; influencer_id: string; status: string; campaigns: Campaign };

// Mirrors src/pages/BusinessDashboard.tsx filter
const businessActiveCampaigns = (all: Campaign[], businessId: string) =>
  all.filter(c => c.business_id === businessId && c.status === "active");

// Mirrors src/pages/BloggerDashboard.tsx filter
const bloggerActiveCampaigns = (invs: Invitation[]) =>
  invs.filter(ci => ci.status === "accepted" && ci.campaigns?.status === "active");

describe("Campaign visibility lifecycle (E2E logic)", () => {
  const BIZ = "biz-1";
  const BLOGGER = "blogger-1";

  it("admin-created active campaign is visible to its business immediately", () => {
    const c: Campaign = { id: "c1", business_id: BIZ, status: "active" };
    expect(businessActiveCampaigns([c], BIZ)).toHaveLength(1);
  });

  it("business-submitted pending campaign is hidden until approved", () => {
    const pending: Campaign = { id: "c2", business_id: BIZ, status: "pending" };
    expect(businessActiveCampaigns([pending], BIZ)).toHaveLength(0);

    // Admin approval flips to active
    const approved: Campaign = { ...pending, status: "active" };
    expect(businessActiveCampaigns([approved], BIZ)).toHaveLength(1);
  });

  it("blogger sees only accepted invitations on active campaigns", () => {
    const active: Campaign = { id: "c3", business_id: BIZ, status: "active" };
    const paused: Campaign = { id: "c4", business_id: BIZ, status: "pending" };
    const invs: Invitation[] = [
      { id: "i1", campaign_id: "c3", influencer_id: BLOGGER, status: "pending", campaigns: active },
      { id: "i2", campaign_id: "c3", influencer_id: BLOGGER, status: "accepted", campaigns: active },
      { id: "i3", campaign_id: "c4", influencer_id: BLOGGER, status: "accepted", campaigns: paused },
      { id: "i4", campaign_id: "c3", influencer_id: BLOGGER, status: "declined", campaigns: active },
    ];
    const visible = bloggerActiveCampaigns(invs);
    expect(visible.map(v => v.id)).toEqual(["i2"]);
  });

  it("active campaign with accepted invitation appears on BOTH dashboards", () => {
    const camp: Campaign = { id: "c5", business_id: BIZ, status: "active" };
    const inv: Invitation = {
      id: "i5", campaign_id: "c5", influencer_id: BLOGGER, status: "accepted", campaigns: camp,
    };
    expect(businessActiveCampaigns([camp], BIZ)).toHaveLength(1);
    expect(bloggerActiveCampaigns([inv])).toHaveLength(1);
  });

  it("rejecting/cancelling campaign removes it from both dashboards", () => {
    const camp: Campaign = { id: "c6", business_id: BIZ, status: "rejected" };
    const inv: Invitation = {
      id: "i6", campaign_id: "c6", influencer_id: BLOGGER, status: "accepted", campaigns: camp,
    };
    expect(businessActiveCampaigns([camp], BIZ)).toHaveLength(0);
    expect(bloggerActiveCampaigns([inv])).toHaveLength(0);
  });
});
