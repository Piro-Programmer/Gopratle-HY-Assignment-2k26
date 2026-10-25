import type { Basics } from "./schema";
import type { Category } from "./options";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

export type RequirementPayload = Basics & { details: Record<string, unknown> };

export type Requirement = RequirementPayload & {
  _id: string;
  category: Category;
  status: "open" | "closed";
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type CreatedRequirement = {
  id: string;
  category: Category;
  status: string;
  createdAt: string;
  requirement: Requirement;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.fields);
  }
  return data as T;
}

export function createRequirement(payload: RequirementPayload) {
  return request<CreatedRequirement>("/api/requirements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listRequirements(category?: Category) {
  const qs = category ? `?category=${category}` : "";
  return request<{ items: Requirement[]; total: number }>(`/api/requirements${qs}`);
}
