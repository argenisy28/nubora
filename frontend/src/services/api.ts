import { getAccessToken } from "./auth";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

if (!API_ENDPOINT) {
  throw new Error("Missing VITE_API_ENDPOINT.");
}

async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("No authenticated Cognito session.");
  }

  const response = await fetch(`${API_ENDPOINT}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Nubora API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsResponse {
  count: number;
  tickets: Ticket[];
}

export interface Asset {
  assetId: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  assignedTo?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetsResponse {
  count: number;
  assets: Asset[];
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_ENDPOINT}/health`);

  if (!response.ok) {
    throw new Error("Health endpoint unavailable.");
  }

  return response.json();
}

export function getTickets(): Promise<TicketsResponse> {
  return authenticatedRequest<TicketsResponse>("/tickets");
}

export function getAssets(): Promise<AssetsResponse> {
  return authenticatedRequest<AssetsResponse>("/assets");
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: string;
  createdBy: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
}

export function getTicket(ticketId: string): Promise<Ticket> {
  return authenticatedRequest<Ticket>(
    `/tickets/${encodeURIComponent(ticketId)}`,
  );
}

export function createTicket(
  ticket: CreateTicketInput,
): Promise<Ticket> {
  return authenticatedRequest<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(ticket),
  });
}

export function updateTicket(
  ticketId: string,
  updates: UpdateTicketInput,
): Promise<Ticket> {
  return authenticatedRequest<Ticket>(
    `/tickets/${encodeURIComponent(ticketId)}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
  );
}

export function deleteTicket(
  ticketId: string,
): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>(
    `/tickets/${encodeURIComponent(ticketId)}`,
    {
      method: "DELETE",
    },
  );
}

export interface CreateAssetInput {
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: string;
  assignedTo: string;
  department: string;
}

export interface UpdateAssetInput {
  name?: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status?: string;
  assignedTo?: string;
  department?: string;
}

export function getAsset(assetId: string): Promise<Asset> {
  return authenticatedRequest<Asset>(
    `/assets/${encodeURIComponent(assetId)}`,
  );
}

export function createAsset(
  asset: CreateAssetInput,
): Promise<Asset> {
  return authenticatedRequest<Asset>("/assets", {
    method: "POST",
    body: JSON.stringify(asset),
  });
}

export function updateAsset(
  assetId: string,
  updates: UpdateAssetInput,
): Promise<Asset> {
  return authenticatedRequest<Asset>(
    `/assets/${encodeURIComponent(assetId)}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
  );
}

export function deleteAsset(
  assetId: string,
): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>(
    `/assets/${encodeURIComponent(assetId)}`,
    {
      method: "DELETE",
    },
  );
}