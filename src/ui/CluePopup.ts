import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";

/** Modal shown once at the start of a session: explains the rules, dismissed with an Okay button. */
export class CluePopup {
  private readonly container: Phaser.GameObjects.Container;
  private readonly clueText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
    overlay.setOrigin(0);

    const panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 40, 220, 0x1b1b2a, 1);
    panel.setStrokeStyle(2, 0xffffff, 0.9);

    this.clueText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, "", {
      fontSize: "15px",
      color: "#ffffff",
      align: "center",
      lineSpacing: 6,
      wordWrap: { width: GAME_WIDTH - 80 },
    }).setOrigin(0.5, 0);

    const button = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 120, 44, 0x2f6fed, 1);
    button.setStrokeStyle(2, 0xffffff, 0.9);
    button.setInteractive({ useHandCursor: true });

    const buttonLabel = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "Okay", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.container = scene.add.container(0, 0, [overlay, panel, this.clueText, button, buttonLabel]);
    this.container.setDepth(100);
    this.container.setVisible(false);

    button.on("pointerdown", () => {
      this.container.setVisible(false);
      this.onOkayCallback?.();
    });
  }

  private onOkayCallback: (() => void) | null = null;

  show(clue: string, onOkay: () => void): void {
    this.clueText.setText(clue);
    this.onOkayCallback = onOkay;
    this.container.setVisible(true);
  }
}
