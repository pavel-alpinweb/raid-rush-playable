import * as Phaser from "phaser";
import { playerComposition } from "@/compositions/Player.composition.js";

export const bonusComposition = {
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

  preloadBonusAnimation(scene) {
    scene.load.atlas("chest_animation", "assets/animation/open-chest.png", "assets/animation/open-chest.json");
  },

  prepareBonusAnimation(scene) {
    const chestFrameNames = this.getSortedFrameNames(scene, "chest_animation").slice().reverse();

    scene.anims.create({
      key: "open-chest",
      frames: chestFrameNames.map((frame) => ({ key: "chest_animation", frame })),
      frameRate: 12,
      repeat: 0,
    });
  },

  getBonus(playerStore, chest, player) {
    if (!chest?.scene || !playerStore || chest.isCollected) {
      return;
    }

    chest.isCollected = true;
    chest.body?.stop?.();
    if (chest.body) {
      chest.body.enable = false;
    }
    chest.disableInteractive?.();

    chest.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      playerStore.$patch((state) => {
        state.currentHealth += state.chestBonusValue;
      });
      playerComposition.createPlayerBonusAnimation(player);
      chest.bonusText?.destroy();
      chest.destroy();
    });
    chest.play("open-chest");
  },

  displayChestBonus(chest, playerStore) {
    if (!chest?.scene || !playerStore) {
      return;
    }

    const scene = chest.scene;
    const bonusValue = playerStore.chestBonusValue;

    if (!chest.bonusText) {
      chest.bonusText = scene.add.text(0, 0, String(bonusValue), {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#24b24a",
        stroke: "#000000",
        strokeThickness: 4,
      });
      chest.bonusText.setOrigin(0.5, 1);
      chest.bonusText.setDepth(chest.depth + 1);
    }

    chest.bonusText.setText(String(bonusValue));
    chest.bonusText.setPosition(chest.x - 30, chest.getTopCenter().y + 50);
  },
};
