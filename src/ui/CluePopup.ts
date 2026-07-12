import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BG_GRADIENT_BOTTOM, BG_GRADIENT_TOP, CORAL, FONT_FAMILY, TEXT_DARK, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "./roundedPanel";

const TEXT_TOP = 140;
const PARAGRAPH_GAP = 22;
const BODY_FONT_SIZE = "22px";

/** Full-screen modal shown once at the start of a session: explains the rules, dismissed with an Okay button. */
export class CluePopup {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private paragraphTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const bg = scene.add.graphics();
    bg.fillGradientStyle(BG_GRADIENT_TOP, BG_GRADIENT_TOP, BG_GRADIENT_BOTTOM, BG_GRADIENT_BOTTOM, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const title = scene.add.text(GAME_WIDTH / 2, 70, "How to Play", {
      fontSize: "28px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "800",
    }).setOrigin(0.5);

    const buttonBg = drawRoundedRectWithShadow(scene, 140, 52, CORAL, 26);
    const button = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 70, [buttonBg]);
    button.setSize(140, 52);
    button.setInteractive({ useHandCursor: true });

    const buttonLabel = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 70, "Okay", {
      fontSize: "18px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "700",
    }).setOrigin(0.5);

    this.container = scene.add.container(0, 0, [bg, title, button, buttonLabel]);
    this.container.setDepth(100);
    this.container.setVisible(false);

    button.on("pointerdown", () => {
      this.container.setVisible(false);
      this.onOkayCallback?.();
    });
  }

  private onOkayCallback: (() => void) | null = null;

  /**
   * Shows one paragraph per array entry, each as its own Text object stacked with an explicit
   * gap — avoids relying on blank-line ("\n\n") preservation inside a single wrapped Text,
   * which some mobile browsers don't render reliably.
   */
  show(paragraphs: string[], onOkay: () => void): void {
    for (const text of this.paragraphTexts) {
      text.destroy();
    }
    this.paragraphTexts = [];

    let y = TEXT_TOP;
    for (const paragraph of paragraphs) {
      const text = this.scene.add.text(GAME_WIDTH / 2, y, paragraph, {
        fontSize: BODY_FONT_SIZE,
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        align: "center",
        lineSpacing: 6,
        wordWrap: { width: GAME_WIDTH - 60 },
      }).setOrigin(0.5, 0);

      this.container.add(text);
      this.paragraphTexts.push(text);
      y += text.height + PARAGRAPH_GAP;
    }

    this.onOkayCallback = onOkay;
    this.container.setVisible(true);
  }
}
