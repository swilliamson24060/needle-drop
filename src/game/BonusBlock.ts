import Phaser from "phaser";
import { BONUS_AMBER, FONT_FAMILY, TEXT_DARK, toCssHex } from "./theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

export type BonusTapHandler = (block: BonusBlock) => void;

const WIDTH = 96;
const HEIGHT = 58;

/** A static (non-falling) bonus block showing a candidate peak chart position. */
export class BonusBlock {
  readonly isCorrect: boolean;
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, peakPosition: number, isCorrect: boolean, onTap: BonusTapHandler) {
    this.isCorrect = isCorrect;

    const bg = drawRoundedRectWithShadow(scene, WIDTH, HEIGHT, BONUS_AMBER, 14);

    const reachedLabel = scene.add.text(0, -14, "Reached", {
      fontSize: "12px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "600",
    }).setOrigin(0.5);

    const numberLabel = scene.add.text(0, 8, `#${peakPosition}`, {
      fontSize: "20px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "800",
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [bg, reachedLabel, numberLabel]);
    this.container.setSize(WIDTH, HEIGHT);
    this.container.setDepth(60);
    this.container.setInteractive({ useHandCursor: true });
    this.container.on("pointerdown", () => onTap(this));
  }

  disableInput(): void {
    this.container.disableInteractive();
  }

  destroy(): void {
    this.container.destroy();
  }
}
