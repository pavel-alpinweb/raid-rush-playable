import {enemiesComposition} from "@/compositions/Enemies.composition.js";

export const tilemapComposition = {
  createObjectLayer(scene, map, layerName) {
    const objLayerMeta = map.getObjectLayer(layerName);
    const objLayer = scene.physics.add.staticGroup();
    objLayerMeta.objects.forEach((obj) => {
      const textureKey = extractPropertyValue(obj, "spriteName") ?? extractTilesetNameByGid(map, obj.gid);
      if (!textureKey) {
        return;
      }

      objLayer
        .get(obj.x + obj.width / 2, obj.y - obj.height / 2, textureKey)
        .setDisplaySize(obj.width, obj.height)
        .setSize(obj.width, obj.height)
        .refreshBody();
    });
    return objLayer;
  },

  createEnemyLayer(scene, map, layerName) {
    const objLayerMeta = map.getObjectLayer(layerName);
    const enemyLayer = scene.add.group();

    objLayerMeta.objects.forEach((obj) => {
      const spriteName = extractPropertyValue(obj, "spriteName") ?? extractTilesetNameByGid(map, obj.gid);
      if (!spriteName) {
        return;
      }

      const damage = Number(extractPropertyValue(obj, "damage") ?? 0);
      const animationKey = `${spriteName}_animation`;
      const frameNames = enemiesComposition.getSortedFrameNames(scene, animationKey);
      const firstFrame = frameNames[0];
      const enemy = scene.add.sprite(obj.x + obj.width / 2, obj.y - obj.height / 2, animationKey, firstFrame);

      enemy
        .setDisplaySize(obj.width, obj.height)
        .setOrigin(0.5, 1)
        .play(spriteName);

      enemy.damage = damage;
      enemy.spriteName = spriteName;
      enemyLayer.add(enemy);
    });

    return enemyLayer;
  },

  createTileLayer(map, tilesetName, layerId, collisionIndexes) {
    const tileset = map.addTilesetImage(tilesetName);
    const tileLayer = map.createLayer(layerId, [tileset]);
    map.setCollision(collisionIndexes);
    return tileLayer;
  }
};

function extractTilesetNameByGid(map, gid) {
  if (!gid) {
    return null;
  }

  const targetTileset = map.tilesets.find((tileset) =>
    gid >= tileset.firstgid && gid < tileset.firstgid + tileset.total
  );

  return targetTileset?.name ?? null;
}

export function extractPropertyValue(tileMeta, propertyName) {
  return tileMeta?.properties?.find((property) => property.name === propertyName)?.value;
}
