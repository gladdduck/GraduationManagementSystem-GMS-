<template>
	<el-descriptions title="" :column="2" border>
		<el-descriptions-item>
			<template #label> 教工编号 </template>
			{{ data.teacherId }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 姓名 </template>
			{{ data.name }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 性别 </template>
			{{ genderMap[data.gender] }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 电话 </template>
			{{ data.telephones }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 邮箱 </template>
			{{ data.email }}
		</el-descriptions-item>
		<el-descriptions-item >
			<template #label> 职称 </template>
			{{ data.professionalTitle }}
		</el-descriptions-item>
		<el-descriptions-item :span="2">
			<template #label> 研究方向 </template>
			{{ data.direction }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label> 照片 </template>
			<img src="../assets/img/img.jpg" style="width: 120px" alt="" />
		</el-descriptions-item>
	</el-descriptions>
</template>

<script lang="ts" setup>
import {genderMap} from '../utils/map';
const props = defineProps({
	data: {
		type: Object,
		required: true
	}
});

const formatBirthday=(value) =>{
    const date = new Date(value);
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`; // 或者其他您希望的日期格式
  }

</script>
