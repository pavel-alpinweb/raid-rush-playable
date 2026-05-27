import { ref, watch } from "vue";
import GameOverModal from "./GameOverModal.component.vue";
import { FAIL_TEXT } from "@/configs/gameplay.config.js";

export default {
  title: "UI/GameOverModal",
  component: GameOverModal,
  tags: ["autodocs"],
  argTypes: {
    isShow: {
      control: "boolean",
      description: "Управляет видимостью модального окна",
    },
    text: {
      control: "text",
      description: "Текст заголовка модального окна",
    },
    onRestart: { action: "restart", description: "Событие при нажатии на кнопку 'Переиграть'" },
    onDownload: { action: "download", description: "Событие при нажатии на кнопку 'Скачать игру'" },
    "update:isShow": { action: "update:isShow", description: "Событие обновления состояния видимости" },
  },
  parameters: {
    docs: {
      description: {
        component: "Компонент модального окна окончания игры (Game Over). Появляется при поражении игрока.",
      },
    },
  },
};

const Template = (args) => ({
  components: { GameOverModal },
  setup() {
    const isVisible = ref(args.isShow ?? true);

    watch(
      () => args.isShow,
      (newVal) => {
        isVisible.value = newVal;
      },
    );

    return { args, isVisible };
  },
  template: `
    <div>
      <div id="story-game-container" style="width:800px; height:400px; border:1px solid #ccc; margin:0 auto; position:relative;">
        <canvas id="story-canvas" width="800" height="400" style="display:block; width:100%; height:100%; background:#222;"></canvas>
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <button @click="isVisible = true">Показать модалку</button>
      </div>
      <GameOverModal 
        v-bind="args" 
        :isShow="isVisible" 
        target="#story-game-container"
        @update:isShow="isVisible = $event" 
      />
    </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  isShow: true,
  text: FAIL_TEXT,
};
Default.parameters = {
  docs: {
    description: {
      story: "Стандартное состояние модального окна поражения. Модальное окно привязано к контейнеру с canvas.",
    },
  },
};
