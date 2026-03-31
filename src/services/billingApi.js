const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function getBillingRates(height) {
  const response = await fetch(`${API_BASE_URL}/billing/rates/${height}`);
  const data = await parseResponse(response, "Failed to load billing rates");
  return data.rates;
}

export async function calculateBilling(payload) {
  const response = await fetch(`${API_BASE_URL}/billing/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response, "Failed to calculate billing");

  return {
    rates: data.rates,
    calculations: data.calculations,
  };
}
