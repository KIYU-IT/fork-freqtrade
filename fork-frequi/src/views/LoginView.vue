<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="container">
    <BCard :header="t('login.title')">
      <BotLogin ref="loginForm" />
    </BCard>
  </div>
</template>

<style scoped>
.container {
  max-width: 520px;
}
</style>
