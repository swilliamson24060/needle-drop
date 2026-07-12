import Phaser from "phaser";
import { getAvailableDecades } from "../data/questionGenerator";
import type { Hit } from "../types";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BG_GRADIENT_BOTTOM, BG_GRADIENT_TOP, CORAL, FONT_FAMILY, TEXT_DARK, TEXT_GRAY, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 56;
const GAP_X = 20;
const GAP_Y = 18;
const GRID_TOP = 190;

export class DecadeSelectScene extends Phaser.Scene {
  constructor() {
    super("DecadeSelect");
  }

  create(): void {
    const hits = this.registry.get("hits") as Hit[];
    const decades = getAvailableDecades(hits);

    const bg = this.add.graphics();
    bg.fillGradientStyle(BG_GRADIENT_TOP, BG_GRADIENT_TOP, BG_GRADIENT_BOTTOM, BG_GRADIENT_BOTTOM, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, 90, "Choose a Decade", {
        fontSize: "30px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "800",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 130, "Every question will be from that era.", {
        fontSize: "15px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_GRAY),
      })
      .setOrigin(0.5);

    decades.forEach((decade, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = GAME_WIDTH / 2 + (col === 0 ? -1 : 1) * (BUTTON_WIDTH / 2 + GAP_X / 2);
      const y = GRID_TOP + row * (BUTTON_HEIGHT + GAP_Y);

      const buttonBg = drawRoundedRectWithShadow(this, BUTTON_WIDTH, BUTTON_HEIGHT, CORAL, 20);
      const button = this.add.container(x, y, [buttonBg]);
      button.setSize(BUTTON_WIDTH, BUTTON_HEIGHT);
      button.setInteractive({ useHandCursor: true });

      this.add
        .text(x, y, `${decade}s`, {
          fontSize: "22px",
          fontFamily: FONT_FAMILY,
          color: "#ffffff",
          fontStyle: "800",
        })
        .setOrigin(0.5);

      button.on("pointerdown", () => this.scene.start("Game", { decade }));
    });
  }
}
