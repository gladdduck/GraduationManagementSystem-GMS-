<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>基础信息</span>
            </div>
          </template>
          <div class="info">
            <div class="info-image" @click="showDialog">
              <el-avatar :size="100" :src="avatarImg" />
              <span class="info-edit">
                <i class="el-icon-lx-camerafill"></i>
              </span>
            </div>
            <div class="info-name">{{ name }}</div>
            <div class="info-desc">{{ signatures }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>账户编辑</span>
            </div>
          </template>
          <el-form label-width="90px" ref="formRefPass" :rules="rulesPass" :model="passForm">
            <el-form-item label="用户名："> {{ name }} </el-form-item>
            <el-form-item label="旧密码：" prop="old">
              <el-input type="password" v-model="passForm.old"></el-input>
            </el-form-item>
            <el-form-item label="新密码：" prop="new">
              <el-input type="password" v-model="passForm.new"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>个人管理</span>
            </div>
          </template>
		  <el-row>
			<el-col :span="6" ><el-button type="info" plain>个性签名:</el-button></el-col>
			<el-col :span="12"><el-input placeholder="请输入签名" v-model="signatures" suffix-icon="el-icon-edit"></el-input></el-col>
		  </el-row>
		
		  <el-row style="margin-top: 20px;"><el-button type="primary" @click="saveSignatures">保存</el-button></el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" style="height: 403px">
          <template #header>
            <div class="clearfix">
              <span>待办事项</span>
              <el-button
                style="float: right; padding: 3px 0"
                text
                @click="showTodoList"
                >添加</el-button
              >
            </div>
          </template>

          <el-table
            :show-header="false"
            :data="todoList"
            style="width: 100%"
            max-height="330"
          >
            <el-table-column width="40">
              <template #default="scope">
                <el-checkbox v-model="scope.row.todoDone"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="scope">
                <div
                  class="todo-item"
                  :class="{
                    'todo-item-del': scope.row.todoDone,
                  }"
                >
                  {{ scope.row.todoName }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog title="裁剪图片" v-model="dialogVisible" width="600px">
      <vue-cropper
        ref="cropper"
        :src="imgSrc"
        :ready="cropImage"
        :zoom="cropImage"
        :cropmove="cropImage"
        style="width: 100%; height: 400px"
      ></vue-cropper>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="crop-demo-btn" type="primary"
            >选择图片
            <input
              class="crop-input"
              type="file"
              name="image"
              accept="image/*"
              @change="setImage"
            />
          </el-button>
          <el-button type="primary" @click="saveAvatar">上传并保存</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="新增事项"
      v-model="addListVisible"
      width="500px"
      destroy-on-close
      @close="closeDialog"
    >
      <el-form
        ref="formRefToDo"
        :model="todoForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="待办事项: " prop="newTodo">
          <el-input v-model="todoForm.newTodo"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addTodoList">保 存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="user">
import { onMounted, reactive, ref } from "vue";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";
import avatar from "../assets/img/img.jpg";
import request from "../utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

const formRefToDo = ref<FormInstance>();
const formRefPass = ref<FormInstance>();
const name = localStorage.getItem("ms_username");
const addListVisible = ref(false);
const passForm = reactive({
	id: null,
  old: null,
  new: null,
});
const signatures = ref("");
onMounted(() => {
	passForm.id = localStorage.getItem("ms_userid");
	getSignatures();
});

const getSignatures = () => {
	request({
		url:"http://localhost:8088/user/getsignatures", 
		method: 'post',
		params: {
			userId: passForm.id
		}
	}).then((response) => {
		signatures.value = response.data.message;
		console.log(signatures.value);
	});
};

const todoForm = reactive({
  newTodo: null,
});
const rules: FormRules = reactive({
  newTodo: [{ required: true, message: "不能为空", trigger: "blur" }],
});
const rulesPass: FormRules = reactive({
	old: [{ required: true, message: "1不能为空", trigger: "blur" }],
	new: [{ required: true, message: "2不能为空", trigger: "blur" }],
});

const onSubmit = () => {
	console.log(formRefPass.value);
	formRefPass.value.validate(async (valid) => {
		if (valid) {
			request.post("http://localhost:8088/user/resetpassword", passForm).then((response) => {
				if (response.data.success == true) {
					ElMessage.success("保存成功！");
				} else {
					ElMessage.error("保存失败!" + response.data.message);
				}
			});
		}
	})
};
const saveSignatures=()=>{
	console.log(signatures.value);
	request.post("http://localhost:8088/user/resetsignature", {
		userId: passForm.id,
		signature: signatures.value
	}).then((response) => {
		if (response.data.success == true) {
			console.log(response.data.message,passForm.id,signatures.value);
			ElMessage.success("保存成功！");
		} else {
			ElMessage.error("保存失败!" + response.data.message);
		}
	});
};
const todoList = ref([]);
const avatarImg = ref(avatar);
const imgSrc = ref("");
const cropImg = ref("");
const dialogVisible = ref(false);
const cropper: any = ref();

const getTodoList = () => {
  request({
    url: "http://localhost:8088/dashboard/getlist",
    method: "get",
  }).then((response) => {
    todoList.value = response.data.reverse();
  });
};

getTodoList();
const showTodoList = () => {
  addListVisible.value = true;
};
const addTodoList = async () => {
	formRefToDo.value.validate(async (valid) => {
    if (!valid) {
      return;
    } else {
      await request({
        url: "http://localhost:8088/dashboard/addlist",
        method: "post",
        params: {
          todoName: todoForm.newTodo,
          todoDone: false,
        },
      }).then((response) => {
        if (response.data.success == true) {
          ElMessage.success("保存成功！");
          todoForm.newTodo = "";
          addListVisible.value = false;
        } else {
          ElMessage.error("保存失败!" + response.data.message);
        }
      });
      await getTodoList();
    }
  });
};
const closeDialog = () => {
  todoForm.newTodo = "";
  addListVisible.value = false;
};

const showDialog = () => {
  dialogVisible.value = true;
  imgSrc.value = avatarImg.value;
};

const setImage = (e: any) => {
  const file = e.target.files[0];
  if (!file.type.includes("image/")) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (event: any) => {
    dialogVisible.value = true;
    imgSrc.value = event.target.result;
    cropper.value && cropper.value.replace(event.target.result);
  };
  reader.readAsDataURL(file);
};

const cropImage = () => {
  cropImg.value = cropper.value.getCroppedCanvas().toDataURL();
};

const saveAvatar = () => {
  avatarImg.value = cropImg.value;
  dialogVisible.value = false;
};
</script>

<style scoped>
.info {
  text-align: center;
  padding: 35px 0;
}
.info-image {
  position: relative;
  margin: auto;
  width: 100px;
  height: 100px;
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 50px;
  overflow: hidden;
}

.info-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.info-edit i {
  color: #eee;
  font-size: 25px;
}
.info-image:hover .info-edit {
  opacity: 1;
}
.info-name {
  margin: 15px 0 10px;
  font-size: 24px;
  font-weight: 500;
  color: #262626;
}
.crop-demo-btn {
  position: relative;
}
.crop-input {
  position: absolute;
  width: 100px;
  height: 40px;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}
.todo-item-del {
  text-decoration: line-through;
  color: #999;
}
</style>
