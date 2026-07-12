import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BONUS_CORRECT_BG, BONUS_WRONG_BG, CARD_WHITE, FONT_FAMILY, TEXT_DARK, toCssHex } from "../game/theme";
import { drawRoundedRectWithShadow } from "./roundedPanel";
import { BonusBlock } from "../game/BonusBlock";
import type { PeakAnswer } from "../types";

export type BonusPopupResultHandler = (correct: boolean) => void;

const PANEL_WIDTH = GAME_WIDTH - 40;
const PANEL_HEIGHT = 320;
const BLOCK_X_POSITIONS = [GAME_WIDTH * 0.1833, GAME_WIDTH * 0.5, GAME_WIDTH * 0.8167];
const BLOCK_Y = GAME_HEIGHT / 2 + 10;
const PROMPT_TEXT = "⭐ Bonus!\nWhat was the peak chart position?";
const FEEDBACK_DELAY_MS = 3500;
const PANEL_RADIUS = 24;

/**
 * Full-screen modal shown right after a correct answer: the player must pick the hit's
 * real peak chart position — the next question doesn't appear until they do.
 */
export class BonusPopup {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly panelBg: Phaser.GameObjects.Graphics;
  private readonly promptText: Phaser.GameObjects.Text;
  private blocks: BonusBlock[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.setOrigin(0);

    this.panelBg = drawRoundedRectWithShadow(scene, PANEL_WIDTH, PANEL_HEIGHT, CARD_WHITE, PANEL_RADIUS);
    const panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [this.panelBg]);

    this.promptText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, PROMPT_TEXT, {
        fontSize: "20px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "800",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.container = scene.add.container(0, 0, [overlay, panel, this.promptText]);
    this.container.setDepth(100);
    this.container.setVisible(false);
  }

  /** Shows the 3 peak-position choices; calls `onResult` once the player taps one. */
  show(bonusAnswers: [PeakAnswer, PeakAnswer, PeakAnswer], onResult: BonusPopupResultHandler): void {
    this.promptText.setText(PROMPT_TEXT);
    this.setPanelColor(CARD_WHITE);
    const answers = Phaser.Utils.Array.Shuffle([...bonusAnswers]);

    this.blocks = answers.map(
      (a, i) =>
        new BonusBlock(this.scene, BLOCK_X_POSITIONS[i], BLOCK_Y, a.peakPosition, a.isCorrect, (tapped) =>
          this.handleTap(tapped, answers, onResult)
        )
    );
    for (const block of this.blocks) {
      this.container.add(block.container);
    }
    this.container.setVisible(true);
  }

  private handleTap(tapped: BonusBlock, answers: PeakAnswer[], onResult: BonusPopupResultHandler): void {
    for (const block of this.blocks) {
      block.disableInput();
    }

    this.promptText.setText(
      tapped.isCorrect
        ? "Nice! That's the peak. +5 bonus points"
        : `Not quite — it peaked at #${answers.find((a) => a.isCorrect)!.peakPosition}.`
    );
    this.setPanelColor(tapped.isCorrect ? BONUS_CORRECT_BG : BONUS_WRONG_BG);

    this.scene.time.delayedCall(FEEDBACK_DELAY_MS, () => {
      this.hide();
      onResult(tapped.isCorrect);
    });
  }

  private hide(): void {
    for (const block of this.blocks) {
      block.destroy();
    }
    this.blocks = [];
    this.container.setVisible(false);
  }

  private setPanelColor(color: number): void {
    this.panelBg.clear();
    this.panelBg.fillStyle(0x000000, 0.14);
    this.panelBg.fillRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2 + 5, PANEL_WIDTH, PANEL_HEIGHT, PANEL_RADIUS);
    this.panelBg.fillStyle(color, 1);
    this.panelBg.fillRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, PANEL_RADIUS);
  }
}
