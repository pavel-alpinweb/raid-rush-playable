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
    scene.load.atlas("open-chest", "assets/animation/chest.png", "assets/animation/chest.json");
  },

  prepareBonusAnimation(scene) {
    const chestFrameNames = this.getSortedFrameNames(scene, "chest");

    scene.anims.create({
      key: "open-chest",
      frames: chestFrameNames.map((frame) => ({ key: "chest", frame })),
      frameRate: 12,
      repeat: -1,
    });
  },
};
