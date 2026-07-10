import Phaser from "phaser";
import { generateQuestion, SESSION_INSTRUCTIONS } from "../data/questionGenerator";
import type { Hit } from "../types";
import {
  CORRECT_STREAK_FOR_ROW_CLEAR,
  FALL_START_Y,
  GAME_WIDTH,
  POINTS_PER_CORRECT,
} from "../game/constants";
import { FallingAnswer } from "../game/FallingAnswer";
import { StackManager } from "../game/StackManager";
import { CluePopup } from "../ui/CluePopup";

const ANSWER_X_POSITIONS = [GAME_WIDTH * 0.1833, GAME_WIDTH * 0.5, GAME_WIDTH * 0.8167];

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

  private scoreText!: Phaser.GameObjects.Text;
  private missText!: Phaser.GameObjects.Text;
  private titleLabel!: Phaser.GameObjects.Text;
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

    this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "18px", color: "#ffffff" });
    this.missText = this.add.text(GAME_WIDTH - 16, 16, "Misses: 0/8", {
      fontSize: "18px",
      color: "#ffffff",
    }).setOrigin(1, 0);
    this.titleLabel = this.add
      .text(GAME_WIDTH / 2, 42, "", {
        fontSize: "22px",
        color: "#ffe066",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 40 },
      })
      .setOrigin(0.5, 0);
    this.artistLabel = this.add
      .text(GAME_WIDTH / 2, 78, "", { fontSize: "19px", color: "#ffffff", align: "center" })
      .setOrigin(0.5, 0);
    this.yearLabel = this.add
      .text(GAME_WIDTH / 2, 102, "", { fontSize: "19px", color: "#cccccc", align: "center" })
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

    this.titleLabel.setText(question.clue);
    this.artistLabel.setText(question.category);
    this.yearLabel.setText(question.subcategory);

    // Reflow below the title in case it wrapped to a second line.
    this.artistLabel.y = this.titleLabel.y + this.titleLabel.height + 6;
    this.yearLabel.y = this.artistLabel.y + this.artistLabel.height + 4;

    if (!this.clueShown) {
      this.clueShown = true;
      this.cluePopup.show(SESSION_INSTRUCTIONS, () => {
        this.spawnAnswers(question);
      });
    } else {
      this.spawnAnswers(question);
    }
  }

  private spawnAnswers(question: ReturnType<typeof generateQuestion>): void {
    const answers = Phaser.Utils.Array.Shuffle([
      { text: question.correctAnswer, isCorrect: true },
      { text: question.wrongAnswers[0], isCorrect: false },
      { text: question.wrongAnswers[1], isCorrect: false },
    ]);

    this.currentAnswers = answers.map(
      (a, i) => new FallingAnswer(
        this, ANSWER_X_POSITIONS[i], FALL_START_Y, a.text, question.subcategory, a.isCorrect,
        (tapped) => this.handleTap(tapped)
      )
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
      this.flash(0x33ff77);

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
