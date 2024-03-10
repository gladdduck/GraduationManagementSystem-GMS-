<template>
	<div>
		<div class="container">

			<div class="search-box">
				<el-input v-model="query.title" placeholder="毕设题目" class="search-input mr10" clearable
					@keyup.enter="handleSearch"></el-input>
				<el-select v-model="query.category" clearable placeholder="分类" class="search-select mr10">
					<el-option v-for="item in categoryList" :key="item" :label="item" :value="item">
					</el-option>
				</el-select>
				<el-select v-model="query.state" clearable placeholder="状态" class="search-select mr10">
					<el-option v-for="item in stateList" :key="item" :label="item" :value="item">
					</el-option>
				</el-select>
				<el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
				<el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">新增</el-button>
				<el-button type="danger" :icon="Delete" :disabled="deleteButtonAble"
					@click="handleBatchDelete">删除</el-button>
			</div>
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
				sele @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55">
				</el-table-column>
				<el-table-column prop="title" label="题目" align="center" sortable width="250"></el-table-column>
				<el-table-column prop="state" label="状态" align="center" sortable>
					<template #default="scope">

						<el-button :type="getColor(scope.row.state)" size="small" v-permiss="15">
							{{ stateMap[scope.row.state] }}
						</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="startDate" label="开始时间" align="center" :formatter="formatBirthday"
					sortable></el-table-column>
				<el-table-column prop="endDate" label="结束时间" align="center" :formatter="formatBirthday"
					sortable></el-table-column>
				<el-table-column prop="category" label="类别" align="center" sortable="">
					<template #default="scope">
						{{ categoryMap[scope.row.category] }}
					</template>
				</el-table-column>
				<el-table-column prop="teacherName" label="指导老师" align="center"></el-table-column>
				<el-table-column prop="studentName" label="学生" align="center"></el-table-column>
				<el-table-column prop="count" label="评分" align="center"></el-table-column>
				<el-table-column label="操作" width="280" align="center">
					<template #default="scope">
						<el-button type="warning" size="small" :icon="View" @click="handleView(scope.row)">
							查看
						</el-button>
						<el-button type="success" size="small" :icon="View" @click="handleEdit(scope.row)">
							操作
						</el-button>
						<el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.$index)"
							v-permiss="15">
							删除
						</el-button>
					</template>
				</el-table-column>


			</el-table>
			<div class="pagination">
				<el-pagination background layout="total, sizes, prev, pager, next" :current-page="query.pageIndex"
					:page-sizes="[2, 5, 10]" :page-size="query.pageSize" @size-change="handleSizeChange"
					:total="pageTotal" @current-change="handlePageChange"></el-pagination>
			</div>
		</div>
		<el-dialog title="查看选题详情" v-model="visible1" width="700px" destroy-on-close>
			<TableDetail :data="rowData" />
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, CirclePlusFilled, View } from '@element-plus/icons-vue';
import TableDetail from '../components/design-table-detail.vue';
import * as XLSX from 'xlsx';
import { UploadProps } from 'element-plus';
import request from '../utils/request';
import {categoryMap, stateMap, categoryMapReversed, stateMapReversed} from '../utils/map';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';



const router = useRouter();
interface TableItem {
	designId: number;
	title: string;
	description: string;
	state: string;
	startDate: string;
	endDate: string;
	category: string;
	count: number;
	studentId: number;
	teacherId: number;
	teacherName: string;
	studentName: string;
}
const categoryList = ['实验型', '理论型', '设计型', '描述型','综合型'];
const stateList = ['已提交', '已完成', '进行中', '未选择'];

const query = reactive({
	title: '',
	category: undefined,
	state: undefined,
	pageIndex: 1,
	pageSize: 5
});
const searchName = ref('');
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
const batchDeleteIds = ref([])
// 获取表格数据

const fetchTableData = () => {
	return request({
		url: 'http://localhost:8088/design/getdesignbyconditions',
		method: 'post',
		params: {
			pageIndex: query.pageIndex,
			pageSize: query.pageSize,
			title:query.title,
			category:query.category===undefined?"":categoryMapReversed[query.category],
			state:query.state===undefined?"":stateMapReversed[query.state]
		}
	});
};

const formatBirthday = (row, column) => {
	const date = new Date(row[column.property]);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
	const day = date.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}

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

const getData = async () => {
	const res = await fetchTableData();
	tableData.value = res.data.data;
	pageTotal.value = res.data.total || 50;
};
getData();

const handleSelectionChange = (val) => {
	batchDeleteIds.value = []
	val.forEach(element => {
		batchDeleteIds.value.push(element.designId);
	});
	deleteButtonAble.value = val.length === 0;
}
const handleAdd = () => {
	ElMessageBox.confirm('确定发布新的毕业设计选题？', '提示', {
		type: 'warning'
	}).then(() => {
		router.push('/adddesign');
	}).catch(() => {});
}
const handleEdit=(row: TableItem) =>{
	ElMessageBox.confirm('跳转到毕设详细操作页面？', '提示', {
		type: 'warning'
	}).then(() => {
		console.log(row)
		router.push({ path: '/editdesign', query: { designId: row.designId } });
	}).catch(() => {});
}

// 查询操作
const handleSearch = async () => {
	getData();
};
// 分页导航
const handlePageChange = (val: number) => {
	query.pageIndex = val;
	getData();
};

const handleSizeChange = (val: number) => {
	query.pageSize = val;
	getData();
};

const handleBatchDelete = () => {
	ElMessageBox.confirm('确定要删除吗？', '提示', {
		type: 'warning'
	})
	.then(async () => {
		await request.post('http://localhost:8088/design/deletedesigns',
			batchDeleteIds.value,
			{ headers: { "Content-Type": "application/json" } }
		).then(res => {
			if (res.data.success == true) {
				ElMessage.success('删除成功');
				tableData.value = tableData.value.filter(item => !batchDeleteIds.value.includes(item.designId));
				batchDeleteIds.value = []
			} else {
				ElMessage.error('删除失败! ' + res.data.message);
			}
		})
	})
	.catch(() => {  });
	getData();
}
// 删除操作
const handleDelete = (index: number) => {
	// 二次确认删除
	ElMessageBox.confirm('确定要删除吗？', '提示', {
		type: 'warning'
	})
	.then(async () => {
		const deleteDesign = tableData.value[index];
		await request({
			url: 'http://localhost:8088/design/deletedesign',
			method: 'post',
			params: {
				designId: deleteDesign.designId
			}
		}).then(res => {
			if (res.data.success == true) {
				ElMessage.success('删除成功');
				tableData.value.splice(index, 1);
			} else {
				ElMessage.error('删除失败! ' + res.data.message);
			}
		})
	})
	.catch(() => {  });
	getData();
};

const visible = ref(false);
const deleteButtonAble = ref(true);
let idx: number = -1;
const idEdit = ref(false);
const rowData = ref({});

const updateData = (row: TableItem) => {
	idEdit.value ? (tableData.value[idx] = row) : tableData.value.unshift(row);
	closeDialog();
};

const closeDialog = () => {
	visible.value = false;
	idEdit.value = false;
};

const visible1 = ref(false);
const handleView = (row: TableItem) => {
	rowData.value = row;
	visible1.value = true;
};
</script>

<style scoped>
.search-box {
	margin-bottom: 20px;
}
.search-select {
	width: 100px;
}
.search-input {
	width: 200px;
}

.mr20 {
	margin-right: 20px;
}

.mr10 {
	margin-right: 10px;
}

.table-td-thumb {
	display: block;
	margin: auto;
	width: 40px;
	height: 40px;
}

.handle-box {
	display: flex;
	margin-bottom: 20px;
}

.table {
	width: 100%;
	font-size: 14px;
}
</style>
