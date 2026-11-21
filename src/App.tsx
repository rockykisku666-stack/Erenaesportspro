/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ExternalLink,
  Copy,
  Check,
  Trophy,
  Users,
  Video,
  Share2,
  ChevronRight,
  ShieldCheck,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  Scale,
  Lock,
} from 'lucide-react';

const OFFICIAL_APP_URL = 'https://erenaesportsofficial.netlify.app/';
const HERO_ARENA_IMAGE = '/src/assets/images/erena_esports_arena_hero_1795235879815.jpg';
const HIGHLIGHT_CLUTCH_IMAGE = '/src/assets/images/highlight_final_circle_clutch_1795235879747.jpg';
const CREST_LOGO_IMAGE = '/src/assets/images/erena_esports_crest_logo_1795235879195.jpg';

const UPLOADED_VIDEO_5K_FINAL = '/assets/aistudio/_360p__2__ee658300.mp4';
const UPLOADED_VIDEO_1V3_CLUTCH = '/assets/aistudio/_360p__5a7dbd32.mp4';

interface HighlightClip {
  id: string;
  title: string;
  tournament: string;
  player: string;
  squad: string;
  views: string;
  duration: string;
  category: 'all' | 'clutch' | 'finals';
  description: string;
  keyMoment: string;
  videoUrl: string;
  posterUrl?: string;
}

const HIGHLIGHT_CLIPS: HighlightClip[] = [
  {
    id: 'clip-1',
    title: 'Booyah Fight in 5K Final — Final Safe Zone Gloo Wall & Nade Push',
    tournament: 'erena 5K Grand Finals · GRP 4',
    player: 'IND_SlayerFF',
    squad: 'TL E-Sports Slot 7',
    views: '54.2K views',
    duration: '00:53',
    category: 'finals',
    description:
      'Intense final shrinking zone battle in the 5K Grand Final with rapid Gloo Wall cover, coordinated grenade pressure, and a Quadra Takedown fight.',
    keyMoment: '00:23 — Quadra Takedown in Final Safe Zone',
    videoUrl: UPLOADED_VIDEO_5K_FINAL,
    posterUrl: HERO_ARENA_IMAGE,
  },
  {
    id: 'clip-2',
    title: '1v3 Clutch in 10 Seconds — Tower Top Team Wipeout',
    tournament: 'erena Pro Scrims Series',
    player: 'CR7_Rusher',
    squad: 'Team Apex',
    views: '68.9K views',
    duration: '00:19',
    category: 'clutch',
    description:
      'Aggressive tower zipline push into a three-man defense, using close-quarters shotgun bursts and fast Gloo Wall shielding to secure an instant Team Wipeout.',
    keyMoment: '00:16 — 1v3 Tower Top Team Wipeout',
    videoUrl: UPLOADED_VIDEO_1V3_CLUTCH,
    posterUrl: HIGHLIGHT_CLUTCH_IMAGE,
  },
];

interface TournamentSlot {
  id: string;
  title: string;
  mode: string;
  map: string;
  entryType: string;
  prizePool: string;
  timeIST: string;
  spotsFilled: number;
  totalSpots: number;
}

const UPCOMING_TOURNAMENTS: TournamentSlot[] = [
  {
    id: 'tour-1',
    title: 'erena Pro Squad Championship — Evening Split',
    mode: 'Squad (4v4 Battle Royale)',
    map: 'Bermuda Remastered',
    entryType: 'Open Qualifier',
    prizePool: '₹10,000 Prize Pool',
    timeIST: 'Tonight · 8:00 PM IST',
    spotsFilled: 44,
    totalSpots: 48,
  },
  {
    id: 'tour-2',
    title: 'Clash Squad 4v4 Tactical Knockout Cup',
    mode: 'Clash Squad Custom Room',
    map: 'Kalahari / Purgatory',
    entryType: 'Instant Bracket',
    prizePool: '₹5,000 Prize Pool',
    timeIST: 'Tonight · 9:30 PM IST',
    spotsFilled: 14,
    totalSpots: 16,
  },
  {
    id: 'tour-3',
    title: 'Solo Survival Rush — Fast Custom Lobby',
    mode: 'Solo Battle Royale',
    map: 'Purgatory',
    entryType: 'Verified Players',
    prizePool: '₹2,500 Prize Pool',
    timeIST: 'Tomorrow · 4:00 PM IST',
    spotsFilled: 39,
    totalSpots: 48,
  },
];

export default function App() {
  const [activeClipId, setActiveClipId] = useState<string>(HIGHLIGHT_CLIPS[0].id);
  const [clipFilter, setClipFilter] = useState<'all' | 'clutch' | 'finals'>('all');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [copiedAdLink, setCopiedAdLink] = useState<boolean>(false);
  const [copiedAppLink, setCopiedAppLink] = useState<boolean>(false);
  const [communityJoined, setCommunityJoined] = useState<boolean>(false);
  const [inGameId, setInGameId] = useState<string>('');
  const [roleChoice, setRoleChoice] = useState<string>('Rusher');
  const [formError, setFormError] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeLegalTab, setActiveLegalTab] = useState<'terms' | 'privacy' | 'fairplay'>('terms');

  const communitySectionRef = useRef<HTMLElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  const activeClip =
    HIGHLIGHT_CLIPS.find((c) => c.id === activeClipId) || HIGHLIGHT_CLIPS[0];

  const filteredClips =
    clipFilter === 'all'
      ? HIGHLIGHT_CLIPS
      : HIGHLIGHT_CLIPS.filter((c) => c.category === clipFilter);

  // Check URL query or hash on mount so Instagram Ad links (?view=community or #community-hub) jump smoothly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'community' || window.location.hash === '#community-hub') {
      setTimeout(() => {
        communitySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  }, []);

  // Sync video playback whenever activeClipId changes
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video) return;
    video.load();
    setPreviewProgress(0);
    if (isPlayingPreview) {
      video.play().catch(() => {
        setIsPlayingPreview(false);
      });
    }
  }, [activeClipId]);

  const toggleVideoPlay = () => {
    const video = videoPlayerRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => setIsPlayingPreview(false));
    } else {
      video.pause();
      setIsPlayingPreview(false);
    }
  };

  const toggleVideoMute = () => {
    const video = videoPlayerRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video) {
      video.muted = nextMuted;
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = videoPlayerRef.current;
    if (!video || !video.duration) return;
    setPreviewProgress((video.currentTime / video.duration) * 100);
  };

  const handleButtonAClick = () => {
    communitySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const video = videoPlayerRef.current;
      if (video && video.paused) {
        video
          .play()
          .then(() => setIsPlayingPreview(true))
          .catch(() => {});
      }
    }, 400);
  };

  const getInstagramAdUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?view=community#community-hub`;
  };

  const handleCopyAdLink = async () => {
    const url = getInstagramAdUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedAdLink(true);
      setTimeout(() => setCopiedAdLink(false), 2500);
    } catch {
      setCopiedAdLink(true);
      setTimeout(() => setCopiedAdLink(false), 2500);
    }
  };

  const handleCopyOriginalLink = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_APP_URL);
      setCopiedAppLink(true);
      setTimeout(() => setCopiedAppLink(false), 2500);
    } catch {
      setCopiedAppLink(true);
      setTimeout(() => setCopiedAppLink(false), 2500);
    }
  };

  const handleCommunityRosterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inGameId.trim();
    if (trimmed.length < 3) {
      setFormError('Please enter your Free Fire UID or In-Game Name (min 3 characters).');
      return;
    }
    setFormError('');
    setCommunityJoined(true);
  };

  const markImageError = (key: string) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0B0C0E] text-[#F4F4F5] flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-4 sm:gap-8 */}
      <header className="sticky top-0 z-40 w-full bg-[#0B0C0E]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="font-display text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            erena Esports
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <a
              href="#bio-link-hub"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Bio Link
            </a>
            <a
              href="#community-hub"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Highlights
            </a>
            <a
              href="#tournaments"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Tournaments
            </a>
            <a
              href="#ad-campaign-kit"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ad Link
            </a>
            <a
              href="#terms-and-conditions"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Terms
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <a
              href={OFFICIAL_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-[#F59E0B] hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Play Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* SECTION 1: HERO & OFFICIAL BIO-LINK HUB (Button A & Button B) */}
        <section
          id="bio-link-hub"
          className="relative overflow-hidden border-b border-zinc-800/80 pb-10 lg:pb-16 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.14),_transparent_55%)]"
        >
          {/* Attractive Widescreen Esports Championship Top Banner */}
          <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden border-b border-zinc-800/90 bg-zinc-950">
            {!imageErrors['top-banner'] ? (
              <img
                src={HERO_ARENA_IMAGE}
                alt="erena Esports Free Fire Pro Tournament Banner"
                referrerPolicy="no-referrer"
                onError={() => markImageError('top-banner')}
                className="w-full h-full object-cover object-center scale-105 brightness-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-amber-950/30 to-zinc-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C0E]/90 via-transparent to-[#0B0C0E]/90" />

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-6 sm:pb-8">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-[#F59E0B] mb-1.5">
                <span>erena Esports Official Arena</span>
                <span aria-hidden="true">·</span>
                <span>Daily Custom Rooms &amp; Pro Scrims</span>
                <span aria-hidden="true">·</span>
                <span>Season 2026</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none">
                  INDIA&apos;S PREMIER FREE FIRE CUSTOM TOURNAMENT HUB
                </h2>
                <a
                  href={OFFICIAL_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Enter Live Lobby</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 lg:pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Column (5 cols): Bio-Link Card designed for Instagram Bio & Ads landing */}
              <div className="lg:col-span-5 min-w-0 flex flex-col justify-between bg-[#13161A] border border-zinc-700/80 rounded-2xl p-5 sm:p-8 shadow-2xl">
                <div>
                  {/* Profile Header inside Bio Card */}
                  <div className="flex items-center gap-4 mb-6 pb-5 border-b border-zinc-800/90">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#F59E0B]/60 bg-zinc-900 shrink-0 flex items-center justify-center">
                      {!imageErrors['crest'] ? (
                        <img
                          src={CREST_LOGO_IMAGE}
                          alt="erena Esports Official Crest"
                          referrerPolicy="no-referrer"
                          onError={() => markImageError('crest')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="w-8 h-8 text-[#F59E0B]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                          erena Esports
                        </h2>
                        <ShieldCheck
                          className="w-4 h-4 text-[#F59E0B] shrink-0"
                          aria-label="Verified Platform"
                        />
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        @erenaesports.official · Skill-Based Esports Community
                      </p>
                    </div>
                  </div>

                  {/* Required Headline: "Free Fire Pro Tournament Platform" */}
                  <div className="mb-6">
                    <p className="text-xs font-mono-tabular text-[#F59E0B] mb-1.5">
                      Official Bio Link · Season 2026
                    </p>
                    <h1
                      className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.06]"
                      style={{ textWrap: 'balance' }}
                    >
                      Free Fire Pro Tournament Platform
                    </h1>
                    <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                      Watch real tournament clutches from our 5K Final and 1v3 custom lobbies, join the verified player roster, and enter live tournaments on the official erena Esports app.
                    </p>
                  </div>

                  {/* TWO CORE BIO BUTTONS AS REQUESTED */}
                  <div className="space-y-3.5 my-6">
                    {/* BUTTON A: Content-Oriented for Instagram Ads Approval */}
                    <button
                      type="button"
                      onClick={handleButtonAClick}
                      className="w-full group relative flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/95 border border-zinc-700 hover:border-[#F59E0B] text-left transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-white truncate">
                            Watch Highlights / Join Community
                          </div>
                          <div className="text-xs text-zinc-400 truncate mt-0.5">
                            Step 1 · Watch 5K Final &amp; 1v3 Clutch videos + Squad Hub
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-[#F59E0B] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    {/* BUTTON B: Direct Link to Original erena Esports App */}
                    <a
                      href={OFFICIAL_APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full group flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 font-semibold transition-all duration-150"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-zinc-950/15 flex items-center justify-center text-zinc-950 shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-bold text-zinc-950 truncate">
                            Play Now / Enter Tournament
                          </div>
                          <div className="text-xs text-zinc-900/85 font-medium truncate mt-0.5">
                            Step 2 · Open official erena Esports tournament app
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-zinc-950 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Unboxed Metadata Footer inside Bio Card */}
                <div className="pt-4 border-t border-zinc-800/90 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 font-mono-tabular">
                  <span>14,800+ Active Players</span>
                  <span aria-hidden="true">·</span>
                  <span>100% Skill-Based</span>
                  <span aria-hidden="true">·</span>
                  <a href="#terms-and-conditions" className="text-zinc-300 hover:text-[#F59E0B] underline">
                    Terms &amp; Policy
                  </a>
                </div>
              </div>

              {/* Right Column (7 cols): Arena Showcase + Live Highlight Reel Preview Card */}
              <div className="lg:col-span-7 min-w-0 flex flex-col justify-between rounded-2xl overflow-hidden border border-zinc-800 bg-[#13161A] relative min-h-[440px]">
                <div className="relative flex-1 min-h-[340px] bg-zinc-900">
                  {!imageErrors['hero'] ? (
                    <img
                      src={HIGHLIGHT_CLUTCH_IMAGE}
                      alt="erena Esports Championship Action Banner"
                      referrerPolicy="no-referrer"
                      onError={() => markImageError('hero')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 text-center">
                      <div>
                        <Trophy className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
                        <p className="font-display text-2xl text-white">
                          erena Esports Championship Arena
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Measured Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/65 to-black/25" />

                  {/* Arena Overlay Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-mono-tabular mb-2">
                      <span>2 New Gameplay Highlights Uploaded</span>
                      <span aria-hidden="true">·</span>
                      <span>5K Grand Final &amp; 1v3 Tower Clutch</span>
                      <span aria-hidden="true">·</span>
                      <span>Verified Custom Rooms</span>
                    </div>
                    <h2
                      className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight max-w-xl"
                      style={{ textWrap: 'balance' }}
                    >
                      Watch Real Free Fire Tournament Gameplay Before You Drop In.
                    </h2>
                    <p className="text-sm text-zinc-300 mt-2 max-w-xl">
                      Check out our latest community gameplay clips below—including the 5K Final Safe Zone fight and a 10-second 1v3 clutch—then click Play Now to enter the official tournament app.
                    </p>

                    {/* Quick Jump Buttons to Uploaded Videos */}
                    <div className="mt-5 flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClipId('clip-1');
                          handleButtonAClick();
                        }}
                        className="px-3.5 py-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#F59E0B] fill-current shrink-0" />
                        <span className="truncate">Watch: Booyah Fight in 5K Final</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClipId('clip-2');
                          handleButtonAClick();
                        }}
                        className="px-3.5 py-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#F59E0B] fill-current shrink-0" />
                        <span className="truncate">Watch: 1v3 Clutch in 10 Seconds</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar inside Right Column: Quick Funnel Status & Share */}
                <div className="p-5 sm:px-8 bg-[#13161A] border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-zinc-400">
                    <span className="text-white font-semibold">Official App Destination:</span>{' '}
                    <a
                      href={OFFICIAL_APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F59E0B] hover:underline font-mono-tabular break-all"
                    >
                      {OFFICIAL_APP_URL}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopyAdLink}
                      className="px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedAdLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Instagram Ad URL Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Copy Button A Ad Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-width 4-Column Quantitative Proof Row below Hero Split */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#13161A] border border-zinc-800/90 rounded-xl p-5">
                <div className="font-display text-3xl font-bold text-white font-mono-tabular">
                  14,820+
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Registered Free Fire Contenders Across India
                </div>
              </div>
              <div className="bg-[#13161A] border border-zinc-800/90 rounded-xl p-5">
                <div className="font-display text-3xl font-bold text-[#F59E0B] font-mono-tabular">
                  320+ Matches
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Hosted Monthly in Squad, Duo &amp; Solo Custom Rooms
                </div>
              </div>
              <div className="bg-[#13161A] border border-zinc-800/90 rounded-xl p-5">
                <div className="font-display text-3xl font-bold text-white font-mono-tabular">
                  10 Min
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Room ID &amp; Password Dispatch Prior to Match Start
                </div>
              </div>
              <div className="bg-[#13161A] border border-zinc-800/90 rounded-xl p-5">
                <div className="font-display text-3xl font-bold text-white font-mono-tabular">
                  100% Fair Play
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Skill-Based Esports · Anti-Cheat Spectator Verified
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: BUTTON A DESTINATION — WATCH HIGHLIGHTS & JOIN COMMUNITY HUB */}
        <section
          id="community-hub"
          ref={communitySectionRef}
          className="py-12 lg:py-20 border-b border-zinc-800/80 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="min-w-0">
                <p className="text-xs font-mono-tabular text-[#F59E0B] mb-2">
                  01. Community &amp; Match Highlights Hub (Button A Destination)
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Official Tournament Gameplay Highlights &amp; Squad Replays
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
                  Watch real recorded Free Fire custom room finals and clutch moments from erena Esports tournaments below, or switch between clips anytime.
                </p>
              </div>

              {/* Interactive Filter Controls (Functional Segmented Buttons) */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#13161A] border border-zinc-800 rounded-lg self-start max-w-full">
                {(
                  [
                    { key: 'all', label: 'All Videos (2)' },
                    { key: 'finals', label: '5K Grand Final' },
                    { key: 'clutch', label: '1v3 Clutch' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setClipFilter(tab.key);
                      const matching =
                        tab.key === 'all'
                          ? HIGHLIGHT_CLIPS
                          : HIGHLIGHT_CLIPS.filter((c) => c.category === tab.key);
                      if (matching.length > 0) {
                        setActiveClipId(matching[0].id);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      clipFilter === tab.key
                        ? 'bg-[#F59E0B] text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlight Theatre + Clip Selector Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 Cols: REAL HTML5 Video Player with the User's Uploaded Highlight Videos */}
              <div className="lg:col-span-7 min-w-0 bg-[#13161A] border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoPlayerRef}
                    src={activeClip.videoUrl}
                    poster={activeClip.posterUrl}
                    controls
                    playsInline
                    muted={isMuted}
                    onPlay={() => setIsPlayingPreview(true)}
                    onPause={() => setIsPlayingPreview(false)}
                    onTimeUpdate={handleVideoTimeUpdate}
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Top Metadata Overlay Badge (Non-blocking pointer-events-none) */}
                  <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between gap-4 text-xs text-zinc-200 font-mono-tabular bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="truncate">
                      {activeClip.tournament} · {activeClip.player} ({activeClip.squad})
                    </span>
                    <span className="text-[#F59E0B] shrink-0">{activeClip.duration}</span>
                  </div>
                </div>

                {/* Custom Quick Control Strip Below Video */}
                <div className="px-6 py-3.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleVideoPlay}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {isPlayingPreview ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause Video</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Highlight Video</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleVideoMute}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          <span>Unmute Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Audio On</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-amber-300 font-mono-tabular">
                    {activeClip.keyMoment}
                  </div>
                </div>

                {/* Active Clip Details & Conversion Bridge to Button B */}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono-tabular mb-2">
                    <span>Player: {activeClip.player}</span>
                    <span aria-hidden="true">·</span>
                    <span>Squad: {activeClip.squad}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeClip.views}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {activeClip.title}
                  </h3>
                  <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    {activeClip.description}
                  </p>

                  {/* Funnel Step 2 Conversion Bridge inside Community Hub */}
                  <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Ready to compete in the next custom room?
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Join today&apos;s lobby directly on the official erena Esports app.
                      </div>
                    </div>
                    <a
                      href={OFFICIAL_APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
                    >
                      <span>Play Now / Enter Tournament</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Both Uploaded Videos Playlist + Quick Community Roster Registration */}
              <div className="lg:col-span-5 min-w-0 space-y-6">
                {/* Clip Selection List with Live Video Previews */}
                <div className="bg-[#13161A] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono-tabular text-zinc-400">
                      Uploaded Tournament Highlights ({filteredClips.length} videos)
                    </span>
                    <span className="text-xs font-mono-tabular text-[#F59E0B]">
                      Click to Watch
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredClips.map((clip, idx) => {
                      const isSelected = clip.id === activeClip.id;
                      return (
                        <button
                          key={clip.id}
                          type="button"
                          onClick={() => {
                            setActiveClipId(clip.id);
                            setIsPlayingPreview(true);
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                            isSelected
                              ? 'bg-zinc-900 border-[#F59E0B]'
                              : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          {/* Mini Video Thumbnail Preview */}
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0 relative">
                            <video
                              src={clip.videoUrl}
                              muted
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#F59E0B] text-zinc-950'
                                    : 'bg-zinc-900/80 text-white'
                                }`}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-mono-tabular text-zinc-400">
                              0{idx + 1}. {clip.tournament} · {clip.duration}
                            </div>
                            <div className="text-sm font-semibold text-white mt-0.5 line-clamp-1">
                              {clip.title}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1">
                              {clip.player} · {clip.views}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Community Squad Finder / Player Tag Check-In */}
                <div className="bg-[#13161A] border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Users className="w-5 h-5 text-[#F59E0B]" />
                    <h3 className="font-display text-2xl font-bold text-white">
                      Join the erena Free Fire Community Roster
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Drop your Free Fire In-Game Name (IGN) or UID to get listed on the community squad finder and unlock direct tournament entry.
                  </p>

                  {!communityJoined ? (
                    <form onSubmit={handleCommunityRosterSubmit} className="space-y-3.5">
                      <div>
                        <label
                          htmlFor="ff-ign-input"
                          className="block text-xs font-medium text-zinc-300 mb-1.5"
                        >
                          Free Fire IGN or Player UID
                        </label>
                        <input
                          id="ff-ign-input"
                          type="text"
                          value={inGameId}
                          onChange={(e) => setInGameId(e.target.value)}
                          placeholder="e.g. IND_ViperFF or 248910492"
                          className="w-full px-3.5 py-2.5 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F59E0B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Primary Squad Role
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Rusher', 'Sniper', 'IGL / Support'].map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setRoleChoice(role)}
                              className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                roleChoice === role
                                  ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B]'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formError && (
                        <p className="text-xs text-amber-400 font-medium">{formError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Verify IGN &amp; Unlock Tournament Lobby
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/40 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>
                          Player Tag &ldquo;{inGameId}&rdquo; ({roleChoice}) Added to Community!
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        You are now ready for Step 2. Click below to open the official erena Esports app and claim your tournament slot.
                      </p>
                      <a
                        href={OFFICIAL_APP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <span>Play Now / Enter Tournament</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: LIVE & UPCOMING TOURNAMENTS (Direct Conversion to Official App) */}
        <section id="tournaments" className="py-12 lg:py-20 border-b border-zinc-800/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-mono-tabular text-[#F59E0B] mb-2">
                  02. Daily Custom Rooms &amp; Scrims Schedule
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Upcoming Free Fire Pro Tournaments on erena Esports
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
                  Select any open bracket below to launch the official erena Esports application and register your squad.
                </p>
              </div>
              <a
                href={OFFICIAL_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 self-start"
              >
                <span>Open Full App Schedule</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {UPCOMING_TOURNAMENTS.map((item, index) => {
                const spotsLeft = item.totalSpots - item.spotsFilled;
                return (
                  <div
                    key={item.id}
                    className="bg-[#13161A] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 font-mono-tabular mb-3">
                        <span>0{index + 1}. {item.mode}</span>
                        <span className="text-[#F59E0B] font-semibold">{item.prizePool}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white leading-snug">
                        {item.title}
                      </h3>
                      <div className="mt-4 space-y-2 text-xs text-zinc-300 font-mono-tabular">
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                          <span className="text-zinc-400">Map Rotation</span>
                          <span>{item.map}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                          <span className="text-zinc-400">Match Time</span>
                          <span>{item.timeIST}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-zinc-400">Lobby Capacity</span>
                          <span>
                            {item.spotsFilled}/{item.totalSpots} Filled ({spotsLeft} slots left)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800">
                      <a
                        href={OFFICIAL_APP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-[#F59E0B] text-white hover:text-zinc-950 border border-zinc-700 hover:border-[#F59E0B] font-semibold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <span>Play Now / Enter Tournament</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: INSTAGRAM ADS CAMPAIGN LINK HELPER FOR THE OWNER */}
        <section id="ad-campaign-kit" className="py-12 lg:py-16 border-b border-zinc-800/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-[#13161A] border border-zinc-800 rounded-2xl p-5 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 min-w-0">
                  <p className="text-xs font-mono-tabular text-[#F59E0B] mb-2">
                    03. Instagram Ads &amp; Bio Link Strategy Guide
                  </p>
                  <h2
                    className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    How to Use This Page for Your Instagram Ads &amp; Bio Link
                  </h2>
                  <p className="text-sm text-zinc-300 mt-2 leading-relaxed break-words">
                    Use the <span className="text-white font-semibold">Button A (Community &amp; Highlights)</span> link below as your Instagram Ad destination URL. Because visitors land on a content-rich esports video highlight &amp; community hub first (with full Terms &amp; Conditions and Fair Play disclosures), it delivers a compliant, native experience—and players can immediately click <span className="text-[#F59E0B] font-semibold">&ldquo;Play Now / Enter Tournament&rdquo;</span> to open <span className="font-mono-tabular text-zinc-200 break-all">{OFFICIAL_APP_URL}</span>.
                  </p>
                </div>

                <div className="lg:col-span-5 min-w-0 space-y-3">
                  {/* Box 1: Button A Link for Instagram Ads */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-white">
                        1. Button A Link (Use in Instagram Ads)
                      </span>
                      <span className="text-xs text-[#F59E0B] font-mono-tabular">
                        Content-First Landing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getInstagramAdUrl()}
                        className="w-full px-3 py-2 text-xs font-mono-tabular bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyAdLink}
                        className="px-3.5 py-2 text-xs font-semibold bg-[#F59E0B] hover:bg-amber-400 text-zinc-950 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedAdLink ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Box 2: Button B Original App URL */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-white">
                        2. Button B Destination (Original App Link)
                      </span>
                      <span className="text-xs text-zinc-400 font-mono-tabular">
                        Direct Tournament App
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={OFFICIAL_APP_URL}
                        className="w-full px-3 py-2 text-xs font-mono-tabular bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyOriginalLink}
                        className="px-3.5 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedAppLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: TERMS & CONDITIONS, PRIVACY POLICY & INSTAGRAM ADS COMPLIANCE */}
        <section id="terms-and-conditions" className="py-12 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="min-w-0">
                <p className="text-xs font-mono-tabular text-[#F59E0B] mb-2">
                  04. Platform Terms &amp; Advertising Compliance Disclosures
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Terms &amp; Conditions, Fair Play Policy &amp; Disclaimers
                </h2>
                <p className="text-sm text-zinc-400 mt-1.5 max-w-2xl">
                  Transparent governance, skill-based competition rules, and platform policies ensuring compliance with Meta / Instagram Advertising Standards.
                </p>
              </div>

              {/* Functional Legal Tabs — Wraps cleanly on mobile so it never causes horizontal scroll */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#13161A] border border-zinc-800 rounded-lg self-start max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveLegalTab('terms')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeLegalTab === 'terms'
                      ? 'bg-[#F59E0B] text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Terms &amp; Conditions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLegalTab('fairplay')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeLegalTab === 'fairplay'
                      ? 'bg-[#F59E0B] text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 shrink-0" />
                  <span>Skill Gaming &amp; Fair Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLegalTab('privacy')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeLegalTab === 'privacy'
                      ? 'bg-[#F59E0B] text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Privacy &amp; Disclaimers</span>
                </button>
              </div>
            </div>

            <div className="bg-[#13161A] border border-zinc-800 rounded-2xl p-6 sm:p-8">
              {activeLegalTab === 'terms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      1. 100% Skill-Based Esports Competition
                    </h3>
                    <p>
                      erena Esports is a competitive gaming and community showcase platform dedicated strictly to <strong className="text-white">games of skill</strong>. Outcomes in all hosted custom rooms and tournaments are determined solely by player strategy, reflexes, map knowledge, and team coordination. This platform does not offer, promote, or facilitate gambling, betting, wagering, or games of chance.
                    </p>
                    <h3 className="font-display text-xl font-bold text-white pt-2">
                      2. Player Eligibility &amp; Age Requirement
                    </h3>
                    <p>
                      Participation in competitive tournament brackets requires players to be at least 18 years of age (or have explicit parent/guardian consent for community practice scrims) and reside in jurisdictions where skill-based esports competitions are permitted by applicable law.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      3. Custom Room Rules &amp; Code of Conduct
                    </h3>
                    <p>
                      Players must join the assigned custom room lobby using their registered Free Fire UID at least 5 minutes prior to match start. Teaming with opposing squads, exploiting map bugs, or using unauthorized third-party client modifications will result in immediate disqualification.
                    </p>
                    <h3 className="font-display text-xl font-bold text-white pt-2">
                      4. Community Highlights &amp; Content Usage
                    </h3>
                    <p>
                      Gameplay videos featured on this page are recorded from official erena Esports community tournaments and scrims for educational, entertainment, and community showcase purposes.
                    </p>
                  </div>
                </div>
              )}

              {activeLegalTab === 'fairplay' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      1. Anti-Cheat &amp; Spectator Verification
                    </h3>
                    <p>
                      Every official match on erena Esports is monitored by live tournament marshals. Use of aimbots, wallhacks, macro scripts, or modified game files is strictly prohibited and results in a permanent platform ban.
                    </p>
                    <h3 className="font-display text-xl font-bold text-white pt-2">
                      2. Device &amp; Emulator Policy
                    </h3>
                    <p>
                      Mobile lobbies are strictly restricted to mobile touchscreen devices (Android/iOS). PC emulators are prohibited in mobile-only custom rooms unless explicitly marked as an Open Mixed Lobby.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      3. Scoring &amp; Tie-Breaker Transparency
                    </h3>
                    <p>
                      Match standings follow standardized esports point tables combining placement points (Booyah / survival rank) and elimination points. In the event of a tie, total Booyahs followed by total eliminations determine the final rank.
                    </p>
                    <h3 className="font-display text-xl font-bold text-white pt-2">
                      4. Responsible Gaming Commitment
                    </h3>
                    <p>
                      We encourage healthy, balanced gaming habits. Take regular breaks between scrims and play responsibly for entertainment and competitive skill development.
                    </p>
                  </div>
                </div>
              )}

              {activeLegalTab === 'privacy' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      1. Platform &amp; Trademark Disclaimer
                    </h3>
                    <p>
                      erena Esports is an independent community tournament organizer and is not endorsed by, directly affiliated with, maintained, or sponsored by Garena Free Fire, Meta Platforms, Inc., or Instagram. All game titles, character names, and trademarks belong to their respective owners.
                    </p>
                    <h3 className="font-display text-xl font-bold text-white pt-2">
                      2. Minimal Data Collection &amp; Privacy
                    </h3>
                    <p>
                      When you submit your Free Fire IGN or Player UID in the community roster form, it is used solely for squad matchmaking and custom room slot verification. We never sell or share player data with third-party marketers.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      3. External App Redirection Notice
                    </h3>
                    <p>
                      Clicking &ldquo;Play Now / Enter Tournament&rdquo; redirects you to our official tournament web application at{' '}
                      <a
                        href={OFFICIAL_APP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F59E0B] underline font-mono-tabular"
                      >
                        {OFFICIAL_APP_URL}
                      </a>
                      .
                    </p>
                    <h3 className="font-display text-xl font-bold text-white pt-2">
                      4. Contact &amp; Grievance Support
                    </h3>
                    <p>
                      For tournament rule inquiries, match disputes, or support requests, reach out through the official support channel inside the erena Esports application.
                    </p>
                  </div>
                </div>
              )}

              {/* Compliance Footer Strip inside Legal Box */}
              <div className="mt-6 pt-4 border-t border-zinc-800/90 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono-tabular">
                <span>Compliance Status: Skill-Based Esports &amp; Community Hub</span>
                <span>18+ Competitive Brackets · No Gambling or Betting</span>
                <span>Independent Organizer · Not Affiliated with Meta or Garena</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-6 bg-[#0B0C0E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-lg font-bold text-white">erena Esports</span>
            <span aria-hidden="true">·</span>
            <span>Free Fire Pro Tournament Platform</span>
            <span aria-hidden="true">·</span>
            <span>All Rights Reserved 2026</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#bio-link-hub"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Bio Hub
            </a>
            <a
              href="#community-hub"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Watch Highlights
            </a>
            <a
              href="#terms-and-conditions"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Terms &amp; Conditions
            </a>
            <a
              href={OFFICIAL_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F59E0B] hover:underline font-medium whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>Official App (erenaesportsofficial.netlify.app)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
