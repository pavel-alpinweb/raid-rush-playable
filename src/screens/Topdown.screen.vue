<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import Phaser from "phaser";
import { TopdownScene } from "@/scenes/Topdown.scene";
import Preloader from "@/ui-components/Preloader.component.vue";
import GameOverModal from "@/ui-components/GameOverModal.component.vue";
import { usePlayer } from "@/store/player.store";
import { GAME_HEIGHT, GAME_WIDTH } from "@/configs/engine.config";
import { WIN_TEXT, FAIL_TEXT } from "@/configs/gameplay.config.js";
import { router } from "@/router.js";
import { EventBus } from "@/utils/utils.js";
import * as EventNames from "@/configs/eventNames.config.js";

const gameContainer = ref(null);
const playerStore = usePlayer();
let game = null;

const winText = ref("Победа! Попробовать еще раз?");
const failText = ref("Поражение! Попробовать еще раз?");

const restartGame = () => {
  const topdownScene = game?.scene?.getScene("MainScene");
  topdownScene?.restartLevel?.();
};

const downloadGame = () => {
  window.open("https://play.google.com/store/apps/details?id=com.overmobile.keepers", "_blank");
};

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.CANVAS,
    scene: new TopdownScene(playerStore),
    backgroundColor: "#000000",
    loader: {
      imageLoadType: "HTMLImageElement",
    },
    scale: {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      mode: Phaser.Scale.FIT,
      parent: gameContainer.value,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
  });

  playerStore.$patch((state) => {
    state.gameOverText = WIN_TEXT;
  });

  EventBus.on(EventNames.GO_TO_PLATFORM, () => {
    EventBus.off(EventNames.GO_TO_PLATFORM);
    game?.destroy(true);
    router.push({ path: "/platformer" });
  });
});

onBeforeUnmount(() => {
  EventBus.off(EventNames.GO_TO_TOPDOWN);
  game?.destroy(true);
});
</script>

<template>
  <div class="game-screen">
    <Preloader />
    <div ref="gameContainer" class="game-screen__game-wrapper"></div>
    <GameOverModal :is-show="playerStore.isGameOver" :text="playerStore.gameOverText" @restart="restartGame" @download="downloadGame" @update:is-show="playerStore.isGameOver = $event" />
  </div>
</template>

<style lang="scss" scoped>
.game-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.game-screen__game-wrapper {
  position: absolute;
  inset: 0;
}
</style>
