<template>
	<el-config-provider :locale="zhCn">
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
const saveData= () => {
  localStorage.setItem('ms_loginDate', new Date().toLocaleString());
};

window.addEventListener('beforeunload', saveData);


</script>
<style>
@import './assets/css/main.css';
@import './assets/css/color-dark.scss';





</style>
