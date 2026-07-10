import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: { score: number }): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Game Over", {
        fontSize: "36px",
        color: "#ff6666",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `Score: ${data.score ?? 0}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const button = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 200, 56, 0x2f6fed, 1);
    button.setStrokeStyle(2, 0xffffff, 0.9);
    button.setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "Play Again", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => this.scene.start("Game"));
  }
}
