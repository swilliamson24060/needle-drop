import Phaser from "phaser";
import { FALL_START_Y, GAME_WIDTH, ROW_HEIGHT, STACK_ROWS, STACK_TOP_Y } from "./constants";

/** Tracks how many rows of the bottom stack are filled, and renders it. */
export class StackManager {
  private filledRows = 0;
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.draw();
  }

  /** Adds a filled row from the bottom. Returns true if the stack is now full (game over). */
  addMiss(): boolean {
    this.filledRows = Math.min(this.filledRows + 1, STACK_ROWS);
    this.draw();
    return this.filledRows >= STACK_ROWS;
  }

  /** Removes one filled row, if any are filled. */
  clearRow(): void {
    this.filledRows = Math.max(this.filledRows - 1, 0);
    this.draw();
  }

  /** The y-coordinate falling blocks should stop at: the top of the current stack. */
  getLandingY(): number {
    return STACK_TOP_Y + (STACK_ROWS - this.filledRows) * ROW_HEIGHT;
  }

  getFallDistance(): number {
    return this.getLandingY() - FALL_START_Y;
  }

  getFilledRows(): number {
    return this.filledRows;
  }

  getMaxRows(): number {
    return STACK_ROWS;
  }

  private draw(): void {
    this.graphics.clear();
    for (let i = 0; i < this.filledRows; i++) {
      const rowIndex = STACK_ROWS - 1 - i; // fill from the bottom up
      const y = STACK_TOP_Y + rowIndex * ROW_HEIGHT;
      this.graphics.fillStyle(0xb33636, 1);
      this.graphics.fillRect(2, y, GAME_WIDTH - 4, ROW_HEIGHT - 2);
    }

    // Stack floor line for visual reference.
    this.graphics.lineStyle(1, 0x444444, 1);
    this.graphics.lineBetween(0, STACK_TOP_Y - 0.5, GAME_WIDTH, STACK_TOP_Y - 0.5);
  }
}
