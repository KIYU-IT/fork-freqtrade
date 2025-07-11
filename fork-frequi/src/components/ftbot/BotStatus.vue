<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const { t } = useI18n();
</script>

<template>
  <div v-if="botStore.activeBot.botState">
    <p>
      {{ t('botStatus.runningFreqtrade') }} <strong>{{ botStore.activeBot.version }}</strong>
    </p>
    <p>
      {{ t('botStatus.runningWith') }}
      <strong>
        {{ botStore.activeBot.botState.max_open_trades }}x{{
          botStore.activeBot.botState.stake_amount
        }}
        {{ botStore.activeBot.botState.stake_currency }}
      </strong>
      {{ t('botStatus.on') }}
      <strong>{{ botStore.activeBot.botState.exchange }}</strong> {{ t('botStatus.in') }}
      <strong>{{ botStore.activeBot.botState.trading_mode || 'spot' }}</strong> {{ t('botStatus.markets') }}, {{ t('botStatus.withStrategy') }} <strong>{{ botStore.activeBot.botState.strategy }}</strong
      >.
    </p>
    <p v-if="'stoploss_on_exchange' in botStore.activeBot.botState">
      {{ t('botStatus.stoplossOnExchange') }}
      <strong>{{
        botStore.activeBot.botState.stoploss_on_exchange ? t('common.enabled') : t('common.disabled')
      }}</strong
      >.
    </p>
    <p>
      {{ t('botStatus.currently') }} <strong>{{ botStore.activeBot.botState.state }}</strong
      >,
      <strong>{{ t('botStatus.forceEntry') }}: {{ botStore.activeBot.botState.force_entry_enable }}</strong>
    </p>
    <p>
      <strong>{{ botStore.activeBot.botState.dry_run ? t('botStatus.dryRun') : t('botStatus.live') }}</strong>
    </p>
    <hr />
    <p>
      {{ t('botStatus.avgProfit') }} {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_mean) }} (&sum;
      {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_sum) }}) {{ t('botStatus.inTrades', { count: botStore.activeBot.profit.trade_count }) }}, {{ t('botStatus.withAvgDuration') }}
      {{ botStore.activeBot.profit.avg_duration }}. {{ t('botStatus.bestPair') }}:
      {{ botStore.activeBot.profit.best_pair }}.
    </p>
    <p v-if="botStore.activeBot.profit.first_trade_timestamp">
      <span v-if="botStore.activeBot.profit.bot_start_timestamp" class="d-block">
        {{ t('botStatus.botStartDate') }}:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.bot_start_timestamp" show-timezone />
        </strong>
      </span>
      <span class="d-block">
        {{ t('botStatus.firstTradeOpened') }}:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.first_trade_timestamp" show-timezone />
        </strong>
      </span>
      <span class="d-block">
        {{ t('botStatus.lastTradeOpened') }}:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.latest_trade_timestamp" show-timezone />
        </strong>
      </span>
    </p>
    <p>
      <span v-if="botStore.activeBot.profit.profit_factor" class="d-block">
        {{ t('botStatus.profitFactor') }}:
        {{ botStore.activeBot.profit.profit_factor.toFixed(2) }}
      </span>
      <span v-if="botStore.activeBot.profit.trading_volume" class="d-block">
        {{ t('botStatus.tradingVolume') }}:
        {{
          formatPriceCurrency(
            botStore.activeBot.profit.trading_volume,
            botStore.activeBot.botState.stake_currency,
            botStore.activeBot.botState.stake_currency_decimals ?? 3,
          )
        }}
      </span>
    </p>
    <BotProfit
      class="mx-1"
      :profit="botStore.activeBot.profit"
      :stake-currency="botStore.activeBot.botState.stake_currency ?? 'USDT'"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
  </div>
</template>
