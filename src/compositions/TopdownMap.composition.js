import {tilemapComposition } from "@/compositions/Tilemap.composition.js";
import {enemiesComposition} from "@/compositions/Enemies.composition.js";

export const topdownMapComposition = {
  preloadLevel(scene) {
    scene.load.image("ground_tiles", "assets/levels/tiles/ground_tiles.jpg");
    scene.load.image("chest", "assets/img/chest.png");
    scene.load.atlas("sprut_animation", "assets/animation/sprut.png", "assets/animation/sprut.json");
    scene.load.tilemapTiledJSON("topdown-tilemap", "assets/levels/tilemaps/topdown.json");
  },

  createLevel(scene) {
    const map = scene.make.tilemap({ key: "topdown-tilemap" });

    const groundLayer = tilemapComposition.createTileLayer(map, "ground_tiles", "ground_layer", [3]);
    const bonusLayer = tilemapComposition.createObjectLayer(scene, map, "chest_layer");
    enemiesComposition.prepareEnemiesAnimation(scene);
    const enemyLayer = tilemapComposition.createEnemyLayer(scene, map, "enemies_layer");

    return [map, groundLayer, bonusLayer, enemyLayer];
  }
};
