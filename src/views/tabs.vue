<template>
  <div class="container">
    <el-tabs v-model="message">
      <el-tab-pane
        :label="`未读消息(${state.message.unread.length})`"
        name="first"
      >
        <el-table
          :data="state.message.unread"
          :show-header="false"
          style="width: 100%"
        >
          <el-table-column>
            <template #default="scope">
              <span class="message-title">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="date" width="180">
            <template v-slot="{ row }">
              {{ formatBirthday(row.date) }}
            </template>
          </el-table-column>
          <el-table-column width="120">
            <template #default="scope">
              <el-button size="small" @click="handleRead(scope.$index)"
                >标为已读</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="handle-row">
          <el-button type="primary" @click="handleAllRead"
            >全部标为已读</el-button
          >
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="`已读消息(${state.message.read.length})`"
        name="second"
      >
        <template v-if="message === 'second'">
          <el-table
            :data="state.message.read"
            :show-header="false"
            style="width: 100%"
          >
            <el-table-column>
              <template #default="scope">
                <span class="message-title">{{ scope.row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="date" width="180">
				<template v-slot="{ row }">
              {{ formatBirthday(row.date) }}
            </template>
			</el-table-column>
            <el-table-column width="120">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDel(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="handle-row">
            <el-button type="danger" @click="handleAllDel">删除全部</el-button>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane
        :label="`回收站(${state.message.recycle.length})`"
        name="third"
      >
        <template v-if="message === 'third'">
          <el-table
            :data="state.message.recycle"
            :show-header="false"
            style="width: 100%"
          >
            <el-table-column>
              <template #default="scope">
                <span class="message-title">{{ scope.row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="date" width="180">
				<template v-slot="{ row }">
              {{ formatBirthday(row.date) }}
            </template>
			</el-table-column>
            <el-table-column width="120">
              <template #default="scope">
                <el-button size="small" @click="handleRestore(scope.$index)"
                  >还原</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="handle-row">
            <el-button type="danger" @click="clearMessage"
              >清空回收站</el-button
            >
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts" name="tabs">
import { ref, reactive, onMounted } from "vue";
import request from "../utils/request";
import { all } from "axios";
import { ElMessage, ElMessageBox } from 'element-plus';


const message = ref("first");
const state = reactive({
  message: {
    unread: [
      {
		id: null,
        date: "2018-04-19 21:00:00",
        title: "今晚12点整发大红包，先到先得",
		state: "unread",
      },
    ],
    read: [
      {
		id: null,
        date: "2018-04-19 20:00:00",
        title: "【系统通知】该系统将于今晚凌晨2点到5点进行升级维护",
		state: "read",
      },
    ],
    recycle: [
      {
		id: null,
        date: "2018-04-19 20:00:00",
        title: "【系统通知】该系统将于今晚凌晨2点到5点进行升级维护",
		state: "recycle",
      },
    ],
  },
});

const formatBirthday = (birthday) => {
  const date = new Date(birthday);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-indexed, hence the +1
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


const getMessage = async () => {
  await request({
    url: "http://localhost:8088/message/getmessage",
    method: "get",
  }).then((res) => {
    state.message = res.data;
  });
};

onMounted(() => {
  getMessage();
});

const changeMessageState = () => {
	request.post('http://localhost:8088/message/setmessage', 
		state.message,
		{ headers: { "Content-Type": "application/json" } })
	.then((res) => {
	});
};


const handleAllRead = () => {
  const item = state.message.unread;
  state.message.read = item.concat(state.message.read);
  state.message.unread = [];
  changeMessageState();
};
const handleRead = (index: number) => {
  const item = state.message.unread.splice(index, 1);
  state.message.read = item.concat(state.message.read);
  changeMessageState();
};
const handleAllDel = () => {
  const item = state.message.read;
  state.message.recycle = item.concat(state.message.recycle);
  state.message.read = [];
  changeMessageState();
};
const handleDel = (index: number) => {
  const item = state.message.read.splice(index, 1);
  state.message.recycle = item.concat(state.message.recycle);
  changeMessageState();
};
const handleRestore = (index: number) => {
  const item = state.message.recycle.splice(index, 1);
  state.message.read = item.concat(state.message.read);
  changeMessageState();
};
const clearMessage = () => {

	ElMessageBox.confirm('确定要清空回收站吗？', '提示', {
		type: 'warning'
	}).then(() => {
		request.post('http://localhost:8088/message/deletemessages',
			state.message.recycle.map((item) => item.id),
			{ headers: { "Content-Type": "application/json" } }
		).then((res) => {
			if(res.data.success == true){
				state.message.recycle = [];
			}
		});
	});

};
</script>

<style>
.message-title {
  cursor: pointer;
}
.handle-row {
  margin-top: 30px;
}
</style>
