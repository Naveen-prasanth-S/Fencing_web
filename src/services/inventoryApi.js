import { API_BASE_URL } from "./apiBaseUrl";

async function parseApiResponse(response, fallbackMessage) {
  const rawText = await response.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (_error) {
      data = {};
    }
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function getInventory() {
  const response = await fetch(`${API_BASE_URL}/inventory`);
  const data = await parseApiResponse(response, "Failed to load inventory");
  return data.items || [];
}

export async function createInventoryItem(payload) {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "Failed to add inventory item");
  return data.item;
}

export async function removeInventoryItem(id) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "DELETE",
  });
  await parseApiResponse(response, "Failed to delete inventory item");
}

export async function updateInventoryItem(id, payload) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "Failed to update inventory item");
  return data.item;
}

export async function getOrders() {
  const response = await fetch(`${API_BASE_URL}/inventory/orders`);
  const data = await parseApiResponse(response, "Failed to load orders");
  return data.orders || [];
}

export async function createOrder(payload) {
  const response = await fetch(`${API_BASE_URL}/inventory/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "Failed to add order");
  return data.order;
}

export async function markOrderDelivered(id) {
  const response = await fetch(`${API_BASE_URL}/inventory/orders/${id}/deliver`, {
    method: "PATCH",
  });
  const data = await parseApiResponse(
    response,
    "Failed to mark order as delivered"
  );
  return {
    order: data.order || null,
    inventoryItem: data.inventoryItem || null,
  };
}

export async function getStaffLogs() {
  const response = await fetch(`${API_BASE_URL}/inventory/staff-logs`);
  const data = await parseApiResponse(response, "Failed to load staff logs");
  return data.logs || [];
}

export async function createStaffLog(payload) {
  const response = await fetch(`${API_BASE_URL}/inventory/staff-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "Failed to add staff log");
  return data.log;
}

export async function updateStaffLog(id, payload) {
  const response = await fetch(`${API_BASE_URL}/inventory/staff-logs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseApiResponse(response, "Failed to update staff log");
  return data.log;
}
