<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useBotStore } from '@/stores/ftbotwrapper';
import type { TableField } from 'bootstrap-vue-next';

const botStore = useBotStore();
const { t } = useI18n();
enum PerformanceOptions {
  performance = 'performance',
  entryStats = 'entryStats',
  exitStats = 'exitStats',
  mixTagStats = 'mixTagStats',
}
const selectedOption = ref<PerformanceOptions>(PerformanceOptions.performance);

function formatTextLen(text: string, len: number) {
  if (text.length > len) {
    return text.substring(0, len) + '...';
  }
  return text;
}

const performanceTable = computed<TableField[]>(() => {
  const textLength = 17;
  const initialCol = {
    [PerformanceOptions.performance]: { key: 'pair', label: t('performance.pair') },
    [PerformanceOptions.entryStats]: {
      key: 'enter_tag',
      label: t('performance.enterTag'),
      formatter: (v: unknown) => formatTextLen(v as string, textLength),
    },
    [PerformanceOptions.exitStats]: {
      key: 'exit_reason',
      label: t('performance.exitReason'),
      formatter: (v: unknown) => formatTextLen(v as string, textLength),
    },
    [PerformanceOptions.mixTagStats]: {
      key: 'mix_tag',
      label: t('performance.mixTag'),
      formatter: (v: unknown) => formatTextLen(v as string, textLength),
    },
  };
  return [
    initialCol[selectedOption.value],
    { key: 'profit', label: t('performance.profitRatio') },
    {
      key: 'profit_abs',
      label: `${t('performance.profit')} ${botStore.activeBot.botState?.stake_currency}`,
      formatter: (v: unknown) => formatPrice(v as number, 5),
    },
    { key: 'count', label: t('performance.count') },
  ];
});

const performanceData = computed(() => {
  if (selectedOption.value === PerformanceOptions.performance) {
    return botStore.activeBot.performanceStats;
  }
  if (selectedOption.value === PerformanceOptions.entryStats) {
    return botStore.activeBot.entryStats;
  }
  if (selectedOption.value === PerformanceOptions.exitStats) {
    return botStore.activeBot.exitStats;
  }
  if (selectedOption.value === PerformanceOptions.mixTagStats) {
    return botStore.activeBot.mixTagStats;
  }
  return [];
});

const hasAdvancedStats = computed(() => botStore.activeBot.botApiVersion >= 2.34);

const options = computed(() => [
  { value: PerformanceOptions.performance, text: t('performance.performance') },
  { value: PerformanceOptions.entryStats, text: t('performance.entries') },
  { value: PerformanceOptions.exitStats, text: t('performance.exits') },
  { value: PerformanceOptions.mixTagStats, text: t('performance.mixTag') },
]);

function refreshSummary() {
  if (selectedOption.value === PerformanceOptions.performance) {
    botStore.activeBot.getPerformance();
  }
  if (selectedOption.value === PerformanceOptions.entryStats) {
    botStore.activeBot.getEntryStats();
  }
  if (selectedOption.value === PerformanceOptions.exitStats) {
    botStore.activeBot.getExitStats();
  }
  if (selectedOption.value === PerformanceOptions.mixTagStats) {
    botStore.activeBot.getMixTagStats();
  }
}

onMounted(() => {
  refreshSummary();
});
</script>
<template>
  <div>
    <div class="mb-2">
      <h3 class="me-auto d-inline">{{ t('performance.title') }}</h3>
      <BButton class="float-end" size="sm" @click="refreshSummary">
        <i-mdi-refresh />
      </BButton>
    </div>
    <BFormRadioGroup
      v-if="hasAdvancedStats"
      id="order-direction"
      v-model="selectedOption"
      :options="options"
      name="radios-btn-default"
      size="sm"
      buttons
      style="min-width: 10em"
      button-variant="outline-primary"
      @change="refreshSummary"
    ></BFormRadioGroup>
    <BTable class="table-sm" :items="performanceData" :fields="performanceTable"></BTable>
  </div>
</template>
