import { defineStore } from "pinia";
import { PLAYER_CURRENT_HEALTH, CHEST_BONUS_VALUE } from "@/configs/gameplay.config.js";

export const usePlayer = defineStore("player", {
  state: () => ({
    currentHealth: PLAYER_CURRENT_HEALTH,
    chestBonusValue: CHEST_BONUS_VALUE,
    isGameOver: false,
  }),
});
