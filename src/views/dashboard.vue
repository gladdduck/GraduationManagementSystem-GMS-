<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="mgb20" style="height: 252px">
          <div class="user-info">
            <el-avatar :size="120" :src="imgurl" />
            <div class="user-info-cont">
              <div class="user-info-name">{{ name }}</div>
              <div>{{ role }}</div>
            </div>
          </div>
          <div class="user-info-list">
            上次登录时间：
            <span>{{ loginDate }}</span>
          </div>
          <div class="user-info-list">
            上次登录地点：
            <span>江苏-泰州</span>
          </div>
        </el-card>
        <el-card shadow="hover" style="height: 252px">
          <template #header>
            <div class="clearfix">
              <span>毕业设计完成进度情况</span>
            </div>
          </template>
          已完成
          <el-progress
            :percentage="statePercent.completed"
            color="#42b983"
          ></el-progress>
          审核中
          <el-progress
            :percentage="statePercent.inprogress"
            color="#f1e05a"
          ></el-progress>
          已提交
          <el-progress :percentage="statePercent.submitted"></el-progress>
          未选择
          <el-progress
            :percentage="statePercent.unselected"
            color="#f56c6c"
          ></el-progress>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-row :gutter="20" class="mgb20">
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-1">
                <el-icon class="grid-con-icon">
                  <User />
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">{{ itemNums.studentNum }}</div>
                  <div>学生数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-2">
                <el-icon class="grid-con-icon">
                  <ChatDotRound />
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">{{ itemNums.designNum }}</div>
                  <div>毕设选题数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-3">
                <el-icon class="grid-con-icon">
                  <Goods />
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">{{ itemNums.teacherNum }}</div>
                  <div>教师数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
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
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <schart
            ref="pie"
            class="schart"
            canvasId="pie"
            :options="options"
          ></schart>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <schart
            ref="bar"
            class="schart"
            canvasId="bar"
            :options="options2"
          ></schart>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
      title="新增事项"
      v-model="addListVisible"
      width="500px"
      destroy-on-close
      @close="closeDialog"
    >
      <el-form :model="todoForm" label-width="100px" :rules="rules" ref="todoForm">
        <el-form-item label="待办事项: " prop="newTodo">
          <el-input v-model="todoForm.newTodo"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addTodoList('todoForm')">保 存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Schart from "vue-schart";
import { reactive } from "vue";
import imgurl from "../assets/img/img.jpg";
import request from "../utils/request";
import { categoryMap } from "../utils/map";

export default {
  name: "welcome",
  data() {
    return {
      
      loginDate: "2022-10-01",
      imgurl: imgurl,
      name: "user",
      role: "普通用户",
      options: {
        type: "pie",
        title: {
          text: "毕设选题类型占比分布饼状图",
        },
        legend: {
          position: "left",
        },
        bgColor: "#fbfbfb",
        labels: ["设计型", "理论型", "综合型", "描述型", "实验型"],
        datasets: [
          {
            data: [1, 2, 3, 4, 5],
          },
        ],
      },
      options2: {
        type: "line",
        title: {
          text: "指导老师职称数量分布图",
        },
        labels: ["Mrs.", "Mr.", "Ms.", "Prof.", "Miss."],
        datasets: [
          {
            label: "职称",
            data: [234, 278, 270, 190, 230],
          },
        ],
      },
      todoForm: {
        newTodo: null,
      },
      rules: {
        newTodo: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
      todoList: [],
      addListVisible: false,
      itemNums: {
        studentNum: 1234,
        designNum: 321,
        teacherNum: 5000,
      },
      statePercent: {
        finish: 79.4,
        checking: 14,
        submit: 5.6,
        unselected: 1,
      },
    };
  },
  components: {
    Schart,
  },
  created() {
    const username = localStorage.getItem("ms_username");
    this.loginDate = localStorage.getItem("ms_loginDate");
    this.name = username ? username : "";
    this.role = this.name === "admin" ? "超级管理员" : "普通用户";
    this.getTodoList();
    this.getStatePercent();
    this.getItemNums();
    this.getBarData();
    this.getPieData();
  },
  methods: {
    async getBarData() {
      await request({
        url: "http://localhost:8088/dashboard/getBarData",
        method: "get",
      }).then((response) => {
        this.options2.labels = Object.keys(response.data);
        this.options2.datasets[0].data = Object.values(response.data);
      });
    },

    async getPieData() {
      await request({
        url: "http://localhost:8088/dashboard/getPieData",
        method: "get",
      }).then((response) => {
        this.options.labels = Object.keys(response.data).map(
          (label) => categoryMap[label]
        );
        this.options.datasets[0].data = Object.values(response.data);
      });
    },
    getStatePercent() {
      request({
        url: "http://localhost:8088/dashboard/getStatePercent",
        method: "get",
      }).then((response) => {
        this.statePercent = response.data;
      });
    },
    getItemNums() {
      request({
        url: "http://localhost:8088/dashboard/getItemNums",
        method: "get",
      }).then((response) => {
        this.itemNums = response.data;
      });
    },
    getTodoList() {
      request({
        url: "http://localhost:8088/dashboard/getlist",
        method: "get",
      }).then((response) => {
        this.todoList = response.data.reverse();
      });
    },
    showTodoList() {
      this.addListVisible = true;
    },
    async addTodoList(formRef) {
      this.$refs[formRef].validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          await request({
            url: "http://localhost:8088/dashboard/addlist",
            method: "post",
            params: {
              todoName: this.todoForm.newTodo,
              todoDone: false,
            },
          }).then((response) => {
            if (response.data.success == true) {
              ElMessage.success("保存成功！");
              this.todoForm.newTodo = "";
              this.addListVisible = false;
            } else {
              ElMessage.error("保存失败!" + response.data.message);
            }
          });
          await this.getTodoList();
        }
      });
    },
    closeDialog() {
      this.todoForm.newTodo = "";
      this.addListVisible = false;
    },
  },
};
</script>



<style scoped>
.el-row {
  margin-bottom: 20px;
}

.grid-content {
  display: flex;
  align-items: center;
  height: 100px;
}

.grid-cont-right {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.grid-num {
  font-size: 30px;
  font-weight: bold;
}

.grid-con-icon {
  font-size: 50px;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  color: #fff;
}

.grid-con-1 .grid-con-icon {
  background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
  background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
  color: rgb(100, 213, 114);
}

.grid-con-3 .grid-con-icon {
  background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
  color: rgb(242, 94, 67);
}

.user-info {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
}

.user-info-cont {
  padding-left: 50px;
  flex: 1;
  font-size: 14px;
  color: #999;
}

.user-info-cont div:first-child {
  font-size: 30px;
  color: #222;
}

.user-info-list {
  font-size: 14px;
  color: #999;
  line-height: 25px;
}

.user-info-list span {
  margin-left: 70px;
}

.mgb20 {
  margin-bottom: 20px;
}

.todo-item {
  font-size: 14px;
}

.todo-item-del {
  text-decoration: line-through;
  color: #999;
}

.schart {
  width: 100%;
  height: 300px;
}
</style>
