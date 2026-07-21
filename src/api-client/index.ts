import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Query key factories
export const getGetBotWarningsQueryKey = () => ["bot-warnings"];
export const getGetBotAutoResponsesQueryKey = () => ["bot-autoresponses"];
export const getGetBotStatsQueryKey = () => ["bot-stats"];
export const getGetBotLeaderboardQueryKey = () => ["bot-leaderboard"];
export const getGetBotLfgSessionsQueryKey = () => ["bot-lfg"];
export const getGetBotTournamentsQueryKey = () => ["bot-tournaments"];
export const getGetBotChannelsQueryKey = () => ["bot-channels"];

// Bot Stats
export function useGetBotStats() {
  return useQuery({
    queryKey: getGetBotStatsQueryKey(),
    queryFn: () => apiFetch<any>("/bot/stats"),
  });
}

// Leaderboard
export function useGetBotLeaderboard() {
  return useQuery({
    queryKey: getGetBotLeaderboardQueryKey(),
    queryFn: () => apiFetch<any[]>("/bot/leaderboard"),
  });
}

// LFG Sessions
export function useGetBotLfgSessions() {
  return useQuery({
    queryKey: getGetBotLfgSessionsQueryKey(),
    queryFn: () => apiFetch<any[]>("/bot/lfg"),
  });
}

// Tournaments
export function useGetBotTournaments() {
  return useQuery({
    queryKey: getGetBotTournamentsQueryKey(),
    queryFn: () => apiFetch<any[]>("/bot/tournaments"),
  });
}

// Warnings
export function useGetBotWarnings() {
  return useQuery({
    queryKey: getGetBotWarningsQueryKey(),
    queryFn: () => apiFetch<any[]>("/bot/warnings"),
  });
}

// Auto Responses
export function useGetBotAutoResponses() {
  return useQuery({
    queryKey: getGetBotAutoResponsesQueryKey(),
    queryFn: () => apiFetch<any[]>("/bot/autoresponses"),
  });
}

// Channels
export function useGetBotChannels() {
  return useQuery({
    queryKey: getGetBotChannelsQueryKey(),
    queryFn: () => apiFetch<any[]>("/bot/channels"),
  });
}

// Mutations
export function useCreateBotWarning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: { userId: string; reason: string } }) =>
      apiFetch<any>("/bot/warnings", {
        method: "POST",
        body: JSON.stringify(data.data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetBotWarningsQueryKey() });
    },
  });
}

export function useCreateBotAutoResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: { trigger: string; response: string; embedTitle: string | null; embedColor: string | null } }) =>
      apiFetch<any>("/bot/autoresponses", {
        method: "POST",
        body: JSON.stringify(data.data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetBotAutoResponsesQueryKey() });
    },
  });
}

export function useDeleteBotAutoResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string }) =>
      apiFetch<any>(`/bot/autoresponses/${data.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetBotAutoResponsesQueryKey() });
    },
  });
}

export function useSendBotAnnouncement() {
  return useMutation({
    mutationFn: (data: { data: { channelId: string; message: string } }) =>
      apiFetch<any>("/bot/announce", {
        method: "POST",
        body: JSON.stringify(data.data),
      }),
  });
}
