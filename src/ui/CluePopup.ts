import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { CARD_WHITE, CORAL, FONT_FAMILY, TEXT_DARK, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "./roundedPanel";

/** Modal shown once at the start of a session: explains the rules, dismissed with an Okay button. */
export class CluePopup {
  private readonly container: Phaser.GameObjects.Container;
  private readonly clueText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45);
    overlay.setOrigin(0);

    const panelBg = drawRoundedRectWithShadow(scene, GAME_WIDTH - 20, 440, CARD_WHITE, 24);
    const panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [panelBg]);

    this.clueText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 190, "", {
      fontSize: "15px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      align: "center",
      lineSpacing: 6,
      wordWrap: { width: GAME_WIDTH - 60 },
    }).setOrigin(0.5, 0);

    const buttonBg = drawRoundedRectWithShadow(scene, 130, 48, CORAL, 24);
    const button = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, [buttonBg]);
    button.setSize(130, 48);
    button.setInteractive({ useHandCursor: true });

    const buttonLabel = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, "Okay", {
      fontSize: "18px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "700",
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
