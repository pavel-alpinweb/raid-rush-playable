import * as Phaser from "phaser";
import { FAIL_TEXT } from "@/configs/gameplay.config.js";

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
    scene.load.atlas("player_hit", "assets/animation/hero-hit.png", "assets/animation/hero-hit.json");
    scene.load.atlas("player_bonus", "assets/animation/hero-bonus.png", "assets/animation/hero-bonus.json");
    scene.load.atlas("player_damage", "assets/animation/electricity.png", "assets/animation/electricity.json");
  },

  preparePlayerAnimation(scene) {
    const waitFrameNames = this.getSortedFrameNames(scene, "player_wait");
    const moveFrameNames = this.getSortedFrameNames(scene, "player_move");
    const hitFrameNames = this.getSortedFrameNames(scene, "player_hit");
    const bonusFrameNames = this.getSortedFrameNames(scene, "player_bonus");
    const damageFrameNames = this.getSortedFrameNames(scene, "player_damage");

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
      key: "player_hit",
      frames: hitFrameNames.map((frame) => ({ key: "player_hit", frame })),
      frameRate: 20,
      repeat: 1,
    });
    scene.anims.create({
      key: "player_bonus",
      frames: bonusFrameNames.map((frame) => ({ key: "player_bonus", frame })),
      frameRate: 20,
      repeat: 0,
    });
    scene.anims.create({
      key: "player_damage",
      frames: damageFrameNames.map((frame) => ({ key: "player_damage", frame })),
      frameRate: 20,
      repeat: 0,
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

  createPlayerBonusAnimation(player) {
    if (!player?.scene) {
      return null;
    }

    const scene = player.scene;
    const [firstBonusFrame] = this.getSortedFrameNames(scene, "player_bonus");
    const bonusAnimation = scene.add
      .sprite(player.x, player.y, "player_bonus", firstBonusFrame)
      .setOrigin(player.originX, player.originY)
      .setDisplaySize(player.displayWidth, player.displayHeight)
      .setDepth((player.depth ?? 0) + 1);

    bonusAnimation.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      bonusAnimation.destroy();
    });

    bonusAnimation.play("player_bonus");

    return bonusAnimation;
  },

  createPlayerDamageAnimation(player) {
    if (!player?.scene) {
      return null;
    }

    const scene = player.scene;
    const [firstDamageFrame] = this.getSortedFrameNames(scene, "player_damage");
    const damageAnimation = scene.add
      .sprite(player.x, player.y, "player_damage", firstDamageFrame)
      .setOrigin(player.originX, player.originY)
      .setDisplaySize(player.displayWidth, player.displayHeight)
      .setDepth((player.depth ?? 0) + 1);

    damageAnimation.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      damageAnimation.destroy();
    });

    damageAnimation.play("player_damage");

    return damageAnimation;
  },

  displayPlayerHealth(player, playerStore) {
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

  configureCameraFollow(scene, player, deadzoneWidth, deadzoneHeight, zoom = 1) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
    scene.cameras.main.setZoom(zoom);
  },

  stopPlayer(player) {
    player.setVelocity(0, 0);
    player.body?.stop();
    player.play("player_wait", true);
    player.currentTarget = null;
    this.clearTrack(player);
  },

  clearTrack(player) {
    if (!player) {
      return;
    }

    const trackDots = player.trackDots ?? [];

    trackDots.forEach((dot) => dot.destroy());
    player.trackDots = [];
    player.trackOrigin = null;
    player.trackDirection = null;
    player.trackTarget = null;
  },

  createTrackDots(player, startX, startY, endX, endY) {
    const scene = player?.scene;
    if (!scene) {
      return;
    }

    const direction = new Phaser.Math.Vector2(endX - startX, endY - startY);
    const distance = direction.length();
    if (distance === 0) {
      return;
    }

    const dotSpacing = 26;
    const dotRadius = 6;
    const dotColor = 0x70d6ff;
    const dotAlpha = 0.95;
    const dotDepth = player.depth - 1;

    direction.normalize();
    const dotCount = Math.max(1, Math.ceil(distance / dotSpacing));
    const dots = [];

    for (let index = 1; index <= dotCount; index += 1) {
      const traveled = Math.min(index * dotSpacing, distance);
      const dot = scene.add.circle(startX + direction.x * traveled, startY + direction.y * traveled, dotRadius, dotColor, dotAlpha);
      dot.setDepth(dotDepth);
      dot.trackDistance = traveled;
      dots.push(dot);
    }

    player.trackDots = dots;
    player.trackOrigin = new Phaser.Math.Vector2(startX, startY);
    player.trackDirection = direction.clone();
    player.trackTarget = player.currentTarget ?? null;
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
    this.highlightTrack(player, target);
  },

  highlightTrack(player, target) {
    if (!player?.scene || !target?.scene) {
      this.clearTrack(player);
      return;
    }

    const playerCenter = player.getCenter();
    const targetCenter = target.getCenter();
    const trackTargetChanged = player.trackTarget !== target;

    if (trackTargetChanged || !player.trackDots?.length || !player.trackOrigin || !player.trackDirection) {
      this.clearTrack(player);
      this.createTrackDots(player, playerCenter.x, playerCenter.y, targetCenter.x, targetCenter.y);
      return;
    }

    const traveled = new Phaser.Math.Vector2(playerCenter.x - player.trackOrigin.x, playerCenter.y - player.trackOrigin.y).dot(player.trackDirection);

    player.trackDots.forEach((dot) => {
      dot.setVisible(dot.trackDistance > traveled);
    });
  },

  destroyPlayer(player, playerStore) {
    if (!player?.scene || !playerStore) {
      return;
    }

    this.clearTrack(player);
    player.setVelocity(0, 0);
    player.body?.stop();
    player.play("player_wait", true);

    const damageAnimation = this.createPlayerDamageAnimation(player);
    const finishGameOver = () => {
      playerStore.$patch((state) => {
        state.isGameOver = true;
        state.currentHealth = 0;
        state.gameOverText = FAIL_TEXT;
      });
    };

    if (damageAnimation) {
      damageAnimation.once(Phaser.Animations.Events.ANIMATION_COMPLETE, finishGameOver);
      return;
    }

    finishGameOver();
  },
};
