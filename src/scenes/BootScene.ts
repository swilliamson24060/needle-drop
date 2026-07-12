import Phaser from "phaser";
import { loadChartRows } from "../data/csvLoader";
import { buildHits } from "../data/questionGenerator";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { BG_CREAM, CORAL, FONT_FAMILY, TEXT_DARK, toCssHex } from "../game/theme";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(BG_CREAM);

    const statusText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Loading chart data…", {
        fontSize: "18px",
        fontFamily: FONT_FAMILY,
        color: toCssHex(TEXT_DARK),
      })
      .setOrigin(0.5);

    loadChartRows(`${import.meta.env.BASE_URL}data/billboard.csv`)
      .then((rows) => {
        const hits = buildHits(rows);
        if (hits.length < 3) {
          throw new Error(`Only found ${hits.length} usable hits in the CSV; need at least 3.`);
        }
        this.registry.set("hits", hits);
        this.scene.start("Menu");
      })
      .catch((err) => {
        console.error(err);
        statusText.setText(`Failed to load chart data:\n${(err as Error).message}`);
        statusText.setColor(toCssHex(CORAL));
      });
  }
}
