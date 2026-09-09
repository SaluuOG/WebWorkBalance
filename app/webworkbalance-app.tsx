/* eslint-disable @next/next/no-img-element -- free direct image sources avoid an optimizer dependency. */
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  BellRing,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Euro,
  ExternalLink,
  Info,
  List,
  ListTodo,
  LayoutDashboard,
  LocateFixed,
  Mail,
  Map as MapIcon,
  MapPin,
  Menu as MenuIcon,
  Navigation,
  Phone,
  Plane,
  Plus,
  Radar,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { BusinessCard, type SwipeAction } from "@/components/wwb/business-card";
import { DetailSheet } from "@/components/wwb/detail-sheet";
import { ManualLeadDialog } from "@/components/wwb/manual-lead-dialog";
import { PricingStudio } from "@/components/wwb/pricing-studio";
import { QuickMenu } from "@/components/wwb/quick-menu";
import { RadarPanel } from "@/components/wwb/radar-panel";
import { RegionalList } from "@/components/wwb/regional-list";
import { TeamWorkspace } from "@/components/wwb/team-workspace-v2";
import { WorkflowCockpit } from "@/components/wwb/workflow-cockpit";
import {
  RadarDirectError,
  REGIONAL_SEARCH_CENTERS,
  mergeRadarBusinesses,
  readRadarClientCache,
  readRegionalClientCache,
  searchOpenStreetMapDirect,
  writeRadarClientCache,
  writeRegionalClientCache,
  type RadarDirectResult,
  type RadarSearchRequest,
} from "@/lib/radar-client";
import {
  calculateLeadScore,
  categories,
  DEFAULT_PRICES,
  demoBusinesses,
  googleMapsUrl,
  haversineKm,
  leadStatuses,
  packageForBusiness,
  type AppUser,
  type AppView,
  type Business,
  type GeocodeResult,
  type LeadStatus,
  type LeadTask,
  type PriceSettings,
  type SearchCenter,
  type StoredLead,
  type TeamChatMessage,
  type TeamNote,
  type TeamNoteKind,
} from "../lib/webworkbalance";

type SortMode = "distance" | "score" | "contact";
type HistoryItem = { business: Business; action: SwipeAction };
type Interaction = { businessId: string; action: string; createdAt: string };
type RadarServerResponse = {
  businesses: Business[];
  limited?: boolean;
  cached?: boolean;
  stale?: boolean;
  clientFallback?: boolean;
  warning?: string;
  segments?: number;
  provider?: string;
  sampled?: boolean;
};
type AcquiredRadarResult = {
  businesses: Business[];
  limited: boolean;
  cached: boolean;
  stale: boolean;
  notice: string;
};
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
};
type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: { osm_id?: number; name?: string; city?: string; state?: string; country?: string; type?: string };
};

const DEFAULT_CENTER: SearchCenter = { name: "Nürnberg", lat: 49.4521, lon: 11.0767, passport: true };
const RADIUS_PRESETS = [2, 5, 13, 18, 25, 50];
const DEVICE_USER_STORAGE_KEY = "wwb-device-user-v1";
const TEAM_NOTES_READ_STORAGE_KEY = "wwb-team-notes-read-v1";
const TEAM_NOTES_PREVIEW_LIMIT = 6;

function readTeamNoteVersions(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TEAM_NOTES_READ_STORAGE_KEY) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id, version]) => Boolean(id) && typeof version === "string"));
  } catch {
    return {};
  }
}

function rememberTeamNotes(notes: TeamNote[]) {
  if (typeof window === "undefined" || !notes.length) return;
  try {
    const versions = readTeamNoteVersions();
    notes.forEach((note) => { versions[note.id] = note.updatedAt; });
    const recentEntries = Object.entries(versions).slice(-300);
    window.localStorage.setItem(TEAM_NOTES_READ_STORAGE_KEY, JSON.stringify(Object.fromEntries(recentEntries)));
  } catch {
    // A blocked localStorage must never interrupt the shared workspace.
  }
}

function teamNotePromptKey(notes: TeamNote[]) {
  return notes.map((note) => `${note.id}:${note.updatedAt}`).join("|");
}

function formatTeamNoteTime(value: string) {
  return new Date(value).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function getOrCreateDeviceUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(window.localStorage.getItem(DEVICE_USER_STORAGE_KEY) ?? "null") as Partial<AppUser> | null;
    if (saved?.id?.startsWith("device-") && saved.name) {
      return { id: saved.id, name: saved.name.slice(0, 120), email: null };
    }
    const token = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const user: AppUser = { id: `device-${token}`, name: `Gast ${token.slice(-4).toUpperCase()}`, email: null };
    window.localStorage.setItem(DEVICE_USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const deviceUser = getOrCreateDeviceUser();
  if (deviceUser) {
    headers.set("x-wwb-device-id", deviceUser.id);
    headers.set("x-wwb-device-name", deviceUser.name);
  }
  const response = await fetch(url, { ...init, headers });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    const error = new Error(data.error || "Die Anfrage ist fehlgeschlagen.") as Error & { code?: string; suggestion?: string };
    error.code = (data as T & { code?: string }).code;
    error.suggestion = (data as T & { suggestion?: string }).suggestion;
    throw error;
  }
  return data;
}

async function searchPlacesDirect(query: string): Promise<GeocodeResult[]> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10_000);
  try {
    const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "6", countrycodes: "de", addressdetails: "0" });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { "Accept-Language": "de" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    const data = (await response.json()) as NominatimPlace[];
    if (data.length) {
      return data.map((item) => ({
        id: String(item.place_id),
        name: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
        type: item.type ?? "Ort",
      }));
    }
  } catch {
    // Photon ist die zweite kostenlose OSM-basierte Ortsuche.
  } finally {
    window.clearTimeout(timer);
  }

  const photonController = new AbortController();
  const photonTimer = window.setTimeout(() => photonController.abort(), 10_000);
  try {
    const params = new URLSearchParams({ q: `${query}, Deutschland`, limit: "6", lang: "de" });
    const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal: photonController.signal });
    if (!response.ok) throw new Error(`Photon HTTP ${response.status}`);
    const data = (await response.json()) as { features?: PhotonFeature[] };
    return (data.features ?? []).flatMap((feature, index) => {
      const [lon, lat] = feature.geometry?.coordinates ?? [];
      if (typeof lat !== "number" || typeof lon !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon)) return [];
      const properties = feature.properties ?? {};
      const label = [properties.name, properties.city, properties.state, properties.country]
        .filter((value, itemIndex, values): value is string => Boolean(value) && values.indexOf(value) === itemIndex)
        .join(", ");
      return [{
        id: `photon-${properties.osm_id ?? index}`,
        name: label || query,
        lat,
        lon,
        type: properties.type ?? "Ort",
      }];
    });
  } finally {
    window.clearTimeout(photonTimer);
  }
}

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "Ohne Termin";
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function mapEmbedUrl(center: SearchCenter, radiusKm: number) {
  const latSpan = Math.max(0.015, radiusKm / 111);
  const lonSpan = Math.max(0.02, radiusKm / (111 * Math.max(0.3, Math.cos((center.lat * Math.PI) / 180))));
  const bbox = [center.lon - lonSpan, center.lat - latSpan, center.lon + lonSpan, center.lat + latSpan].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${center.lat}%2C${center.lon}`;
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function WebWorkBalanceApp({ currentUser }: { currentUser: AppUser }) {
  const [activeUser, setActiveUser] = useState(currentUser);
  const [booting, setBooting] = useState(true);
  const [view, setView] = useState<AppView>("today");
  const [center, setCenter] = useState<SearchCenter>(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(5);
  const [category, setCategory] = useState("all");
  const [showExisting, setShowExisting] = useState(false);
  const [contactableOnly, setContactableOnly] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("distance");
  const [searchResults, setSearchResults] = useState<Business[]>(() => demoBusinesses(DEFAULT_CENTER));
  const [regionalBusinesses, setRegionalBusinesses] = useState<Business[]>([]);
  const [regionalLoading, setRegionalLoading] = useState(false);
  const [regionalError, setRegionalError] = useState<string | null>(null);
  const [regionalNotice, setRegionalNotice] = useState<string | null>(null);
  const [regionalScope, setRegionalScope] = useState("Nürnberg, Fürth, Erlangen, Schwabach & umliegende Landkreise");
  const [isLiveData, setIsLiveData] = useState(false);
  const [searching, setSearching] = useState(false);
  const [starterLoading, setStarterLoading] = useState(false);
  const [radarNotice, setRadarNotice] = useState<string | null>(null);
  const [sessionDecisions, setSessionDecisions] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [teamNotes, setTeamNotes] = useState<TeamNote[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([]);
  const [teamSyncReady, setTeamSyncReady] = useState(false);
  const [teamInboxOpen, setTeamInboxOpen] = useState(false);
  const [teamInboxNotes, setTeamInboxNotes] = useState<TeamNote[]>([]);
  const [teamInboxCount, setTeamInboxCount] = useState(0);
  const teamInboxOpenRef = useRef(false);
  const teamInboxPromptKeyRef = useRef("");
  const teamInboxPendingNotesRef = useRef<TeamNote[]>([]);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [manualLeadOpen, setManualLeadOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [teamNoteLeadId, setTeamNoteLeadId] = useState<string | null>(null);
  const [passportQuery, setPassportQuery] = useState("");
  const [passportResults, setPassportResults] = useState<GeocodeResult[]>([]);
  const [passportSearching, setPassportSearching] = useState(false);
  const [recentPlaces, setRecentPlaces] = useState<SearchCenter[]>([]);
  const [prices, setPrices] = useState<PriceSettings>(DEFAULT_PRICES);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [leadQuery, setLeadQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState(tomorrow());
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const displayName = activeUser.name;

  function setTeamInboxVisibility(open: boolean) {
    teamInboxOpenRef.current = open;
    setTeamInboxOpen(open);
  }

  function syncTeamNotesState(nextNotes: TeamNote[]) {
    setTeamNotes(nextNotes);
    setTeamSyncReady(true);
    const readVersions = readTeamNoteVersions();
    const unread = nextNotes.filter((note) => readVersions[note.id] !== note.updatedAt);
    const promptKey = teamNotePromptKey(unread);
    if (!unread.length || promptKey === teamInboxPromptKeyRef.current) return;
    teamInboxPromptKeyRef.current = promptKey;
    teamInboxPendingNotesRef.current = unread;
    setTeamInboxNotes(unread.slice(0, TEAM_NOTES_PREVIEW_LIMIT));
    setTeamInboxCount(unread.length);
    if (!teamInboxOpenRef.current) setTeamInboxVisibility(true);
  }

  function dismissTeamInbox(markAsRead: boolean) {
    if (markAsRead) rememberTeamNotes(teamInboxPendingNotesRef.current);
    if (markAsRead) teamInboxPendingNotesRef.current = [];
    setTeamInboxVisibility(false);
  }

  function openTeamFromInbox() {
    dismissTeamInbox(true);
    navigate("team");
  }

  async function updateTeamName(value: string) {
    const name = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 40);
    if (name.length < 2) {
      toast.error("Der Team-Name braucht mindestens 2 Zeichen.");
      return;
    }
    try {
      const data = await requestJson<{ user: AppUser }>("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const nextUser = { ...activeUser, name: data.user.name };
      setActiveUser(nextUser);
      if (nextUser.id.startsWith("device-")) window.localStorage.setItem(DEVICE_USER_STORAGE_KEY, JSON.stringify(nextUser));
      setLeads((current) => current.map((lead) => lead.claimedById === nextUser.id ? { ...lead, claimedByName: nextUser.name } : lead));
      setTeamNotes((current) => current.map((note) => note.authorId === nextUser.id ? { ...note, authorName: nextUser.name } : note));
      setTeamChatMessages((current) => current.map((message) => message.authorId === nextUser.id ? { ...message, authorName: nextUser.name } : message));
      toast.success(`Du erscheinst im Team jetzt als ${nextUser.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Der Team-Name konnte nicht gespeichert werden.");
    }
  }

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setBooting(false), 1250);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const preferencesTimer = window.setTimeout(() => {
      const deviceUser = getOrCreateDeviceUser();
      if (currentUser.id === "signed-in-viewer" && deviceUser) setActiveUser(deviceUser);
      const savedCenter = window.localStorage.getItem("wwb-center");
      const savedRadius = window.localStorage.getItem("wwb-radius");
      const savedPrices = window.localStorage.getItem("wwb-prices");
      const savedGoal = window.localStorage.getItem("wwb-goal");
      const savedPlaces = window.localStorage.getItem("wwb-places");
      try {
        if (savedCenter) setCenter(JSON.parse(savedCenter));
        if (savedRadius) setRadiusKm(Number(savedRadius));
        if (savedPrices) {
          const parsed = JSON.parse(savedPrices) as Partial<PriceSettings> & { starter?: number; plus?: number };
          setPrices("starter" in parsed || "plus" in parsed ? DEFAULT_PRICES : { ...DEFAULT_PRICES, ...parsed });
        }
        if (savedGoal) setDailyGoal(Number(savedGoal));
        if (savedPlaces) setRecentPlaces(JSON.parse(savedPlaces));
      } catch {
        // Corrupt device preferences are ignored; durable lead data stays server-backed.
      }
    }, 0);

    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    void loadPersistentState();
    return () => {
      window.clearTimeout(splashTimer);
      window.clearTimeout(preferencesTimer);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
    };
    // The initial durable-state read intentionally runs once for this mounted user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    window.localStorage.setItem("wwb-center", JSON.stringify(center));
    window.localStorage.setItem("wwb-radius", String(radiusKm));
    window.localStorage.setItem("wwb-prices", JSON.stringify(prices));
    window.localStorage.setItem("wwb-goal", String(dailyGoal));
    window.localStorage.setItem("wwb-places", JSON.stringify(recentPlaces));
  }, [center, radiusKm, prices, dailyGoal, recentPlaces]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshSharedState();
    }, 4500);
    const onVisible = () => { if (document.visibilityState === "visible") void refreshSharedState(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // The polling loop is intentionally mounted once; its callback reads the shared state endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPersistentState() {
    try {
      const [leadData, interactionData, taskData, noteData, chatData] = await Promise.all([
        requestJson<{ leads: StoredLead[] }>("/api/leads"),
        requestJson<{ interactions: Interaction[] }>("/api/interactions"),
        requestJson<{ tasks: LeadTask[] }>("/api/tasks"),
        requestJson<{ notes: TeamNote[] }>("/api/notes"),
        requestJson<{ messages: TeamChatMessage[] }>("/api/chat").catch(() => null),
      ]);
      setLeads(leadData.leads);
      setSkippedIds(new Set(interactionData.interactions.filter((item) => item.action === "skip").map((item) => item.businessId)));
      setTasks(taskData.tasks);
      syncTeamNotesState(noteData.notes);
      if (chatData) setTeamChatMessages(chatData.messages);
      setStorageReady(true);
      if (!leadData.leads.length && !window.localStorage.getItem("wwb-starter-attempted")) {
        window.localStorage.setItem("wwb-starter-attempted", "1");
        window.setTimeout(() => void loadStarterLeads(), 900);
      }
    } catch {
      setStorageReady(false);
    }
  }

  async function refreshSharedState() {
    try {
      const [leadData, noteData, taskData, chatData] = await Promise.all([
        requestJson<{ leads: StoredLead[] }>("/api/leads"),
        requestJson<{ notes: TeamNote[] }>("/api/notes"),
        requestJson<{ tasks: LeadTask[] }>("/api/tasks"),
        requestJson<{ messages: TeamChatMessage[] }>("/api/chat").catch(() => null),
      ]);
      setLeads(leadData.leads);
      syncTeamNotesState(noteData.notes);
      setTasks(taskData.tasks);
      if (chatData) setTeamChatMessages(chatData.messages);
      setStorageReady(true);
    } catch {
      setTeamSyncReady(false);
    }
  }

  const leadIds = useMemo(() => new Set(leads.map((lead) => lead.id)), [leads]);
  const candidates = useMemo(() => {
    const list = searchResults.filter((business) => {
      if (sessionDecisions.has(business.id) || skippedIds.has(business.id) || leadIds.has(business.id)) return false;
      if (!showExisting && business.websiteStatus === "exists") return false;
      if (contactableOnly && !business.phone && !business.email) return false;
      if (focusMode && calculateLeadScore(business) < 70) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sortMode === "score") return calculateLeadScore(b) - calculateLeadScore(a);
      if (sortMode === "contact") return Number(Boolean(b.phone || b.email)) - Number(Boolean(a.phone || a.email)) || a.distanceKm - b.distanceKm;
      return a.distanceKm - b.distanceKm;
    });
  }, [searchResults, sessionDecisions, skippedIds, leadIds, showExisting, contactableOnly, focusMode, sortMode]);

  const currentBusiness = candidates[0] ?? null;
  const selectedLead = selectedBusiness ? leads.find((lead) => lead.id === selectedBusiness.id) ?? null : null;
  const today = new Date().toISOString().slice(0, 10);
  const todayLeads = leads.filter((lead) => lead.createdAt.startsWith(today)).length;
  const openTasks = tasks.filter((task) => !task.completed).length;
  const topLeads = leads.filter((lead) => lead.score >= 75 && lead.status !== "Abgelehnt").length;
  const potentialValue = leads
    .filter((lead) => !["Abgelehnt", "Auftrag gewonnen"].includes(lead.status))
    .reduce((sum, lead) => sum + packageForBusiness(lead, prices).price, 0);

  const filteredLeads = useMemo(() => {
    const query = leadQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      if (leadStatusFilter !== "all" && lead.status !== leadStatusFilter) return false;
      return !query || `${lead.name} ${lead.category} ${lead.address}`.toLowerCase().includes(query);
    });
  }, [leads, leadQuery, leadStatusFilter]);

  async function acquireRadarResults(
    targetCenter: SearchCenter,
    targetRadiusKm: number,
    targetCategory: string,
    onProgress?: (message: string) => void,
  ): Promise<AcquiredRadarResult> {
    const searchRequest: RadarSearchRequest = {
      lat: targetCenter.lat,
      lon: targetCenter.lon,
      radiusKm: targetRadiusKm,
      category: targetCategory,
    };
    let staleShared: RadarServerResponse | null = null;
    try {
      const shared = await requestJson<RadarServerResponse>("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchRequest),
      });
      if (shared.businesses.length && !shared.clientFallback && !shared.stale) {
        return {
          businesses: shared.businesses,
          limited: Boolean(shared.limited),
          cached: true,
          stale: false,
          notice: `Schnell aus dem gemeinsamen Team-Cache geladen${shared.provider ? ` · ${shared.provider}` : ""}.`,
        };
      }
      if (shared.businesses.length) staleShared = shared;
    } catch {
      // Der Direktmodus ist unabhängig vom optionalen Server-Cache.
    }

    const deviceCache = readRadarClientCache(searchRequest);
    if (deviceCache) {
      return {
        businesses: deviceCache.result.businesses,
        limited: deviceCache.result.businesses.length >= 160,
        cached: true,
        stale: false,
        notice: `Sofort aus dem 30-Minuten-Gerätecache geladen · ${deviceCache.result.fieldsSearched} Suchfeld${deviceCache.result.fieldsSearched === 1 ? "" : "er"}.`,
      };
    }

    try {
      const direct = await searchOpenStreetMapDirect(searchRequest, onProgress);
      writeRadarClientCache(searchRequest, direct);
      if (direct.businesses.length) {
        void requestJson("/api/search", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...searchRequest,
            businesses: direct.businesses,
            provider: direct.provider,
            segments: direct.fieldsSearched,
            sampled: direct.sampled,
          }),
        }).catch(() => undefined);
      }
      const fieldText = `${direct.fieldsSearched}/${direct.fieldsPlanned} kleine Suchfelder`;
      const samplingText = direct.sampled
        ? ` Der ${targetRadiusKm}-km-Bereich wird absichtlich schrittweise statt als eine übergroße Timeout-Abfrage durchsucht.`
        : "";
      const retryText = direct.diagnostics.length ? ` Automatischer Anbieterwechsel war aktiv (${direct.diagnostics.length} Versuch${direct.diagnostics.length === 1 ? "" : "e"}).` : "";
      return {
        businesses: direct.businesses,
        limited: direct.businesses.length >= 160,
        cached: false,
        stale: false,
        notice: `Direktmodus erfolgreich über ${direct.provider} · ${fieldText}.${samplingText}${retryText}`,
      };
    } catch (error) {
      const staleDevice = readRadarClientCache(searchRequest, true);
      const fallbackBusinesses = staleShared?.businesses.length ? staleShared.businesses : staleDevice?.result.businesses ?? [];
      if (fallbackBusinesses.length) {
        return {
          businesses: fallbackBusinesses,
          limited: Boolean(staleShared?.limited) || fallbackBusinesses.length >= 160,
          cached: true,
          stale: true,
          notice: "Alle Live-Endpunkte waren kurzzeitig nicht erreichbar. Damit du weiterarbeiten kannst, wird der letzte gespeicherte Stand angezeigt.",
        };
      }
      throw error;
    }
  }

  async function runSearch() {
    setSearching(true);
    setRadarNotice(null);
    if (radiusKm >= 13) toast.info("Großer Radius wird automatisch in kleine, schnelle Suchfelder zerlegt.");
    try {
      const data = await acquireRadarResults(center, radiusKm, category, setRadarNotice);
      setSearchResults(data.businesses);
      setSessionDecisions(new Set());
      setHistory([]);
      setIsLiveData(true);
      const sourceLabel = data.stale ? " · letzter gespeicherter Stand" : data.cached ? " · aus Cache" : "";
      toast.success(`${data.businesses.length} echte Einträge geladen${data.limited ? " · Ergebnis begrenzt" : ""}${sourceLabel}`);
      setRadarNotice(data.notice);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Live-Suche fehlgeschlagen";
      const diagnostics = error instanceof RadarDirectError && error.diagnostics.length
        ? ` Geprüft: ${error.diagnostics.slice(0, 3).join(" · ")}. Prüfe Werbe-/Tracking-Schutz oder ein Firmennetzwerk, das externe Kartendienste blockiert.`
        : "";
      setRadarNotice(`${message}${diagnostics}`);
      toast.error(message);
    } finally {
      setSearching(false);
    }
  }

  async function loadRegionalList() {
    if (regionalLoading) return;
    setRegionalLoading(true);
    setRegionalError(null);
    setRegionalNotice("Gemeinsamer Team-Cache wird geprüft …");
    try {
      let staleShared: RadarServerResponse | null = null;
      try {
        const shared = await requestJson<RadarServerResponse & { scope?: string }>("/api/regional-list");
        if (shared.scope) setRegionalScope(shared.scope);
        if (shared.businesses.length && !shared.clientFallback && !shared.stale) {
          setRegionalBusinesses(shared.businesses);
          setRegionalNotice(`Regional-Liste aus dem gemeinsamen Team-Cache geladen${shared.provider ? ` · ${shared.provider}` : ""}.`);
          toast.success(`${shared.businesses.length} Firmen für Nürnberg & Region geladen · Team-Cache`);
          return;
        }
        if (shared.businesses.length) staleShared = shared;
      } catch {
        // Der direkte Regional-Scan funktioniert auch ohne Server-Cache.
      }

      const local = readRegionalClientCache();
      if (local) {
        setRegionalBusinesses(local.result.businesses);
        setRegionalNotice("Regional-Liste sofort aus dem 30-Minuten-Gerätecache geladen.");
        toast.success(`${local.result.businesses.length} Firmen für Nürnberg & Region geladen · Gerätecache`);
        return;
      }

      let collected: Business[] = [];
      const diagnostics: string[] = [];
      const providers = new Set<string>();
      let completedAreas = 0;
      for (const [index, place] of REGIONAL_SEARCH_CENTERS.entries()) {
        setRegionalNotice(`Direktmodus ${index + 1}/${REGIONAL_SEARCH_CENTERS.length}: ${place.name} wird durchsucht …`);
        const request: RadarSearchRequest = { lat: place.lat, lon: place.lon, radiusKm: index === 0 ? 4.5 : 3.5, category: "all" };
        try {
          const cachedArea = readRadarClientCache(request);
          const result = cachedArea?.result ?? await searchOpenStreetMapDirect(request, (message) => setRegionalNotice(`${place.name}: ${message}`));
          if (!cachedArea) writeRadarClientCache(request, result);
          providers.add(cachedArea ? "Gerätecache" : result.provider);
          completedAreas += 1;
          collected = mergeRadarBusinesses(collected, result.businesses)
            .map((business) => ({ ...business, distanceKm: Number(haversineKm(DEFAULT_CENTER.lat, DEFAULT_CENTER.lon, business.lat, business.lon).toFixed(1)) }))
            .sort((first, second) => first.name.localeCompare(second.name, "de"));
          setRegionalBusinesses(collected);
          if (collected.length >= 480 && completedAreas >= 4) break;
        } catch (error) {
          if (error instanceof RadarDirectError) diagnostics.push(...error.diagnostics);
          else diagnostics.push(error instanceof Error ? error.message : `${place.name}: unbekannter Fehler`);
        }
      }

      if (!collected.length) {
        const staleLocal = readRegionalClientCache(true);
        const fallback = staleShared?.businesses.length ? staleShared.businesses : staleLocal?.result.businesses ?? [];
        if (!fallback.length) throw new RadarDirectError("Die Regional-Liste konnte über keinen freien Kartendienst geladen werden.", diagnostics);
        setRegionalBusinesses(fallback);
        setRegionalNotice("Freie Live-Endpunkte waren nicht erreichbar. Der letzte gespeicherte Regionalstand bleibt verfügbar.");
        toast.info(`${fallback.length} Firmen aus dem letzten Regional-Cache geladen`);
        return;
      }

      const regionalResult: RadarDirectResult = {
        businesses: collected.slice(0, 500),
        provider: [...providers].join(" + "),
        fieldsSearched: completedAreas,
        fieldsPlanned: REGIONAL_SEARCH_CENTERS.length,
        partial: completedAreas < REGIONAL_SEARCH_CENTERS.length,
        sampled: true,
        diagnostics: diagnostics.slice(0, 8),
      };
      writeRegionalClientCache(regionalResult);
      setRegionalBusinesses(regionalResult.businesses);
      setRegionalNotice(`${completedAreas}/${REGIONAL_SEARCH_CENTERS.length} Teilregionen direkt geladen · ${regionalResult.provider}${diagnostics.length ? " · Anbieterwechsel aktiv" : ""}.`);
      void requestJson("/api/regional-list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businesses: regionalResult.businesses, tiles: completedAreas, provider: regionalResult.provider }),
      }).catch(() => undefined);
      toast.success(`${regionalResult.businesses.length} Firmen für Nürnberg & Region geladen`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Regional-Liste konnte nicht geladen werden";
      const diagnostics = error instanceof RadarDirectError && error.diagnostics.length ? ` Geprüft: ${error.diagnostics.slice(0, 3).join(" · ")}.` : "";
      setRegionalError(`${message}${diagnostics}`);
      toast.error(message);
    } finally {
      setRegionalLoading(false);
    }
  }

  function navigate(nextView: AppView) {
    setView(nextView);
    if (nextView === "regional" && !regionalBusinesses.length) void loadRegionalList();
  }

  async function loadStarterLeads() {
    if (starterLoading) return;
    setStarterLoading(true);
    try {
      const data = await acquireRadarResults(center, Math.max(18, Math.min(25, radiusKm)), "all", setRadarNotice);
      const candidates = data.businesses.filter((business) => !business.website && !leads.some((lead) => lead.id === business.id)).slice(0, 10);
      if (!candidates.length) {
        toast.info("Im aktuellen Suchgebiet wurden keine neuen Website-Chancen gefunden. Wähle einen anderen Ort oder Radius.");
        return;
      }
      let saved = 0;
      for (const [index, business] of candidates.entries()) {
        if (await saveLead(business, index < 3 && calculateLeadScore(business) >= 80)) saved += 1;
      }
      setView("leads");
      toast.success(`${saved} echte Start-Leads aus dem aktuellen Suchgebiet gespeichert${data.cached || data.stale ? " · Kartendaten aus Cache" : ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Start-Leads konnten nicht geladen werden");
    } finally {
      setStarterLoading(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return toast.error("Standortzugriff wird auf diesem Gerät nicht unterstützt.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({ name: "Mein Standort", lat: position.coords.latitude, lon: position.coords.longitude, passport: false });
        toast.success("Standort übernommen – starte jetzt den Radar.");
      },
      () => toast.error("Standort konnte nicht gelesen werden. Nutze den Passport-Modus."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function searchPassport(event?: FormEvent) {
    event?.preventDefault();
    if (passportQuery.trim().length < 2) return;
    setPassportSearching(true);
    try {
      let results: GeocodeResult[] = [];
      try {
        const data = await requestJson<{ results: GeocodeResult[] }>(`/api/geocode?q=${encodeURIComponent(passportQuery.trim())}`);
        results = data.results;
      } catch {
        // Öffentliche Sites dürfen die kostenlose Ortsuche direkt vom Gerät aus
        // fortsetzen, falls der Server-Endpunkt gerade kein externes Netz hat.
      }
      if (!results.length) results = await searchPlacesDirect(passportQuery.trim());
      setPassportResults(results);
      if (!results.length) toast.info("Kein passender Ort in Deutschland gefunden.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ortssuche fehlgeschlagen");
    } finally {
      setPassportSearching(false);
    }
  }

  function choosePlace(place: SearchCenter) {
    setCenter({ ...place, passport: true });
    setRecentPlaces((current) => [place, ...current.filter((item) => Math.abs(item.lat - place.lat) > 0.0001 || Math.abs(item.lon - place.lon) > 0.0001)].slice(0, 5));
    setPassportOpen(false);
    setPassportResults([]);
    setPassportQuery("");
    toast.success(`Passport aktiv: ${place.name}`);
  }

  function openDetails(business: Business) {
    setSelectedBusiness(business);
    setDetailOpen(true);
  }

  async function saveLead(business: Business, priority = false) {
    if (business.isDemo) {
      toast.info("Das ist ein Demo-Eintrag. Starte den Live-Radar für echte Unternehmen.");
      return false;
    }
    const optimistic: StoredLead = {
      ...business,
      score: calculateLeadScore(business),
      status: priority ? "Interessant" : "Neu",
      priority,
      notes: "",
      nextAction: "Erstkontakt vorbereiten",
      followUpAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((current) => [optimistic, ...current.filter((item) => item.id !== business.id)]);
    setSessionDecisions((current) => new Set(current).add(business.id));
    try {
      const data = await requestJson<{ lead: StoredLead }>("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, priority }),
      });
      setLeads((current) => [data.lead, ...current.filter((item) => item.id !== data.lead.id)]);
      setStorageReady(true);
      toast.success(priority ? "Top-Lead gespeichert" : "Lead gespeichert");
      if (priority) await addTask(`Erstkontakt mit ${business.name} vorbereiten`, business.id, tomorrow(), false);
      return true;
    } catch (error) {
      setLeads((current) => current.filter((item) => item.id !== business.id));
      setSessionDecisions((current) => { const next = new Set(current); next.delete(business.id); return next; });
      setStorageReady(false);
      toast.error(error instanceof Error ? error.message : "Lead konnte nicht gespeichert werden");
      return false;
    }
  }

  async function decide(action: SwipeAction) {
    if (!currentBusiness) return;
    const business = currentBusiness;
    setSessionDecisions((current) => new Set(current).add(business.id));
    setHistory((current) => [...current, { business, action }]);
    if (business.isDemo) {
      toast.info(action === "skip" ? "Demo übersprungen" : "Demo bewertet – Live-Radar starten, um echte Leads zu speichern");
      return;
    }
    if (action === "skip") {
      setSkippedIds((current) => new Set(current).add(business.id));
      try {
        await requestJson("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: business.id, action: "skip" }),
        });
      } catch {
        setStorageReady(false);
        toast.error("Überspringen wurde nur für diese Sitzung gemerkt.");
      }
      return;
    }
    await saveLead(business, action === "priority");
  }

  async function undoLast() {
    const last = history.at(-1);
    if (!last) return;
    setHistory((current) => current.slice(0, -1));
    setSessionDecisions((current) => { const next = new Set(current); next.delete(last.business.id); return next; });
    if (last.business.isDemo) return toast.success("Letzte Demo-Entscheidung zurückgenommen");
    try {
      if (last.action === "skip") {
        setSkippedIds((current) => { const next = new Set(current); next.delete(last.business.id); return next; });
        await requestJson(`/api/interactions?businessId=${encodeURIComponent(last.business.id)}`, { method: "DELETE" });
      } else {
        setLeads((current) => current.filter((item) => item.id !== last.business.id));
        await requestJson(`/api/leads?id=${encodeURIComponent(last.business.id)}`, { method: "DELETE" });
      }
      toast.success("Letzte Entscheidung zurückgenommen");
    } catch {
      toast.error("Rückgängig konnte nicht vollständig gespeichert werden.");
    }
  }

  async function patchLead(id: string, patch: Partial<Pick<StoredLead, "status" | "priority" | "notes" | "nextAction" | "followUpAt" | "websiteStatus" | "audit" | "activities">>) {
    const previous = leads;
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...patch, updatedAt: new Date().toISOString() } : lead));
    try {
      const data = await requestJson<{ lead: StoredLead }>("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      setLeads((current) => current.map((lead) => lead.id === id ? data.lead : lead));
    } catch (error) {
      setLeads(previous);
      toast.error(error instanceof Error ? error.message : "Änderung konnte nicht gespeichert werden");
    }
  }

  async function claimLead(lead: StoredLead, claim: boolean) {
    try {
      const data = await requestJson<{ lead: StoredLead }>("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, claim: claim ? "claim" : "release" }),
      });
      setLeads((current) => current.map((item) => item.id === lead.id ? data.lead : item));
      setTeamSyncReady(true);
      toast.success(claim ? `${lead.name} ist jetzt dir zugeordnet` : `${lead.name} wurde freigegeben`);
    } catch (error) {
      await refreshSharedState();
      toast.error(error instanceof Error ? error.message : "Zuständigkeit konnte nicht geändert werden");
    }
  }

  async function createTeamNote(body: string, kind: TeamNoteKind, leadId: string | null) {
    try {
      const data = await requestJson<{ note: TeamNote }>("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, kind, leadId }),
      });
      setTeamNotes((current) => [data.note, ...current.filter((note) => note.id !== data.note.id)]);
      rememberTeamNotes([data.note]);
      setTeamSyncReady(true);
      toast.success("Notiz wurde mit dem Team geteilt");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Notiz konnte nicht geteilt werden");
      throw error;
    }
  }

  async function toggleTeamNotePin(note: TeamNote) {
    const previous = teamNotes;
    setTeamNotes((current) => current.map((item) => item.id === note.id ? { ...item, pinned: !item.pinned } : item));
    try {
      const data = await requestJson<{ note: TeamNote }>("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, pinned: !note.pinned }),
      });
      setTeamNotes((current) => current.map((item) => item.id === note.id ? data.note : item));
      rememberTeamNotes([data.note]);
    } catch (error) {
      setTeamNotes(previous);
      toast.error(error instanceof Error ? error.message : "Notiz konnte nicht aktualisiert werden");
    }
  }

  async function deleteTeamNote(note: TeamNote) {
    const previous = teamNotes;
    setTeamNotes((current) => current.filter((item) => item.id !== note.id));
    try {
      await requestJson(`/api/notes?id=${encodeURIComponent(note.id)}`, { method: "DELETE" });
      toast.success("Notiz gelöscht");
    } catch (error) {
      setTeamNotes(previous);
      toast.error(error instanceof Error ? error.message : "Notiz konnte nicht gelöscht werden");
    }
  }

  async function createTeamChatMessage(body: string) {
    try {
      const data = await requestJson<{ message: TeamChatMessage }>("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setTeamChatMessages((current) => [...current.filter((message) => message.id !== data.message.id), data.message].slice(-150));
      setTeamSyncReady(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nachricht konnte nicht gesendet werden");
      throw error;
    }
  }

  async function deleteTeamChatMessage(message: TeamChatMessage) {
    const previous = teamChatMessages;
    setTeamChatMessages((current) => current.filter((item) => item.id !== message.id));
    try {
      await requestJson(`/api/chat?id=${encodeURIComponent(message.id)}`, { method: "DELETE" });
    } catch (error) {
      setTeamChatMessages(previous);
      toast.error(error instanceof Error ? error.message : "Nachricht konnte nicht gelöscht werden");
    }
  }

  function openTeamNote(business: Business) {
    setTeamNoteLeadId(business.id);
    setDetailOpen(false);
    setView("team");
  }

  async function addTask(title: string, leadId: string | null = null, dueAt: string | null = null, notify = true) {
    try {
      const data = await requestJson<{ task: LeadTask }>("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, leadId, dueAt }),
      });
      setTasks((current) => [...current, data.task].sort((a, b) => Number(a.completed) - Number(b.completed) || String(a.dueAt).localeCompare(String(b.dueAt))));
      if (notify) toast.success("Aufgabe hinzugefügt");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Aufgabe konnte nicht gespeichert werden");
    }
  }

  async function toggleTask(task: LeadTask) {
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item));
    try {
      await requestJson("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
    } catch {
      setTasks((current) => current.map((item) => item.id === task.id ? task : item));
      toast.error("Aufgabe konnte nicht aktualisiert werden");
    }
  }

  function submitTask(event: FormEvent) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    void addTask(taskTitle.trim(), null, taskDate || null);
    setTaskTitle("");
  }

  function exportLeads() {
    if (!leads.length) return toast.info("Noch keine Leads zum Exportieren vorhanden.");
    const header = ["Firma", "Kategorie", "Status", "Score", "Adresse", "Telefon", "E-Mail", "Website", "Nächster Schritt", "Wiedervorlage", "Quelle"];
    const rows = leads.map((lead) => [lead.name, lead.category, lead.status, lead.score, lead.address, lead.phone, lead.email, lead.website, lead.nextAction, lead.followUpAt, lead.source]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `webworkbalance-leads-${today}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Lead-Liste exportiert");
  }

  async function installApp() {
    if (!installPrompt) return toast.info("Nutze im Browser-Menü „Zum Home-Bildschirm“ oder „App installieren“.");
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (booting) {
    return (
      <main className="wwb-splash flex flex-col items-center justify-center px-6 text-center text-foreground">
        <div className="wwb-splash-icon relative"><div className="absolute inset-2 rounded-[2rem] bg-[#d7b56d]/20 blur-3xl" /><img src="/wwb-icon-v10-512.png" alt="" className="relative size-32 rounded-[2.2rem] shadow-[0_25px_80px_rgba(215,181,109,.18)] sm:size-40" /></div>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl"><span className="gold-text">WebWork</span>Balance</h1>
        <p className="mt-2 text-sm font-medium tracking-[.16em] text-[#d7b56d]">made by Salu &amp; Sula</p>
        <div className="mt-8 h-1 w-36 overflow-hidden rounded-full bg-white/[.07]"><span className="wwb-loading-bar block h-full rounded-full bg-gradient-to-r from-[#a77b32] via-[#fff1c8] to-[#d7b56d]" /></div>
        <p className="mt-4 text-xs text-muted-foreground">Dein Business-Radar wird vorbereitet</p>
      </main>
    );
  }

  return (
    <main className="wwb-app-shell text-foreground">
      <header className="safe-top sticky top-0 z-30 border-b border-white/[.07] bg-[#080b0f]/85 px-4 py-3 backdrop-blur-2xl sm:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative size-11 shrink-0">
              <img src="/wwb-icon-v10-192.png" alt="" className="size-11 rounded-[.9rem] border border-[#d7b56d]/20 object-cover shadow-[0_8px_28px_rgba(215,181,109,.12)]" />
              <span className="pulse-dot absolute right-0 top-0 size-2 rounded-full bg-[#52d6a0]" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl"><span className="gold-text">WebWork</span>Balance</h1>
              <p className="truncate text-xs font-medium tracking-[.08em] text-[#d7b56d]">made by Salu &amp; Sula</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-right sm:block">
              <p className="text-[11px] text-muted-foreground">Offenes Potenzial</p>
              <strong className="text-sm text-[#efd28e]">{potentialValue.toLocaleString("de-DE")} €</strong>
            </div>
            <button type="button" onClick={() => setQuickMenuOpen(true)} className="flex items-center gap-2 rounded-xl border border-[#d7b56d]/20 bg-[#d7b56d]/[.06] px-3 py-2 text-sm font-medium text-[#efd28e] transition hover:bg-[#d7b56d]/[.12]">
              <MenuIcon className="size-4" /><span>Menü</span><kbd className="hidden rounded border border-white/10 bg-black/15 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground lg:inline">⌘K</kbd>
            </button>
            <button type="button" onClick={() => setView("settings")} className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-sm transition hover:bg-white/[.06]">
              <span className={`size-2 rounded-full ${storageReady === false ? "bg-[#ff6677]" : storageReady ? "bg-[#52d6a0]" : "bg-[#d7b56d]"}`} />
              <span className="hidden sm:inline">{displayName}</span>
            </button>
          </div>
        </div>
      </header>

      <Tabs value={view} onValueChange={(value) => navigate(value as AppView)}>
        <TabsContent value="today" className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6">
          <WorkflowCockpit displayName={displayName} leads={leads} tasks={tasks} prices={prices} dailyGoal={dailyGoal} onOpenLead={openDetails} onOpenManual={() => setManualLeadOpen(true)} onLoadStarter={() => void loadStarterLeads()} onViewRadar={() => setView("discover")} onViewRegional={() => navigate("regional")} onViewLeads={() => setView("leads")} onViewTeam={() => setView("team")} onViewTasks={() => setView("tasks")} onViewPricing={() => setView("pricing")} onToggleTask={toggleTask} />
        </TabsContent>

        <TabsContent value="discover" className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
          <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(380px,560px)_300px] xl:justify-center">
            <div className="space-y-4 xl:sticky xl:top-24">
              <section className="glass-panel rounded-[1.75rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d7b56d]">Suchgebiet</p><h2 className="mt-1 font-semibold">{center.name}</h2></div>
                  <Badge variant="outline" className={center.passport ? "border-[#6fa8ff]/25 bg-[#6fa8ff]/10 text-[#9fc1ff]" : "border-[#52d6a0]/25 bg-[#52d6a0]/10 text-[#75e5b7]"}>{center.passport ? <Plane className="mr-1 size-3" /> : <LocateFixed className="mr-1 size-3" />}{center.passport ? "Passport" : "Live"}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" className="border-white/10" onClick={useCurrentLocation}><LocateFixed className="mr-2 size-4" /> Standort</Button>
                  <Button type="button" variant="outline" className="border-white/10" onClick={() => setPassportOpen(true)}><Plane className="mr-2 size-4" /> Passport</Button>
                </div>

                <div className="mt-5 flex items-end justify-between"><label className="text-sm font-medium" htmlFor="radius-control">Umkreis</label><strong className="text-xl text-[#efd28e]">{radiusKm} km</strong></div>
                <Slider id="radius-control" className="mt-4 [&_[data-slot=slider-range]]:bg-[#d7b56d] [&_[data-slot=slider-thumb]]:border-[#d7b56d]" min={2} max={50} step={1} value={[radiusKm]} onValueChange={(value) => setRadiusKm(value[0] ?? 5)} />
                <div className="mt-3 grid grid-cols-6 gap-1">
                  {RADIUS_PRESETS.map((radius) => <button key={radius} type="button" onClick={() => setRadiusKm(radius)} className={`rounded-lg py-1.5 text-xs transition ${radiusKm === radius ? "bg-[#d7b56d] font-bold text-[#080b0f]" : "bg-white/[.04] text-muted-foreground hover:text-foreground"}`}>{radius}</button>)}
                </div>

                <label className="mt-5 block space-y-2 text-sm"><span className="text-muted-foreground">Branche</span>
                  <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>
                </label>

                <div className="mt-4 space-y-3 rounded-xl border border-white/[.06] bg-black/10 p-3">
                  <label className="flex cursor-pointer items-center justify-between gap-4 text-sm"><span><strong className="block font-medium">Websites anzeigen</strong><span className="text-xs text-muted-foreground">Auch Redesign-Chancen</span></span><Switch checked={showExisting} onCheckedChange={setShowExisting} className="data-[state=checked]:bg-[#d7b56d]" /></label>
                  <label className="flex cursor-pointer items-center justify-between gap-4 text-sm"><span><strong className="block font-medium">Nur kontaktierbar</strong><span className="text-xs text-muted-foreground">Telefon oder E-Mail</span></span><Switch checked={contactableOnly} onCheckedChange={setContactableOnly} className="data-[state=checked]:bg-[#d7b56d]" /></label>
                  <label className="flex cursor-pointer items-center justify-between gap-4 text-sm"><span><strong className="block font-medium">Focus-Modus</strong><span className="text-xs text-muted-foreground">Nur Score ab 70</span></span><Switch checked={focusMode} onCheckedChange={setFocusMode} className="data-[state=checked]:bg-[#d7b56d]" /></label>
                </div>

                <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}><SelectTrigger className="mt-3 w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="distance">Nach Entfernung</SelectItem><SelectItem value="score">Bestes Potenzial zuerst</SelectItem><SelectItem value="contact">Kontaktierbare zuerst</SelectItem></SelectContent></Select>
                <Button type="button" className="mt-3 h-12 w-full" onClick={runSearch} disabled={searching}>{searching ? <><Radar className="mr-2 size-4 animate-spin" /> Radar sucht…</> : <><Search className="mr-2 size-4" /> Live-Radar starten</>}</Button>
                {radarNotice && <div className="mt-3 rounded-xl border border-[#d7b56d]/20 bg-[#d7b56d]/[.055] p-3 text-xs leading-5 text-muted-foreground"><strong className="block text-[#efd28e]">Radar-Status</strong>{radarNotice}</div>}
                <p className="mt-3 text-center text-[11px] leading-4 text-muted-foreground">Direkte Live-Suche · 3 freie OSM-Endpunkte · Team- und Gerätecache</p>
              </section>
              <div className="hidden xl:block"><RadarPanel center={center} radiusKm={radiusKm} businesses={candidates} onSelect={openDetails} /></div>
            </div>

            <section className="flex min-w-0 flex-col items-center">
              <div className="mb-3 flex w-full max-w-[530px] items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><span className={`size-2 rounded-full ${isLiveData ? "pulse-dot bg-[#52d6a0]" : "bg-[#6fa8ff]"}`} />{isLiveData ? "Live-Daten" : "Demo-Modus"} · {candidates.length} übrig</div>
                <Button type="button" variant="ghost" size="sm" onClick={undoLast} disabled={!history.length} className="text-muted-foreground"><RotateCcw className="mr-2 size-4" /> Rückgängig</Button>
              </div>
              {currentBusiness ? (
                <BusinessCard business={currentBusiness} prices={prices} onDetails={() => openDetails(currentBusiness)} onDecision={decide} />
              ) : (
                <div className="glass-panel flex min-h-[520px] w-full max-w-[530px] flex-col items-center justify-center rounded-[2rem] p-8 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#d7b56d]/10 text-[#efd28e]"><CheckCircle2 className="size-7" /></div>
                  <h2 className="mt-5 text-2xl font-semibold">Stapel erledigt</h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Ändere Filter oder Radius und starte einen neuen Radar-Durchlauf.</p>
                  <Button className="mt-5" onClick={runSearch}><Radar className="mr-2 size-4" /> Neu suchen</Button>
                </div>
              )}
              <p className="mt-4 text-center text-xs text-muted-foreground">Links überspringen · Rechts speichern · Nach oben priorisieren</p>
            </section>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <section className="glass-panel rounded-[1.75rem] p-4">
                <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-[#d7b56d]" /> Scout-Ausblick</p><Badge variant="outline" className="border-[#52d6a0]/20 bg-[#52d6a0]/8 text-[#75e5b7]">lokal</Badge></div>
                {currentBusiness ? (() => {
                  const score = calculateLeadScore(currentBusiness);
                  const offer = packageForBusiness(currentBusiness, prices);
                  return <div className="mt-4"><div className="flex items-end justify-between"><div><strong className="text-4xl tracking-tight">{score}</strong><span className="text-muted-foreground">/100</span></div><span className="text-sm font-medium text-[#efd28e]">{score >= 75 ? "Starke Chance" : score >= 55 ? "Gute Chance" : "Prüfen"}</span></div><Progress value={score} className="mt-3 h-1.5 [&_[data-slot=progress-indicator]]:bg-[#d7b56d]" /><div className="mt-4 rounded-xl border border-white/[.06] bg-white/[.025] p-3"><p className="text-xs text-muted-foreground">Angebotsvorschlag</p><div className="mt-1 flex items-baseline justify-between gap-3"><strong>{offer.name}</strong><strong className="text-[#efd28e]">{offer.price.toLocaleString("de-DE")} €</strong></div></div><button type="button" onClick={() => openDetails(currentBusiness)} className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[.06] p-3 text-left text-sm hover:bg-white/[.03]"><span>Recherche & Konzept öffnen</span><ChevronRight className="size-4" /></button></div>;
                })() : <p className="mt-4 text-sm text-muted-foreground">Starte einen neuen Suchlauf.</p>}
              </section>

              <section className="glass-panel rounded-[1.75rem] p-4">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold">Tagesziel</p><Target className="size-4 text-[#d7b56d]" /></div>
                <div className="mt-3 flex items-end justify-between"><strong className="text-3xl">{todayLeads}<span className="text-base text-muted-foreground">/{dailyGoal}</span></strong><span className="text-xs text-muted-foreground">Leads heute</span></div>
                <Progress value={Math.min(100, (todayLeads / Math.max(1, dailyGoal)) * 100)} className="mt-3 h-1.5 [&_[data-slot=progress-indicator]]:bg-[#52d6a0]" />
                <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/[.025] p-3"><strong className="block text-lg">{topLeads}</strong><span className="text-xs text-muted-foreground">Top-Leads</span></div><div className="rounded-xl bg-white/[.025] p-3"><strong className="block text-lg">{openTasks}</strong><span className="text-xs text-muted-foreground">Aufgaben</span></div></div>
              </section>
              <div className="xl:hidden"><RadarPanel center={center} radiusKm={radiusKm} businesses={candidates} onSelect={openDetails} /></div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
          <RegionalList
            businesses={regionalBusinesses}
            loading={regionalLoading}
            error={regionalError}
            notice={regionalNotice}
            scope={regionalScope}
            leadIds={leadIds}
            onLoad={() => void loadRegionalList()}
            onOpen={openDetails}
            onSave={(business) => void saveLead(business)}
          />
        </TabsContent>

        <TabsContent value="map" className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_420px]">
            <section className="glass-panel overflow-hidden rounded-[1.75rem]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] p-4"><div><p className="text-xs uppercase tracking-[.16em] text-[#d7b56d]">Kartenansicht</p><h2 className="mt-1 text-xl font-semibold">{center.name} · {radiusKm} km</h2></div><div className="flex gap-2"><Button variant="outline" className="border-white/10" onClick={() => setPassportOpen(true)}><Plane className="mr-2 size-4" /> Passport</Button><Button onClick={runSearch} disabled={searching}><Radar className="mr-2 size-4" /> Aktualisieren</Button></div></div>
              <iframe title={`OpenStreetMap um ${center.name}`} src={mapEmbedUrl(center, radiusKm)} className="h-[62vh] min-h-[470px] w-full bg-[#11151b]" loading="lazy" />
            </section>
            <section className="glass-panel max-h-[74vh] overflow-y-auto rounded-[1.75rem] p-4 scrollbar-thin">
              <div className="sticky top-0 z-10 mb-3 flex items-center justify-between bg-[#11151b]/95 pb-3 backdrop-blur-xl"><div><h2 className="font-semibold">Treffer im Stapel</h2><p className="text-xs text-muted-foreground">{candidates.length} ungeprüft</p></div><Badge variant="outline" className="border-white/10">OpenStreetMap</Badge></div>
              <div className="space-y-2">{candidates.map((business) => <button key={business.id} type="button" onClick={() => openDetails(business)} className="flex w-full items-center gap-3 rounded-2xl border border-white/[.07] bg-white/[.025] p-3 text-left transition hover:bg-white/[.055]"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Building2 className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium">{business.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{business.category} · {business.distanceKm} km</p></div><Badge variant="outline" className={business.website ? "border-[#6fa8ff]/20 text-[#9fc1ff]" : "border-[#52d6a0]/20 text-[#75e5b7]"}>{business.website ? "Website" : "Chance"}</Badge></button>)}</div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d7b56d]">Akquise-Pipeline</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Meine Leads</h2><p className="mt-1 text-sm text-muted-foreground">Vom Fund bis zum Auftrag an einem Ort.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="border-[#52d6a0]/20 text-[#75e5b7]" onClick={() => void loadStarterLeads()} disabled={starterLoading}><Sparkles className="mr-2 size-4" /> {starterLoading ? "Suche Start-Leads…" : "10 Start-Leads"}</Button><Button variant="outline" className="border-white/10" onClick={exportLeads}><Download className="mr-2 size-4" /> CSV exportieren</Button><Button onClick={() => setManualLeadOpen(true)}><Plus className="mr-2 size-4" /> Lead anlegen</Button></div></div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Gespeichert" value={leads.length} icon={<BriefcaseBusiness className="size-4" />} /><StatCard label="Top-Leads" value={topLeads} icon={<Star className="size-4" />} accent /><StatCard label="Offene Aufgaben" value={openTasks} icon={<ListTodo className="size-4" />} /><StatCard label="Potenzial" value={`${potentialValue.toLocaleString("de-DE")} €`} icon={<TrendingUp className="size-4" />} accent /></div>
          <section className="glass-panel mt-5 rounded-[1.75rem] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={leadQuery} onChange={(event) => setLeadQuery(event.target.value)} placeholder="Firma, Branche oder Ort suchen" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 pl-10 pr-3 outline-none focus:border-[#d7b56d]/50" /></label><Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}><SelectTrigger className="h-11 w-full border-white/10 sm:w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alle Status</SelectItem>{leadStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
            <div className="mt-5 space-y-3">{filteredLeads.length ? filteredLeads.map((lead) => <LeadRow key={lead.id} lead={lead} currentUserId={activeUser.id} prices={prices} onOpen={() => openDetails(lead)} onStatus={(status) => patchLead(lead.id, { status })} />) : <div className="py-16 text-center"><BriefcaseBusiness className="mx-auto size-9 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Noch keine passenden Leads</h3><p className="mt-1 text-sm text-muted-foreground">Speichere interessante Unternehmen im Entdecken-Bereich.</p><Button className="mt-4" onClick={() => setView("discover")}><Radar className="mr-2 size-4" /> Unternehmen entdecken</Button></div>}</div>
          </section>
        </TabsContent>

        <TabsContent value="tasks" className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d7b56d]">Nächste Schritte</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Aufgaben</h2><p className="mt-1 text-sm text-muted-foreground">Kein guter Lead geht mehr verloren.</p></div>
          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
            <form onSubmit={submitTask} className="glass-panel rounded-[1.75rem] p-5 lg:sticky lg:top-24"><h3 className="flex items-center gap-2 font-semibold"><Plus className="size-4 text-[#d7b56d]" /> Neue Aufgabe</h3><label className="mt-4 block space-y-2 text-sm"><span className="text-muted-foreground">Was ist zu tun?</span><textarea value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} rows={3} placeholder="Zum Beispiel: Bei Café anrufen" className="w-full resize-none rounded-xl border border-white/10 bg-black/15 p-3 outline-none focus:border-[#d7b56d]/50" /></label><label className="mt-3 block space-y-2 text-sm"><span className="text-muted-foreground">Termin</span><input type="date" value={taskDate} onChange={(event) => setTaskDate(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/50" /></label><Button className="mt-4 w-full" type="submit">Aufgabe speichern</Button></form>
            <section className="glass-panel rounded-[1.75rem] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Deine Liste</h3><Badge variant="outline" className="border-white/10">{openTasks} offen</Badge></div><div className="space-y-2">{tasks.length ? tasks.map((task) => { const lead = task.leadId ? leads.find((item) => item.id === task.leadId) : null; return <button key={task.id} type="button" onClick={() => toggleTask(task)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${task.completed ? "border-white/[.04] bg-white/[.015] opacity-55" : "border-white/[.08] bg-white/[.03] hover:bg-white/[.055]"}`}><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${task.completed ? "border-[#52d6a0] bg-[#52d6a0] text-[#07120d]" : "border-white/20"}`}>{task.completed && <Check className="size-4" />}</span><span className="min-w-0 flex-1"><strong className={`block text-sm ${task.completed ? "line-through" : ""}`}>{task.title}</strong><span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> {formatDate(task.dueAt)}</span>{lead && <span>· {lead.name}</span>}</span></span></button>; }) : <div className="py-14 text-center text-sm text-muted-foreground">Noch keine Aufgaben. Top-Leads erzeugen automatisch eine Aufgabe.</div>}</div></section>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6">
          <TeamWorkspace
            currentUser={activeUser}
            notes={teamNotes}
            messages={teamChatMessages}
            leads={leads}
            live={teamSyncReady}
            onUpdateName={updateTeamName}
            focusLeadId={teamNoteLeadId}
            onFocusLeadChange={setTeamNoteLeadId}
            onCreateNote={createTeamNote}
            onCreateChatMessage={createTeamChatMessage}
            onTogglePin={toggleTeamNotePin}
            onDeleteNote={deleteTeamNote}
            onDeleteChatMessage={deleteTeamChatMessage}
            onClaimLead={claimLead}
            onOpenLead={openDetails}
            onRefresh={refreshSharedState}
          />
        </TabsContent>

        <TabsContent value="pricing" className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6">
          <PricingStudio prices={prices} onPricesChange={setPrices} />
        </TabsContent>

        <TabsContent value="settings" className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d7b56d]">Dein System</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Einstellungen</h2></div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className="glass-panel rounded-[1.75rem] p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Professionelle Preisprofile</h3><p className="mt-1 text-sm text-muted-foreground">Sechs Projektarten, Marktvergleich und Angebots-Kalkulator.</p></div><Euro className="size-5 text-[#d7b56d]" /></div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><InfoTile title="Business Website" text={`ab ${prices.business.toLocaleString("de-DE")} €`} /><InfoTile title="Web-App / SaaS" text={`ab ${prices.webapp.toLocaleString("de-DE")} €`} /></div><Button className="mt-4 w-full" onClick={() => setView("pricing")}><Euro className="mr-2 size-4" /> Preisliste &amp; Kalkulator</Button></section>
            <section className="glass-panel rounded-[1.75rem] p-5"><h3 className="font-semibold">Tagesziel</h3><p className="mt-1 text-sm text-muted-foreground">Ein kleines festes Ziel hält die Akquise konstant.</p><div className="mt-5 flex items-end justify-between"><strong className="text-4xl text-[#efd28e]">{dailyGoal}</strong><span className="text-sm text-muted-foreground">neue Leads pro Tag</span></div><Slider className="mt-5 [&_[data-slot=slider-range]]:bg-[#d7b56d] [&_[data-slot=slider-thumb]]:border-[#d7b56d]" min={1} max={30} step={1} value={[dailyGoal]} onValueChange={(value) => setDailyGoal(value[0] ?? 10)} /></section>
            <section className="glass-panel rounded-[1.75rem] p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">App installieren</h3><p className="mt-1 text-sm text-muted-foreground">WebWorkBalance direkt vom Startbildschirm öffnen.</p></div><Navigation className="size-5 text-[#d7b56d]" /></div><Button variant="outline" className="mt-4 w-full border-white/10" onClick={installApp}>App installieren</Button><p className="mt-3 text-xs leading-5 text-muted-foreground">Falls kein Dialog erscheint: Im Browser-Menü „Zum Home-Bildschirm“ auswählen.</p></section>
            <section className="glass-panel rounded-[1.75rem] p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">Datenstatus</h3>{storageReady ? <Wifi className="size-5 text-[#52d6a0]" /> : <WifiOff className="size-5 text-[#ff8290]" />}</div><p className="mt-2 text-sm text-muted-foreground">{storageReady ? "Leads, Aufgaben und Entscheidungen werden dauerhaft gespeichert." : storageReady === false ? "Die Datenbank ist gerade nicht erreichbar. Live-Suche und Demo bleiben nutzbar." : "Speicher wird geprüft…"}</p><Button variant="outline" className="mt-4 w-full border-white/10" onClick={loadPersistentState}>Status neu prüfen</Button></section>
            <section className="glass-panel rounded-[1.75rem] p-5 md:col-span-2"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-semibold"><Info className="size-4 text-[#d7b56d]" /> Radar-Datenmodus</h3><Badge variant="outline" className="border-[#52d6a0]/25 bg-[#52d6a0]/[.07] text-[#75e5b7]">Direktmodus aktiv</Badge></div><div className="mt-4 grid gap-3 md:grid-cols-3"><InfoTile title="Freie Live-Endpunkte" text="overpass-api.de · private.coffee · maps.mail.ru" /><InfoTile title="Ausfallschutz" text="Lernt den schnellsten Anbieter, wechselt automatisch und wiederholt einmal" /><InfoTile title="Doppelter Cache" text="30 Min. auf dem Gerät plus gemeinsamer Team-Cache" /></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Die Firmensuche läuft nach deinem Klick direkt vom Gerät zu OpenStreetMap. Dadurch greift nicht mehr die kurze Server-Wartezeit der veröffentlichten App. Große Kreise werden als kleine Teilgebiete geladen; sie liefern verlässliche Arbeitsstapel, sind aber keine vollständige amtliche Firmenliste. Für einen Anbieter mit festem Kontingent lässt sich später optional Geoapify (kostenloser API-Key) ergänzen.</p><div className="mt-4 flex flex-wrap gap-2"><a href="https://www.geoapify.com/pricing/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-medium text-muted-foreground transition hover:bg-white/[.06] hover:text-foreground"><ExternalLink className="mr-2 size-3.5" /> Geoapify-Free-Tarif</a><a href="https://wiki.openstreetmap.org/wiki/Overpass_API" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-medium text-muted-foreground transition hover:bg-white/[.06] hover:text-foreground"><ExternalLink className="mr-2 size-3.5" /> OSM-Endpunkte</a></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Ein fehlender Website-Eintrag ist ein Signal, kein Beweis. Prüfe den Betrieb vor Kontaktaufnahme. Kartendaten © OpenStreetMap-Mitwirkende, ODbL.</p></section>
          </div>
        </TabsContent>

        <TabsList className="wwb-bottom-nav fixed z-40 h-auto justify-between rounded-[1.4rem] border border-white/10 bg-[#11151b]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur-2xl">
          <NavTab value="today" icon={<LayoutDashboard />} label="Heute" />
          <NavTab value="discover" icon={<Radar />} label="Entdecken" />
          <NavTab value="regional" icon={<List />} label="Region" />
          <NavTab value="map" icon={<MapIcon />} label="Karte" />
          <NavTab value="leads" icon={<BriefcaseBusiness />} label="Leads" badge={leads.length} />
          <NavTab value="team" icon={<UsersRound />} label="Team" badge={teamNotes.filter((note) => note.kind === "Blocker").length} />
          <NavTab value="tasks" icon={<ListTodo />} label="Aufgaben" badge={openTasks} />
        </TabsList>
      </Tabs>

      <Dialog open={passportOpen} onOpenChange={setPassportOpen}>
        <DialogContent className="border-white/10 bg-[#10141a] sm:max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plane className="size-5 text-[#d7b56d]" /> Passport-Modus</DialogTitle><DialogDescription>Springe in jede Stadt oder jedes Dorf in Deutschland und starte dort deinen Radar.</DialogDescription></DialogHeader>
          <form onSubmit={searchPassport} className="flex flex-col gap-2 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus value={passportQuery} onChange={(event) => setPassportQuery(event.target.value)} placeholder="Stadt, Dorf oder Postleitzahl" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 pl-10 pr-3 outline-none focus:border-[#d7b56d]/50" /></label><Button type="submit" disabled={passportSearching}>{passportSearching ? "Sucht…" : "Suchen"}</Button></form>
          {!passportResults.length && <div className="flex flex-wrap gap-2">{[
            { name: "Nürnberg", lat: 49.4521, lon: 11.0767, passport: true },
            { name: "Fürth", lat: 49.4771, lon: 10.9887, passport: true },
            { name: "Erlangen", lat: 49.5897, lon: 11.0119, passport: true },
            { name: "München", lat: 48.1374, lon: 11.5755, passport: true },
          ].map((place) => <Button key={place.name} type="button" variant="outline" size="sm" className="border-white/10" onClick={() => choosePlace(place)}>{place.name}</Button>)}</div>}
          {passportResults.length > 0 && <div className="max-h-72 space-y-2 overflow-y-auto scrollbar-thin">{passportResults.map((result) => <button key={result.id} type="button" onClick={() => choosePlace({ name: result.name.split(",").slice(0, 2).join(","), lat: result.lat, lon: result.lon, passport: true })} className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left hover:bg-white/[.055]"><MapPin className="size-4 shrink-0 text-[#d7b56d]" /><span className="min-w-0 flex-1 truncate text-sm">{result.name}</span><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div>}
          {recentPlaces.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zuletzt verwendet</p><div className="flex flex-wrap gap-2">{recentPlaces.map((place) => <button type="button" key={`${place.lat}-${place.lon}`} onClick={() => choosePlace(place)} className="rounded-lg bg-white/[.04] px-3 py-2 text-xs hover:bg-white/[.07]">{place.name}</button>)}</div></div>}
          <p className="text-[11px] leading-4 text-muted-foreground">Ortssuche: OpenStreetMap Nominatim. Nur manuell ausgelöste Suchanfragen.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={teamInboxOpen} onOpenChange={(open) => { if (!open) dismissTeamInbox(false); }}>
        <DialogContent className="wwb-team-inbox-dialog border-[#d7b56d]/20 bg-[#10141a] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#d7b56d]/12 text-[#efd28e]"><BellRing className="size-5" /></span><span>Neue Team-Notizen</span></DialogTitle>
            <DialogDescription>{teamInboxCount === 1 ? "Eine neue Notiz wartet auf dich." : `${teamInboxCount} neue Team-Notizen warten auf dich.`} Sie werden automatisch mit eurem gemeinsamen Arbeitsraum abgeglichen.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            {teamInboxNotes.map((note) => <article key={note.id} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{note.authorName}</strong><Badge variant="outline" className="h-5 border-white/10 px-2 text-[11px] text-muted-foreground">{note.kind}</Badge>{note.pinned && <Badge className="h-5 bg-[#d7b56d]/15 px-2 text-[11px] text-[#efd28e]">Wichtig</Badge>}<span className="text-[11px] text-muted-foreground">{formatTeamNoteTime(note.updatedAt)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{note.body}</p>{note.leadId && <p className="mt-2 text-xs text-[#d7b56d]">Mit einem Lead verknüpft · im Team-Bereich öffnen</p>}</article>)}
          </div>
          {teamInboxCount > teamInboxNotes.length && <p className="text-xs text-muted-foreground">Weitere {teamInboxCount - teamInboxNotes.length} Einträge findest du im Team-Bereich.</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="border-white/10" onClick={() => dismissTeamInbox(false)}>Später erinnern</Button><Button type="button" onClick={openTeamFromInbox}><UsersRound className="mr-2 size-4" /> Team öffnen</Button></div>
        </DialogContent>
      </Dialog>

      <ManualLeadDialog open={manualLeadOpen} onOpenChange={setManualLeadOpen} center={center} onCreate={async (business, priority) => { await saveLead(business, priority); setView("leads"); }} />
      <QuickMenu open={quickMenuOpen} onOpenChange={setQuickMenuOpen} leads={leads} onNavigate={navigate} onNewLead={() => setManualLeadOpen(true)} onLoadStarter={() => void loadStarterLeads()} onPassport={() => setPassportOpen(true)} onOpenLead={openDetails} />
      <DetailSheet open={detailOpen} onOpenChange={setDetailOpen} business={selectedBusiness} lead={selectedLead} prices={prices} currentUser={activeUser} onSaveLead={async (business, priority) => { await saveLead(business, priority); }} onPatchLead={patchLead} onClaimLead={claimLead} onOpenTeamNote={openTeamNote} onAddTask={addTask} />
      <Toaster position="top-center" richColors closeButton />
    </main>
  );
}

function NavTab({ value, icon, label, badge }: { value: AppView; icon: ReactNode; label: string; badge?: number }) {
  return <TabsTrigger value={value} className="relative h-auto min-w-0 flex-col gap-1 rounded-xl px-2 py-2 text-[11px] data-[state=active]:bg-[#d7b56d]/12 data-[state=active]:text-[#efd28e] sm:flex-row sm:px-4 sm:text-sm [&_svg]:size-5">{icon}<span className="max-w-full truncate">{label}</span>{Boolean(badge) && <span className="absolute right-1 top-0 flex min-w-4 items-center justify-center rounded-full bg-[#d7b56d] px-1 text-[10px] font-bold text-[#080b0f] sm:-right-1">{(badge ?? 0) > 99 ? "99+" : badge}</span>}</TabsTrigger>;
}

function StatCard({ label, value, icon, accent = false }: { label: string; value: string | number; icon: ReactNode; accent?: boolean }) {
  return <div className="glass-panel rounded-2xl p-4"><div className={`flex size-8 items-center justify-center rounded-lg ${accent ? "bg-[#d7b56d]/10 text-[#efd28e]" : "bg-white/[.04] text-muted-foreground"}`}>{icon}</div><strong className={`mt-3 block text-xl sm:text-2xl ${accent ? "text-[#efd28e]" : ""}`}>{value}</strong><span className="mt-1 block text-xs text-muted-foreground">{label}</span></div>;
}

function InfoTile({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span></div>;
}

function LeadRow({ lead, currentUserId, prices, onOpen, onStatus }: { lead: StoredLead; currentUserId: string; prices: PriceSettings; onOpen: () => void; onStatus: (status: LeadStatus) => void }) {
  const offer = packageForBusiness(lead, prices);
  const claimedByOther = Boolean(lead.claimedById && lead.claimedById !== currentUserId);
  return <article className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4 transition hover:bg-white/[.045]"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Building2 className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{lead.name}</h3>{lead.priority && <Star className="size-4 fill-[#d7b56d] text-[#d7b56d]" />}{lead.claimedByName && <Badge variant="outline" className="h-5 border-[#6fa8ff]/20 bg-[#6fa8ff]/[.06] px-2 text-[11px] text-[#9fc1ff]"><UserCheck className="mr-1 size-3" /> {lead.claimedByName}</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{lead.category} · {lead.address}</p><div className="mt-2 flex flex-wrap gap-2"><span className="text-xs text-[#75e5b7]">Score {lead.score}</span><span className="text-xs text-muted-foreground">{offer.name} · {offer.price.toLocaleString("de-DE")} €</span></div></div></button><div className="flex flex-wrap items-center gap-2 lg:justify-end"><Select value={lead.status} disabled={claimedByOther} onValueChange={(value) => onStatus(value as LeadStatus)}><SelectTrigger className="h-9 w-48 border-white/10 text-xs"><SelectValue /></SelectTrigger><SelectContent>{leadStatuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select>{lead.phone && <a href={`tel:${lead.phone}`} aria-label={`${lead.name} anrufen`} className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]"><Phone className="size-4" /></a>}{lead.email && <button type="button" onClick={() => { navigator.clipboard.writeText(lead.email!); toast.success("E-Mail kopiert"); }} aria-label="E-Mail kopieren" className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]"><Mail className="size-4" /></button>}<a href={googleMapsUrl(lead)} target="_blank" rel="noreferrer" aria-label="Google Maps öffnen" className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]"><ExternalLink className="size-4" /></a><button type="button" onClick={onOpen} className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]" aria-label="Lead öffnen"><ChevronRight className="size-4" /></button></div></div>{lead.followUpAt && <div className="mt-3 flex items-center gap-2 border-t border-white/[.06] pt-3 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Wiedervorlage {formatDate(lead.followUpAt)} · {lead.nextAction}</div>}</article>;
}
