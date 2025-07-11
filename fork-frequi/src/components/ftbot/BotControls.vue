forceexit
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { MsgBoxObject } from '@/components/general/MessageBox.vue';
import MessageBox from '@/components/general/MessageBox.vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import type { ForceSellPayload } from '@/types';

import ForceEntryForm from './ForceEntryForm.vue';

const botStore = useBotStore();
const { t } = useI18n();
const forceEnter = ref<boolean>(false);
const msgBox = ref<typeof MessageBox>();

const isRunning = computed((): boolean => {
  return botStore.activeBot.botState?.state === 'running';
});

const handleStopBot = () => {
  const msg: MsgBoxObject = {
    title: t('botControls.stop'),
    message: t('botControls.confirmStop'),
    accept: () => {
      botStore.activeBot.stopBot();
    },
  };
  msgBox.value?.show(msg);
};

const handleStopBuy = () => {
  const msg: MsgBoxObject = {
    title: t('botControls.stopBuy'),
    message: t('botControls.stopBuyMessage'),
    accept: () => {
      botStore.activeBot.stopBuy();
    },
  };
  msgBox.value?.show(msg);
};

const handleReloadConfig = () => {
  const msg: MsgBoxObject = {
    title: t('botControls.reload'),
    message: t('botControls.confirmReload'),
    accept: () => {
      console.log('reload...');
      botStore.activeBot.reloadConfig();
    },
  };
  msgBox.value?.show(msg);
};

const handleForceExit = () => {
  const msg: MsgBoxObject = {
    title: t('botControls.forceExit'),
    message: t('botControls.confirmForceExit'),
    accept: () => {
      const payload: ForceSellPayload = {
        tradeid: 'all',
        // TODO: support ordertype (?)
      };
      botStore.activeBot.forceexit(payload);
    },
  };
  msgBox.value?.show(msg);
};
</script>

<template>
  <div>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || isRunning"
      :title="t('botControls.start')"
      @click="botStore.activeBot.startBot()"
    >
      <i-mdi-play height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      :title="t('botControls.stopDesc')"
      @click="handleStopBot()"
    >
      <i-mdi-stop height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      :title="t('botControls.stopBuyDesc')"
      @click="handleStopBuy()"
    >
      <i-mdi-pause height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      :title="t('botControls.reloadDesc')"
      @click="handleReloadConfig()"
    >
      <i-mdi-reload height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      :title="t('botControls.forceExitDesc')"
      @click="handleForceExit()"
    >
      <i-mdi-close-box-multiple height="24" width="24" />
    </button>
    <button
      v-if="botStore.activeBot.botState && botStore.activeBot.botState.force_entry_enable"
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      :title="t('botControls.forceEnterDesc')"
      @click="forceEnter = true"
    >
      <i-mdi-plus-box-multiple-outline style="font-size: 20px" />
    </button>
    <button
      v-if="botStore.activeBot.isWebserverMode && false"
      :disabled="botStore.activeBot.isTrading"
      class="btn btn-secondary btn-sm ms-1"
      :title="t('botControls.startTradingMode')"
      @click="botStore.activeBot.startTrade()"
    >
      <i-mdi-play class="fs-4" />
    </button>
    <ForceEntryForm v-model="forceEnter" :pair="botStore.activeBot.selectedPair" />
    <MessageBox ref="msgBox" />
  </div>
</template>
