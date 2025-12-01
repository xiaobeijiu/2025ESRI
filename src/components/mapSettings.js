// 饼图渲染器设置
const PieChartRend = {
    type: "pie-chart", // autocasts as new PieChartRenderer
    size: 15,
    attributes: [
        {
            color: "#FF5733", // 鲜明的橙红色
            label: "购物",
            field: "购物个"
        },
        {
            field: "教育培",
            color: "#33A8FF", // 亮蓝色
            label: "教育培训"
        },
        {
            field: "生活服",
            color: "#4CAF50", // 绿色
            label: "生活服务"
        },
        {
            field: "医疗个",
            color: "#E91E63", // 粉红色
            label: "医疗设施"
        },
        {
            field: "政府机",
            color: "#9C27B0", // 紫色
            label: "政府机构"
        }
    ],
    backgroundFillSymbol: { // polygon fill behind pie chart
        color: [127, 127, 127, 0.2],
        outline: {
            width: 1,
            color: [255, 255, 255, 0.3]
        }
    },
    outline: {
        width: 1.5,
        color: "grey"
    },
    visualVariables: [
        {
            type: "size",
            valueExpression:
                "($feature.购物个 + $feature.教育培 + $feature.生活服 + $feature.医疗个 + $feature.政府机) / 5",
            minDataValue: 20,
            maxDataValue: 100,
            minSize: 12,
            maxSize: 48
        }
    ],
};

// 饼图弹出窗口设置
const PieChartPopup = {
    title: "{name}",
    content: [{
        type: "text",
        text: "<b>{name}</b>区域设施点分布情况"
    },
    {
        // 使用mediaInfo添加饼图
        type: "media",
        mediaInfos: [{
            title: "设施点类型占比",
            type: "pie-chart",
            caption: "各类设施点数量占比",
            value: {
                fields: ["购物个", "教育培", "生活服", "医疗个", "政府机"],
                normalizeField: null,
                tooltipField: "设施类型"
            }
        }]
    },
    {
        type: "fields",
        fieldInfos: [
            { fieldName: "购物个", label: "购物设施数量" },
            { fieldName: "教育培", label: "教育培训设施数量" },
            { fieldName: "生活服", label: "生活服务设施数量" },
            { fieldName: "医疗个", label: "医疗设施数量" },
            { fieldName: "政府机", label: "政府机构数量" },
            { fieldName: "name", label: "区域名称" }
        ]
    }]
};

// 聚类配置
const clusterConfig = {
    type: "cluster",
    clusterRadius: "100px",
    cluserMaxSize: "60px",
    clusterMinSize: "25px",
    // 添加缩放范围设置
    maxScale: 10000,  // 当地图比例尺小于此值时不再聚类
    minScale: 0,      // 当地图比例
    labelingInfo: [{
        labelPlacement: "center-center",
        labelExpressionInfo: {
            expression: "$feature.cluster_count"
        },
        symbol: {
            type: "text",
            color: "white",
            haloColor: "black",
            haloSize: "1px",
            font: {
                size: "12px",
                family: "Noto Sans",
                weight: "bold"
            }
        }
    }],
    // 添加聚类的弹出窗口模板
    popupTemplate: {
        title: "聚类点信息",
        content: [
            {
                type: "text",
                text: "此聚类包含 {cluster_count} 个点位"
            },
            {
                type: "text",
                text: "点击聚类可以查看更多详细信息"
            }
        ]
    }
};

// 唯一值渲染器
const UniqueValueRenderer = {
    type: "unique-value",
    field: "class",
    defaultSymbol: {
        type: "simple-marker",
        color: [128, 128, 128, 0.5],
        outline: {
            color: [128, 128, 128, 0.75],
            width: 1
        }
    },
    uniqueValueInfos: [
        {
            value: "教育培训",
            symbol: {
                type: "simple-marker",
                color: [233, 32, 26, 1],
                outline: {
                    color: [255, 255, 255, 0],
                    width: 0
                }
            }
        },
        {
            value: "政府机构",
            symbol: {
                type: "simple-marker",
                color: [176, 222, 140, 1],
                outline: {
                    color: [255, 255, 255, 0],
                    width: 0
                }

            }
        },
        {
            value: "购物",
            symbol: {
                type: "simple-marker",
                color: [163, 206, 227, 1],
                outline: {
                    color: [255, 255, 255, 0],
                    width: 0
                }

            }
        },
        {
            value: "医疗",
            symbol: {
                type: "simple-marker",
                color: [255, 155, 153, 1],
                outline: {
                    color: [255, 255, 255, 0],
                    width: 0
                }

            }
        },
        {
            value: "生活服务",
            symbol: {
                type: "simple-marker",
                color: [43, 138, 50, 1],
                outline: {
                    color: [255, 255, 255, 0],
                    width: 0
                }
            }
        },
    ]
};

// 弹出窗口模板
const popupTemplate = {
    title: "{name}",
    content: [
        {
            type: "fields",
            fieldInfos: [
                { fieldName: "FID", label: "FID" },
                { fieldName: "uid", label: "UID" },
                { fieldName: "addr", label: "地址" },
                { fieldName: "showtag", label: "显示标签" },
                { fieldName: "srcname", label: "来源名称" },
                { fieldName: "stdtag", label: "标准标签" },
                { fieldName: "phone", label: "电话" },
                { fieldName: "x", label: "X坐标" },
                { fieldName: "y", label: "Y坐标" },
                { fieldName: "area", label: "区域" },
                { fieldName: "tag", label: "标签" },
                { fieldName: "class", label: "类别" }
            ]
        }
    ]
};

const fieldSetting = [
    {
        name: "FID",
        label: "FID",
        direction: "asc"
    },
    {
        name: "name",
        label: "名称"
    },
    {
        name: "addr",
        label: "地址"
    },
    {
        name: "class",
        label: "类别"
    },
    {
        name: "phone",
        label: "电话"
    },
    {
        name: "area",
        label: "区域"
    }
]

// 导出这些设置，使它们可以在其他文件中使用
export { PieChartRend, PieChartPopup, clusterConfig, UniqueValueRenderer, popupTemplate, fieldSetting };