<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Lock } from '@/types';

import { useBotStore } from '@/stores/ftbotwrapper';
import type { TableField } from 'bootstrap-vue-next';
const botStore = useBotStore();
const { t } = useI18n();

const tableFields: TableField[] = [
  { key: 'pair', label: t('trade.pair') },
  { key: 'lock_end_timestamp', label: t('pairLocks.until'), formatter: (value) => timestampms(value as number) },
  { key: 'reason', label: t('pairLocks.reason') },
  { key: 'actions' },
];

const removePairLock = (item: Lock) => {
  console.log(item);
  if (item.id !== undefined) {
    botStore.activeBot.deleteLock(item.id);
  } else {
    showAlert(t('pairLocks.deleteNotSupported'));
  }
};
</script>

<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">{{ t('trading.pairLocks') }}</label>
      <BButton class="float-end" size="sm" @click="botStore.activeBot.getLocks">
        <i-mdi-refresh />
      </BButton>
    </div>
    <div>
      <BTable class="table-sm" :items="botStore.activeBot.activeLocks" :fields="tableFields">
        <template #cell(actions)="row">
          <BButton
            class="btn-xs ms-1"
            size="sm"
            :title="t('pairLocks.deleteLock')"
            @click="removePairLock(row.item as unknown as Lock)"
          >
            <i-mdi-delete />
          </BButton>
        </template>
      </BTable>
    </div>
  </div>
</template>
