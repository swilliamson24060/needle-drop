import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BG_GRADIENT_BOTTOM, BG_GRADIENT_TOP, CORAL, FONT_FAMILY, TEXT_DARK, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: { score: number }): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(BG_GRADIENT_TOP, BG_GRADIENT_TOP, BG_GRADIENT_BOTTOM, BG_GRADIENT_BOTTOM, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Game Over", {
        fontSize: "36px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(CORAL),
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
        color: "#ffffff",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Game"));
  }
}
