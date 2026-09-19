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