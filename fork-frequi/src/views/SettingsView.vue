<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { OpenTradeVizOptions, useSettingsStore } from '@/stores/settings';
import { useLayoutStore } from '@/stores/layout';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';
import { ColorPreferences, useColorStore } from '@/stores/colors';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const layoutStore = useLayoutStore();
const { t } = useI18n();

const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
const openTradesOptions = computed(() => [
  { value: OpenTradeVizOptions.showPill, text: t('settings.showPillInIcon') },
  { value: OpenTradeVizOptions.asTitle, text: t('settings.showInTitle') },
  { value: OpenTradeVizOptions.noOpenTrades, text: t('settings.dontShowOpenTrades') },
]);
const colorPreferenceOptions = computed(() => [
  { value: ColorPreferences.GREEN_UP, text: t('settings.greenUpRedDown') },
  { value: ColorPreferences.RED_UP, text: t('settings.greenDownRedUp') },
]);

const resetDynamicLayout = () => {
  layoutStore.resetTradingLayout();
  layoutStore.resetDashboardLayout();
  showAlert(t('settings.layoutsReset'));
};
</script>

<template>
  <div class="container mt-3">
    <BCard :header="t('settings.title')">
      <div class="text-start d-flex flex-column gap-2">
        <p>{{ t('settings.uiVersion') }}: {{ settingsStore.uiVersion }}</p>
        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <h4>{{ t('settings.uiSettings') }}</h4>
          <BFormGroup
            :description="t('settings.lockLayoutDesc')"
          >
            <BFormCheckbox v-model="layoutStore.layoutLocked">{{ t('common.lockLayout') }}</BFormCheckbox>
          </BFormGroup>
          <BFormGroup :description="t('settings.resetLayoutDesc')">
            <BButton size="sm" class="me-1" @click="resetDynamicLayout">{{ t('common.resetLayout') }}</BButton>
          </BFormGroup>
          <BFormGroup
            :label="t('settings.showOpenTradesInHeader')"
            :description="t('settings.showOpenTradesDesc')"
          >
            <BFormSelect
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
            ></BFormSelect>
          </BFormGroup>
          <BFormGroup
            :label="t('settings.utcTimezone')"
            :description="t('settings.timezoneDesc')"
          >
            <BFormSelect v-model="settingsStore.timezone" :options="timezoneOptions"></BFormSelect>
          </BFormGroup>
          <BFormGroup :description="t('settings.backgroundSyncDesc')">
            <BFormCheckbox v-model="settingsStore.backgroundSync">{{ t('settings.backgroundSync') }}</BFormCheckbox>
          </BFormGroup>
          <BFormGroup :description="t('settings.confirmDialogDesc')">
            <BFormCheckbox v-model="settingsStore.confirmDialog"
              >{{ t('settings.showConfirmDialog') }}</BFormCheckbox
            >
          </BFormGroup>
          <BFormGroup
            :description="t('settings.multiPaneButtonsDesc')"
          >
            <BFormCheckbox v-model="settingsStore.multiPaneButtonsShowText"
              >{{ t('settings.showTextOnMultiPaneButtons') }}</BFormCheckbox
            >
          </BFormGroup>
        </div>

        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <h4>{{ t('settings.chartSettings') }}</h4>
          <BFormGroup
            :description="t('settings.chartScaleSideDesc')"
          >
            <BFormRadioGroup
              v-model="settingsStore.chartLabelSide"
              name="chart-preference-options"
              :options="[
                { value: 'left', text: t('settings.left') },
                { value: 'right', text: t('settings.right') },
              ]"
            ></BFormRadioGroup>
          </BFormGroup>

          <BFormGroup :description="t('settings.heikinAshiDesc')">
            <BFormCheckbox v-model="settingsStore.useHeikinAshiCandles"
              >{{ t('settings.useHeikinAshi') }}</BFormCheckbox
            >
          </BFormGroup>
          <BFormGroup
            :description="t('settings.reducedPairCallsDesc')"
          >
            <BFormCheckbox v-model="settingsStore.useReducedPairCalls"
              >{{ t('settings.onlyRequestNecessaryColumns') }}</BFormCheckbox
            >
          </BFormGroup>
          <BFormGroup :description="t('settings.candleColorPreference')">
            <BFormRadioGroup
              id="settings-color-preference-radio-group"
              v-model="colorStore.colorPreference"
              name="color-preference-options"
              @change="colorStore.updateProfitLossColor"
            >
              <BFormRadio
                v-for="option in colorPreferenceOptions"
                :key="option.value"
                :value="option.value"
              >
                <div class="d-flex">
                  <span class="me-2">{{ option.text }}</span>
                  <i-mdi-arrow-up-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="color-candle-arrows"
                  />
                  <i-mdi-arrow-down-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="color-candle-arrows"
                  />
                </div>
              </BFormRadio>
            </BFormRadioGroup>
          </BFormGroup>
        </div>
        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <BFormGroup :description="t('settings.notifications')">
            <h4>{{ t('settings.notificationSettings') }}</h4>
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]"
              >{{ t('settings.entryNotifications') }}</BFormCheckbox
            >
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]"
              >{{ t('settings.exitNotifications') }}</BFormCheckbox
            >
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]"
              >{{ t('settings.entryCancelNotifications') }}</BFormCheckbox
            >
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]"
              >{{ t('settings.exitCancelNotifications') }}</BFormCheckbox
            >
          </BFormGroup>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style lang="scss" scoped>
.color-candle-arrows {
  margin-left: -0.5rem;
  margin-top: 2px;
}
</style>
