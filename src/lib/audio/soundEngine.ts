import { Howl } from "howler";
import { generateSoundSet } from "./synthPaper";

class BookSoundEngine {
  private turnHowls: Howl[] = [];
  private coverHowls: Howl[] = [];
  private ready = false;
  private initPromise: Promise<void> | null = null;
  private enabled = true;

  init() {
    if (this.ready || this.initPromise || typeof window === "undefined") return;
    this.initPromise = generateSoundSet()
      .then(({ turn, cover }) => {
        this.turnHowls = turn.map((src) => new Howl({ src: [src], format: ["wav"], volume: 0.4 }));
        this.coverHowls = cover.map((src) => new Howl({ src: [src], format: ["wav"], volume: 0.45 }));
        this.ready = true;
      })
      .catch(() => {
        this.initPromise = null;
      });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /** Triggered continuously while a page is being dragged; speed in [0,1] scales volume/rate. */
  playTurn(speed = 1) {
    if (!this.enabled || !this.ready || this.turnHowls.length === 0) return;
    const howl = this.turnHowls[Math.floor(Math.random() * this.turnHowls.length)];
    const id = howl.play();
    howl.rate(0.85 + Math.random() * 0.3 + speed * 0.15, id);
    howl.volume(Math.min(0.55, 0.16 + speed * 0.3), id);
  }

  playCoverThud() {
    if (!this.enabled || !this.ready || this.coverHowls.length === 0) return;
    const howl = this.coverHowls[Math.floor(Math.random() * this.coverHowls.length)];
    const id = howl.play();
    howl.rate(0.92 + Math.random() * 0.16, id);
  }
}

export const soundEngine = new BookSoundEngine();
