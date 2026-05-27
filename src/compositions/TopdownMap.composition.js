import {tilemapComposition } from "@/compositions/Tilemap.composition.js";
import {enemiesComposition} from "@/compositions/Enemies.composition.js";
import * as Config from "@/configs/gameplay.config.js";

export const topdownMapComposition = {
  preloadLevel(scene) {
    scene.load.image("ground_tiles", "assets/levels/tiles/ground_tiles.jpg");
    scene.load.image("chest", "assets/img/chest.png");
    scene.load.atlas("sprut_animation", "assets/animation/sprut.png", "assets/animation/sprut.json");
    scene.load.atlas("skat_animation", "assets/animation/skat.png", "assets/animation/skat.json");
    scene.load.tilemapTiledJSON("topdown-tilemap", "assets/levels/tilemaps/topdown.json");
  },

  createLevel(scene) {
    const map = scene.make.tilemap({ key: "topdown-tilemap" });

    const groundLayer = tilemapComposition.createTileLayer(map, "ground_tiles", "ground_layer", [3]);
    const bonusLayer = tilemapComposition.createObjectLayer(scene, map, "chest_layer");
    enemiesComposition.prepareEnemiesAnimation(scene);
    const enemyLayer = tilemapComposition.createEnemyLayer(scene, map, "enemies_layer");

    return [map, groundLayer, bonusLayer, enemyLayer];
  },

  restartLevel(scene, playerStore) {
    if (!scene || !playerStore) {
      return;
    }

    playerStore.$patch((state) => {
      state.currentHealth = Config.PLAYER_MAX_HEALTH;
      state.isGameOver = false;
    });

    const animationKeys = ["player_wait", "player_move", "player_hit", "open-chest", "sprut", "skat"];
    animationKeys.forEach((animationKey) => {
      if (scene.anims.exists(animationKey)) {
        scene.anims.remove(animationKey);
      }
    });

    scene.scene.restart();
  },
};
