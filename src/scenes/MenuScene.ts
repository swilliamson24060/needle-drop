import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BG_GRADIENT_BOTTOM, BG_GRADIENT_TOP, CORAL, FONT_FAMILY, TEXT_DARK, TEXT_GRAY, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "../ui/roundedPanel";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(BG_GRADIENT_TOP, BG_GRADIENT_TOP, BG_GRADIENT_BOTTOM, BG_GRADIENT_BOTTOM, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, "🎵  🧱  ⭐", { fontSize: "28px" })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Needle Drop", {
        fontSize: "40px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "800",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "Tap the answer before the blocks bury you.", {
        fontSize: "16px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_GRAY),
        align: "center",
      })
      .setOrigin(0.5);

    const buttonBg = drawRoundedRectWithShadow(this, 200, 60, CORAL, 30);
    const button = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, [buttonBg]);
    button.setSize(200, 60);
    button.setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, "Play", {
        fontSize: "22px",
        fontFamily: FONT_FAMILY,
        color: "#ffffff",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Game"));
  }
}
