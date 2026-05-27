import * as Phaser from "phaser";
import { WIN_TEXT } from "@/configs/gameplay.config.js";
import { playerComposition } from "@/compositions/Player.composition.js";

export const enemiesComposition = {
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

  preloadEnemiesAnimation(scene) {
    scene.load.atlas("enemy_damage", "assets/animation/enemy-damage.png", "assets/animation/enemy-damage.json");
  },

  prepareEnemiesAnimation(scene) {
    const sprutFrameNames = this.getSortedFrameNames(scene, "sprut_animation");
    scene.anims.create({
      key: "sprut",
      frames: sprutFrameNames.map((frameName) => ({ key: "sprut_animation", frame: frameName })),
      frameRate: 12,
      repeat: -1,
    });

    const skatFrameNames = this.getSortedFrameNames(scene, "skat_animation");
    scene.anims.create({
      key: "skat",
      frames: skatFrameNames.map((frameName) => ({ key: "skat_animation", frame: frameName })),
      frameRate: 12,
      repeat: -1,
    });

    const enemyDamageFrameNames = this.getSortedFrameNames(scene, "enemy_damage");
    scene.anims.create({
      key: "enemy_damage",
      frames: enemyDamageFrameNames.map((frameName) => ({ key: "enemy_damage", frame: frameName })),
      frameRate: 20,
      repeat: 0,
    });
  },

  createEnemyDeathAnimation(enemy) {
    if (!enemy?.scene) {
      return null;
    }

    const scene = enemy.scene;
    const [firstDamageFrame] = this.getSortedFrameNames(scene, "enemy_damage");
    const deathAnimation = scene.add
      .sprite(enemy.x, enemy.y, "enemy_damage", firstDamageFrame)
      .setOrigin(enemy.originX, enemy.originY)
      .setDisplaySize(enemy.displayWidth, enemy.displayHeight)
      .setDepth((enemy.depth ?? 0) + 1);

    deathAnimation.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      deathAnimation.destroy();
    });

    deathAnimation.play("enemy_damage");

    return deathAnimation;
  },

  displayEnemyDamage(enemy) {
    if (!enemy?.scene) {
      return;
    }

    const scene = enemy.scene;
    const damageValue = enemy.damage ?? 0;

    if (!enemy.damageText) {
      enemy.damageText = scene.add.text(0, 0, String(damageValue), {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ff2a2a",
        stroke: "#000000",
        strokeThickness: 4,
      });
      enemy.damageText.setOrigin(0.5, 1);
      enemy.damageText.setDepth(enemy.depth + 1);
    }

    enemy.damageText.setText(String(damageValue));
    enemy.damageText.setPosition(enemy.x, enemy.getTopCenter().y);
  },

  killEnemy(player, enemy, enemyLayer) {
    if (!player?.scene || !enemy?.scene || enemy.isDead) {
      return;
    }

    enemy.isDead = true;
    player.currentTarget = null;
    playerComposition.clearTrack(player);
    enemy.body?.stop?.();
    if (enemy.body) {
      enemy.body.enable = false;
    }
    enemy.disableInteractive?.();

    player.setVelocity(0, 0);
    player.body?.stop();

    player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (player.scene) {
        player.scene.playerStore?.$patch((state) => {
          state.currentHealth += enemy.damage;
        });
      }

      player.play("player_wait", true);
      playerComposition.createPlayerBonusAnimation(player);

      const enemyDeathAnimation = this.createEnemyDeathAnimation(enemy);
      const finishEnemyDeath = () => {
        enemy.damageText?.destroy();
        enemy.destroy();

        if (enemyLayer.getLength() === 0 && player.scene) {
          player.scene.playerStore?.$patch((state) => {
            state.isGameOver = true;
            state.gameOverText = WIN_TEXT;
          });
        }
      };

      if (enemyDeathAnimation) {
        enemyDeathAnimation.once(Phaser.Animations.Events.ANIMATION_COMPLETE, finishEnemyDeath);
        return;
      }

      finishEnemyDeath();
    });

    player.play("player_hit");
  },
};
