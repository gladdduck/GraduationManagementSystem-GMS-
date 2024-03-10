<template>
	<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
		<el-form-item label="姓名" prop="name">
			<el-input v-model="form.name"></el-input>
		</el-form-item>
		<el-form-item label="性别" prop="gender">
			<el-select v-model="form.gender" placeholder="请选择">
				<el-option
					v-for="item in genderoptions"
					:key="item.value"
					:label="item.label"
					:value="item.value">
				</el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="电话" prop="telephones">
			<el-input v-model.number="form.telephones"></el-input>
		</el-form-item>

		<el-form-item label="邮箱" prop="email">
			<el-input v-model.number="form.email"></el-input>
		</el-form-item>
		<el-form-item label="职称" prop="email">
			<el-input v-model.number="form.professionalTitle"></el-input>
		</el-form-item>
		<el-form-item label="研究方向" prop="email">
			<el-input v-model.number="form.direction"></el-input>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="saveEdit(formRef)">保 存</el-button>
		</el-form-item>
	</el-form>
</template>

<script lang="ts" setup>
import { ElMessage, FormInstance, FormRules, UploadProps } from 'element-plus';
import { getRandomInt } from 'element-plus/es/utils';
import { ref } from 'vue';
import request from '../utils/request';
const props = defineProps({
	data: {
		type: Object,
		required: true
	},
	edit: {
		type: Boolean,
		required: false
	},
	update: {
		type: Function,
		required: true
	}
});
const genderoptions=[{
          value: '男',
          label: '男'
        }, {
          value: '女',
          label: '女'
        }];

const defaultData = {
	teacherId: "",
	name:"",
	gender: "男",
	direction: "",
	telephones: "",
	email: "",
	professionalTitle: ""
}


const form = ref({ ...(props.edit ? props.data : defaultData) });

const rules: FormRules = {
	name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
};
const formRef = ref<FormInstance>();
const saveEdit = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate(valid => {
		if (!valid) return false;
		if(props.edit){
			request.post('http://localhost:8088/teacher/setteacher',
				JSON.stringify(form.value),
				{headers: {"Content-Type":"application/json"}})
			.then(res=>{
				if(res.data.success==true){
					props.update(form.value);
					ElMessage.success('保存成功！');
				}else{
					ElMessage.error('保存失败');
				}
			});
		}else{
			form.value.gender = form.value.gender === "男" ? "male" : "female";
			request.post('http://localhost:8088/teacher/addteacher',
				JSON.stringify(form.value),
				{headers: {"Content-Type":"application/json"}})
			.then(res=>{
				if(res.data.success==true){
					props.update(form.value);
					ElMessage.success('保存成功！');
				}else{
					ElMessage.error('保存失败');
				}
			});
		}
	});
};


</script>

<style>
.avatar-uploader .el-upload {
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
	border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 178px;
	height: 178px;
	text-align: center;
}
</style>
