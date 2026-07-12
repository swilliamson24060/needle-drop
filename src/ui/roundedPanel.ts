import Phaser from "phaser";

/**
 * Draws a rounded rectangle with a soft drop shadow, centered on (0,0) in local space —
 * drop the returned Graphics into a Container at any x/y, same as a centered Rectangle
 * GameObject would behave.
 */
export function drawRoundedRectWithShadow(
  scene: Phaser.Scene,
  width: number,
  height: number,
  fillColor: number,
  radius = 20
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  g.fillStyle(0x000000, 0.14);
  g.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, radius);

  g.fillStyle(fillColor, 1);
  g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

  return g;
}
