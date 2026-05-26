import * as Phaser from "phaser";

export const playerComposition = {
  getSortedFrameNames(scene, textureKey) {
    return scene.textures
      .get(textureKey)
      .getFrameNames()
      .slice()
      .sort((a, b) => {
        const frameA = parseInt(a, 10);
        const frameB = parseInt(b, 10);

        if (Number.isNaN(frameA) || Number.isNaN(frameB)) {
          return a.localeCompare(b);
        }

        return frameA - frameB;
      });
  },

  preloadPlayerAnimation(scene) {
    scene.load.atlas("player_wait", "assets/animation/hero-idle.png", "assets/animation/hero-idle.json");
    scene.load.atlas("player_move", "assets/animation/hero-run.png", "assets/animation/hero-run.json");
    scene.load.atlas("player_jump", "assets/animation/jump.png", "assets/animation/jump.json");
  },

  preparePlayerAnimation(scene) {
    const waitFrameNames = this.getSortedFrameNames(scene, "player_wait");
    const moveFrameNames = this.getSortedFrameNames(scene, "player_move");

    scene.anims.create({
      key: "player_wait",
      frames: waitFrameNames.map((frame) => ({ key: "player_wait", frame })),
      frameRate: 15,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_move",
      frames: moveFrameNames.map((frame) => ({ key: "player_move", frame })),
      frameRate: 20,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_jump",
      frames: scene.anims.generateFrameNames("player_jump", { start: 1, end: 8 }),
      frameRate: 8,
      repeat: 1,
    });
  },

  createPlayer(scene, x, y, displayWidth, displayHeight, bodyWidth, bodyHeight, speed, maxHealth) {
    const [firstWaitFrame] = this.getSortedFrameNames(scene, "player_wait");
    const player = scene.physics.add
      .sprite(x, y, "player_wait", firstWaitFrame)
      .setBodySize(bodyWidth, bodyHeight)
      .setDisplaySize(displayWidth, displayHeight)
      .setOrigin(0.5, 1)
      .play("player_wait")
      .refreshBody();
    player.speed = speed;
    player.depth = 100;
    player.maxHealth = maxHealth;
    player.currentHealth = maxHealth;
    return player;
  },

  displayPlayerPoints(player, playerStore) {
    if (!player?.scene || !playerStore) {
      return;
    }

    const scene = player.scene;
    const healthValue = playerStore.currentHealth;

    if (!player.pointsText) {
      player.pointsText = scene.add.text(0, 0, String(healthValue), {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#1e6bff",
        stroke: "#000000",
        strokeThickness: 4,
      });
      player.pointsText.setOrigin(0.5, 1);
      player.pointsText.setDepth(player.depth + 1);
    }

    player.pointsText.setText(String(healthValue));
    player.pointsText.setPosition(player.x, player.getTopCenter().y);
  },

  configureCameraFollow(scene, player, deadzoneWidth, deadzoneHeight) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
  },

  stopPlayer(player) {
    player.setVelocity(0, 0);
    player.body?.stop();
    player.play("player_wait", true);
    player.currentTarget = null;
  },

  movePlayerToObject(player, target) {
    if (!player?.body || !target) {
      return;
    }

    const playerCenter = player.getCenter();
    const targetCenter = target.getCenter();
    const direction = new Phaser.Math.Vector2(targetCenter.x - playerCenter.x, targetCenter.y - playerCenter.y);

    if (direction.lengthSq() === 0) {
      this.stopPlayer(player);
      return;
    }

    direction.normalize();
    player.setVelocity(direction.x * player.speed, direction.y * player.speed);
    player.play("player_move", true);
    player.currentTarget = target;
  },
};
