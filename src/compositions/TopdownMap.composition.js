import {tilemapComposition } from "@/compositions/Tilemap.composition.js";

export const topdownMapComposition = {
  preloadLevel(scene) {
    scene.load.image("ground_tiles", "assets/levels/tiles/ground_tiles.jpg");
    scene.load.image("chest", "assets/img/chest.png");
    scene.load.tilemapTiledJSON("topdown-tilemap", "assets/levels/tilemaps/topdown.json");
  },

  createLevel(scene) {
    const map = scene.make.tilemap({ key: "topdown-tilemap" });

    const groundLayer = tilemapComposition.createTileLayer(map, "ground_tiles", "ground_layer", [3]);
    const bonusLayer = tilemapComposition.createObjectLayer(scene, map, "chest_layer");

    return [map, groundLayer, bonusLayer];
  }
};
