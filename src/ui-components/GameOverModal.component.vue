<script setup>
import UiModal from "@/ui-components/UiModal.component.vue";

const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["restart", "download", "update:isShow"]);

const onRestart = () => {
  emit("restart");
};

const onDownload = () => {
  emit("download");
};
</script>

<template>
  <UiModal :model-value="isShow" @update:model-value="emit('update:isShow', $event)">
    <div class="game-over-modal">
      <h2 class="game-over-modal__title">Поражение! Попробовать еще раз?</h2>
      <div class="game-over-modal__actions">
        <button class="game-over-modal__btn" @click="onRestart">Переиграть</button>
        <button class="game-over-modal__btn" @click="onDownload">Скачать игру</button>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">
.game-over-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 10px;

  &__title {
    color: #2c1f1a;
    font-size: 32px;
    text-align: center;
    margin: 0;
    text-transform: uppercase;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  &__btn {
    width: 100%;
    height: 60px;
    cursor: pointer;
    border: none;
    background: #7f4837;
    color: #d99b47;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 24px;
    font-family: inherit;
    transition: background 0.2s ease;

    &:hover {
      background: #b56f44;
    }
  }
}
</style>
