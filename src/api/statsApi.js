export function getCompanyStats(companyId) {
  try {
    if (!companyId) throw new Error("Missing companyId");
    return Promise.resolve({ ctr: 0.12, views: 1234 });
  } catch (err) {
    console.error("getCompanyStats error:", err);
    return Promise.resolve({ ctr: 0, views: 0 });
  }
}
