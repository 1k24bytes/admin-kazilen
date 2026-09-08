const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const TOKEN_KEY = "kazilen_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      /* keep default message */
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

export interface AdminLoginResponse {
  status: string;
  access_token: string;
  token_type: string;
  email: string;
}

export interface AdminProfile {
  email: string;
  role: string;
}

export interface AdminStats {
  total_users: number;
  total_customers: number;
  total_workers: number;
  workers_online: number;
  total_bookings: number;
  bookings_pending: number;
  bookings_completed: number;
  total_reviews: number;
}

export interface AdminUser {
  id: number;
  phone_number: string;
  full_name: string | null;
  role: string;
  is_online: number;
  referral_code: string | null;
  referral_points: number;
  created_at: string | null;
}

export interface AdminBooking {
  id: number;
  customer_id: number;
  worker_id: number;
  service_id: string;
  date: string;
  time_slot: string;
  status: string;
  amount: string | null;
  created_at: string | null;
}
