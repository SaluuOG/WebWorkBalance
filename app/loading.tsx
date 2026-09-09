/* eslint-disable @next/next/no-img-element -- the tiny local splash logo needs no optimizer. */

export default function Loading() {
  return (
    <main className="wwb-splash flex min-h-screen flex-col items-center justify-center px-6 text-center text-foreground">
      <div className="wwb-splash-icon relative">
        <div className="absolute inset-2 rounded-[2rem] bg-[#d7b56d]/20 blur-3xl" />
        <img src="/icon-512.png" alt="" className="relative size-32 rounded-[2.2rem] shadow-[0_25px_80px_rgba(215,181,109,.18)] sm:size-40" />
      </div>
      <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl"><span className="gold-text">WebWork</span>Balance</h1>
      <p className="mt-2 text-sm font-medium tracking-[.16em] text-[#d7b56d]">made by Salu &amp; Sula</p>
      <div className="mt-8 h-1 w-36 overflow-hidden rounded-full bg-white/[.07]"><span className="wwb-loading-bar block h-full rounded-full bg-gradient-to-r from-[#a77b32] via-[#fff1c8] to-[#d7b56d]" /></div>
      <p className="mt-4 text-xs text-muted-foreground">Dein Business-Radar wird vorbereitet</p>
    </main>
  );
}
