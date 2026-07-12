import Phaser from "phaser";
import { BLOCK_MAX_WIDTH, BLOCK_MIN_HEIGHT, BLOCK_MIN_WIDTH, FALL_SPEED_PX_PER_SEC, GAME_WIDTH } from "./constants";
import { FONT_FAMILY } from "./theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

export type AnswerTapHandler = (answer: FallingAnswer) => void;

const FONT_SIZE = 18;
const HORIZONTAL_PADDING = 24;
const VERTICAL_PADDING = 16;
const SCREEN_MARGIN = 10;
const CORNER_RADIUS = 18;

/** A single falling answer block: sizes itself to fit `title`, tappable, falls at a constant speed. */
export class FallingAnswer {
  readonly isCorrect: boolean;
  readonly title: string;
  readonly container: Phaser.GameObjects.Container;

  private landed = false;

  constructor(
    scene: Phaser.Scene,
    preferredX: number,
    startY: number,
    title: string,
    color: number,
    isCorrect: boolean,
    onTap: AnswerTapHandler
  ) {
    this.title = title;
    this.isCorrect = isCorrect;

    const label = scene.add.text(0, 0, title, {
      fontSize: `${FONT_SIZE}px`,
      fontFamily: FONT_FAMILY,
      color: "#ffffff",
      align: "center",
      fontStyle: "700",
    });

    // Widen the block to fit the title on one line, unless it's too long for the screen —
    // then cap the width and let it wrap to extra lines instead.
    const singleLineWidth = label.width + HORIZONTAL_PADDING;
    if (singleLineWidth > BLOCK_MAX_WIDTH) {
      label.setWordWrapWidth(BLOCK_MAX_WIDTH - HORIZONTAL_PADDING, true);
    }
    label.setOrigin(0.5);

    const blockWidth = Math.min(Math.max(singleLineWidth, BLOCK_MIN_WIDTH), BLOCK_MAX_WIDTH);
    const blockHeight = Math.max(label.height + VERTICAL_PADDING, BLOCK_MIN_HEIGHT);

    const bg = drawRoundedRectWithShadow(scene, blockWidth, blockHeight, color, CORNER_RADIUS);

    // Keep the whole block on-screen even if it ended up wider than its preferred slot.
    const halfWidth = blockWidth / 2;
    const x = Phaser.Math.Clamp(preferredX, SCREEN_MARGIN + halfWidth, GAME_WIDTH - SCREEN_MARGIN - halfWidth);

    this.container = scene.add.container(x, startY, [bg, label]);
    this.container.setSize(blockWidth, blockHeight);
    this.container.setInteractive({ useHandCursor: true });
    this.container.on("pointerdown", () => onTap(this));
  }

  /** Moves the block down; returns true the first time it reaches landingY. */
  update(deltaSeconds: number, landingY: number): boolean {
    if (this.landed) return false;

    this.container.y += FALL_SPEED_PX_PER_SEC * deltaSeconds;
    if (this.container.y >= landingY) {
      this.container.y = landingY;
      this.landed = true;
      return true;
    }
    return false;
  }

  disableInput(): void {
    this.container.disableInteractive();
  }

  destroy(): void {
    this.container.destroy();
  }
}
