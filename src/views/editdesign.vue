<template>
	<div class="container">
		<el-form ref="formRef" :model="addForm" label-width="100px" :rules="rules">
			
			<el-form-item label="毕设名称:" prop="title" style="width:680px">
				<el-input v-model="addForm.title" disabled></el-input>
			</el-form-item>
			<el-row>
				<el-col :span="8">
					<el-form-item label="毕设类型:" prop="category">
						<el-select v-model="addForm.category" placeholder="毕设类型" disabled>
							<el-option label="实验型" value="experimental"></el-option>
							<el-option label="理论型" value="theoretical"></el-option>
							<el-option label="设计型" value="design"></el-option>
							<el-option label="描述型" value="descriptive"></el-option>
							<el-option label="综合型" value="synthesis"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="指导老师:" prop="teacherName" >
						<el-select v-model="addForm.teacherName" placeholder="指导老师" disabled>
							<el-option v-for="item in teacherOptions" :key="item.value" :label="item.label"
								:value="item.value">
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="8">
					<el-form-item label="开始时间:" prop="startDate" >

						<el-date-picker type="date" placeholder="选择日期" v-model="addForm.startDate" disabled
							style="width: 100%;"></el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="8">

					<el-form-item label="结束时间:" prop="endDate">
						<el-date-picker type="date" placeholder="选择日期" v-model="addForm.endDate" disabled
							style="width: 100%;"></el-date-picker>
					</el-form-item>
				</el-col>

			</el-row>
			<el-row>
				<el-col :span="8">
					<el-form-item label="学生姓名:" prop="studentName" >
						<el-autocomplete
							class="inline-input"
							v-model="addForm.studentName"
							:fetch-suggestions="querySearch"
							placeholder="请输入内容"
							:trigger-on-focus="true"
							@select="handleSelect"
						></el-autocomplete>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="选题状态:" prop="state">
					<el-select v-model="addForm.state" placeholder="选题状态" :disabled="addForm.studentName===''">
							<el-option label="已完成" value="completed"></el-option>
							<el-option label="已提交" value="submitted"></el-option>
							<el-option label="进行中" value="inprogress"></el-option>
							<el-option label="未选择" value="unselected"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="8">
					<el-form-item label="最终评分:" prop="count" >
						<el-input v-model="addForm.count" :disabled="addForm.state!=='completed'"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
				</el-col>

			</el-row>
			<el-form-item label="选题描述">
				<div style="border: 1px solid #ccc; margin-bottom: 10px">
					<Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" />
					<Editor style="height: 300px; overflow-y: hidden" v-model="addForm.description" aria-disabled="true"
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
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

const route = useRoute()
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
const designId = route.query.designId;
let addForm = reactive({
	designId: null,
	count: "",
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
let studentList = [{
	'value':'',
	'studentId':''
}]

const teacherOptions = ref([]);
const getStudentList = () => {
	request({
		url: 'http://localhost:8088/student/getstudentname',
		method: 'get',
	}).then(res => {
		const names = Object.keys(res.data);
		const ids = Object.values(res.data);
		const suggestions = names.map((item, index) => ({
			'studentId': '' + ids[index],
			'value': item
		}));
		studentList = suggestions;
		console.log(studentList)
	})

}
onMounted(() => {
    getDesign();
	getStudentList();
});
const handleSelect = (item: any) => {
	addForm.studentId = item.studentId;
	console.log(item)
};
const querySearch=(queryString, cb) =>{
	var students = studentList;
	var results = queryString ? students.filter(createFilter(queryString)) : students;
	console.log(results)
	cb(results);
};

const createFilter=(queryString)=> {
	return (item) => {
		return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
	};
};
const getDesign =  () => {
	request({
		url: 'http://localhost:8088/design/getdesignsbyid',
		method: 'post',
		params: {
			designId: designId
		},
	}).then(res => {
		addForm.title = res.data.title;
		addForm.category = res.data.category;
		addForm.teacherName = res.data.teacherName;
		addForm.startDate = res.data.startDate;
		addForm.endDate = res.data.endDate;
		addForm.description = res.data.description;
		addForm.studentId = res.data.studentId;
		addForm.studentName = res.data.studentName;
		addForm.state = res.data.state;
		addForm.designId = res.data.designId;
		addForm.count = res.data.count;
	})
}

const toolbarConfig = {};
const editorConfig = { placeholder: '选题无描述' };

onBeforeUnmount(() => {
	const editor = editorRef.value;
	if (editor == null) return;
	editor.destroy();
});

const handleCreated = (editor: any) => {
	editorRef.value = editor; 
	editorRef.value.disable()
};
const syncHTML = () => {
	formRef.value.validate(async (valid) => {
		if (valid) {
			ElMessageBox.confirm('确定提交？', '提示', {
				type: 'warning'
			}).then(async () => {
				await request.post('http://localhost:8088/design/setdesign',
					JSON.stringify(addForm),
					{ headers: { "Content-Type": "application/json" } })
				.then(res => {
					if (res.data.success == true) {
						ElMessage.success('保存成功！');
					} else {
						ElMessage.error('保存失败!' + res.data.message);
					}
				});
				const newMessage = {
					"date": new Date(),
					"title": "【系统消息】学生："+addForm.studentName+"的毕设选题：<<" + addForm.title + ">>状态已更新为:" + addForm.state,
					"state": "unread",
				}
				await request.post('http://localhost:8088/message/addmessage',
					JSON.stringify(newMessage),
						{ headers: { "Content-Type": "application/json" } })
					.then(res => {
						if (res.data.success == true) {
							ElMessage.success('消息发送成功！');
						} else {
							ElMessage.error('消息发送失败!' + res.data.message);
						}
					})
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
