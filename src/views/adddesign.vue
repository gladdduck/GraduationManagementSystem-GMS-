<template>
	<div class="container">
		<el-form ref="formRef" :model="addForm" label-width="100px" :rules="rules">
			<el-form-item label="毕设名称:" prop="title" style="width:680px">
				<el-input v-model="addForm.title"></el-input>
			</el-form-item>
			<el-row>
				<el-col :span="8">
					<el-form-item label="毕设类型:" prop="category">
						<el-select v-model="addForm.category" placeholder="毕设类型">
							<el-option label="实验型" value="experimental"></el-option>
							<el-option label="理论型" value="theoretical"></el-option>
							<el-option label="设计型" value="design"></el-option>
							<el-option label="描述型" value="descriptive"></el-option>
							<el-option label="综合型" value="synthesis"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="指导老师:" prop="teacherName">
						<el-select v-model="addForm.teacherName" placeholder="指导老师">
							<el-option v-for="item in teacherOptions" :key="item.value" :label="item.label"
								:value="item.value">
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="8">
					<el-form-item label="开始时间:" prop="startDate">

						<el-date-picker type="date" placeholder="选择日期" v-model="addForm.startDate"
							style="width: 100%;"></el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="8">

					<el-form-item label="结束时间:" prop="endDate">
						<el-date-picker type="date" placeholder="选择日期" v-model="addForm.endDate"
							style="width: 100%;"></el-date-picker>
					</el-form-item>
				</el-col>

			</el-row>

			<el-form-item label="选题描述">
				<div style="border: 1px solid #ccc; margin-bottom: 10px">
					<Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" />
					<Editor style="height: 300px; overflow-y: hidden" v-model="addForm.description"
						:defaultConfig="editorConfig" @onCreated="handleCreated" />
				</div>
				<el-button type="primary" @click="syncHTML">提交</el-button>
			</el-form-item>

		</el-form>

	</div>
</template>

<script setup lang="ts" name="editor">
import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import { onBeforeUnmount, ref, reactive, shallowRef, onMounted } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '../utils/request';

// import form from './form.vue';
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const rules: FormRules = {
	title: [{ required: true, message: '请输入选题名称', trigger: 'blur' }],
	startDate: [{ required: true, message: '请输入开始日期', trigger: 'blur' }],
	endDate: [{ required: true, message: '请输入结束日期', trigger: 'blur' }],
	category: [{ required: true, message: '请选择选题分类', trigger: 'blur' }],
	teacherName: [{ required: true, message: '请选择指导老师', trigger: 'blur' }],
};
const formRef = ref<FormInstance>();

let addForm = reactive({
	designId: null,
	count: 1,
	studentId: undefined,
	studentName: undefined,
	teacherId: undefined,
	state: 'unselected',
	title: '',
	description: '',
	startDate: '',
	endDate: '',
	category: '',
	teacherName: '',

});
const teacherOptions = ref([]);

// 模拟 ajax 异步获取内容
onMounted(() => {
	request({
		url: 'http://localhost:8088/teacher/getteachers',
		method: 'get',
	}).then(res => {
		res.data.data.forEach(element => {
			teacherOptions.value.push({ value: element.name, label: element.name })
		});
	})
});

const toolbarConfig = {};
const editorConfig = { placeholder: '请输入选题描述...' };

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
	const editor = editorRef.value;
	if (editor == null) return;
	editor.destroy();
});

const handleCreated = (editor: any) => {
	editorRef.value = editor; // 记录 editor 实例，重要！
};
const syncHTML = () => {
	console.log(addForm)
	console.log(JSON.stringify(addForm),)
	formRef.value.validate(async (valid) => {
		if (valid) {
			ElMessageBox.confirm('选题发布之后不可修改,确定发布吗？', '提示', {
				type: 'warning'
			}).then(async () => {
				await request.post('http://localhost:8088/design/adddesign',
					JSON.stringify(addForm),
					{ headers: { "Content-Type": "application/json" } })
					.then(res => {
						if (res.data.success == true) {
							ElMessage.success('保存成功！');
						} else {
							ElMessage.error('保存失败!' + res.data.message);
						}
					});
			})
		} else {
			ElMessage.error('请补全信息');
		}
	})


};
</script>

<style>
.mr30 {
	margin-right: 30px;
}
</style>
