import api from "./api";

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post("/auth/login", { email, password });
  return data.access_token;
}

export async function register(email: string, password: string): Promise<string> {
  const { data } = await api.post("/auth/register", { email, password });
  return data.access_token;
}
