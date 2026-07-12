import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BG_CREAM, BLOCK_COLORS } from "./theme";

const CONSOLE_DARK = 0x2a241e;
const CONSOLE_MID = 0x3a322a;
const WARM_BROWN_TOP = 0x6b5a4a;
const WARM_BROWN_BOTTOM = 0x453a30;

/**
 * Draws a stylized recording-studio scene (mixing console, faders, knobs, monitor
 * speakers) as flat vector shapes — deliberately illustrated rather than a photo, to
 * match the game's existing cartoon art style and avoid any image-rights concerns.
 * A translucent cream wash sits on top so the foreground UI stays legible.
 */
export function drawStudioBackground(scene: Phaser.Scene): void {
  const g = scene.add.graphics();

  g.fillGradientStyle(WARM_BROWN_TOP, WARM_BROWN_TOP, WARM_BROWN_BOTTOM, WARM_BROWN_BOTTOM, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Monitor speakers, left and right.
  for (const side of [0, 1]) {
    const x = side === 0 ? -25 : GAME_WIDTH - 45;
    g.fillStyle(CONSOLE_DARK, 1);
    g.fillRoundedRect(x, GAME_HEIGHT * 0.14, 70, 150, 12);
    g.fillStyle(0x1a1512, 1);
    g.fillCircle(x + 35, GAME_HEIGHT * 0.14 + 45, 24);
    g.fillCircle(x + 35, GAME_HEIGHT * 0.14 + 105, 16);
  }

  // Mixing console body.
  const consoleTop = GAME_HEIGHT * 0.58;
  const consoleHeight = GAME_HEIGHT * 0.34;
  g.fillStyle(CONSOLE_MID, 1);
  g.fillRoundedRect(16, consoleTop, GAME_WIDTH - 32, consoleHeight, 18);

  // Fader row.
  const faderY = consoleTop + consoleHeight * 0.28;
  const faderTravel = consoleHeight * 0.4;
  for (let i = 0; i < 6; i++) {
    const x = 56 + i * ((GAME_WIDTH - 112) / 5);
    g.fillStyle(CONSOLE_DARK, 1);
    g.fillRoundedRect(x - 5, faderY, 10, faderTravel, 4);
    g.fillStyle(BLOCK_COLORS[i % BLOCK_COLORS.length], 1);
    g.fillRoundedRect(x - 12, faderY + faderTravel * (0.3 + 0.1 * (i % 3)), 24, 14, 5);
  }

  // Knob row.
  const knobY = consoleTop + consoleHeight * 0.82;
  for (let i = 0; i < 5; i++) {
    const x = 66 + i * ((GAME_WIDTH - 132) / 4);
    g.fillStyle(CONSOLE_DARK, 1);
    g.fillCircle(x, knobY, 15);
    g.lineStyle(3, BLOCK_COLORS[(i + 2) % BLOCK_COLORS.length], 0.9);
    g.beginPath();
    g.arc(x, knobY, 15, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(90 + i * 30));
    g.strokePath();
  }

  // Soft cream wash so the white ribbon card / blocks / signs stay legible on top.
  g.fillStyle(BG_CREAM, 0.55);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}
