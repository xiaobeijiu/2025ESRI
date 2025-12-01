<template>
<div class="background">
  <div class="side-div top-left">
    <div id="age" class="chart-container"></div>
  </div>
  <div class="side-div bottom-left">
    <div id="edu" class="chart-container"></div>
  </div>

  <div id="container">
    <div class="head-bar">
      <div class="home-icon">
        <RouterLink to="/main" style="text-decoration: none; color: inherit;">
          <img src="../../asset/icon/home.svg" alt="" style="width: 18px" />
        </RouterLink>
      </div>
      <div class="title">郑州市基础设施系统🏗️</div>
      <i class="layui-icon layui-icon-spread-left"></i>
    </div>
   <transferPage />
    <div id="tableDiv"></div>
  </div>

  <div class="side-div top-right">
    <div id="QueryPanelBorder">
      <div id="QueryPanel">
        <div id="attributeQuery">
          <h3>属性/空间查询</h3>
          <div>
            <label for="fieldSelect">选择字段：</label>
            <select id="fieldSelect">
              <option value="">请先选择字段</option>
              <option value="class">类别</option>
              <option value="stdtag">详细类别</option>
              <option value="showtag">显示类别</option>
              <option value="tag">要素标签</option>
            </select>
          </div>
          <div>
            <label for="valueSelect">选择值：</label>
            <select id="valueSelect">
              <option value="">-- 请先选择字段 --</option>
            </select>
          </div>
          <div id="BtnContainer">
            <button id="queryBtn">执行查询</button>
            <button id="queryBtnClear">清除查询</button>
            <button id="toggleTableBtn">显示属性表</button>
            <button id="toggleClusterBtn">聚类切换</button>
          </div>
        </div>

      </div>
    </div>
  </div>
  <div class="side-div bottom-right">
    <div id="ClusterPanel">
      <div id="LegendPanel">
        <h3 style="margin: 0 0 10px 0; color: #0079c1; font-size: 16px; border-bottom: 1px solid #ccc; padding: 8px;">
          图例</h3>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="js">
  import transferPage from './跳转-过渡.vue'
  import * as echarts from 'echarts';
  import { onMounted, onUnmounted } from 'vue';
  import { RouterLink } from 'vue-router';
  import { PieChartRend, PieChartPopup, clusterConfig, UniqueValueRenderer, popupTemplate, fieldSetting } from "./mapSettings"

  let view;
  let map;


// 初始化地图
  const initMap = () => {
  // 使用ArcGIS的require加载必要模块
    window.require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/layers/WebTileLayer",
      "esri/Basemap",
      "esri/widgets/FeatureTable",
      "esri/renderers/PieChartRenderer",
      "esri/widgets/LayerList",
      "esri/Graphic",
      "esri/widgets/Sketch",
      "esri/widgets/Expand",
      "esri/layers/GraphicsLayer",
      "esri/widgets/Legend",
      "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"
    ],
      (Map, MapView, FeatureLayer, WebTileLayer, Basemap, FeatureTable, PieChartRenderer, LayerList, Graphic, Sketch, Expand, GraphicsLayer, Legend,) => {

      // 天地图token
      const tiandituToken = "7d688e8a2217c9202786f4b224becbfd";

      // 创建天地图矢量底图
      const tiandituVectorLayer = new WebTileLayer({
        urlTemplate: `https://t{subDomain}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituToken}`,
        subDomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
        copyright: "天地图"
      });

      // 创建天地图矢量注记层
      const tiandituVectorLabelLayer = new WebTileLayer({
        urlTemplate: `https://t{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituToken}`,
        subDomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
        copyright: "天地图"
      });

      // 创建天地图底图
      const tiandituBasemap = new Basemap({
        baseLayers: [tiandituVectorLayer, tiandituVectorLabelLayer],
        title: "天地图矢量",
        id: "tianditu-vector"
      });

      map = new Map({
          basemap: tiandituBasemap,
        });

      view = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 12,
          center: [113.68789834663198, 34.770249629125615],
        });

        const graphicsLayer = new GraphicsLayer({
          title: "空间查询图形",
        });
        map.add(graphicsLayer);

        const featureLayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E4%B8%BB%E5%9F%8E%E5%8C%BA%E8%AE%BE%E6%96%BD%E7%82%B9_%E5%90%88%E5%B9%B6/FeatureServer",
          renderer: UniqueValueRenderer,
          featureReduction: clusterConfig,
          popupTemplate: popupTemplate,
          title: "设施点",
          outFields: ["class", "stdtag", "showtag", "tag"]
        });

        map.add(featureLayer);

        const PieLayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%AE%BE%E6%96%BD%E5%8D%A0%E6%AF%94/FeatureServer",
          title: "设施占比",
          visible: false,
          renderer: PieChartRend,
          popupTemplate: PieChartPopup,
        })
        map.add(PieLayer)

        const featureTable = new FeatureTable({
          view: view,  // 关联地图视图
          layer: featureLayer,  // 使用相同的图层
          container: "tableDiv",  // 表格容器
          // 配置要显示的字段
          fieldConfigs: fieldSetting,
          // 启用选择功能
          highlightEnabled: true,
          // 启用表格与地图的交互
          attachmentsEnabled: true
        });

        view.on("click", function (event) {
          view.hitTest(event).then(function (response) {
            if (response.results.length > 0) {
              const graphic = response.results[0].graphic;
              if (graphic && graphic.layer === featureLayer) {
                // 高亮显示表格中对应的行
                featureTable.highlightIds.add(graphic.attributes.FID);
              }
            }
          });
        });

        const layerList = new LayerList({
          view: view,
        });

        const LayerListExpand = new Expand({
          view: view,
          content: layerList
        })

        view.ui.add(LayerListExpand, "top-right");

        const legend = new Legend({
          view: view,
          container: "LegendPanel" // 直接指定容器ID
        });

        // 添加按钮控制表格显示/隐藏
        const toggleTableBtn = document.getElementById("toggleTableBtn");
        const tableDiv = document.getElementById("tableDiv");
        const viewDiv = document.getElementById("viewDiv");
        let isTableVisible = true;

        toggleTableBtn.addEventListener("click", function () {
          if (isTableVisible) {
            // 隐藏表格
            tableDiv.classList.add("hidden");
            // 延迟设置视图高度，等待表格过渡效果完成
            setTimeout(() => {
              viewDiv.style.height = "100%";
            }, 250);
            toggleTableBtn.textContent = "显示属性表";
          } else {
            // 显示表格
            viewDiv.style.height = "60%";
            // 延迟显示表格，等待视图高度过渡效果
            setTimeout(() => {
              tableDiv.classList.remove("hidden");
            }, 250);
            toggleTableBtn.textContent = "隐藏属性表";
          }
          isTableVisible = !isTableVisible;
        });

        // 属性查询功能实现
        const fieldSelect = document.getElementById("fieldSelect");
        const valueSelect = document.getElementById("valueSelect");
        const queryBtn = document.getElementById("queryBtn");
        const queryBtnClear = document.getElementById("queryBtnClear");

        // 当字段选择变化时，获取该字段的唯一值
        fieldSelect.addEventListener("change", getUniqueValues);

        function getUniqueValues() {
          const selectedField = fieldSelect.value;
          // 清空并禁用值选择框
          valueSelect.innerHTML = '<option value="">加载中...</option>';
          valueSelect.disabled = true;

          // 创建查询获取唯一值
          const query = featureLayer.createQuery();
          query.outFields = [selectedField];
          query.returnDistinctValues = true;
          query.where = "1=1";

          featureLayer.queryFeatures(query).then(function (response) {
            // 清空选择框
            valueSelect.innerHTML = '';
            // 添加默认选项
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.text = "-- 请选择值 --";
            valueSelect.appendChild(defaultOption);

            // 获取唯一值并排序
            const uniqueValues = response.features
              .map(feature => feature.attributes[selectedField])
              .filter(value => value !== null && value !== undefined && value !== "")
              .filter((value, index, self) => self.indexOf(value) === index)
              .sort();

            // 添加选项
            uniqueValues.forEach(value => {
              const option = document.createElement("option");
              option.value = value;
              option.text = value;
              valueSelect.appendChild(option);
            });

            // 启用选择框
            valueSelect.disabled = false;
          }).catch(function (error) {
            console.error("获取唯一值失败:", error);
            valueSelect.innerHTML = '<option value="">加载失败</option>';
          });
        }

        // 执行查询
        queryBtn.addEventListener("click", executeQuery);
        queryBtnClear.addEventListener("click", executeQueryClear);

        // 按回车键也可以执行查询
        valueSelect.addEventListener("keyup", function (event) {
          if (event.key === "Enter") {
            executeQuery();
          }
        });

        // 查询函数
        function executeQuery() {
          const selectedField = fieldSelect.value;
          const selectedValue = valueSelect.value;

          featureLayer.featureReduction = null

          // 创建查询
          const query = featureLayer.createQuery();
          query.outFields = ["*"];
          query.where = selectedField + " = '" + selectedValue + "'";
          query.returnGeometry = true;
          featureLayer.definitionExpression = selectedField + " = '" + selectedValue + "'";

          featureLayer.queryExtent(query).then(extentResult => {
            if (extentResult.extent) {
              view.goTo(extentResult.extent.expand(1.2));
            }
          });
          // 执行查询
          featureLayer.queryFeatures(query).then(() => {
            legend.refresh();
          });
        }
        function executeQueryClear() {
          featureLayer.definitionExpression = null;

          featureTable.filterGeometry = null;
          view.graphics.removeAll();
          featureLayer.featureReduction = clusterConfig
        }

        // 创建Sketch组件
        const sketch = new Sketch({
          view: view,
          layer: graphicsLayer,
          creationMode: "update",
          availableCreateTools: ["point", "polyline", "polygon", "rectangle", "circle"],
          visibleElements: {
            createTools: {
              point: true,
              polyline: true,
              polygon: true,
              rectangle: true,
              circle: true
            },
            selectionTools: {
              "lasso-selection": true,
              "rectangle-selection": true
            },
            undoRedoMenu: true,
            settingsMenu: true
          }
        });

        // 创建Expand组件，包含Sketch组件，默认不展开
        const sketchExpand = new Expand({
          view: view,
          content: sketch,
          expanded: false,
          expandIconClass: "esri-icon-edit",
          expandTooltip: "打开绘图工具",
          collapseTooltip: "关闭绘图工具",
          group: "top-left"
        });
        // 将Expand组件添加到视图的UI中
        view.ui.add(sketchExpand, "top-left");

        sketch.on("create", (event) => {
          console.log(event.graphic);
          if (event.state === "complete") {
            performSpatialQuery(event.graphic.geometry);
          }
        });

        function performSpatialQuery(geometry) {
          // 创建空间查询参数
          const query = featureLayer.createQuery();
          query.geometry = geometry;
          query.spatialRelationship = "intersects";
          query.outFields = ["*"];
          query.returnGeometry = true;
          // 执行空间查询
          featureLayer.queryFeatures(query).then(function (response) {
            // 清除之前的高亮显示
            response.features.forEach(function (feature) {
              // 高亮显示该要素
              const highlightGraphic = new Graphic({
                geometry: feature.geometry,
                symbol: {
                  type: "simple-marker",
                  color: [255, 255, 0, 0.5],
                  size: "16px",
                  outline: {
                    color: [255, 255, 0, 1],
                    width: "2px"
                  }
                }
              });
              view.graphics.add(highlightGraphic);
            })
          });
          featureTable.filterGeometry = geometry;
          featureLayer.featureReduction = null
        }

        // 添加聚类切换按钮的事件处理
        const toggleClusterBtn = document.getElementById("toggleClusterBtn");
        let isFeatureLayerVisible = true;

        toggleClusterBtn.addEventListener("click", function () {
          if (isFeatureLayerVisible) {
            // 切换到PieLayer
            featureLayer.visible = false;
            PieLayer.visible = true;
            toggleClusterBtn.textContent = "切换到设施点";
          } else {
            // 切换到featureLayer
            featureLayer.visible = true;
            PieLayer.visible = false;
            toggleClusterBtn.textContent = "切换到饼图";
          }
          isFeatureLayerVisible = !isFeatureLayerVisible;
        });



        //let PoiWhere = ["class='教育培训'", "class='生活服务'", "class='购物'", "class='医疗'", "class='政府机构'"]
        // "class='教育培训'"
        // "class='生活服务'"
        // "class='购物'"
        // "class='医疗'"
        // "class='政府机构'"


        const poi1Query = featureLayer.createQuery()
        poi1Query.outFields = ["*"];
        poi1Query.where = "class='教育培训'";

        const poi2Query = featureLayer.createQuery()
        poi2Query.outFields = ["*"];
        poi2Query.where = "class='生活服务'";

        const poi3Query = featureLayer.createQuery()
        poi3Query.outFields = ["*"];
        poi3Query.where = "class='购物'";

        const poi4Query = featureLayer.createQuery()
        poi4Query.outFields = ["*"];
        poi4Query.where = "class='医疗'";

        const poi5Query = featureLayer.createQuery()
        poi5Query.outFields = ["*"];
        poi5Query.where = "class='政府机构'";

        // poiQuery.outSpatialReference = view.spatialReference;
        featureLayer.queryFeatureCount(poi1Query).then(function (response) {
          console.log(response);
        })
        featureLayer.queryFeatureCount(poi2Query).then(function (response) {
          console.log(response);
        })
        featureLayer.queryFeatureCount(poi3Query).then(function (response) {
          console.log(response);
        })
        featureLayer.queryFeatureCount(poi4Query).then(function (response) {
          console.log(response);
        })
        featureLayer.queryFeatureCount(poi5Query).then(function (response) {
          console.log(response);
        })

        // function queryFeaturesByWhereClause() {
        //     // 存储每个类别的计数结果
        //     const countResults = {};

        //     // 使用Promise.all来并行处理所有查询
        //     const queryPromises = PoiWhere.map(whereClause => {
        //         const poiQuery = featureLayer.createQuery();
        //         poiQuery.where = whereClause;
        //         poiQuery.outFields = ["*"];

        //         // 返回查询Promise
        //         return featureLayer.queryFeatureCount(poiQuery).then(count => {
        //             // 提取类别名称（去掉class='和'部分）
        //             const categoryName = whereClause.replace("class='", "").replace("'", "");
        //             countResults[categoryName] = count;
        //             console.log(`${categoryName}: ${count}个设施点`);
        //             return { category: categoryName, count: count };
        //         });
        //     });

        //     // 等待所有查询完成
        //     Promise.all(queryPromises).then(results => {
        //         console.log("所有类别查询完成:", countResults);
        //         // 这里可以添加代码来显示或处理结果
        //         // 例如更新图表或显示在页面上
        //     }).catch(error => {
        //         console.error("查询过程中出错:", error);
        //     });
        // }

        // view.when(
        //     () => {
        //         queryFeaturesByWhereClause();
        //     }
        // )
        // poiQuery.groupByFieldsForStatistics = ["TYPE"];
        // poiQuery.outStatistics = [{
        //     statisticType: "count",
        //     onStatisticField: "TYPE",
        //     outStatisticFieldName: "count"
        // }];
      });

  // 将事件监听器的设置移到onMounted钩子中
}


function initfacilityChart() {
        const POIchartDom = document.getElementById('age');
        const myPOIChart = echarts.init(POIchartDom);

        // 多个区的数据
        const districtData = {
            '中原区': [25, 20, 18, 22, 30, 15],
            '二七区': [20, 22, 15, 30, 16, 12],
            '管城回族区': [18, 10, 20, 18, 22, 13],
            '金水区': [25, 18, 19, 23, 14, 14],
            '惠济区': [16, 15, 30, 14, 20, 10]
        };
        const categories = ['教育培训', '医疗', '购物', '生活服务', '政府机构', '其他'];

        // 指标设置
        const indicator = categories.map(name => ({
            name: name,
            max: 30
        }));

        const colorPalette = ['#5886A5', '#FFD166', '#73C476', '#FF6F59', '#8FB339'];

        // 生成series.data
        const dataArr = Object.entries(districtData).map(([name, value]) => ({
            value: value,
            name: name
        }));

        const staticPOIRadarOption = {
            color: colorPalette,
            title: {
                text: '郑州各城区设施占比雷达图',
                left: 'center',
                top: 10   // 原来是'2%'，这里用像素（如40），整体标题下移
            },
            tooltip: {},
            legend: {
                data: Object.keys(districtData),
                top: 35   // 适当下移，例如原本'10%'，可以写为70或80（单位像素）
            },
            radar: {
                indicator: indicator,
                radius: '62%',         // 控制雷达本体大小
                center: ['50%', '60%'] // 第二个参数'60%'就是让雷达图中心下移
            },
            series: [{
                name: '设施占比',
                type: 'radar',
                areaStyle: { opacity: 0.13 },
                lineStyle: { width: 2 },
                data: dataArr

            }]
        };

        myPOIChart.setOption(staticPOIRadarOption);

        // 响应式
        window.addEventListener('resize', function () {
            myPOIChart.resize();
        });
}


// 郑州市设施可达性 图表
function initfacilityStyleChart() {
      // 郑州市区1km区域对各种基础设施的可达性比例
      const chartDom = document.getElementById('edu');
      const myChart = echarts.init(chartDom);

      // 城区饼图数据（环形图形式）
      const pieSeries = [
          {
              name: '中原区',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '60%'],
              itemStyle: { borderRadius: 10 },
              label: { formatter: '{b}\n{d}%' },
              data: [
                  { value: 30, name: '小于5分钟' },
                  { value: 20, name: '5-10分钟' },
                  { value: 18, name: '10-15分钟' },
                  { value: 22, name: '大于15分钟' },
              ]
          },
          {
              name: '金水区',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '60%'],
              itemStyle: { borderRadius: 10 },
              label: { formatter: '{b}\n{d}%' },
              data: [
                  { value: 25, name: '小于5分钟' },
                  { value: 25, name: '5-10分钟' },
                  { value: 15, name: '10-15分钟' },
                  { value: 20, name: '大于15分钟' },
              ]
          },
          {
              name: '管城回族区',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '60%'],
              itemStyle: { borderRadius: 10 },
              label: { formatter: '{b}\n{d}%' },
              data: [
                  { value: 20, name: '小于5分钟' },
                  { value: 15, name: '5-10分钟' },
                  { value: 25, name: '10-15分钟' },
                  { value: 25, name: '大于15分钟' },
              ]
          },
          {
              name: '惠济区',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '60%'],
              itemStyle: { borderRadius: 10 },
              label: { formatter: '{b}\n{d}%' },
              data: [
                  { value: 22, name: '小于5分钟' },
                  { value: 20, name: '5-10分钟' },
                  { value: 20, name: '10-15分钟' },
                  { value: 28, name: '大于15分钟' },
              ]
          },
          {
              name: '二七区',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '60%'],
              itemStyle: { borderRadius: 10 },
              label: { formatter: '{b}\n{d}%' },
              data: [
                  { value: 28, name: '小于5分钟' },
                  { value: 22, name: '5-10分钟' },
                  { value: 18, name: '10-15分钟' },
                  { value: 22, name: '大于15分钟' },
              ]
          }
      ];

      // 初始化图表选项
      let currentArea = pieSeries[0].name; // 初始显示的城区

      const option = {
          color: ['#5886A5', '#FFD166', '#73C476', '#FF6F59', '#8FB339'],
          title: [{
                  id: 'mainTitle',
                  text: '郑州各城区对基础设施的可达性比例',
                  left: 'center',
                  top: '2%',
                  textStyle: { fontSize: 18, fontWeight: 'bold', color: '#333' }
                },
                {
                  id: 'areaTitle',                    // ← 关键：给副标题一个固定 id
                  text: currentArea,
                  left: 'center',
                  top: '55%',
                  textStyle: { fontSize: 20, fontWeight: 'bold', color: '#333' }
                }],
          tooltip: {
              trigger: 'item'
          },
          legend: {
              top: '10%',
              left: 'center',
              selectedMode: 'single',
              data: pieSeries.map(s => s.name)
          },
          series: pieSeries.map((s, i) => ({
              ...s,
              label: {
                  show: i === 0,
                  formatter: '{b}\n{d}%'
              },
              emphasis: {
                  label: {
                      show: i === 0,
                      fontSize: 18,
                      fontWeight: 'bold'
                  }
              }
          }))
      };

      // 设置图表
      myChart.setOption(option);

      // 图例点击切换系列与标题
      myChart.on('legendselectchanged', function (params) {
          // 图例名称
          const selectedName = params.name;
          currentArea = selectedName;

          //
          const updatedSeries = pieSeries.map(s => {
              return {
                  ...s,
                  label: {
                    show: s.name === selectedName,   // 改动
                    formatter: '{b}\n{d}%'
                  },
                  emphasis: {
                      label: {
                          show: s.name === selectedName,
                          fontSize: 18,
                          fontWeight: 'bold'
                      }
                  }
              };
          });
          myChart.setOption({
            title: { text: currentArea },
            series: updatedSeries
          });
      });

      // 自适应窗口
      window.addEventListener('resize', () => {
          myChart.resize();
      });
      onUnmounted(() => {
          myChart.dispose();
      });
}
  // 声明变量存储表格显示状态
  let isTableVisible = true;
  let toggleIconClickHandler = null;


  // 组件挂载时初始化地图
  onMounted(() => {
    // 确保ArcGIS API已加载
    if (window.require) {
      initMap();
    } else {
      console.error("ArcGIS API未加载，请检查引入");
    }

    initfacilityChart();
    initfacilityStyleChart();


    // 设置表格显示/隐藏功能
    const toggleIcon = document.querySelector(".head-bar i.layui-icon");
    if (toggleIcon) {
      // 监听导航图标点击事件，用于控制表格显示/隐藏
      toggleIcon.addEventListener("click", function() {
        const tableDiv = document.getElementById("tableDiv");
        const viewDiv = document.getElementById("viewDiv");

        if (isTableVisible) {
          // 隐藏表格
          tableDiv.classList.add("hidden");
          // 延迟设置视图高度，等待表格过渡效果完成
          setTimeout(() => {
            viewDiv.style.height = "100%";
          }, 250);
        } else {
          // 显示表格
          viewDiv.style.height = "60%";
          // 延迟显示表格，等待视图高度过渡效果
          setTimeout(() => {
            tableDiv.classList.remove("hidden");
          }, 250);
        }
        isTableVisible = !isTableVisible;
      });
    }
  });

  // 组件卸载时清理
  onUnmounted(() => {
    // 销毁地图视图释放资源
    if (view) {
      view.destroy();
    }

    // 移除事件监听器
    const toggleIcon = document.querySelector(".head-bar i.layui-icon");
    if (toggleIcon && toggleIconClickHandler) {
      toggleIcon.removeEventListener("click", toggleIconClickHandler);
    }
  });

</script>

<style>
  @import '../CSS/基础设施.css';

</style>
