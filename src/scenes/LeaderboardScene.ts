import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import {
  BG_GRADIENT_BOTTOM,
  BG_GRADIENT_TOP,
  CARD_WHITE,
  CORAL,
  FONT_FAMILY,
  TEXT_DARK,
  TEXT_GRAY,
  toCssHex,
} from "../game/theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";
import { fetchTopScores, type LeaderboardEntry } from "../data/leaderboard";

const LIST_TOP = 150;
const LIST_BOTTOM = GAME_HEIGHT - 110;
const LIST_HEIGHT = LIST_BOTTOM - LIST_TOP;
const ROW_HEIGHT = 40;
const LIST_LEFT = 24;
const LIST_WIDTH = GAME_WIDTH - LIST_LEFT * 2;

export class LeaderboardScene extends Phaser.Scene {
  private listContainer!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;
  private scrollMin = 0;
  private dragStartY = 0;
  private containerStartY = 0;

  constructor() {
    super("Leaderboard");
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(BG_GRADIENT_TOP, BG_GRADIENT_TOP, BG_GRADIENT_BOTTOM, BG_GRADIENT_BOTTOM, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, 70, "Top 40", {
        fontSize: "30px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "800",
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(GAME_WIDTH / 2, LIST_TOP + 20, "Loading...", {
        fontSize: "16px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_GRAY),
      })
      .setOrigin(0.5, 0);

    this.listContainer = this.add.container(0, LIST_TOP);
    const maskShape = this.make.graphics({});
    maskShape.fillRect(LIST_LEFT, LIST_TOP, LIST_WIDTH, LIST_HEIGHT);
    this.listContainer.setMask(maskShape.createGeometryMask());

    this.setupScrollInput();
    this.buildBackButton();

    fetchTopScores()
      .then((entries) => this.renderEntries(entries))
      .catch(() => this.statusText.setText("Couldn't load the leaderboard. Check your connection and try again."));
  }

  private renderEntries(entries: LeaderboardEntry[]): void {
    if (entries.length === 0) {
      this.statusText.setText("No scores yet — be the first!");
      return;
    }
    this.statusText.setVisible(false);

    entries.forEach((entry, i) => {
      const y = i * ROW_HEIGHT;
      const rowBg = drawRoundedRectWithShadow(this, LIST_WIDTH, ROW_HEIGHT - 8, CARD_WHITE, 12);
      const row = this.add.container(GAME_WIDTH / 2, y + ROW_HEIGHT / 2, [rowBg]);
      this.listContainer.add(row);

      this.listContainer.add(
        this.add
          .text(LIST_LEFT + 16, y + ROW_HEIGHT / 2, `${i + 1}`, {
            fontSize: "15px",
            fontFamily: FONT_FAMILY,
            color: toCssHex(TEXT_GRAY),
            fontStyle: "700",
          })
          .setOrigin(0, 0.5)
      );
      this.listContainer.add(
        this.add
          .text(LIST_LEFT + 48, y + ROW_HEIGHT / 2, entry.name, {
            fontSize: "16px",
            fontFamily: FONT_FAMILY,
            color: toCssHex(TEXT_DARK),
            fontStyle: "700",
          })
          .setOrigin(0, 0.5)
      );
      this.listContainer.add(
        this.add
          .text(GAME_WIDTH - LIST_LEFT - 16, y + ROW_HEIGHT / 2, `${entry.score}`, {
            fontSize: "16px",
            fontFamily: FONT_FAMILY,
            color: toCssHex(TEXT_DARK),
            fontStyle: "800",
          })
          .setOrigin(1, 0.5)
      );
    });

    const contentHeight = entries.length * ROW_HEIGHT;
    this.scrollMin = Math.min(0, LIST_HEIGHT - contentHeight);
  }

  private setupScrollInput(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < LIST_TOP || pointer.y > LIST_BOTTOM) return;
      this.dragStartY = pointer.y;
      this.containerStartY = this.listContainer.y;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      const delta = pointer.y - this.dragStartY;
      const targetY = Phaser.Math.Clamp(this.containerStartY + delta, LIST_TOP + this.scrollMin, LIST_TOP);
      this.listContainer.y = targetY;
    });

    this.input.on("wheel", (_pointer: unknown, _objs: unknown, _dx: number, dy: number) => {
      const targetY = Phaser.Math.Clamp(this.listContainer.y - dy, LIST_TOP + this.scrollMin, LIST_TOP);
      this.listContainer.y = targetY;
    });
  }

  private buildBackButton(): void {
    const buttonBg = drawRoundedRectWithShadow(this, 160, 52, CORAL, 26);
    const button = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 50, [buttonBg]);
    button.setSize(160, 52);
    button.setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 50, "Back", {
        fontSize: "18px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "700",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Menu"));
  }
}
