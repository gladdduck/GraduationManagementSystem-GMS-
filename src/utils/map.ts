const categoryMap = {
	"experimental": "实验型",
	"theoretical": "理论型",
	"design": "设计型",
	"descriptive": "描述型",
	"synthesis": "综合型"
};
const stateMap = {
    "submitted": "已提交",
    "completed": "已完成",
    "inprogress": "进行中",
    "unselected": "未选择"
};
const categoryMapReversed = {
	"实验型":"experimental",
    "理论型": "theoretical",
	"设计型": "design",
	"描述型": "descriptive",
	"综合型": "synthesis"
};
const stateMapReversed = {
    "已提交": "submitted",
    "已完成": "completed",
    "进行中": "inprogress",
    "未选择": "unselected"
};

const genderMap = {
    'male': '男',
    'female': '女'
}


export  {categoryMap, stateMap, categoryMapReversed, stateMapReversed, genderMap};