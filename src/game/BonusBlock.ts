import Phaser from "phaser";
import { BONUS_AMBER, FONT_FAMILY } from "./theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

export type BonusTapHandler = (block: BonusBlock) => void;

const WIDTH = 84;
const HEIGHT = 48;

/** A static (non-falling) bonus block showing a candidate peak chart position. */
export class BonusBlock {
  readonly isCorrect: boolean;
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, peakPosition: number, isCorrect: boolean, onTap: BonusTapHandler) {
    this.isCorrect = isCorrect;

    const bg = drawRoundedRectWithShadow(scene, WIDTH, HEIGHT, BONUS_AMBER, 14);
    const label = scene.add.text(0, 0, `#${peakPosition}`, {
      fontSize: "18px",
      fontFamily: FONT_FAMILY,
      color: "#ffffff",
      fontStyle: "800",
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [bg, label]);
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
