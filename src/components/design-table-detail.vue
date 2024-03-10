<template>
	<el-descriptions title="" :column="2" border>
		<el-descriptions-item :span="2">
			<template #label> 选题名称 </template>
			{{ data.title }}
		</el-descriptions-item>

		<el-descriptions-item>
			<template #label> 选题类别 </template>
			{{ data.category }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 选题状态 </template>
			<el-button :type="getColor(data.state)" size="small" v-permiss="15">
				{{ stateMap[data.state] }}
			</el-button>
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 学生姓名 </template>
			{{ data.studentName }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 指导老师 </template>
			{{ data.teacherName }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 开始日期 </template>
			{{ formatBirthday(data.startDate) }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 结束日期 </template>
			{{ formatBirthday(data.endDate) }}
		</el-descriptions-item>

	</el-descriptions>
	<el-descriptions title="" border direction="vertical">
		<el-descriptions-item>
			<template #label> 选题详情 </template>
			<Editor style="height: 300px; overflow-y: auto;" v-model="data.description"
				:defaultConfig="editorConfig" />
		</el-descriptions-item>
	</el-descriptions>
</template>

<script lang="ts" setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { categoryMap, stateMap, categoryMapReversed, stateMapReversed } from '../utils/map';



const getColor = (state) => {
	if (state === 'submitted') {
		return 'warning';
	} else if (state === 'completed') {
		return 'success';
	} else if (state === 'inprogress') {
		return 'primary';
	} else if (state === 'unselected') {
		return 'danger';
	}
}

const props = defineProps({
	data: {
		type: Object,
		required: true
	}
});
const editorConfig = { placeholder: '选题无描述...' };
const formatBirthday = (value) => {
	const date = new Date(value);
	const year = date.getFullYear();
	const month = (1 + date.getMonth()).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`; // 或者其他您希望的日期格式
}

</script>
