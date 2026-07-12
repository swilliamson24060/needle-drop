import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/constants";
import { BG_CREAM } from "./game/theme";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { DecadeSelectScene } from "./scenes/DecadeSelectScene";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";

function startGame() {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: BG_CREAM,
    parent: "app",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      activePointers: 1,
    },
    dom: {
      createContainer: true,
    },
    scene: [BootScene, MenuScene, DecadeSelectScene, GameScene, GameOverScene, LeaderboardScene],
  });

  if (import.meta.env.DEV) {
    (window as unknown as { __game: Phaser.Game }).__game = game;
  }
}

// Wait for the custom font so the very first frame doesn't flash the fallback font.
document.fonts.load('700 16px "Baloo 2"').finally(() => {
  document.fonts.ready.finally(startGame);
});
