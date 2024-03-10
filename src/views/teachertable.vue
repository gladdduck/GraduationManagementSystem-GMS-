<template>
	<div>
		<div class="container">
			<div class="search-box">
				<el-input v-model="query.conditions" placeholder="姓名/研究方向/职称" class="search-input mr10" clearable @keyup.enter="handleSearch"></el-input>
				<el-button type="primary" :icon="Search" @click="handleSearch" >搜索</el-button>
				<el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
				<el-button type="danger" :icon="Delete" :disabled="deleteButtonAble"
					@click="handleBatchDelete">删除</el-button>
			</div>
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
				sele @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55">
				</el-table-column>
				<el-table-column prop="name" label="姓名" align="center" sortable></el-table-column>
				<el-table-column label="性别" align="center" sortable>
					<template #default="scope">{{ scope.row.gender }}</template>
				</el-table-column>
				<el-table-column prop="telephones" label="电话" align="center"></el-table-column>
				<el-table-column prop="email" label="邮箱" align="center"></el-table-column>
				<el-table-column prop="direction" label="研究方向" align="center" sortable></el-table-column>
				<el-table-column prop="professionalTitle" label="职称" align="center" sortable></el-table-column>

				<el-table-column label="操作" width="280" align="center">
					<template #default="scope">
						<el-button type="warning" size="small" :icon="View" @click="handleView(scope.row)">
							查看
						</el-button>
						<el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.$index, scope.row)"
							v-permiss="15">
							编辑
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
				:page-sizes="[2, 5, 10]"  :page-size="query.pageSize" @size-change="handleSizeChange"
				 :total="pageTotal" @current-change="handlePageChange"></el-pagination>
			</div>
		</div>
		<el-dialog :title="idEdit ? '编辑用户' : '新增用户'" v-model="visible" width="500px" destroy-on-close
			:close-on-click-modal="false" @close="closeDialog">
			<TableEdit :data="rowData" :edit="idEdit" :update="updateData" />
		</el-dialog>
		<el-dialog title="查看用户详情" v-model="visible1" width="700px" destroy-on-close>
			<TableDetail :data="rowData" />
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, CirclePlusFilled, View } from '@element-plus/icons-vue';
import TableEdit from '../components/teacher-table-edit.vue';
import TableDetail from '../components/teacher-table-detail.vue';
import * as XLSX from 'xlsx';
import { UploadProps } from 'element-plus';
import request from '../utils/request';

interface TableItem {
	teacherId: number;
	name: string;
	gender:string;
	direction: string;
	telephones: string;
	email: string;
	professionalTitle: string;
}

const query = reactive({
	conditions: '',
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
		url: 'http://localhost:8088/teacher/getteacherbyconditions',
		method: 'post',
		params: {
			pageIndex: query.pageIndex,
			pageSize: query.pageSize,
			conditions: query.conditions
		}
	});
};


const getData = async () => {
	const res = await fetchTableData();
	tableData.value = res.data.data;
	pageTotal.value = res.data.total ;
};

getData();



const handleSelectionChange = (val) => {
	batchDeleteIds.value = []
	val.forEach(element => {
		batchDeleteIds.value.push(element.teacherId);
	});
	deleteButtonAble.value = val.length === 0;
}

const handleSearch = async () => {
	getData()
};
const handlePageChange = (val: number) => {
	query.pageIndex = val;
	getData();
};
const handleSizeChange = (val: number) => {
	query.pageSize = val;
	getData();
};

const handleBatchDelete = () => {
	ElMessageBox.confirm(`确定要删除这${batchDeleteIds.value.length}条数据吗？`, '提示', {
		type: 'warning'
	})
	.then(async () => {
		await request.post('http://localhost:8088/teacher/deleteteachers',
			batchDeleteIds.value,
			{ headers: { "Content-Type": "application/json" } }
		).then(res => {
			if (res.data.success == true) {
				ElMessage.success('删除成功');
				tableData.value = tableData.value.filter(item => !batchDeleteIds.value.includes(item.teacherId));
				batchDeleteIds.value = []
				
			} else {
				ElMessage.error('删除失败! '+res.data.message);
			}
		})
		await getData();
	})
	.catch(() => {  });
	
}
const handleDelete = (index: number) => {
	const deleteTeacher = tableData.value[index];
	ElMessageBox.confirm(`确定要删除${deleteTeacher.name}吗？`, '提示', {
		type: 'warning'
	})
	.then(async () => {
		
		await request({
			url: 'http://localhost:8088/teacher/deleteteacher',
			method: 'post',
			params: {
				teacherId: deleteTeacher.teacherId
			}
		}).then(res => {
			if (res.data.success == true) {
				ElMessage.success('删除成功');
				tableData.value.splice(index, 1);
			} else {
				ElMessage.error('删除失败! '+res.data.message);
			}
		})
		await getData();
	})
	.catch(() => {  });
	
};

const visible = ref(false);
const deleteButtonAble = ref(true);
let idx: number = -1;
const idEdit = ref(false);
const rowData = ref({});
const handleEdit = (index: number, row: TableItem) => {
	idx = index;
	rowData.value = row;
	idEdit.value = true;
	visible.value = true;
};
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
