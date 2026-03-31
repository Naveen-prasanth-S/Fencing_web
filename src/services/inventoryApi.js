const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function getInventory() {
  const response = await fetch(`${API_BASE_URL}/inventory`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load inventory");
  }
  return data.items || [];
}

export async function createInventoryItem(payload) {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to add inventory item");
  }
  return data.item;
}

export async function removeInventoryItem(id) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete inventory item");
  }
}

export async function updateInventoryItem(id, payload) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update inventory item");
  }
  return data.item;
}
