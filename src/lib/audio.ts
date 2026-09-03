// Audio ambiens — 100% programatik via Web Audio API (OscillatorNode + GainNode).
// Tidak ada file MP3. Dua suara: dentum sub-bass dramatis (momen judul) dan
// tick mekanis halus (feedback navigasi langkah).

type AudioContextCtor = typeof AudioContext;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _muted = false;

  get muted(): boolean {
    return this._muted;
  }

  /** Harus dipanggil dari gesture pengguna (keydown) agar AudioContext boleh jalan. */
  init(): void {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const Ctor: AudioContextCtor | undefined =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: AudioContextCtor })
            .webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = this._muted ? 0 : 0.9;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {
      /* audio tidak tersedia di environment ini */
    }
  }

  private live(): boolean {
    return this.ctx !== null && this.master !== null;
  }

  /** Dentum sub-bass sintetis (40-54 Hz), ~2.1 detik, fade in/out. */
  thump(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.exponentialRampToValueAtTime(54, t + 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 2.2);
  }

  /** Tick analog mekanis — dua klik sangat pendek, gain sangat rendah. */
  tick(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    const mk = (freq: number, at: number, gain: number, dur: number): void => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(at);
      osc.stop(at + dur + 0.01);
    };
    mk(2600, t, 0.035, 0.03);
    mk(1100, t + 0.045, 0.022, 0.02);
  }

  /** Toggle mute master. Return status mute terbaru. */
  toggleMute(): boolean {
    this._muted = !this._muted;
    const ctx = this.ctx;
    const master = this.master;
    if (ctx && master) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.linearRampToValueAtTime(this._muted ? 0 : 0.9, t + 0.15);
    }
    return this._muted;
  }
}

export const audio = new AudioEngine();
