export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export type LeadResult = {
  success: boolean;
  message: string;
};

/**
 * Submit a lead. Currently mocked — swap this for Hub/CRM API integration later.
 */
export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("[LifeSpring Lead]", payload);

  return {
    success: true,
    message: "Thank you! We'll be in touch soon.",
  };
}
