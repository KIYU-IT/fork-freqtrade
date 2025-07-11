<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { GridItemData } from '@/types';

import { useLayoutStore, findGridLayout, TradeLayout } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const layoutStore = useLayoutStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();
const currentBreakpoint = ref('');

const breakpointChanged = (newBreakpoint: string) => {
  // console.log('breakpoint:', newBreakpoint);
  currentBreakpoint.value = newBreakpoint;
};
const isResizableLayout = computed(() =>
  ['', 'sm', 'md', 'lg', 'xl'].includes(currentBreakpoint.value),
);
const isLayoutLocked = computed(() => {
  return layoutStore.layoutLocked || !isResizableLayout.value;
});
const gridLayoutData = computed((): GridItemData[] => {
  if (isResizableLayout.value) {
    return layoutStore.tradingLayout;
  }
  return [...layoutStore.getTradingLayoutSm];
});

const gridLayoutMultiPane = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.multiPane);
});

const gridLayoutOpenTrades = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.openTrades);
});

const gridLayoutTradeHistory = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.tradeHistory);
});

const gridLayoutTradeDetail = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.tradeDetail);
});

const gridLayoutChartView = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.chartView);
});

const responsiveGridLayouts = computed(() => {
  return {
    sm: layoutStore.getTradingLayoutSm,
  };
});

function refreshOHLCV(pair: string, columns: string[]) {
  botStore.activeBot.getPairCandles({
    pair: pair,
    timeframe: botStore.activeBot.timeframe,
    columns: columns,
  });
}
</script>

<template>
  <GridLayout
    class="h-100 w-100"
    style="padding: 1px"
    :row-height="50"
    :layout="gridLayoutData"
    :vertical-compact="false"
    :margin="[1, 1]"
    :responsive-layouts="responsiveGridLayouts"
    :is-resizable="!isLayoutLocked"
    :is-draggable="!isLayoutLocked"
    :responsive="true"
    :cols="{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }"
    :col-num="12"
    @update:breakpoint="breakpointChanged"
  >
    <template #default="{ gridItemProps }">
      <GridItem
        v-if="gridLayoutMultiPane.h != 0"
        v-bind="gridItemProps"
        :i="gridLayoutMultiPane.i"
        :x="gridLayoutMultiPane.x"
        :y="gridLayoutMultiPane.y"
        :w="gridLayoutMultiPane.w"
        :h="gridLayoutMultiPane.h"
        drag-allow-from=".card-header"
      >
        <DraggableContainer :header="t('trading.multiPane')">
          <div class="mt-1 d-flex justify-content-center">
            <BotControls class="mt-1 mb-2" />
          </div>
          <BTabs content-class="mt-3 mx-1" class="mt-1">
            <BTab title="Pairs combined" active>
              <template #title>
                <div :title="t('trading.pairsCombined')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1"
                    >{{ t('trading.pairsCombined') }}</span
                  >
                  <i-mdi-view-list v-else />
                </div>
              </template>
              <PairSummary
                :pairlist="botStore.activeBot.whitelist"
                :current-locks="botStore.activeBot.activeLocks"
                :trades="botStore.activeBot.openTrades"
              />
            </BTab>
            <BTab title="General">
              <template #title>
                <div :title="t('trading.general')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">{{ t('trading.general') }}</span>
                  <i-mdi-information v-else />
                </div>
              </template>
              <BotStatus />
            </BTab>
            <BTab title="Performance" lazy>
              <template #title>
                <div :title="t('performance.title')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1"
                    >{{ t('performance.title') }}</span
                  >
                  <i-mdi-chart-line v-else />
                </div>
              </template>
              <BotPerformance />
            </BTab>
            <BTab title="Balance" lazy>
              <template #title>
                <div :title="t('balance.title')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">{{ t('balance.title') }}</span>
                  <i-mdi-bank v-else />
                </div>
              </template>
              <BotBalance />
            </BTab>
            <BTab title="Time Breakdown" lazy>
              <template #title>
                <div :title="t('trading.timeBreakdown')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1"
                    >{{ t('trading.timeBreakdown') }}</span
                  >
                  <i-mdi-folder-clock v-else />
                </div>
              </template>
              <PeriodBreakdown />
            </BTab>

            <BTab title="Pairlist" lazy>
              <template #title>
                <div :title="t('trading.pairlist')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">{{ t('trading.pairlist') }}</span>
                  <i-mdi-format-list-group v-else />
                </div>
              </template>
              <PairListLive />
            </BTab>
            <BTab title="Pair Locks" lazy>
              <template #title>
                <div :title="t('trading.pairLocks')">
                  <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">{{ t('trading.pairLocks') }}</span>
                  <i-mdi-lock-alert v-else />
                </div>
              </template>
              <PairLockList />
            </BTab>
          </BTabs>
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="gridLayoutOpenTrades.h != 0"
        v-bind="gridItemProps"
        :i="gridLayoutOpenTrades.i"
        :x="gridLayoutOpenTrades.x"
        :y="gridLayoutOpenTrades.y"
        :w="gridLayoutOpenTrades.w"
        :h="gridLayoutOpenTrades.h"
        drag-allow-from=".card-header"
      >
        <DraggableContainer :header="t('dashboard.openTrades')">
          <TradeList
            class="open-trades"
            :trades="botStore.activeBot.openTrades"
            :title="t('dashboard.openTrades')"
            :active-trades="true"
            :empty-text="t('trading.noOpenTrades')"
          />
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="gridLayoutTradeHistory.h != 0"
        v-bind="gridItemProps"
        :i="gridLayoutTradeHistory.i"
        :x="gridLayoutTradeHistory.x"
        :y="gridLayoutTradeHistory.y"
        :w="gridLayoutTradeHistory.w"
        :h="gridLayoutTradeHistory.h"
        drag-allow-from=".card-header"
      >
        <DraggableContainer :header="t('dashboard.closedTrades')">
          <TradeList
            class="trade-history"
            :trades="botStore.activeBot.closedTrades"
            :title="t('trading.tradeHistory')"
            :show-filter="true"
            :empty-text="t('trading.noClosedTrades')"
          />
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="
          botStore.activeBot.detailTradeId &&
          botStore.activeBot.tradeDetail &&
          gridLayoutTradeDetail.h != 0
        "
        v-bind="gridItemProps"
        :i="gridLayoutTradeDetail.i"
        :x="gridLayoutTradeDetail.x"
        :y="gridLayoutTradeDetail.y"
        :w="gridLayoutTradeDetail.w"
        :h="gridLayoutTradeDetail.h"
        :min-h="4"
        drag-allow-from=".card-header"
      >
        <DraggableContainer :header="t('trading.tradeDetail')">
          <TradeDetail
            :trade="botStore.activeBot.tradeDetail"
            :stake-currency="botStore.activeBot.stakeCurrency"
          />
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="gridLayoutTradeDetail.h != 0"
        v-bind="gridItemProps"
        :i="gridLayoutChartView.i"
        :x="gridLayoutChartView.x"
        :y="gridLayoutChartView.y"
        :w="gridLayoutChartView.w"
        :h="gridLayoutChartView.h"
        :min-h="6"
        drag-allow-from=".card-header"
      >
        <DraggableContainer header="Chart">
          <CandleChartContainer
            :available-pairs="botStore.activeBot.whitelist"
            :historic-view="!!false"
            :timeframe="botStore.activeBot.timeframe"
            :trades="botStore.activeBot.allTrades"
            @refresh-data="refreshOHLCV"
          >
          </CandleChartContainer>
        </DraggableContainer>
      </GridItem>
    </template>
  </GridLayout>
</template>
