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
		<el-form-item label="地址" prop="address">
			<el-input v-model="form.address"></el-input>
		</el-form-item>
		<el-form-item label="电话" prop="telephones">
			<el-input v-model.number="form.telephones"></el-input>
		</el-form-item>
		<el-form-item label="班级" prop="classes">
			<el-input v-model.number="form.classes"></el-input>
		</el-form-item>
		<el-form-item label="邮箱" prop="email">
			<el-input v-model.number="form.email"></el-input>
		</el-form-item>
		<el-form-item label="选题状态" prop="state">
			<el-switch
				disabled
				v-model="form.state"
				:active-value="0"
				:inactive-value="1"
				active-text="已选"
				inactive-text="未选"
			></el-switch>
		</el-form-item>
		<el-form-item label="生日" prop="birthday">
			<el-date-picker type="date" v-model="form.birthday" value-format="YYYY-MM-DD"></el-date-picker>
		</el-form-item>
		<!-- <el-form-item label="上传头像" prop="thumb">
			<el-upload
				class="avatar-uploader"
				action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
				:show-file-list="false"
				:on-success="handleAvatarSuccess"
				:before-upload="beforeAvatarUpload"
			>
				<img v-if="form.thumb" :src="form.thumb" class="avatar" />
				<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
			</el-upload>
		</el-form-item> -->
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
	studentId: "",
	name: "",
	gender: "男",
	telephones: "",
	birthday: new Date(),
	classes: "",
	address: "",
	email: "",
	state: 1,
	designTitle: "",
	thumb: ""

};

const form = ref({ ...(props.edit ? props.data : defaultData) });

const rules: FormRules = {
	name: [{ required: true, message: '姓名', trigger: 'blur' }]
};
const formRef = ref<FormInstance>();
const saveEdit = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate(valid => {
		if (!valid) return false;
		if(props.edit){
			request.post('http://localhost:8088/student/setstudent',
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
			request.post('http://localhost:8088/student/addstudent',
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
