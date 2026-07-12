import Phaser from "phaser";
import { FONT_FAMILY, toCssHex } from "../game/theme";

const UNLIT_FILL = 0x2a2620;
const UNLIT_BORDER = 0x4a4038;
const UNLIT_TEXT = 0x8a7f74;

/** A marquee-style sign that sits dim/unlit until `flash()` briefly lights it up. */
export class SignBadge {
  readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly glow: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly width: number;
  private readonly height: number;
  private readonly litColor: number;
  private litTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, width: number, height: number, litColor: number) {
    this.width = width;
    this.height = height;
    this.litColor = litColor;

    this.glow = scene.add.graphics();
    this.bg = scene.add.graphics();
    this.label = scene.add.text(0, 0, text, {
      fontSize: "16px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(UNLIT_TEXT),
      fontStyle: "800",
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [this.glow, this.bg, this.label]);
    this.container.setSize(width, height);
    this.container.setDepth(60);

    this.drawUnlit();
  }

  private drawUnlit(): void {
    const { width, height } = this;
    this.glow.clear();
    this.bg.clear();
    this.bg.lineStyle(3, UNLIT_BORDER, 1);
    this.bg.fillStyle(UNLIT_FILL, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.label.setColor(toCssHex(UNLIT_TEXT));
  }

  private drawLit(): void {
    const { width, height } = this;
    this.glow.clear();
    this.glow.fillStyle(this.litColor, 0.35);
    this.glow.fillRoundedRect(-width / 2 - 6, -height / 2 - 6, width + 12, height + 12, 14);

    this.bg.clear();
    this.bg.lineStyle(3, 0xffffff, 0.9);
    this.bg.fillStyle(this.litColor, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.label.setColor("#ffffff");
  }

  /** Briefly lights up the sign, then fades back to its unlit state. */
  flash(scene: Phaser.Scene, durationMs = 700): void {
    this.litTimer?.remove();
    this.drawLit();
    this.litTimer = scene.time.delayedCall(durationMs, () => this.drawUnlit());
  }
}
