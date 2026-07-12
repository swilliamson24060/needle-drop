import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BG_GRADIENT_BOTTOM, BG_GRADIENT_TOP, CORAL, CORAL_TEXT, FONT_FAMILY, SKY_BLUE, TEXT_DARK, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: { score: number; decade: number }): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(BG_GRADIENT_TOP, BG_GRADIENT_TOP, BG_GRADIENT_BOTTOM, BG_GRADIENT_BOTTOM, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Game Over", {
        fontSize: "36px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(CORAL_TEXT),
        fontStyle: "800",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `Score: ${data.score ?? 0}`, {
        fontSize: "26px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "700",
      })
      .setOrigin(0.5);

    const buttonBg = drawRoundedRectWithShadow(this, 220, 60, CORAL, 30);
    const button = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, [buttonBg]);
    button.setSize(220, 60);
    button.setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, "Play Again", {
        fontSize: "20px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "700",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Game", { decade: data.decade }));

    const decadeButtonBg = drawRoundedRectWithShadow(this, 220, 56, SKY_BLUE, 28);
    const decadeButton = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, [decadeButtonBg]);
    decadeButton.setSize(220, 56);
    decadeButton.setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, "Change Decade", {
        fontSize: "18px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "700",
      })
      .setOrigin(0.5);

    decadeButton.on("pointerdown", () => this.scene.start("DecadeSelect"));
  }
}
