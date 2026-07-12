import Phaser from "phaser";
import { generateQuestion, SESSION_INSTRUCTIONS } from "../data/questionGenerator";
import type { Hit } from "../types";
import {
  ANSWER_STAGGER_MS,
  CORRECT_STREAK_FOR_ROW_CLEAR,
  FALL_START_Y,
  GAME_WIDTH,
  POINTS_PER_CORRECT,
} from "../game/constants";
import {
  BG_CREAM,
  BLOCK_COLORS,
  CARD_WHITE,
  CORAL,
  FONT_FAMILY,
  SOFT_GREEN,
  TEXT_DARK,
  TEXT_GRAY,
  toCssHex,
} from "../game/theme";
import { FallingAnswer } from "../game/FallingAnswer";
import { StackManager } from "../game/StackManager";
import { CluePopup } from "../ui/CluePopup";

const ANSWER_X_POSITIONS = [GAME_WIDTH * 0.1833, GAME_WIDTH * 0.5, GAME_WIDTH * 0.8167];
const CARD_LEFT = 20;
const CARD_TOP = 56;
const CARD_RADIUS = 20;
const CARD_PADDING = 16;

export class GameScene extends Phaser.Scene {
  private hits: Hit[] = [];
  private stackManager!: StackManager;
  private cluePopup!: CluePopup;

  private clueShown = false;

  private score = 0;
  private correctCount = 0;
  private missCount = 0;
  private roundActive = false;
  private currentAnswers: FallingAnswer[] = [];
  private pendingSpawnTimers: Phaser.Time.TimerEvent[] = [];

  private scoreText!: Phaser.GameObjects.Text;
  private missText!: Phaser.GameObjects.Text;
  private ribbonCard!: Phaser.GameObjects.Graphics;
  private artistLabel!: Phaser.GameObjects.Text;
  private yearLabel!: Phaser.GameObjects.Text;
  private feedbackFlash!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("Game");
  }

  create(): void {
    this.hits = this.registry.get("hits") as Hit[];
    this.clueShown = false;
    this.score = 0;
    this.correctCount = 0;
    this.missCount = 0;
    this.roundActive = false;
    this.currentAnswers = [];
    this.pendingSpawnTimers = [];

    this.cameras.main.setBackgroundColor(BG_CREAM);

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "18px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "700",
    });
    this.missText = this.add.text(GAME_WIDTH - 16, 16, "Misses: 0/8", {
      fontSize: "18px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(CORAL),
      fontStyle: "700",
    }).setOrigin(1, 0);

    this.ribbonCard = this.add.graphics();

    this.artistLabel = this.add
      .text(GAME_WIDTH / 2, CARD_TOP + CARD_PADDING, "", {
        fontSize: "22px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
        fontStyle: "700",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 40 - CARD_PADDING * 2 },
      })
      .setOrigin(0.5, 0);
    this.yearLabel = this.add
      .text(GAME_WIDTH / 2, 0, "", {
        fontSize: "16px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_GRAY),
        align: "center",
      })
      .setOrigin(0.5, 0);

    this.feedbackFlash = this.add.rectangle(0, 0, GAME_WIDTH, this.scale.height, 0xffffff, 0);
    this.feedbackFlash.setOrigin(0);
    this.feedbackFlash.setDepth(50);

    this.stackManager = new StackManager(this);
    this.cluePopup = new CluePopup(this);

    this.startNextRound();
  }

  update(_time: number, deltaMs: number): void {
    if (!this.roundActive) return;

    const deltaSeconds = deltaMs / 1000;
    const landingY = this.stackManager.getLandingY();

    for (const answer of [...this.currentAnswers]) {
      const landed = answer.update(deltaSeconds, landingY);
      if (!landed) continue;

      if (answer.isCorrect) {
        // The correct answer reached the bottom without being tapped — that's a miss.
        this.resolveRound(true);
      } else {
        answer.destroy();
        this.currentAnswers = this.currentAnswers.filter((a) => a !== answer);
      }
    }
  }

  private startNextRound(): void {
    const question = generateQuestion(this.hits);

    this.artistLabel.setText(question.category);
    this.yearLabel.y = this.artistLabel.y + this.artistLabel.height + 4;
    this.yearLabel.setText(question.subcategory);

    const cardHeight = this.yearLabel.y + this.yearLabel.height + CARD_PADDING - CARD_TOP;
    this.ribbonCard.clear();
    this.ribbonCard.fillStyle(0x000000, 0.08);
    this.ribbonCard.fillRoundedRect(CARD_LEFT, CARD_TOP + 4, GAME_WIDTH - CARD_LEFT * 2, cardHeight, CARD_RADIUS);
    this.ribbonCard.fillStyle(CARD_WHITE, 1);
    this.ribbonCard.fillRoundedRect(CARD_LEFT, CARD_TOP, GAME_WIDTH - CARD_LEFT * 2, cardHeight, CARD_RADIUS);

    if (!this.clueShown) {
      this.clueShown = true;
      this.cluePopup.show(SESSION_INSTRUCTIONS, () => {
        this.spawnAnswers(question);
      });
    } else {
      this.spawnAnswers(question);
    }
  }

  /** Releases the 3 answers one at a time (staggered) at shuffled, randomized-within-lane positions. */
  private spawnAnswers(question: ReturnType<typeof generateQuestion>): void {
    const answers = Phaser.Utils.Array.Shuffle([...question.answers]);
    const lanes = Phaser.Utils.Array.Shuffle([...ANSWER_X_POSITIONS]);
    const colors = Phaser.Utils.Array.Shuffle([...BLOCK_COLORS]);

    this.currentAnswers = [];
    this.pendingSpawnTimers = answers.map((a, i) =>
      this.time.delayedCall(i * ANSWER_STAGGER_MS, () => {
        const block = new FallingAnswer(
          this, lanes[i], FALL_START_Y, a.title, colors[i % colors.length], a.isCorrect,
          (tapped) => this.handleTap(tapped)
        );
        this.currentAnswers.push(block);
      })
    );
    this.roundActive = true;
  }

  private handleTap(answer: FallingAnswer): void {
    if (!this.roundActive) return;
    this.resolveRound(!answer.isCorrect);
  }

  /** Ends the current round. `wasMiss` is true for a wrong tap OR the correct answer landing unanswered. */
  private resolveRound(wasMiss: boolean): void {
    this.roundActive = false;

    for (const timer of this.pendingSpawnTimers) {
      timer.remove();
    }
    this.pendingSpawnTimers = [];

    for (const answer of this.currentAnswers) {
      answer.disableInput();
      answer.destroy();
    }
    this.currentAnswers = [];

    if (wasMiss) {
      this.missCount++;
      this.missText.setText(`Misses: ${this.missCount > 8 ? 8 : this.missCount}/8`);
      this.flash(0xff3333);

      const isGameOver = this.stackManager.addMiss();
      if (isGameOver) {
        this.time.delayedCall(500, () => this.scene.start("GameOver", { score: this.score }));
        return;
      }
    } else {
      this.score += POINTS_PER_CORRECT;
      this.correctCount++;
      this.scoreText.setText(`Score: ${this.score}`);
      this.flash(SOFT_GREEN);

      if (this.correctCount % CORRECT_STREAK_FOR_ROW_CLEAR === 0) {
        this.stackManager.clearRow();
      }
    }

    this.time.delayedCall(700, () => this.startNextRound());
  }

  private flash(color: number): void {
    this.feedbackFlash.setFillStyle(color, 0.35);
    this.feedbackFlash.setAlpha(1);
    this.tweens.add({
      targets: this.feedbackFlash,
      alpha: 0,
      duration: 300,
    });
  }
}
