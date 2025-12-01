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
        <RouterLink to="/main" style="text-decoration: none; color: inherit">
          <img src="../../asset/icon/home.svg" alt="" style="width: 18px" />
        </RouterLink>
      </div>
      <div class="title">郑州市智慧治安系统👮</div>
      <i class="layui-icon layui-icon-spread-left"></i>
    </div>
    <transferPage />
  </div>

  <div class="side-div top-right">
    <div id="QueryPanelBorder">
      <div id="QueryPanel">
        <div id="attributeQuery">
          <h3>属性/空间查询</h3>
          <div class="control-items">
            <label for="fieldSelect">选择字段：</label>
            <select id="fieldSelect">
              <option value="">请先选择字段</option>
              <option value="year">案件发生时间</option>
              <option value="incident_l">案件发生地点</option>
              <option value="case_type">犯罪类型</option>
              <option value="details">案件详情</option>
              <option value="case_numbe">审判决书案号</option>
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
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="side-div bottom-right">
    <div id="ClusterPanel">
      <div id="routePanel">
        <h3>
          最快出警分配
          <span class="help-icon">
            <img src="../../asset/icon/问号.svg" alt="帮助" width="20" height="20" float="right">
            <div class="tooltip-content">
              <p>提示: 您也可以直接在地图上选择点位</p>
              <p>- 按住Ctrl键点击地图设置<span style="color: red">事件点</span></p>
            </div>
          </span>
        </h3>
        <div class="control-item">
          <label for="endLocationInput">事件点:</label>
          <div style="display: flex; gap: 10px">
            <input type="text" id="endLocationInput" placeholder="请输入事件点名称" style="flex: 1" />
            <button id="searchEndBtn" style="font-size: 13px;">查询</button>
          </div>
        </div>
        <div id="RouteBtnControl" style="display: flex; flex-direction: column">
          <button id="calculateRouteBtn" style="width: 100%; margin-bottom: 10px">计算路径</button>
          <button id="clearRouteBtn" style="background-color: #f44336; width: 100%">
            清除路径
          </button>
        </div>
        <div id="routeInfo" style="margin-top: 10px; display: none">
          <h4>路径信息</h4>
          <div id="routeDistance"></div>
          <div id="routeDuration"></div>
          <div
            id="routeSteps"
            style="margin-top: 10px; max-height: 150px; overflow-y: auto; font-size: 13px"
          ></div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="js">
  import transferPage from '../components/跳转-过渡.vue'
  import * as echarts from 'echarts';
  import { onMounted, onUnmounted } from 'vue';
  // import { RouterLink } from 'vue-router';
  // let map;
  import { clusterConfig } from "./mapSettings.js";

  let view= null;
  let toggleIconClickHandler = null;
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
        "esri/layers/support/LabelClass",
        "esri/layers/support/AggregateField",
        "esri/renderers/PieChartRenderer",
        "esri/widgets/LayerList",
        "esri/Graphic",
        "esri/widgets/Sketch",
        "esri/widgets/Expand",
        "esri/layers/GraphicsLayer",
        "esri/geometry/Polygon",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/widgets/Search",
        "esri/widgets/Locate",
        "esri/widgets/Bookmarks",
        "esri/geometry/Point",
        "esri/widgets/ScaleBar",
        "esri/widgets/BasemapToggle",
        "esri/widgets/Legend",
        "esri/rest/support/Query",
        "esri/widgets/Home",
    ],
      (Map,MapView,FeatureLayer,WebTileLayer,Basemap,FeatureTable,LabelClass,AggregateField,PieChartRenderer,
      LayerList,Graphic,Sketch,Expand,GraphicsLayer,Polygon,
      SimpleFillSymbol,SimpleMarkerSymbol,Search,Locate,Bookmarks,
      Point,ScaleBar,BasemapToggle,Legend,Query,Home,) => {

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

         // 请替换为您的Mapbox访问令牌
          const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZGF5MzI3IiwiYSI6ImNtN2FpeWhtbzA0aDcycHB5eTBpNWw2MnIifQ.A9dTX6iqdgq_r9Nh5G-Njg';

          // 色彩条
           const colors = ["#48385f", "#995375", "#db4a5b", "#fc9a59", "#fee086"];

         // 要素聚合
            const featureReduction = {
                type: "binning",
                fields: [
                    new AggregateField({
                        name: "aggregateCount",
                        statisticType: "count"
                    })
                ],
                fixedBinLevel: 6,
                popupEnabled: true,
                popupTemplate: {
                    title: "犯罪类型",
                    content: "{aggregateCount} 起案件发生在这个区域。"
                },
                renderer: {
                    type: "simple",
                    symbol: {
                        type: "simple-fill",
                        color: [0, 255, 71, 1],
                        outline: {
                            color: "rgba(153, 31, 23, 0.3)",
                            width: 0.3,
                        },
                    },
                    visualVariables: [
                        {
                            type: "color",
                            field: "aggregateCount",
                            legendOptions: {
                                title: "案件数量"
                            },
                            stops: [
                                { value: 0, color: colors[0] },
                                { value: 5, color: colors[1] },
                                { value: 10, color: colors[2] },
                                { value: 15, color: colors[3] },
                                { value: 20, color: colors[4] }
                            ]
                        }
                    ]
                }
            };

            // 犯罪图层
            const layer = new FeatureLayer({
                title: "犯罪案件",
                url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/ZZcrime_ExportFeatures/FeatureServer",
                featureReduction,
                renderer: {
                    type: "simple",
                    label: "案件数量",
                    symbol: {
                        type: "simple-marker",
                        style: "circle",
                        size: 5,
                        color: colors[3],
                        outline: {
                            style: "solid",
                            color: [15, 15, 15, 0.3],
                            width: 0.5
                        }
                    },
                },
                outFields: ["*"]
            });

            // 公安局POI要素图层
            const Publiclayer = new FeatureLayer({
                title: "公安局POI点",
                url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E9%83%91%E5%B7%9E%E8%AD%A6%E5%AF%9F_Clip/FeatureServer",
                visible: false,
                // 渲染器
                renderer: {
                    type: "simple",
                    label: "公安局位置",
                    symbol: {
                        type: "picture-marker",
                        style: "circle",
                        url: "../../asset/icon/公安.svg",
                        size: 5,
                        color: [255, 255, 255, 1], // 白色+60%不透明的整体染色
                        outline: {
                            style: "solid",
                            color: [15, 15, 15, 0.3],
                            width: 0.5
                        }
                    },
                },
                // 加载所有字段
                outFields: ["*"]
            });

            // 定义地图
            const map = new Map({
                basemap: tiandituBasemap,
                layers: [layer,Publiclayer]
            });

            // 定义视图
            const view = new MapView({
                container: "viewDiv",
                map: map,
                center: [113.66, 34.74],
                // scale: 144447,
                zoom: 10,
                constraints: {
                    snapToZoom: false
                }
            });

            // 创建图形图层，之后sketch组件用得到
            const graphicsLayer = new GraphicsLayer(
              {
                title:"绘制要素",
              }
            );
            map.add(graphicsLayer);

            //
            view.when().then(() => {
                // 降低底图标签的不透明度，使其不与分箱计数冲突
                const referenceLayer = view.map.basemap.referenceLayers.getItemAt(0);
                referenceLayer.opacity = 0.8;
            });

            // 返回主页面标签
            view.ui.add(
                new Home({
                    view: view
                }),
                "top-left"
            );

            // 图例
            const legend = new Legend({
                view: view,
            });

            // Expand 工具
            const infoDiv = document.getElementById("infoDiv");

            view.ui.add(
                new Expand({
                    view: view,
                    content: infoDiv,
                    expandIcon: "list-bullet",
                    expanded: false
                }),
                "top-left"
            );

            // 切换按钮（没弄清楚有什么用）
            const toggleButton = document.getElementById("showBins");
            if (toggleButton) {
                toggleButton.onclick = () => {
                    layer.featureReduction = layer.featureReduction ? null : featureReduction;
                }
            }

            // 在legend常量定义后添加
            const layerList = new LayerList({
                view: view,
                container: "layerListDiv" // 这将在HTML中创建一个容器
            });

            // 创建一个Expand小部件来容纳LayerList
            const layerListExpand = new Expand({
                view: view,
                content: layerList,
                expandIcon: "layers",
                expanded: false,
                group: "top-right" // 将其放在右上角
            });

            // 将LayerList添加到视图的UI中，可以切换属性
            view.ui.add(layerListExpand, "top-right");

            // 图例说明
            view.ui.add(legend, "bottom-left")

            // 属性表选项
            const featureTable = new FeatureTable({
                view: view,  // 关联地图视图
                layer: layer,  // 使用相同的图层
                container: "tableDiv",  // 表格容器
                // 配置要显示的字段（还存在部分问题）
                fieldConfigs: [
                {
                    name: "case_category",
                    label: "类别",
                },
            ],
                // 启用选择功能
                highlightEnabled: true,
                // 启用表格与地图的交互
                attachmentsEnabled: true,
            });

            // 添加按钮控制表格显示/隐藏
            const toggleTableBtn = document.getElementById("toggleTableBtn");
            const tableDiv = document.getElementById("tableDiv");
            const viewDiv = document.getElementById("viewDiv");

            let isTableVisible = false;

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
                const query = layer.createQuery();
                query.outFields = [selectedField];
                query.returnDistinctValues = true;
                query.where = "1=1";

                layer.queryFeatures(query).then(function (response) {
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

                layer.featureReduction = null

                // 创建查询
                const query = layer.createQuery();
                query.outFields = ["*"];
                query.where = selectedField + " = '" + selectedValue + "'";
                query.returnGeometry = true;
                layer.definitionExpression = selectedField + " = '" + selectedValue + "'";

                layer.queryExtent(query).then(extentResult => {
                    if (extentResult.extent) {
                        view.goTo(extentResult.extent.expand(1.2));
                    }
                });
                // 执行查询
                layer.queryFeatures(query).then(function () {
                });
            }

            function executeQueryClear() {
                layer.definitionExpression = null;

                featureTable.filterGeometry = null;
                view.graphics.removeAll();
                layer.featureReduction = clusterConfig
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
                const query = layer.createQuery();
                query.geometry = geometry;
                query.spatialRelationship = "intersects";
                query.outFields = ["*"];
                query.returnGeometry = true;
                // 执行空间查询
                layer.queryFeatures(query).then(function (response) {
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
                layer.featureReduction = null
            }

        // 添加搜索小部件（不显示在界面上，仅用于地理编码）
        const searchWidget = new Search({
          view: view,
          popupEnabled: false,
          popupOpenOnSelect: false
        });

        // 创建图形图层用于显示路径
        const routeLayer = new GraphicsLayer(
          {
            title:"路径"
          }
        );
        map.add(routeLayer);

        // 创建图形图层用于显示起点和终点
        const routePointsLayer = new GraphicsLayer(
          {
            title:"最近公安局点和事件点"
          }
        );
        map.add(routePointsLayer);

        // 存储最近设施点和时间点坐标
        // let startPoint = null;
        let endPoint = null;

       // 搜索时间点点击事件
        document.getElementById("searchEndBtn").addEventListener("click", function () {
          const locationName = document.getElementById("endLocationInput").value.trim();
          if (!locationName) {
            alert("请输入事件点名称");
            return;
          }

          // 使用Search组件进行地理编码
          searchWidget.search(locationName)
            .then(function (result) {
              if (result.results && result.results.length > 0) {
                const firstResult = result.results[0].results[0];
                endPoint = firstResult.feature.geometry;

                // 检查是否已存在终点，如果存在则先清除
                routePointsLayer.graphics.some(function (graphic) {
                  if (graphic.attributes && graphic.attributes.type === "终点") {
                    routePointsLayer.remove(graphic);
                    return true;
                  }
                  return false;
                });

                // 添加终点标记
                addRoutePoint(endPoint, [255, 0, 0], "终点");

                // 缩放到搜索结果位置
                view.goTo({
                  target: endPoint,
                  zoom: 14
                });
              } else {
                alert("未找到该地点，请尝试更精确的名称");
              }
            })
            .catch(function (error) {
              console.error("地理编码错误:", error);
              alert("搜索地点时出错，请稍后重试");
            });
        });

        // 最近公安局设施查找 + 最短路径规划
        // 添加事件点
        function addRoutePoint(point, color, label) {
          // 创建图形
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              color: color,
              outline: {
                color: [255, 255, 255],
                width: 2
              },
              size: 12
            }),
            attributes: {
              type: label
            },
            popupTemplate: {
              title: label,
              content: `${label}坐标: [${point.longitude.toFixed(6)}, ${point.latitude.toFixed(6)}]`
            }
          });

          // 添加到图层
          routePointsLayer.add(pointGraphic);
        }

        // 计算路径点击事件
        document.getElementById("calculateRouteBtn").addEventListener("click", function () {
          if (!endPoint) {
            alert("请先设置事件点");
            return;
          }

          getNearestPoint(endPoint, Publiclayer).then(startPoint => {
            if (!startPoint) {
              alert("未找到公安局点");
              return;
            }

            addRoutePoint(startPoint, [0, 255, 0], "起点");
            const profile = "driving";
            routeLayer.removeAll();
            calculateRoute(startPoint.longitude, startPoint.latitude, endPoint.longitude, endPoint.latitude, profile,view,routeLayer);
          });
        });

        function getNearestPoint(endPoint, Publiclayer){
          return Publiclayer.queryFeatures({
            where: "1=1",
            outFields: ["*"],
            returnGeometry: false
          }).then(result => {
            let nearestFeature = null;
            let minDistance = Infinity;

            result.features.forEach(feature => {
              const LON = feature.attributes.LON;
              const LAT = feature.attributes.LAT;
              const dx = endPoint.longitude - LON;
              const dy = endPoint.latitude - LAT;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < minDistance) {
                minDistance = distance;
                nearestFeature = feature;
              }
            });

            if (nearestFeature) {
              return {
                type: "point",
                longitude: nearestFeature.attributes.LON,
                latitude: nearestFeature.attributes.LAT,
                spatialReference: { wkid: 4326 }
              };
            }
            return null;
          });
        }

        // 计算路线
        function calculateRoute(
          startLon, startLat,
          endLon, endLat,
          profile,
          view,
          routeLayer,
          drawFullBaseline = true
        ){
          console.log("调用路径规划服务…");

          // 必要的容错
          if (!window.fetch) {
            console.error("当前环境不支持 fetch。");
            alert("当前环境不支持网络请求（fetch）。");
            return;
          }
          if (!view || !routeLayer) {
            console.error("缺少 view 或 routeLayer。");
            alert("内部依赖未就绪：view 或 routeLayer 缺失。");
            return;
          }
          if (!window.MAPBOX_ACCESS_TOKEN && typeof MAPBOX_ACCESS_TOKEN === "undefined") {
            console.error("缺少 MAPBOX_ACCESS_TOKEN。");
            alert("Mapbox 访问令牌缺失。");
            return;
          }

          const token = window.MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN;
          const url = `https://api.mapbox.com/directions/v5/mapbox/${encodeURIComponent(profile)}/${startLon},${startLat};${endLon},${endLat}?geometries=geojson&overview=full&steps=true&access_token=${token}`;

          // 右侧信息面板元素（根据你的 DOM id）
          const routeInfoEl     = document.getElementById("routeInfo");
          const routeDistanceEl = document.getElementById("routeDistance");
          const routeDurationEl = document.getElementById("routeDuration");
          const routeStepsEl    = document.getElementById("routeSteps");

          // 分段配色（循环使用）
          const palette = [
            [33,150,243, 0.95],  // 蓝
            [76,175,80,  0.95],  // 绿
            [255,152,0,  0.95],  // 橙
            [233,30,99,  0.95],  // 品红
            [156,39,176, 0.95],  // 紫
            [0,188,212,  0.95],  // 青
          ];

          // 开始请求
          fetch(url)
            .then(resp => {
              if (!resp.ok) throw new Error("网络响应异常");
              return resp.json();
            })
            .then(data => {
              if (!data || !data.routes || data.routes.length === 0) {
                alert("无法计算路径，请检查起终点。");
                return;
              }

              const route = data.routes[0];
              // 清空旧图形
              routeLayer.removeAll();

              // 可选：绘制整段“底线”以增强整体可读性
              if (drawFullBaseline && route.geometry && route.geometry.coordinates) {
                const fullPath = route.geometry.coordinates.map(([lon, lat]) => [lon, lat]);
                const fullLine = {
                  type: "polyline",
                  paths: fullPath,
                  spatialReference: { wkid: 4326 }
                };
                routeLayer.add(new Graphic({
                  geometry: fullLine,
                  symbol: { type: "simple-line", color: [0, 0, 255, 0.25], width: 4 }
                }));
              }

              // —— 核心：按 step 分段绘制 —— //
              let stepSerial = 0;
              (route.legs || []).forEach((leg, legIdx) => {
                (leg.steps || []).forEach((step, stepIdx) => {
                  stepSerial++;
                  const color = palette[(stepSerial - 1) % palette.length];

                  // 优先使用 step.geometry（需要 steps=true 且 geometries=geojson）
                  const coords = step?.geometry?.coordinates;
                  if (!coords || coords.length < 2) {
                    // 回退策略（简版）：无几何则跳过该步的绘制（仍保留文本指令）
                    return;
                  }

                  const stepPolyline = {
                    type: "polyline",
                    paths: coords.map(([lon, lat]) => [lon, lat]),
                    spatialReference: { wkid: 4326 }
                  };

                  // 文本信息
                  const instruction = step?.maneuver?.instruction || "无导航指令";
                  const roadName    = step?.name ? `（${step.name}）` : "";
                  const distText    = step?.distance
                    ? (step.distance < 1000 ? `${Math.round(step.distance)} 米`
                                            : `${(step.distance/1000).toFixed(2)} 公里`)
                    : "—";
                  const durText     = step?.duration
                    ? `${Math.round(step.duration / 60)} 分钟`
                    : "—";

                  // 绘制该步线段 + popup
                  routeLayer.add(new Graphic({
                    geometry: stepPolyline,
                    symbol: { type: "simple-line", color, width: 5 },
                    attributes: {
                      legIndex: legIdx,
                      stepIndex: stepIdx,
                      instruction,
                      roadName: step?.name || "",
                      distance: step?.distance || 0,
                      duration: step?.duration || 0
                    },
                    popupTemplate: {
                      title: `第 ${legIdx + 1} 段 · 第 ${stepIdx + 1} 步`,
                      content: `
                        <div style="line-height:1.6">
                          <div><b>指令：</b>${instruction}${roadName}</div>
                          <div><b>距离：</b>${distText}</div>
                          <div><b>时间：</b>${durText}</div>
                        </div>
                      `
                    }
                  }));
                });
              });

              // 更新右侧信息
              if (routeInfoEl) routeInfoEl.style.display = "block";
              if (routeDistanceEl) routeDistanceEl.textContent = `距离: ${(route.distance / 1000).toFixed(2)} 公里`;
              if (routeDurationEl) routeDurationEl.textContent = `预计时间: ${Math.round(route.duration / 60)} 分钟`;

              // 重建步骤列表
              if (routeStepsEl) {
                routeStepsEl.innerHTML = "<strong>详细路径:</strong>";
                if (route.legs && route.legs.length > 0) {
                  const ol = document.createElement("ol");
                  ol.style.paddingLeft = "20px";
                  ol.style.margin = "5px 0";

                  route.legs.forEach(leg => {
                    (leg.steps || []).forEach(step => {
                      const li = document.createElement("li");
                      let txt = step?.maneuver?.instruction || "";
                      if (step?.name) txt += ` (${step.name})`;
                      if (step?.distance) {
                        const d = step.distance < 1000
                          ? `${Math.round(step.distance)} 米`
                          : `${(step.distance/1000).toFixed(2)} 公里`;
                        txt += ` - ${d}`;
                      }
                      li.textContent = txt;
                      ol.appendChild(li);
                    });
                  });

                  routeStepsEl.appendChild(ol);
                } else {
                  routeStepsEl.innerHTML += "<p>无详细路径信息</p>";
                }
              }

              // 视图定位到所有分段
              if (routeLayer.graphics.length > 0) {
                view.goTo(routeLayer.graphics).catch(() => {});
              }
            })
            .catch(err => {
              console.error("获取路径数据出错：", err);
              alert("获取路径数据出错，请检查 Mapbox 访问令牌或网络环境。");
            });
        }

        // 添加地图点击事件，只允许 Ctrl + 点击 设置事件点
        view.on("click", function (event) {
          if (event.native.ctrlKey) {
            // 检查终点是否已存在
            const hasEndPoint = routePointsLayer.graphics.some(function (graphic) {
              return graphic.attributes && graphic.attributes.type === "终点";
            });

            endPoint = event.mapPoint;

            // 如果存在终点，先清除
            if (hasEndPoint) {
              routePointsLayer.graphics.some(function (graphic) {
                if (graphic.attributes && graphic.attributes.type === "终点") {
                  routePointsLayer.remove(graphic);
                  return true;
                }
                return false;
              });
            }

            // 添加新的终点（红色）
            addRoutePoint(endPoint, [255, 0, 0], "终点");
          }
        });


        // 清除路径按钮点击事件
        document.getElementById("clearRouteBtn").addEventListener("click", function () {
          // 清除路径点和路径
          routePointsLayer.removeAll();
          routeLayer.removeAll();

          // 重置起点和终点变量
          // startPoint = null;
          endPoint = null;

          // 隐藏路径信息
          document.getElementById("routeInfo").style.display = "none";
        });






        }
      )
    // 将事件监听器的设置移到onMounted钩子中
  }

// 左上角图

function initpublicChart(){

            //  左上角郑州犯罪发生率及巡查次数图
            const chartDom = document.getElementById('age');
            const myChart = echarts.init(chartDom);

            const months = [
                '2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06',
                '2020-07', '2020-08', '2020-09', '2020-10', '2020-11', '2020-12',
                '2021-01', '2021-02', '2021-03', '2021-04', '2021-05', '2021-06',
                '2021-07', '2021-08', '2021-09', '2021-10', '2021-11', '2021-12',
                '2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06',
                '2022-07', '2022-08', '2022-09', '2022-10', '2022-11', '2022-12',
                '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
                '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
                '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
                '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
            ];

            // 模拟数据（你可用真实数据替换）
            const crimeRate = Array.from({ length: 60 }, () => (Math.random() * 5 + 5).toFixed(2)); // 每万人犯罪数
            const patrolCount = Array.from({ length: 60 },() => Math.floor(300 + Math.random() * 200)); // 巡查次数

            const option = {
                title: {
                    top: 10,
                    text: '郑州市犯罪发生率 vs 巡查次数(2020-2024)',
                    left: 'center',
                    textStyle:
                    {
                        fontSize: 15, // ← 设置标题字体大小
                        fontWeight: 'bold', // 可选：加粗
                        color: '#333'       // 可选：字体颜色
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['犯罪发生率（每万人）', '巡查次数'],
                    top: 30
                },
                grid: {
                    top: 80, // 调整为你需要的值，默认是 60，数值越大图表越往下
                    left: '10%',
                    right: '10%',
                    bottom: '15%' // 可根据需要微调
                },

                // toolbox: {
                //     feature: {
                //         saveAsImage: {},
                //         dataView: {},
                //         restore: {}
                //     }
                // },

                xAxis: {
                    type: 'category',
                    data: months,
                    axisLabel: {
                        rotate: 0,
                        fontSize: 10,
                        fontFamily: 'sans-serif',
                        fontWeight: 'normal'
                    }
                },

                yAxis: [
                    {
                        type: 'value',
                        name: '犯罪发生率（每万人）',
                        position: 'left',
                        min: 0,               // 起始值
                        max: 15,              // 最大值（你模拟的范围是 5~10，可留裕度）
                    },
                    {
                        type: 'value',
                        name: '巡查次数',
                        position: 'right',
                        min: 275,               // 起始值
                        max: 500,              // 最大值（你模拟的范围是 5~10，可留裕度）
                    }
                ],
                dataZoom: [
                    {
                        type: 'slider',
                        show: true,
                        xAxisIndex: 0,
                        height: 18,
                        bottom: 10,
                        start: 0,
                        end: 20,
                        handleSize: '80%',
                        handleStyle: {
                            color: '#2f4554'
                        },
                        textStyle: {
                            color: '#333',
                            fontSize: 10
                        },
                        backgroundColor: '#f5f5f5',
                        dataBackground: {
                            lineStyle: {
                                color: '#aaa'
                            },
                            areaStyle: {
                                color: '#ddd'
                            }
                        },
                        fillerColor: 'rgba(63, 81, 181, 0.2)'
                    },
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        start: 0,
                        end: 20
                    }
                ],


                series: [
                    {
                        name: '犯罪发生率（每万人）',
                        type: 'line',
                        yAxisIndex: 0,
                        data: crimeRate,
                        smooth: true,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: '巡查次数',
                        type: 'line',
                        yAxisIndex: 1,
                        data: patrolCount,
                        smooth: true,
                        lineStyle: { width: 2 }
                    }
                ]
            };

            myChart.setOption(option);

            // 响应窗口大小变化
            window.addEventListener('resize', function () {
                myChart.resize();
            });
}

// 左下角图
function initpublicStyleChart(){
            // 左下角郑州各区犯罪事件
            const crimeStackBarChart = echarts.init(document.getElementById('edu'));
            const districts = ['中原区', '金水区', '二七区', '管城回族区', '惠济区'];
            const crimeTypeData = {
                '盗窃': [120, 132, 101, 134, 90],
                '抢劫': [60, 72, 91, 84, 65],
                '诈骗': [90, 102, 81, 74, 85],
                '故意伤害': [30, 42, 51, 44, 35]
            };

            const series = Object.entries(crimeTypeData).map(([type, data]) => ({
                name: type,
                type: 'bar',
                stack: 'total',
                emphasis: { focus: 'series' },
                label: {
                    show: false
                },
                data: data
            }));

            const crimeStackBarOption = {
                title: {
                    text: '郑州市各区犯罪事件',
                    left: 'center',
                    top: 10,
                    textStyle: {
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                legend: {
                    top: 40,
                    data: Object.keys(crimeTypeData)
                },
                grid: {
                    left: '10%',
                    right: '10%',
                    top: "27%",
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: districts,
                    axisLabel: {
                        fontSize: 12
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '犯罪事件数量'
                },
                series: series
            };

            crimeStackBarChart.setOption(crimeStackBarOption);
                    // 响应窗口大小变化
        window.addEventListener('resize', function () {
            crimeStackBarChart.resize();
        });
}


    // 声明变量存储表格显示状态
  let isTableVisible = true;

  // 组件挂载时初始化地图
  onMounted(() => {
    // 确保ArcGIS API已加载
    if (window.require) {
      initMap();
    } else {
      console.error("ArcGIS API未加载，请检查引入");
    }

    initpublicChart();
    initpublicStyleChart();

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

<style scoped>
@import "../CSS/智慧治安.css";
@import "../CSS/style.css";



#ClusterPanel {
  /* 更柔和的浅蓝色卡片背景，和右上角面板视觉统一 */
  background: linear-gradient(180deg, rgba(233, 243, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 75%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  padding: 16px;
}
#routePanel {
 margin-top: 40px;
}
/* 标题区卡片化 */
#routePanel h3 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 16px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  border-radius: 10px;
  background: linear-gradient(180deg, #f0f7ff 0%, #eaf3ff 100%);
  border: 1px solid #dbeafe;
}
#routePanel h3::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: #1f6feb;
  border-radius: 2px;
}

/* 帮助提示气泡 */
.help-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  cursor: help;
}
.help-icon img { display: block; }
.help-icon .tooltip-content {
  position: absolute;
  top: 28px;
  right: 0;
  width: 260px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  color: #374151;
  font-size: 12px;
  line-height: 1.5;
  display: none;
  z-index: 30;
}
.help-icon:hover .tooltip-content { display: block; }

/* 表单控件 */
#routePanel .control-item { margin-top: 40px;
padding: 20px; }
#routePanel .control-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #374151;
}
#routePanel input[type='text'] {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
  font-size: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
#routePanel input[type='text']:focus {
  border-color: #1f6feb;
  box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.15);
}

/* 查询按钮与主按钮统一风格 */
#searchEndBtn {
  background-color: #1f6feb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(31, 111, 235, 0.25);
  transition: background-color 0.2s, transform 0.12s;
}
#searchEndBtn:hover { background-color: #165bd3; transform: translateY(-1px); }
#searchEndBtn:active { transform: translateY(0); }

/* 主按钮区 */
#RouteBtnControl {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
#routePanel button {
  background-color: #1f6feb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(31, 111, 235, 0.25);
  transition: background-color 0.2s, transform 0.12s;
}
#routePanel button:hover { background-color: #165bd3; transform: translateY(-1px); }
#routePanel button:active { transform: translateY(0); }
#clearRouteBtn {
  background-color: #f44336 !important;
  box-shadow: 0 4px 10px rgba(244, 67, 54, 0.25);
}
#clearRouteBtn:hover { background-color: #d8382d !important; }

/* 路径信息区域卡片 */
#routeInfo {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  background: rgba(249, 250, 251, 0.9);
  border-radius: 10px;
  padding: 12px;
}
#routeInfo h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #1f2937;
}
#routeSteps {
  margin-top: 8px;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 6px;
}
#routeSteps::-webkit-scrollbar { width: 8px; }
#routeSteps::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
#routeSteps::-webkit-scrollbar-track { background: transparent; }

/* 响应式微调 */
@media (max-width: 1280px) {
  #ClusterPanel { padding: 12px; }
  #routePanel button { padding: 10px 12px; }
}

h3{
  margin-top: 100px;
}
#attributeQuery h3{
  margin-top: 20px;
}
#BtnContainer{
  margin: 20px 10px;
}

.control-items{
  margin-top: 20px ;
}
</style>

