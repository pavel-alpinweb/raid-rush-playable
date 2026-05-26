import * as Phaser from "phaser";
import {playerComposition} from "@/compositions/Player.composition.js";
import {bonusComposition} from "@/compositions/Bonus.composition.js";
import {sceneComposition} from "@/compositions/scene.composition.js";
import {backgroundComposition} from "@/compositions/Background.composition.js";
import {topdownMapComposition} from "@/compositions/TopdownMap.composition.js";
import {EventBus} from "@/utils/utils.js";
import * as Config from "@/configs/gameplay.config.js";
import * as EventNames from "@/configs/eventNames.config.js";

export class TopdownScene extends Phaser.Scene {
  constructor(playerStore) {
    super("MainScene");
    this.playerStore = playerStore;
  }

  preload() {
    sceneComposition.preload(this);
    playerComposition.preloadPlayerAnimation(this);
    bonusComposition.preloadBonusAnimation(this);
    backgroundComposition.preloadBackgroundImage(this);
    topdownMapComposition.preloadLevel(this);
  }

  create() {
    this.background = backgroundComposition.createBackgroundImage(this, this.cameras.main.width, this.cameras.main.height);
    const [map, groundLayer, bonusLayer] = topdownMapComposition.createLevel(this);
    this.bonusLayer = bonusLayer;

    playerComposition.preparePlayerAnimation(this);
    bonusComposition.prepareBonusAnimation(this);
    this.player = playerComposition.createPlayer(
      this,
      Config.START_X,
      Config.START_Y,
      Config.PLAYER_DISPLAY_WIDTH,
      Config.PLAYER_DISPLAY_HEIGHT,
      Config.PLAYER_TOPDOWN_BODY_WIDTH,
      Config.PLAYER_TOPDOWN_BODY_HEIGHT,
      Config.PLAYER_SPEED,
      Config.PLAYER_MAX_HEALTH
    );
    playerComposition.configureCameraFollow(this, this.player, this.cameras.main.width / 4, this.cameras.main.height / 4);

    this.physics.add.collider(this.player, groundLayer);
    this.physics.add.overlap(this.player, this.bonusLayer, (player, bonus) => {
      if (player.currentTarget !== bonus) {
        return;
      }

      playerComposition.stopPlayer(player);
    });

    this.bonusLayer.children.iterate((bonus) => {
      bonus.setInteractive({ useHandCursor: true });
      bonus.on("pointerdown", () => {
        playerComposition.movePlayerToObject(this.player, bonus);
      });
    });
  }

  update() {
    backgroundComposition.moveBackground(this.cameras.main, this.background);
  }
}
