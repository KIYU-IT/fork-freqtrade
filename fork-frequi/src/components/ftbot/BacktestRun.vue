<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useBotStore } from '@/stores/ftbotwrapper';
import type { BacktestPayload } from '@/types';

import { useBtStore } from '@/stores/btStore';
const botStore = useBotStore();
const btStore = useBtStore();
const { t } = useI18n();

function clickBacktest() {
  const btPayload: BacktestPayload = {
    strategy: btStore.strategy,
    timerange: btStore.timerange,
    enable_protections: btStore.enableProtections,
  };
  const openTradesInt = parseInt(btStore.maxOpenTrades, 10);
  if (openTradesInt) {
    btPayload.max_open_trades = openTradesInt;
  }
  if (btStore.stakeAmountUnlimited) {
    btPayload.stake_amount = 'unlimited';
  } else {
    const stakeAmountLoc = Number(btStore.stakeAmount);
    if (stakeAmountLoc) {
      btPayload.stake_amount = stakeAmountLoc.toString();
    }
  }

  const startingCapitalLoc = Number(btStore.startingCapital);
  if (startingCapitalLoc) {
    btPayload.dry_run_wallet = startingCapitalLoc;
  }

  if (btStore.selectedTimeframe) {
    btPayload.timeframe = btStore.selectedTimeframe;
  }
  if (btStore.selectedDetailTimeframe) {
    btPayload.timeframe_detail = btStore.selectedDetailTimeframe;
  }
  if (!btStore.allowCache) {
    btPayload.backtest_cache = 'none';
  }
  if (btStore.freqAI.enabled) {
    btPayload.freqaimodel = btStore.freqAI.model;
    if (btStore.freqAI.identifier !== '') {
      btPayload.freqai = { identifier: btStore.freqAI.identifier };
    }
  }

  botStore.activeBot.startBacktest(btPayload);
}
</script>

<template>
  <div class="mb-2">
    <span>{{ t('backtest.strategy') }}</span>
    <StrategySelect v-model="btStore.strategy"></StrategySelect>
  </div>
  <BCard :disabled="botStore.activeBot.backtestRunning">
    <!-- Backtesting parameters -->
    <BFormGroup
      label-cols-lg="2"
      :label="t('backtest.backtestParams')"
      label-size="sm"
      label-class="fw-bold pt-0"
      class="mb-0"
    >
      <BFormGroup
        label-cols-sm="5"
        :label="t('backtest.timeframe') + ':'"
        label-align-sm="right"
        label-for="timeframe-select"
      >
        <TimeframeSelect id="timeframe-select" v-model="btStore.selectedTimeframe" />
      </BFormGroup>
      <BFormGroup
        label-cols-sm="5"
        :label="t('backtest.detailTimeframe') + ':'"
        label-align-sm="right"
        label-for="timeframe-detail-select"
        :title="t('backtest.detailTimeframeTooltip')"
      >
        <TimeframeSelect
          id="timeframe-detail-select"
          v-model="btStore.selectedDetailTimeframe"
          :below-timeframe="btStore.selectedTimeframe"
        />
      </BFormGroup>

      <BFormGroup
        label-cols-sm="5"
        :label="t('backtest.maxOpenTrades') + ':'"
        label-align-sm="right"
        label-for="max-open-trades"
      >
        <BFormInput
          id="max-open-trades"
          v-model="btStore.maxOpenTrades"
          :placeholder="t('backtest.useStrategyDefault')"
          type="number"
        ></BFormInput>
      </BFormGroup>
      <BFormGroup
        label-cols-sm="5"
        :label="t('backtest.startingCapital') + ':'"
        label-align-sm="right"
        label-for="starting-capital"
      >
        <BFormInput
          id="starting-capital"
          v-model="btStore.startingCapital"
          :placeholder="t('backtest.useConfigDefault')"
          type="number"
          step="0.001"
        ></BFormInput>
      </BFormGroup>
      <BFormGroup
        label-cols-sm="5"
        :label="t('backtest.stakeAmount') + ':'"
        label-align-sm="right"
        label-for="stake-amount"
      >
        <div class="d-flex align-items-center">
          <div style="flex-basis: 100%" class="d-flex">
            <BFormCheckbox id="stake-amount-bool" v-model="btStore.stakeAmountUnlimited"
              >{{ t('backtest.unlimitedStake') }}</BFormCheckbox
            >
          </div>
          <BFormInput
            id="stake-amount"
            v-model="btStore.stakeAmount"
            type="number"
            :placeholder="t('backtest.useStrategyDefault')"
            step="0.01"
            style="flex-basis: 100%"
            :disabled="btStore.stakeAmountUnlimited"
          ></BFormInput>
        </div>
      </BFormGroup>

      <BFormGroup
        label-cols-sm="5"
        :label="t('backtest.enableProtections') + ':'"
        label-align-sm="right"
        label-for="enable-protections"
        class="align-items-center"
      >
        <BFormCheckbox id="enable-protections" v-model="btStore.enableProtections"></BFormCheckbox>
      </BFormGroup>
      <BFormGroup
        v-if="botStore.activeBot.botApiVersion >= 2.22"
        label-cols-sm="5"
        :label="t('backtest.cacheResults') + ':'"
        label-align-sm="right"
        label-for="enable-cache"
        class="align-items-center"
      >
        <BFormCheckbox id="enable-cache" v-model="btStore.allowCache"></BFormCheckbox>
      </BFormGroup>
      <template v-if="botStore.activeBot.botApiVersion >= 2.22">
        <BFormGroup
          label-cols-sm="5"
          :label="t('backtest.enableFreqAI') + ':'"
          label-align-sm="right"
          label-for="enable-freqai"
          class="align-items-center"
        >
          <template #label>
            <div class="d-flex justify-content-center">
              <span class="me-2">{{ t('backtest.enableFreqAI') }}:</span>
              <InfoBox
                :hint="t('backtest.freqAITooltip')"
              />
            </div>
          </template>
          <BFormCheckbox id="enable-freqai" v-model="btStore.freqAI.enabled"></BFormCheckbox>
        </BFormGroup>
        <BFormGroup
          v-if="btStore.freqAI.enabled"
          label-cols-sm="5"
          :label="t('backtest.freqAIIdentifier') + ':'"
          label-align-sm="right"
          label-for="freqai-identifier"
        >
          <BFormInput
            id="freqai-identifier"
            v-model="btStore.freqAI.identifier"
            :placeholder="t('backtest.useConfigDefault')"
          ></BFormInput>
        </BFormGroup>
        <BFormGroup
          v-if="btStore.freqAI.enabled"
          label-cols-sm="5"
          :label="t('backtest.freqAIModel')"
          label-align-sm="right"
          label-for="freqai-model"
        >
          <FreqaiModelSelect id="freqai-model" v-model="btStore.freqAI.model"></FreqaiModelSelect>
        </BFormGroup>
      </template>

      <!-- <b-form-group label-cols-sm="5" label="Fee:" label-align-sm="right" label-for="fee">
              <b-form-input
                id="fee"
                type="number"
                placeholder="Use exchange default"
                step="0.01"
              ></b-form-input>
            </b-form-group> -->
      <hr />
      <TimeRangeSelect v-model="btStore.timerange" class="mt-2"></TimeRangeSelect>
    </BFormGroup>
  </BCard>

  <h3 class="mt-3">{{ t('backtest.backtestingSummary') }}</h3>
  <div class="d-flex flex-wrap flex-md-nowrap justify-content-between justify-content-md-center">
    <BButton
      id="start-backtest"
      variant="primary"
      :disabled="
        !btStore.canRunBacktest ||
        botStore.activeBot.backtestRunning ||
        !botStore.activeBot.canRunBacktest
      "
      class="mx-1"
      @click="clickBacktest"
    >
      {{ t('backtest.startBacktesting') }}
    </BButton>
    <BButton
      variant="secondary"
      :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
      class="mx-1"
      @click="botStore.activeBot.pollBacktest"
    >
      {{ t('backtest.loadBacktestResult') }}
    </BButton>
    <BButton
      variant="secondary"
      class="mx-1"
      :disabled="!botStore.activeBot.backtestRunning"
      @click="botStore.activeBot.stopBacktest"
      >{{ t('backtest.stopBacktesting') }}</BButton
    >
    <BButton
      variant="secondary"
      class="mx-1"
      :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
      @click="botStore.activeBot.removeBacktest"
      >{{ t('backtest.resetBacktest') }}</BButton
    >
  </div>
</template>
