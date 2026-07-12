import Phaser from "phaser";
import { buildSessionInstructions, decadeOf, generateQuestion } from "../data/questionGenerator";
import type { Hit } from "../types";
import {
  ANSWER_STAGGER_MS,
  BONUS_POINTS,
  CORRECT_STREAK_FOR_ROW_CLEAR,
  FALL_START_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  POINTS_PER_CORRECT,
  STACK_ROWS,
} from "../game/constants";
import {
  BLOCK_COLORS,
  BONUS_AMBER,
  CARD_WHITE,
  CORAL,
  FONT_FAMILY,
  TEXT_DARK,
  TEXT_GRAY,
  toCssHex,
} from "../game/theme";
import { FallingAnswer } from "../game/FallingAnswer";
import { BonusBlock } from "../game/BonusBlock";
import { StackManager } from "../game/StackManager";
import { CluePopup } from "../ui/CluePopup";
import { SignBadge } from "../ui/signBadge";
import { drawStudioBackground } from "../game/studioBackground";

const RIGHT_SIGN_COLOR = 0xff6b4a;
const SORRY_SIGN_COLOR = 0xd9534f;

const ANSWER_X_POSITIONS = [GAME_WIDTH * 0.1833, GAME_WIDTH * 0.5, GAME_WIDTH * 0.8167];
const CARD_LEFT = 20;
const CARD_TOP = 56;
const CARD_RADIUS = 20;
const CARD_PADDING = 16;

const SIGN_Y = GAME_HEIGHT - 46;
const BONUS_ROW_Y = SIGN_Y - 88;
const BONUS_LABEL_Y = BONUS_ROW_Y - 42;

export class GameScene extends Phaser.Scene {
  private hits: Hit[] = [];
  private decade!: number;
  private stackManager!: StackManager;
  private cluePopup!: CluePopup;

  private clueShown = false;

  private score = 0;
  private correctCount = 0;
  private missCount = 0;
  private roundActive = false;
  private currentAnswers: FallingAnswer[] = [];
  private pendingSpawnTimers: Phaser.Time.TimerEvent[] = [];
  private bonusBlocks: BonusBlock[] = [];

  private scoreText!: Phaser.GameObjects.Text;
  private missText!: Phaser.GameObjects.Text;
  private ribbonCard!: Phaser.GameObjects.Graphics;
  private artistLabel!: Phaser.GameObjects.Text;
  private yearLabel!: Phaser.GameObjects.Text;
  private rightSign!: SignBadge;
  private sorrySign!: SignBadge;
  private bonusLabel!: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  create(data: { decade: number }): void {
    this.decade = data.decade;
    const allHits = this.registry.get("hits") as Hit[];
    this.hits = allHits.filter((h) => decadeOf(h.year) === this.decade);
    this.clueShown = false;
    this.score = 0;
    this.correctCount = 0;
    this.missCount = 0;
    this.roundActive = false;
    this.currentAnswers = [];
    this.pendingSpawnTimers = [];
    this.bonusBlocks = [];

    drawStudioBackground(this);

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "18px",
      fontFamily: FONT_FAMILY,
      color: toCssHex(TEXT_DARK),
      fontStyle: "700",
    });
    this.missText = this.add.text(GAME_WIDTH - 16, 16, `Misses: 0/${STACK_ROWS}`, {
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

    this.rightSign = new SignBadge(
      this, GAME_WIDTH * 0.27, GAME_HEIGHT - 46, "RIGHT!", 150, 52, RIGHT_SIGN_COLOR
    );
    this.sorrySign = new SignBadge(
      this, GAME_WIDTH * 0.73, GAME_HEIGHT - 46, "OOH, SORRY!", 180, 52, SORRY_SIGN_COLOR
    );

    this.bonusLabel = this.add
      .text(GAME_WIDTH / 2, BONUS_LABEL_Y, "⭐ Bonus: Peak Position?", {
        fontSize: "14px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(BONUS_AMBER),
        fontStyle: "700",
      })
      .setOrigin(0.5)
      .setDepth(60)
      .setVisible(false);

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

    if (question.bonusAnswers) {
      this.spawnBonusBlocks(question.bonusAnswers);
    }

    if (!this.clueShown) {
      this.clueShown = true;
      this.cluePopup.show(buildSessionInstructions(this.decade), () => {
        this.spawnAnswers(question);
      });
    } else {
      this.spawnAnswers(question);
    }
  }

  /** Shows the 3 static bonus blocks (peak chart position) above the Right!/Ooh, sorry! signs. */
  private spawnBonusBlocks(bonusAnswers: NonNullable<ReturnType<typeof generateQuestion>["bonusAnswers"]>): void {
    const answers = Phaser.Utils.Array.Shuffle([...bonusAnswers]);
    const lanes = Phaser.Utils.Array.Shuffle([...ANSWER_X_POSITIONS]);

    this.bonusLabel.setVisible(true);
    this.bonusBlocks = answers.map(
      (a, i) => new BonusBlock(
        this, lanes[i], BONUS_ROW_Y, a.peakPosition, a.isCorrect,
        (tapped) => this.handleBonusTap(tapped)
      )
    );
  }

  private clearBonusBlocks(): void {
    for (const block of this.bonusBlocks) {
      block.disableInput();
      block.destroy();
    }
    this.bonusBlocks = [];
    this.bonusLabel.setVisible(false);
  }

  /** A bonus tap never affects the main round — it just scores (if correct) and clears itself. */
  private handleBonusTap(block: BonusBlock): void {
    if (block.isCorrect) {
      this.score += BONUS_POINTS;
      this.scoreText.setText(`Score: ${this.score}`);
      this.rightSign.flash(this);
    }
    this.clearBonusBlocks();
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
    this.clearBonusBlocks();

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
      this.missText.setText(`Misses: ${Math.min(this.missCount, STACK_ROWS)}/${STACK_ROWS}`);
      this.sorrySign.flash(this);

      const isGameOver = this.stackManager.addMiss();
      if (isGameOver) {
        this.time.delayedCall(500, () => this.scene.start("GameOver", { score: this.score, decade: this.decade }));
        return;
      }
    } else {
      this.score += POINTS_PER_CORRECT;
      this.correctCount++;
      this.scoreText.setText(`Score: ${this.score}`);
      this.rightSign.flash(this);

      if (this.correctCount % CORRECT_STREAK_FOR_ROW_CLEAR === 0) {
        this.stackManager.clearRow();
      }
    }

    this.time.delayedCall(700, () => this.startNextRound());
  }
}
