import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Needle Drop", {
        fontSize: "40px",
        color: "#ffe066",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "Tap the answer before the blocks bury you.", {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const button = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 180, 56, 0x2f6fed, 1);
    button.setStrokeStyle(2, 0xffffff, 0.9);
    button.setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "Start", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Game"));
  }
}
