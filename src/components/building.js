window.require([
    "esri/layers/FeatureLayer", // 要素图层模块
    "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js",
], (FeatureLayer, echarts) => {
    // 封装图表初始化和调整大小函数
    const initChart = (id, option) => {
        const chart = echarts.init(document.getElementById(id));
        chart.setOption(option);
        return chart;
    };

    const handleResize = (chart) => {
        window.addEventListener("resize", () => chart.resize());
    };

    // 容积率柱状图（使用死数据）
    const prChart = initChart("pr", {
        title: {
            text: "各行政区平均容积率统计",
            left: "center",
            top: 10,
            textStyle: {
                fontWeight: "normal",
                fontSize: 16,
            },
        },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        xAxis: {
            type: "category",
            data: ["中原", "二七", "管城", "金水", "惠济"],
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "5%",
            top: "20%",
            containLabel: true,
        },
        yAxis: { type: "value", name: "容积率" },
        series: [
            {
                name: "容积率",
                type: "bar",
                data: [3.6428, 5.3946, 3.2112, 4.3058, 1.7078],
                itemStyle: {
                    color: (params) => {
                        const value = params.value;
                        if (value >= 5.0) return "#dc6560";
                        else if (value >= 4.0) return "#f0ce58";
                        else if (value >= 3.5) return "#96c775";
                        else if (value >= 3.0) return "#7abde0";
                        else return "#5a6bc4";
                    },
                },
                // 添加数值标注
                label: {
                    show: true,
                    position: "top",
                    formatter: function (params) {
                        return params.value.toFixed(2);
                    },
                    fontSize: 12,
                    color: "#666666",
                },
            },
        ],
    });
    handleResize(prChart);

    // 建筑类型雷达图（修改为雷达图）
    // 建筑类型雷达图（优化版本）
    const bcChart = initChart("bc", {
        title: {
            text: "建筑类型分布",
            left: "center",
            top: 10,
            textStyle: {
                fontWeight: "500",
                fontSize: 16,
                color: "#2c3e50",
            },
        },
        tooltip: {
            trigger: "item",
            formatter: function (params) {
                const typeNames = {
                    APT: "公寓",
                    VILLA: "别墅",
                    HIGH: "高层建筑",
                    MID: "中层建筑",
                    AFF: "经济适用房",
                };
                const indicators = ["APT", "VILLA", "HIGH", "MID", "AFF"];
                let content = `<div style="padding: 8px;">`;
                content += `<div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50;">${params.seriesName}</div>`;
                params.value.forEach((value, index) => {
                    const type = indicators[index];
                    content += `<div style="margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">`;
                    content += `<span style="color: #7f8c8d;">${typeNames[type]}(${type}):</span>`;
                    content += `<span style="font-weight: bold; color: #3498db; margin-left: 10px;">${value.toLocaleString()}</span>`;
                    content += `</div>`;
                });
                content += `</div>`;
                return content;
            },
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#3498db",
            borderWidth: 1,
            textStyle: {
                color: "#2c3e50",
            },
            extraCssText:
                "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;",
        },
        radar: {
            center: ["50%", "52%"],
            radius: "75%",
            startAngle: 90, // 从顶部开始
            indicator: [
                { name: "APT", max: 12000 },
                { name: "VILLA", max: 12000 },
                { name: "HIGH", max: 23000 },
                { name: "MID", max: 15000 },
                { name: "AFF", max: 12000 },
            ],
            axisName: {
                show: true,
                fontSize: 13,
                fontWeight: "500",
                color: "#2c3e50",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: 4,
                padding: [4, 8],
            },
            nameGap: 2,
            splitNumber: 4,
            splitLine: {
                lineStyle: {
                    color: "rgba(52, 152, 219, 0.2)",
                    width: 1,
                    type: "dashed",
                },
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: [
                        "rgba(52, 152, 219, 0.02)",
                        "rgba(52, 152, 219, 0.05)",
                        "rgba(52, 152, 219, 0.08)",
                        "rgba(52, 152, 219, 0.12)",
                    ],
                },
            },
            axisLine: {
                lineStyle: {
                    color: "rgba(52, 152, 219, 0.4)",
                    width: 2,
                },
            },
        },
        series: [
            {
                name: "建筑类型分布",
                type: "radar",
                emphasis: {
                    lineStyle: {
                        width: 4,
                    },
                    areaStyle: {
                        opacity: 0.8,
                    },
                },
                data: [
                    {
                        value: [7480, 4030, 19200, 10100, 6400],
                        name: "建筑类型分布",
                        lineStyle: {
                            color: "#3498db",
                            width: 3,
                            shadowColor: "rgba(52, 152, 219, 0.3)",
                            shadowBlur: 10,
                        },
                        areaStyle: {
                            color: {
                                type: "radial",
                                x: 0.5,
                                y: 0.5,
                                r: 0.8,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: "rgba(52, 152, 219, 0.4)",
                                    },
                                    {
                                        offset: 0.5,
                                        color: "rgba(52, 152, 219, 0.2)",
                                    },
                                    {
                                        offset: 1,
                                        color: "rgba(52, 152, 219, 0.05)",
                                    },
                                ],
                            },
                            shadowColor: "rgba(52, 152, 219, 0.2)",
                            shadowBlur: 20,
                        },
                        symbol: "circle",
                        symbolSize: 10,
                        itemStyle: {
                            color: "#3498db",
                            borderColor: "#fff",
                            borderWidth: 3,
                            shadowColor: "rgba(52, 152, 219, 0.4)",
                            shadowBlur: 8,
                        },
                        label: {
                            show: true,
                            formatter: function (params) {
                                return params.value.toLocaleString();
                            },
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#2c3e50",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderColor: "#3498db",
                            borderWidth: 1,
                            borderRadius: 4,
                            padding: [3, 6],
                            shadowColor: "rgba(0, 0, 0, 0.1)",
                            shadowBlur: 4,
                        },
                    },
                ],
                animationDuration: 2000,
                animationEasing: "cubicOut",
            },
        ],
        graphic: [
            {
                type: "group",
                left: "center",
                bottom: 20,
                children: [
                    {
                        type: "text",
                        style: {
                            text: "APT: 公寓类建筑    VILLA: 别墅类建筑    HIGH: 高层建筑",
                            fontSize: 12,
                            fill: "#666",
                            textAlign: "center",
                        },
                        top: 20,
                        left: "center",
                    },
                    {
                        type: "text",
                        style: {
                            text: "MID: 中层建筑    AFF: 经济适用房",
                            fontSize: 12,
                            fill: "#666",
                            textAlign: "center",
                        },
                        top: 38,
                        left: "center",
                    },
                ],
            },
        ],
        // 添加动画配置
        animation: true,
        animationThreshold: 2000,
        animationDuration: 1500,
        animationEasing: "cubicOut",
        animationDelay: function (idx) {
            return idx * 100;
        },
    });
    handleResize(bcChart);
});
