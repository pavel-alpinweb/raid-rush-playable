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
    scene.load.atlas("player_move", "assets/animation/move.png", "assets/animation/move.json");
    scene.load.atlas("player_jump", "assets/animation/jump.png", "assets/animation/jump.json");
  },

  preparePlayerAnimation(scene) {
    const waitFrameNames = this.getSortedFrameNames(scene, "player_wait");

    scene.anims.create({
      key: "player_wait",
      frames: waitFrameNames.map((frame) => ({ key: "player_wait", frame })),
      frameRate: 15,
      repeat: -1
    });
    scene.anims.create({
      key: "player_move",
      frames: scene.anims.generateFrameNames("player_move", { start: 1, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: "player_jump",
      frames: scene.anims.generateFrameNames("player_jump", { start: 1, end: 8 }),
      frameRate: 8,
      repeat: 1
    });
  },

  createPlayer(scene, x, y, displayWidth, displayHeight, bodyWidth, bodyHeight, speed, maxHealth) {
    const [firstWaitFrame] = this.getSortedFrameNames(scene, "player_wait");
    const player = scene.physics.add.sprite(x, y, "player_wait", firstWaitFrame)
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

  configureCameraFollow(scene, player, deadzoneWidth, deadzoneHeight) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
  },
};
