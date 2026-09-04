import { audio } from "./audio";

export type AudioTrackName =
  | "ouverture"
  | "drone"
  | "searchlight"
  | "curtain"
  | "whoosh";

interface TrackConfig {
  url: string;
  defaultVolume: number;
  fadeIn: number;
  fadeOut: number;
  loop?: boolean;
}

const TRACKS: Record<AudioTrackName, TrackConfig> = {
  ouverture: {
    url: "/audio/ouverture-ambient.mp3",
    defaultVolume: 0.65,
    fadeIn: 1.5,
    fadeOut: 1.2,
  },
  drone: {
    url: "/audio/opening-drone.mp3",
    defaultVolume: 0.55,
    fadeIn: 2.0,
    fadeOut: 1.5,
    loop: true,
  },
  searchlight: {
    url: "/audio/searchlight-reveal.mp3",
    defaultVolume: 0.5,
    fadeIn: 0.1,
    fadeOut: 0.6,
  },
  curtain: {
    url: "/audio/curtain-open.mp3",
    defaultVolume: 0.7,
    fadeIn: 0.05,
    fadeOut: 0.8,
  },
  whoosh: {
    url: "/audio/transition-whoosh.mp3",
    defaultVolume: 0.35,
    fadeIn: 0.02,
    fadeOut: 0.2,
  },
};

interface ActiveNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
  timer?: ReturnType<typeof setTimeout>;
}

class AudioManager {
  private buffers = new Map<AudioTrackName, AudioBuffer>();
  private active = new Map<AudioTrackName, ActiveNode>();
  private isPreloading = false;
  private hasUserInteracted = false;

  get muted(): boolean {
    return audio.muted;
  }

  get userInteracted(): boolean {
    return this.hasUserInteracted;
  }

  /** Dipanggil pada interaksi pertama user (keydown Space/klik). */
  init(): void {
    if (typeof window === "undefined") return;
    this.hasUserInteracted = true;
    audio.init();
    if (!this.isPreloading) {
      this.isPreloading = true;
      void this.preloadAll();
    }
  }

  private async loadBuffer(name: AudioTrackName): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(name);
    if (cached) return cached;
    const ctx = audio.getContext();
    if (!ctx) return null;

    try {
      const res = await fetch(TRACKS[name].url);
      const arr = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arr);
      this.buffers.set(name, decoded);
      return decoded;
    } catch {
      return null;
    }
  }

  private async preloadAll(): Promise<void> {
    const names = Object.keys(TRACKS) as AudioTrackName[];
    await Promise.all(names.map((n) => this.loadBuffer(n)));
  }

  /** Memutar track dengan ramp volume fade-in mulus. */
  async play(name: AudioTrackName, customVolume?: number): Promise<void> {
    if (!this.hasUserInteracted) return;
    this.init();
    const ctx = audio.getContext();
    const master = audio.getMaster();
    if (!ctx || !master) return;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }

    const cfg = TRACKS[name];
    const targetVol = customVolume ?? cfg.defaultVolume;
    const buffer = await this.loadBuffer(name);
    if (!buffer) return;

    // Fade out track sejenis yang sedang berjalan
    this.stop(name, 0.4);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = Boolean(cfg.loop);

    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(targetVol, t + cfg.fadeIn);

    source.connect(gain);
    gain.connect(master);
    source.start(t);

    const node: ActiveNode = { source, gain };

    // Auto-cleanup untuk non-looping track
    if (!cfg.loop) {
      source.onended = () => {
        try {
          source.disconnect();
          gain.disconnect();
        } catch {}
        if (this.active.get(name) === node) {
          this.active.delete(name);
        }
      };
    }

    this.active.set(name, node);
  }

  /** Menghentikan track dengan fade-out mulus. */
  stop(name: AudioTrackName, fadeOutDuration?: number): void {
    const node = this.active.get(name);
    if (!node) return;
    const ctx = audio.getContext();
    if (!ctx) return;

    const dur = fadeOutDuration ?? TRACKS[name].fadeOut;
    const t = ctx.currentTime;
    try {
      node.gain.gain.cancelScheduledValues(t);
      node.gain.gain.setValueAtTime(Math.max(node.gain.gain.value, 0.0001), t);
      node.gain.gain.linearRampToValueAtTime(0.0001, t + dur);
      setTimeout(() => {
        try {
          node.source.stop();
          node.source.disconnect();
          node.gain.disconnect();
        } catch {}
      }, (dur + 0.08) * 1000);
    } catch {}
    this.active.delete(name);
  }

  /** Hentikan semua audio yang sedang berjalan dengan fade-out. */
  stopAll(duration = 1.0): void {
    const keys = Array.from(this.active.keys());
    for (const key of keys) {
      this.stop(key, duration);
    }
  }

  // Helper cepat semantik
  playOuverture(): void {
    void this.play("ouverture");
  }

  fadeOutOuverture(dur = 1.2): void {
    this.stop("ouverture", dur);
  }

  playDrone(): void {
    void this.play("drone");
  }

  fadeOutDrone(dur = 1.5): void {
    this.stop("drone", dur);
  }

  playSearchlight(): void {
    void this.play("searchlight");
  }

  playCurtain(): void {
    void this.play("curtain");
  }

  playWhoosh(): void {
    void this.play("whoosh");
  }

  toggleMute(): boolean {
    return audio.toggleMute();
  }
}

export const audioManager = new AudioManager();
