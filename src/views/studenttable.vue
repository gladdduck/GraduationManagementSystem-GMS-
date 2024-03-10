<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<el-upload action="#" :limit="1" accept=".xlsx, .xls" :show-file-list="false"
					:before-upload="beforeUpload" :http-request="handleMany">
					<el-button class="mr20" type="success">批量导入</el-button>
				</el-upload>
				<el-link href="/template.xlsx" target="_blank" class="mr20">下载模板</el-link>
				<el-button type="primary" @click="exportXlsx" class="mr10">导出Excel</el-button>
			</div>
			<div class="search-box">
				<el-input v-model="query.name" placeholder="姓名" class="search-input mr10" clearable @keyup.enter="handleSearch"></el-input>
				<el-button type="primary" :icon="Search" @click="handleSearch" >搜索</el-button>
				<el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
				<el-button type="danger" :icon="Delete" :disabled="deleteButtonAble"
					@click="handleBatchDelete">删除</el-button>
			</div>
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
				sele @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55">
				</el-table-column>
				<el-table-column prop="studentId" label="学号" align="center" sortable></el-table-column>
				<el-table-column prop="name" label="姓名" align="center" sortable></el-table-column>
				<el-table-column label="性别" align="center">
					<template #default="scope">{{ scope.row.gender }}</template>
				</el-table-column>
				<el-table-column prop="telephones" label="电话" align="center"></el-table-column>
				<el-table-column prop="classes" label="班级" align="center" sortable></el-table-column>
				<el-table-column prop="email" label="邮箱" align="center"></el-table-column>
				<el-table-column prop="designTitle" label="毕设题目" align="center"></el-table-column>
				<el-table-column label="选题状态" align="center">
					<template #default="scope">
						<el-tag :type="scope.row.designTitle ? 'success' : 'danger'">
							{{ scope.row.designTitle ? '已选' : '未选' }}
						</el-tag>
					</template>
				</el-table-column>

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
import TableEdit from '../components/student-table-edit.vue';
import TableDetail from '../components/student-table-detail.vue';
import * as XLSX from 'xlsx';
import { UploadProps } from 'element-plus';
import request from '../utils/request';


interface TableItem {
	studentId: number;
	name: string;
	gender: string;
	telephones: string;
	birthday: string;
	classes: string;
	address: string;
	email: string;
	designId: string;
	designTitle: string;
	thumb: string;

}

const query = reactive({
	address: '',
	name: '',
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
		url: 'http://localhost:8088/student/getstudentsbyename',
		method: 'post',
		params: {
			pageIndex: query.pageIndex,
			pageSize: query.pageSize,
			studentName: query.name
		}
	});
};

const formatBirthday = (birthday) => {
  const date = new Date(birthday);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要+1
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


const getData = async () => {
	const res = await fetchTableData();
	tableData.value = res.data.data;
	pageTotal.value = res.data.total || 50;
};
getData();

const importList = ref<any>([]);
const beforeUpload: UploadProps['beforeUpload'] = async (rawFile) => {
	importList.value = await analysisExcel(rawFile);
	return true;
};
const analysisExcel = (file: any) => {
	return new Promise(function (resolve, reject) {
		const reader = new FileReader();
		reader.onload = function (e: any) {
			const data = e.target.result;
			let datajson = XLSX.read(data, {
				type: 'binary',
			});
			const sheetName = datajson.SheetNames[0];
			const result = XLSX.utils.sheet_to_json(datajson.Sheets[sheetName]);
			resolve(result);
		};
		reader.readAsBinaryString(file);
	});
};

const handleMany = async () => {
	// 把数据传给服务器后获取最新列表，这里只是示例，不做请求
	const list = importList.value.map((item: any, index: number) => {
		return {
			studentId: item['学号'],
			name: item['姓名'],
			gender: item['性别'],
			telephones: item['电话'],
			classes: item['班级'],
			email: item['邮箱'],
			designTitle: item['毕设题目'],
			birthday: item['生日'],
			address: item['地址'],
			state: item['选题状态'],
		};
	});
	tableData.value.push(...list);
	await request.post('http://localhost:8088/student/addstudents',
		list,
		{ headers: { "Content-Type": "application/json" } }
	).then(res => {
		if (res.data.success == true) {
			ElMessage.success('导入成功');
		} else {
			ElMessage.error('导入失败! '+res.data.message);
		}
	})
	
};

const handleSelectionChange = (val) => {
	batchDeleteIds.value = []
	val.forEach(element => {
		batchDeleteIds.value.push(element.studentId);
	});
	deleteButtonAble.value = val.length === 0;
}

const exportExcel = () => {
	tableData.value.map((item: any, i: number) => {
		const arr: any[] = [i + 1];
		arr.push(...[item.studentId,item.name,item.gender,item.telephones,item.classes,item.email,item.designTitle,item.designTitle?'已选':'未选',formatBirthday(item.birthday),item.address   ]);
		list.push(arr);
	});
	let WorkSheet = XLSX.utils.aoa_to_sheet(list);
	let new_workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(new_workbook, WorkSheet, '第一页');
	XLSX.writeFile(new_workbook, `学生信息表格.xlsx`);
}
const list = [['', '学号', '姓名', '性别', '电话', '班级', '邮箱', '毕设题目', '选题状态', '生日', '地址']];
const exportXlsx = () => {
	if(tableData.value.length === 0){
		ElMessage.error('暂无数据');
		return;
	}
	ElMessageBox.confirm('确定要导出学生数据吗？', '提示', {
		type: 'warning'
	}).then(() => {
		exportExcel();
	});
	
};
// 查询操作
const handleSearch = async () => {
	getData()
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
	ElMessageBox.confirm(`确定要删除这${batchDeleteIds.value.length}条数据吗？`,'提示', {
		type: 'warning'
	})
	.then(async () => {
		await request.post('http://localhost:8088/student/deletestudents',
			batchDeleteIds.value,
			{ headers: { "Content-Type": "application/json" } }
		).then(res => {
			if (res.data.success == true) {
				ElMessage.success('删除成功');
				tableData.value = tableData.value.filter(item => !batchDeleteIds.value.includes(item.studentId));
				batchDeleteIds.value = []
			} else {
				ElMessage.error('删除失败! '+res.data.message);
			}
		})
		await getData();
	})
	.catch(() => {  });
}
// 删除操作
const handleDelete = (index: number) => {
	const deleteStudent = tableData.value[index];
	ElMessageBox.confirm(`确定要删除${deleteStudent.name}吗？`, '提示', {
		type: 'warning'
	})
	.then(async () => {
		
		await request({
			url: 'http://localhost:8088/student/deletestudent',
			method: 'post',
			params: {
				studentId: deleteStudent.studentId
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
