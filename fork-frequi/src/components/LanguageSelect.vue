<template>
  <b-nav-item-dropdown id="language-dropdown" size="sm" toggle-class="ps-0 pe-0">
    <template #button-content>
      <i-mdi-translate />
      {{ currentLanguageLabel }}
    </template>
    <b-dropdown-item
      v-for="lang in languages"
      :key="lang.code"
      :active="currentLanguage === lang.code"
      @click="changeLanguage(lang.code)"
    >
      {{ lang.label }}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLanguage } from '@/i18n';

const { locale } = useI18n();

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' }
];

const currentLanguage = computed(() => locale.value);
const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.code === currentLanguage.value);
  return lang ? lang.label : 'English';
});

function changeLanguage(lang: string) {
  setLanguage(lang);
}
</script>

<style scoped>
#language-dropdown {
  padding: 0;
}
</style>