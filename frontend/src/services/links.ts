import api from "./api";

export interface LinkResponse {
  id: number;
  slug: string;
  original_url: string;
  title: string | null;
  short_url: string;
  created_at: string;
  total_clicks: number;
}

export interface LinkAnalytics {
  total_clicks: number;
  clicks_per_day: { date: string; clicks: number }[];
  by_device: { label: string; clicks: number }[];
  by_browser: { label: string; clicks: number }[];
  by_referrer: { label: string; clicks: number }[];
}

export async function getLinks(): Promise<LinkResponse[]> {
  const { data } = await api.get("/links/");
  return data;
}

export async function createLink(original_url: string, title?: string): Promise<LinkResponse> {
  const { data } = await api.post("/links/", { original_url, title });
  return data;
}

export async function deleteLink(id: number): Promise<void> {
  await api.delete(`/links/${id}`);
}

export async function getLinkAnalytics(id: number, days = 30): Promise<LinkAnalytics> {
  const { data } = await api.get(`/links/${id}/analytics?days=${days}`);
  return data;
}
