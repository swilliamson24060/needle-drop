import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { CARD_WHITE, CORAL, FONT_FAMILY, TEXT_DARK, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "./roundedPanel";

const MAX_NAME_LENGTH = 20;

/** Full-screen modal with a real HTML text field — no native browser dialog, so no page-origin chrome. */
export class NameEntryModal {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly inputEl: HTMLInputElement;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.setOrigin(0);

    const panelBg = drawRoundedRectWithShadow(scene, GAME_WIDTH - 60, 260, CARD_WHITE, 24);
    const panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [panelBg]);

    const title = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, "Enter your name for the leaderboard", {
        fontSize: "18px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "800",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 120 },
      })
      .setOrigin(0.5);

    this.inputEl = document.createElement("input");
    this.inputEl.type = "text";
    this.inputEl.maxLength = MAX_NAME_LENGTH;
    this.inputEl.placeholder = "Your name";
    this.inputEl.style.cssText = `
      width: 260px;
      font-size: 18px;
      font-family: ${FONT_FAMILY};
      color: ${toCssHex(TEXT_DARK)};
      text-align: center;
      padding: 10px 14px;
      border-radius: 16px;
      border: 2px solid ${toCssHex(CORAL)};
      outline: none;
      box-sizing: border-box;
    `;
    const inputDom = scene.add.dom(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, this.inputEl);

    const buttonBg = drawRoundedRectWithShadow(scene, 160, 52, CORAL, 26);
    const button = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, [buttonBg]);
    button.setSize(160, 52);
    button.setInteractive({ useHandCursor: true });

    const buttonLabel = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "Save", {
        fontSize: "18px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.container = scene.add.container(0, 0, [overlay, panel, title, inputDom, button, buttonLabel]);
    this.container.setDepth(100);

    button.on("pointerdown", () => this.submit());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submit();
    });
  }

  private onSubmitCallback: ((name: string) => void) | null = null;

  /** Shows the modal and focuses the input; calls `onSubmit` once with the entered (or default) name. */
  show(onSubmit: (name: string) => void): void {
    this.onSubmitCallback = onSubmit;
    this.inputEl.value = "";
    // Let the DOM element mount before focusing.
    this.scene.time.delayedCall(50, () => this.inputEl.focus());
  }

  private submit(): void {
    const name = this.inputEl.value;
    this.container.destroy();
    this.onSubmitCallback?.(name);
  }
}
