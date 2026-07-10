import Phaser from "phaser";
import { BLOCK_HEIGHT, BLOCK_WIDTH, FALL_SPEED_PX_PER_SEC } from "./constants";

export type AnswerTapHandler = (answer: FallingAnswer) => void;

const MONTH_MAX_FONT_SIZE = 24;
const MONTH_MIN_FONT_SIZE = 12;
const YEAR_MAX_FONT_SIZE = 19;
const YEAR_MIN_FONT_SIZE = 13;
const TEXT_PADDING = 20; // horizontal room reserved inside the block on top of the text width
const LINE_GAP = 4;

/** Creates a centered label that shrinks its font size until it fits within `maxWidth`. */
function createFittedLabel(
  scene: Phaser.Scene,
  text: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number,
  color: string
): Phaser.GameObjects.Text {
  const label = scene.add.text(0, 0, text, {
    fontSize: `${maxFontSize}px`,
    color,
    align: "center",
  });
  label.setOrigin(0.5, 0);

  let fontSize = maxFontSize;
  while (label.width > maxWidth && fontSize > minFontSize) {
    fontSize -= 1;
    label.setFontSize(fontSize);
  }

  return label;
}

/** A single falling answer block: a tappable rectangle + month/year label that moves down at a constant speed. */
export class FallingAnswer {
  readonly isCorrect: boolean;
  readonly text: string;
  readonly container: Phaser.GameObjects.Container;

  private landed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    startY: number,
    text: string,
    year: string,
    isCorrect: boolean,
    onTap: AnswerTapHandler
  ) {
    this.text = text;
    this.isCorrect = isCorrect;

    const bg = scene.add.rectangle(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, 0x2f6fed, 1);
    bg.setStrokeStyle(2, 0xffffff, 0.8);

    const maxTextWidth = BLOCK_WIDTH - TEXT_PADDING;
    const monthLabel = createFittedLabel(
      scene, text, maxTextWidth, MONTH_MAX_FONT_SIZE, MONTH_MIN_FONT_SIZE, "#ffffff"
    );
    const yearLabel = createFittedLabel(
      scene, year, maxTextWidth, YEAR_MAX_FONT_SIZE, YEAR_MIN_FONT_SIZE, "#d7e6ff"
    );

    const totalHeight = monthLabel.height + LINE_GAP + yearLabel.height;
    monthLabel.y = -totalHeight / 2;
    yearLabel.y = monthLabel.y + monthLabel.height + LINE_GAP;

    this.container = scene.add.container(x, startY, [bg, monthLabel, yearLabel]);
    this.container.setSize(BLOCK_WIDTH, BLOCK_HEIGHT);
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
