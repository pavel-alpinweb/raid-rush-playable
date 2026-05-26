export const tilemapComposition = {
  createObjectLayer(scene, map, layerName) {
    const objLayerMeta = map.getObjectLayer(layerName);
    const objLayer = scene.physics.add.staticGroup();
    objLayerMeta.objects.forEach((obj) => {
      const textureKey = extractPropertyValue(obj, "imageName") ?? extractTilesetNameByGid(map, obj.gid);
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

  createTileLayer(map, tilesetName, layerId, collisionIndexes) {
    const tileset = map.addTilesetImage(tilesetName);
    const tileLayer = map.createLayer(layerId, [tileset]);
    map.setCollision(collisionIndexes);
    return tileLayer;
  }
};

function extractPropertyValue(tileMeta, propertyName) {
  return tileMeta?.properties?.find((property) => property.name === propertyName)?.value;
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
