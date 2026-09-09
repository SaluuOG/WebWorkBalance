"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categories, type Business, type SearchCenter } from "@/lib/webworkbalance";

export function ManualLeadDialog({
  open,
  onOpenChange,
  center,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: SearchCenter;
  onCreate: (business: Business, priority?: boolean) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [categoryKey, setCategoryKey] = useState("professional");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [priority, setPriority] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const resetTimer = window.setTimeout(() => {
      setName("");
      setCategoryKey("professional");
      setAddress("");
      setPhone("");
      setEmail("");
      setWebsite("");
      setPriority(false);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const id = `manual-${crypto.randomUUID?.() ?? Date.now()}`;
    const category = categories.find((item) => item.value === categoryKey)?.label ?? "Unternehmen";
    const normalizedWebsite = website.trim()
      ? /^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`
      : null;
    const business: Business = {
      id,
      sourceId: id,
      source: "Manuell",
      sourceUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name.trim()} ${address.trim()}`)}`,
      name: name.trim(),
      category,
      categoryKey,
      lat: center.lat,
      lon: center.lon,
      address: address.trim() || center.name,
      phone: phone.trim() || null,
      email: email.trim() || null,
      website: normalizedWebsite,
      websiteStatus: normalizedWebsite ? "exists" : "likely_missing",
      openingHours: null,
      socialUrl: null,
      imageUrl: null,
      imageAttribution: null,
      distanceKm: 0,
      fetchedAt: new Date().toISOString(),
    };
    await onCreate(business, priority);
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#10141a] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-[#d7b56d]" /> Lead manuell anlegen</DialogTitle>
          <DialogDescription>Ideal für Empfehlungen, Instagram-Funde, Visitenkarten oder Firmen, die der Radar nicht erfasst.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm sm:col-span-2"><span className="text-muted-foreground">Firmenname *</span><div className="relative"><Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name des Unternehmens" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 pl-10 pr-3 outline-none focus:border-[#d7b56d]/50" /></div></label>
            <label className="space-y-2 text-sm"><span className="text-muted-foreground">Branche</span><Select value={categoryKey} onValueChange={setCategoryKey}><SelectTrigger className="h-11 w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{categories.filter((item) => item.value !== "all").map((item) => <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm"><span className="text-muted-foreground">Ort / Adresse</span><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder={center.name} className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/50" /></label>
            <label className="space-y-2 text-sm"><span className="text-muted-foreground">Telefon</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0911 …" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/50" /></label>
            <label className="space-y-2 text-sm"><span className="text-muted-foreground">E-Mail</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="kontakt@firma.de" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/50" /></label>
            <label className="space-y-2 text-sm sm:col-span-2"><span className="text-muted-foreground">Website, falls vorhanden</span><input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="www.firma.de" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/50" /></label>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-sm"><span className="flex items-center gap-3"><Star className={`size-5 ${priority ? "fill-[#d7b56d] text-[#d7b56d]" : "text-muted-foreground"}`} /><span><strong className="block">Direkt priorisieren</strong><span className="text-xs text-muted-foreground">Erzeugt automatisch eine Aufgabe für morgen</span></span></span><Switch checked={priority} onCheckedChange={setPriority} /></label>
          <div className="grid grid-cols-2 gap-3"><Button type="button" variant="outline" className="border-white/10" onClick={() => onOpenChange(false)}>Abbrechen</Button><Button type="submit" disabled={saving || !name.trim()}>{saving ? "Speichert…" : "Lead speichern"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
