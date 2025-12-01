<template>
  <div class="background">
  <!-- 左上方平均容积率分布图 -->
  <div class="side-div top-left">
    <div class="card chart-card">
      <div id="pr" class="chart-container"></div>
      <div v-if="isPRLoading" class="local-overlay">
        <img
          class="loading-illust pr-illust"
          src="../../asset/icon/Loading.svg"
          alt="容积率图加载中"
        />
        <div class="loading-text">容积率图加载中…</div>
      </div>
    </div>
  </div>

  <!-- 左下方建筑类型分布图 -->
  <div class="side-div bottom-left">
    <div class="card chart-card">
      <div id="bc" class="chart-container"></div>
      <div v-if="isBCLoading" class="local-overlay">
        <img
          class="loading-illust pr-illust"
          src="../../asset/icon/Loading.svg"
          alt="建筑类型分布图加载中"
        />
        <div class="loading-text">建筑类型分布图加载中…</div>
      </div>
    </div>
  </div>

  <!-- 主地图 -->
  <div id="container">
    <div class="head-bar">
      <div class="home-icon">
        <RouterLink to="/main" style="text-decoration: none; color: inherit">
          <img src="../../asset/icon/home.svg" alt="" style="width: 18px" />
        </RouterLink>
      </div>
      <div class="title">郑州市智慧住建系统🏠</div>
      <i class="layui-icon layui-icon-spread-left"></i>
    </div>
    <transferPage />

    <div class="card map-card">
    <div id="viewDiv" class="map-host"></div>
    <div v-if="isMapLoading" class="local-overlay">
      <img class="loading-illust" src="../../asset/icon/Loading.png" alt="loading" />
      <div class="loading-text">正在加载三维场景…</div>
      <div class="loading-sub">首帧完成后自动关闭</div>
    </div>
  </div>
  </div>

  <!-- 右上方地块预览图  -->
  <div class="side-div top-right">
    <div class="card panel-card">
    <div class="top-right-content">
      <!-- 场景幻灯片部分 -->
      <div id="slidesDiv" class="esri-widget">
        <div id="slideImage">
          <div id="slideTitle">幻灯片标题</div>
          <img src="" alt="幻灯片图片" />
          <button id="prevSlideBtn" class="slide-btn">&lt;</button>
          <button id="nextSlideBtn" class="slide-btn">&gt;</button>
        </div>
      </div>

      <!-- 概览地图部分 -->
      <div id="overviewDiv">
        <div id="extentDiv"></div>
      </div>
    </div>

    <!-- ✅ 右上模块的“局部遮罩” -->
    <div v-if="isRightPanelLoading" class="local-overlay">
      <img class="loading-illust" src="../../asset/icon/Loading.svg" alt="预览加载中" />
      <div class="loading-text">地块预览加载中…</div>
      <div class="loading-sub">首帧完成后自动关闭</div>
    </div>
  </div>
  </div>

  <div class="side-div bottom-right">
    <div class="bottom-right-content">
      <!-- 合并的功能面板 -->
      <div class="unified-panel">
        <!-- 退红线分析部分 -->
        <div class="analysis-section">
          <h3 class="section-header">退红线分析与建筑模拟</h3>
          <div class="analysis-controls">
            <div id="errorMessage" class="error-message"></div>
            <div id="infoDisplay" class="info-display">请点击开始按钮启动分析功能</div>

            <div class="control-item">
              <label>退红线距离 (米):</label>
              <div class="slider-container">
                <input
                  type="range"
                  id="bufferDistance"
                  min="1"
                  max="50"
                  value="10"
                  step="1"
                  disabled
                />
                <span id="distanceValue" class="slider-value">10</span>
              </div>
            </div>

            <div class="control-item">
              <label>图形高度偏移 (米):</label>
              <div class="slider-container">
                <input
                  type="range"
                  id="elevationOffset"
                  min="1"
                  max="20"
                  value="5"
                  step="1"
                  disabled
                />
                <span id="offsetValue" class="slider-value">5</span>
              </div>
            </div>

            <div class="button-row">
              <button
                id="startAnalysisBtn"
                class="analysis-btn half-width"
                style="background-color: #28a745"
              >
                开始分析
              </button>

              <button id="clearBtn" class="analysis-btn half-width" disabled>清除分析结果</button>
            </div>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="section-divider"></div>

        <!-- 建筑模型部分 -->
        <div class="model-section">
          <div class="model-controls">
            <p
              style="
                background-color: #e8f5e8;
                color: #2e7d32;
                padding: 6px;
                border-radius: 3px;
                margin-bottom: 12px;
                font-size: 11px;
              "
            >
              请在退线分析后选择建筑模型放置到场景中：
            </p>
            <div class="button-row">
              <button id="highRiseBtn" class="model-btn half-width">高层建筑</button>
              <button id="multiStoryBtn" class="model-btn half-width">多层建筑</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="js">
  // 引入菜单
  import transferPage from '../components/跳转-过渡.vue'
  // 从 Vue 框架中引入ref和两个生命周期钩子函数
  import { ref, onMounted, onUnmounted } from 'vue';
  // 引入RouterLink
  import { RouterLink } from 'vue-router';

  let view;
  let scene;

  // 各容器的局部加载状态
  const isMapLoading = ref(true);
  const isPRLoading  = ref(true);
  const isBCLoading  = ref(true);
  const isRightPanelLoading = ref(true);

  // 箭头函数 - 初始化地图
  const initMap = () => {
    // 导入使用ArcGIS的require加载必要模块
    window.require([
      "esri/WebScene",
      "esri/views/SceneView",
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/core/reactiveUtils",
      "esri/core/promiseUtils",
      "esri/layers/GraphicsLayer",
      "esri/layers/WebTileLayer",
      "esri/Basemap",
      "esri/widgets/Sketch/SketchViewModel",
      "esri/geometry/geometryEngine",
      "esri/geometry/projection",
      "esri/widgets/DirectLineMeasurement3D",
      "esri/widgets/AreaMeasurement3D",
      "esri/widgets/Expand",
      "esri/widgets/ShadowCast",
      "esri/widgets/LineOfSight",
      "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js", // 要素图层模块
    ],
      (
        WebScene,
        SceneView,
        Map,
        MapView,
        Graphic,
        reactiveUtils,
        promiseUtils,
        GraphicsLayer,
        SketchViewModel,
        geometryEngine,
        projection,
        DirectLineMeasurement3D,
        AreaMeasurement3D,
        Expand,
        ShadowCast,
        LineOfSight,
        echarts
      ) => {
        // 回调函数
        // 三维场景
        scene = new WebScene({
          portalItem: { id: "2a12e9ff52e04c7d8dc3411ec1ee27c6" },
        });
        // 视图
        view = new SceneView({
          container: "viewDiv",
          map: scene,
        });

        // 首帧判断
        reactiveUtils.whenOnce(() => !view.updating).then(() => {
          isMapLoading.value = false;   // 仅关闭地图那一块
        });

        // 右上角遮盖
        // 右上模块的两个首帧就绪信号
        let overviewReady = false;
        let slidesReady = false;

        function tryHideRightPanelLoading() {
          if (overviewReady && slidesReady) {
            isRightPanelLoading.value = false;
          }
        }

        // // 等待视图加载完成（首帧）
        // view.when(() => {
        //   viewReady = true;
        //   tryHideLoading();
        //   // ……你后面的初始化（Sketch、分析、slides 等）原样继续……
        // });

        // 添加阴影分析小部件
        const shadowCast = new ShadowCast({
          view: view,
        });
        shadowCast.viewModel.stop();

        const shadowExpand = new Expand({
          view: view,
          content: shadowCast,
          expandIconClass: "esri-icon-shadow",
        });

        shadowCast.visibleElements = {
          timeRangeSlider: false,
          timezone: false,
          datePicker: false,
          visualizationOptions: true,
          colorPicker: false,
          tooltip: true,
        };

        // 监听展开面板的展开/收起事件，控制阴影分析的启动和停止
        shadowExpand.watch("expanded", (expanded) => {
          if (expanded) {
            // 展开时开始阴影分析
            shadowCast.viewModel.start();
          } else {
            // 收起时停止阴影分析并清除结果
            shadowCast.viewModel.stop();
          }
        });
        view.ui.add(shadowExpand, "top-right");



        // 创建另一个地图，用于概览地图视图
        const overviewMap = new Map({
          basemap: "topo-vector",
        });

        // 创建概览地图的 MapView
        const mapView = new MapView({
          container: "overviewDiv", // 指定概览地图的容器
          map: overviewMap, // 指定概览地图使用的地图对象
          constraints: {
            rotationEnabled: false, // 禁用概览地图的旋转功能
          },
        });

        // 等待地图视图加载完成（首帧）
        reactiveUtils.whenOnce(() => !mapView.updating).then(() => {
        overviewReady = true;
        tryHideRightPanelLoading();
        });

        // 创建测距工具
        const directLineMeasurement = new DirectLineMeasurement3D({
          view: view,
        });

        // 创建自定义的测距工具界面
        const customDirectLineContent = document.createElement("div");
        customDirectLineContent.innerHTML = `
                    <div style="padding: 10px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        <div style="margin-bottom: 8px; font-weight: bold; color: #333;">距离测量</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label style="font-size: 12px; color: #666;">单位:</label>
                            <select id="distanceUnitSelect" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">
                                <option value="meters">米</option>
                                <option value="kilometers">千米</option>
                                <option value="feet">英尺</option>
                                <option value="yards">码</option>
                            </select>
                        </div>
                    </div>
                `;

        // 监听单位选择变化
        const distanceUnitSelect =
          customDirectLineContent.querySelector(
            "#distanceUnitSelect"
          );
        distanceUnitSelect.addEventListener("change", (event) => {
          directLineMeasurement.unit = event.target.value;
        });

        // 监听展开面板的展开/收起事件，控制测量工具的激活状态
        const directLineExpand = new Expand({
          view: view,
          expandIcon: "measure-line",
          content: customDirectLineContent,
        });

        // 当展开面板展开时激活测量工具，收起时清除测量
        directLineExpand.watch("expanded", (expanded) => {
          if (expanded) {
            // 展开时激活测量工具
            directLineMeasurement.viewModel.start();
          } else {
            // 收起时清除所有测量结果并停止测量
            directLineMeasurement.viewModel.clear();
          }
        });

        view.ui.add(directLineExpand, "top-right");

        // 创建面积测量工具
        const areaMeasurement = new AreaMeasurement3D({
          view: view,
        });

        // 创建自定义的面积测量工具界面
        const customAreaContent = document.createElement("div");
        customAreaContent.innerHTML = `
                    <div style="padding: 10px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        <div style="margin-bottom: 8px; font-weight: bold; color: #333;">面积测量</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label style="font-size: 12px; color: #666;">单位:</label>
                            <select id="areaUnitSelect" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;">
                                <option value="square-meters">平方米</option>
                                <option value="square-kilometers">平方千米</option>
                                <option value="square-feet">平方英尺</option>
                                <option value="hectares">公顷</option>
                                <option value="acres">英亩</option>
                            </select>
                        </div>
                    </div>
                `;

        // 监听单位选择变化
        const areaUnitSelect =
          customAreaContent.querySelector("#areaUnitSelect");
        areaUnitSelect.addEventListener("change", (event) => {
          areaMeasurement.unit = event.target.value;
        });

        // 创建面积测量工具的展开面板
        const areaExpand = new Expand({
          view: view,
          expandIcon: "measure-area",
          content: customAreaContent,
        });

        // 当展开面板展开时激活测量工具，收起时清除测量
        areaExpand.watch("expanded", (expanded) => {
          if (expanded) {
            // 展开时激活测量工具
            areaMeasurement.viewModel.start();
          } else {
            // 收起时清除所有测量结果并停止测量
            areaMeasurement.viewModel.clear();
          }
        });
        view.ui.add(areaExpand, "top-right");

        // 创建通视分析小部件，并关联到场景视图
        const lineOfSight = new LineOfSight({
          view: view,
        });
        // 将通视分析小部件添加到可展开的容器中，并添加到视图右上角
        view.ui.add(
          new Expand({
            content: lineOfSight,
            view: view,
          }),
          "top-right"
        );

        // 获取通视分析小部件的视图模型，用于操作和监控通视分析状态
        const viewModel = lineOfSight.viewModel;

        // 监控观察者位置的变化，当观察者位置改变时，更新交叉点标记
        reactiveUtils.watch(
          () => viewModel.observer,
          () => {
            setIntersectionMarkers();
          }
        );

        // 监控目标点的变化，当有新目标添加或删除时，更新交叉点标记
        viewModel.targets.on("change", (event) => {
          // 处理新增的目标点
          event.added.forEach((target) => {
            setIntersectionMarkers();
            // 监控每个目标点的交叉点位置变化，变化时更新交叉点标记
            reactiveUtils.watch(
              () => target.intersectedLocation,
              () => {
                setIntersectionMarkers();
              }
            );
          });
          // 处理移除的目标点，移除时更新交叉点标记
          event.removed.forEach(() => {
            // 移除目标的交叉点标记（右键单击目标移除）
            setIntersectionMarkers();
          });
        });

        // 定义视线被遮挡时与建筑物交点的符号样式
        const intersectionSymbol = {
          type: "point-3d",
          symbolLayers: [
            {
              type: "object",
              resource: { primitive: "inverted-cone" }, // 使用倒锥作为符号形状
              material: { color: [255, 255, 100] }, // 设置符号颜色
              height: 10, // 符号高度
              depth: 10, // 符号深度
              width: 10, // 符号宽度
              anchor: "relative", // 锚点类型为相对位置
              anchorPosition: { x: 0, y: 0, z: -2 }, // 锚点位置
            },
          ],
        };

        // 定义更新交叉点标记的函数
        function setIntersectionMarkers() {
          view.graphics.removeAll();
          // 遍历所有目标点
          viewModel.targets.forEach((target) => {
            if (target.intersectedLocation) {
              // 创建一个图形对象，使用交叉点符号和位置
              const graphic = new Graphic({
                symbol: intersectionSymbol,
                geometry: target.intersectedLocation,
              });
              view.graphics.add(graphic);
            }
          });
        }


        // // 添加比例尺
        // const scalebar = new Scalebar({
        //     view: view,
        //     unit: "metric",
        // });
        // view.ui.add(scalebar, "bottom-left");

        // ===========地块建筑==============
        // 移除概览地图的默认微件
        mapView.ui.components = [];

        // 创建图形图层用于建筑模型
        const modelGraphicsLayer = new GraphicsLayer({
          elevationInfo: { mode: "on-the-ground" },
          title: "建筑模型",
        });
        view.map.add(modelGraphicsLayer);

        // 创建图形图层用于退红线分析
        const bufferLayer = new GraphicsLayer({
          elevationInfo: {
            mode: "relative-to-ground",
            offset: 5,
          },
          title: "可建设范围",
          opacity: 0.8,
        });
        view.map.add(bufferLayer);

        // 本地幻灯片图片路径数组
        const localSlideImages = [
          "../../asset/images/slide1.png",
          "../../asset/images/slide2.png",
          "../../asset/images/slide3.png",
        ];

        // 幻灯片控制变量
        let slides = [];
        let currentSlideIndex = 0;

        // 获取DOM元素
        const slideTitle = document.getElementById("slideTitle");
        const slideImage = document
          .getElementById("slideImage")
          .querySelector("img");
        const prevSlideBtn = document.getElementById("prevSlideBtn");
        const nextSlideBtn = document.getElementById("nextSlideBtn");

        // 更新幻灯片显示
        function updateSlideDisplay() {
          if (slides.length === 0) return;

          const currentSlide = slides[currentSlideIndex];
          slideTitle.textContent = currentSlide.title.text;

          // 使用本地图片路径，而不是从幻灯片获取
          // 确保本地图片数量与幻灯片数量匹配
          if (currentSlideIndex < localSlideImages.length) {
            slideImage.src = localSlideImages[currentSlideIndex];
          } else {
            // 如果本地图片不足，可以使用默认图片或循环使用
            slideImage.src =
              localSlideImages[
              currentSlideIndex % localSlideImages.length
              ];
          }

          slideImage.alt = currentSlide.title.text;

          // 更新按钮状态
          prevSlideBtn.disabled = currentSlideIndex === 0;
          nextSlideBtn.disabled =
            currentSlideIndex === slides.length - 1;

          // 应用幻灯片到视图（保留原有的视点信息）
          currentSlide.applyTo(view);
        }

        // 按钮事件处理
        prevSlideBtn.addEventListener("click", () => {
          if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlideDisplay();
          }
        });

        nextSlideBtn.addEventListener("click", () => {
          if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            updateSlideDisplay();
          }
        });

        // 使用防抖函数处理主视图范围变化时的概览地图更新
        const extentDebouncer = promiseUtils.debounce(async () => {
          if (view.stationary) {
            // 当主视图静止时
            await mapView.goTo({
              center: view.center, // 将概览地图中心移动到主视图中心
              scale:
                view.scale *
                3 *
                Math.max(
                  view.width / mapView.width,
                  view.height / mapView.height
                ), // 计算合适的缩放比例
            });
          }
        });

        // 设置概览地图与主视图范围同步的函数
        function setupOverview() {
          // 创建一个图形对象，用于表示主视图的范围
          const extent3Dgraphic = new Graphic({
            geometry: null, // 初始几何信息为空
            symbol: {
              type: "simple-fill", // 简单填充符号
              color: [0, 0, 0, 0.5], // 填充颜色
              outline: null, // 无轮廓
            },
          });
          // 将表示主视图范围的图形添加到概览地图中
          mapView.graphics.add(extent3Dgraphic);

          // 监听主视图范围的变化
          reactiveUtils.watch(
            () => view.extent, // 监听的属性
            (extent) => {
              // 每当 3D 视图静止时，同步概览地图的位置
              extentDebouncer().then(() => {
                extent3Dgraphic.geometry = extent; // 更新图形的几何信息为当前主视图范围
              });
            },
            {
              initial: true, // 初始时执行一次回调函数
            }
          );
        }

        // ========== 建筑模型功能 ==========
        let sketchVM;
        const highRiseBtn = document.getElementById("highRiseBtn");
        const multiStoryBtn = document.getElementById("multiStoryBtn");

        function deactivateModelButtons() {
          const buttons = [highRiseBtn, multiStoryBtn];
          buttons.forEach((button) => {
            button.classList.remove("active");
          });
        }

        // ========== 退红线分析功能 ==========
        const bufferDistance =
          document.getElementById("bufferDistance");
        const distanceValue = document.getElementById("distanceValue");
        const elevationOffset =
          document.getElementById("elevationOffset");
        const offsetValue = document.getElementById("offsetValue");
        const startAnalysisBtn =
          document.getElementById("startAnalysisBtn");
        const clearBtn = document.getElementById("clearBtn");
        const errorMessage = document.getElementById("errorMessage");
        const infoDisplay = document.getElementById("infoDisplay");

        let selectedFeature = null;
        let highlightHandle = null;
        let analysisActive = false;

        // 显示错误信息的函数
        function showError(message) {
          errorMessage.textContent = message;
          errorMessage.style.display = "block";
          infoDisplay.style.display = "none";
        }

        // 显示信息的函数
        function showInfo(message) {
          infoDisplay.textContent = message;
          infoDisplay.style.display = "block";
          errorMessage.style.display = "none";
        }

        // 更新滑块值显示
        bufferDistance.addEventListener("input", () => {
          distanceValue.textContent = bufferDistance.value;
        });

        elevationOffset.addEventListener("input", () => {
          offsetValue.textContent = elevationOffset.value;
          updateElevationInfo();
        });

        // 更新图层高度信息
        function updateElevationInfo() {
          const offset = parseInt(elevationOffset.value);

          bufferLayer.elevationInfo = {
            mode: "relative-to-ground",
            offset: offset,
          };

          if (selectedFeature) {
            updateBuffer();
          }
        }

        // 执行缓冲区分析的函数
        function performBufferAnalysis(geometry, distance) {
          try {
            if (!geometry || geometry.isEmpty) {
              showError("选中的地块几何无效");
              return false;
            }

            let projectedGeometry = geometry;

            if (
              geometry.spatialReference &&
              geometry.spatialReference.isGeographic
            ) {
              projectedGeometry = projection.project(geometry, {
                wkid: 3857,
              });
            }

            const bufferPolygon = geometryEngine.buffer(
              projectedGeometry,
              -distance,
              "meters"
            );

            if (!bufferPolygon || bufferPolygon.isEmpty) {
              showError("退红线距离过大，无可建设范围");
              return false;
            }

            let finalGeometry = bufferPolygon;
            if (
              geometry.spatialReference &&
              geometry.spatialReference.isGeographic
            ) {
              finalGeometry = projection.project(
                bufferPolygon,
                geometry.spatialReference
              );
            }

            const bufferSymbol = {
              type: "simple-fill",
              color: [0, 255, 0, 0.6],
              outline: {
                color: [0, 200, 0, 1],
                width: 3,
                style: "solid",
              },
            };

            const area = geometryEngine.planarArea(
              finalGeometry,
              "square-meters"
            );
            const originalArea = geometryEngine.planarArea(
              geometry,
              "square-meters"
            );

            const bufferGraphic = new Graphic({
              geometry: finalGeometry,
              symbol: bufferSymbol,
              attributes: {
                type: "buffer",
                name: "可建设范围（退红线 " + distance + "米）",
                area: area,
                originalArea: originalArea,
              },
            });

            bufferLayer.add(bufferGraphic);

            const areaPercent = (
              (area / originalArea) *
              100
            ).toFixed(1);
            showInfo(
              `可建设面积: ${area.toFixed(
                0
              )}㎡ (占原地块${areaPercent}%)`
            );

            return true;
          } catch (error) {
            console.error("缓冲区计算错误:", error);
            showError("缓冲区计算失败：" + error.message);
            return false;
          }
        }

        function updateBuffer() {
          if (selectedFeature) {
            bufferLayer.removeAll();
            const distance = parseInt(bufferDistance.value);
            performBufferAnalysis(
              selectedFeature.geometry,
              distance
            );
          }
        }

        // 等待视图加载完成
        view.when(() => {
          // 初始化SketchViewModel
          sketchVM = new SketchViewModel({
            layer: modelGraphicsLayer,
            view: view,
          });

          // 建筑模型按钮事件
          highRiseBtn.addEventListener("click", () => {
            sketchVM.pointSymbol = {
              type: "point-3d",
              symbolLayers: [
                {
                  type: "object",
                  resource: {
                    href: "../../asset/modal/高层建筑.glb",
                  },
                },
              ],
            };
            sketchVM.create("point");
            deactivateModelButtons();
            highRiseBtn.classList.add("active");
          });

          multiStoryBtn.addEventListener("click", () => {
            sketchVM.pointSymbol = {
              type: "point-3d",
              symbolLayers: [
                {
                  type: "object",
                  resource: {
                    href: "../../asset/modal/多层建筑.glb",

                  },
                  tilt: 270,
                },
              ],
            };
            deactivateModelButtons();
            sketchVM.create("point");
            multiStoryBtn.classList.add("active");
          });

          sketchVM.on("create", (event) => {
            if (event.state === "complete") {
              sketchVM.update(event.graphic);
              deactivateModelButtons();
            }
          });

          // 开始分析按钮事件
          startAnalysisBtn.addEventListener("click", () => {
            if (!analysisActive) {
              // 启动分析模式
              analysisActive = true;
              startAnalysisBtn.textContent = "停止分析";
              startAnalysisBtn.style.backgroundColor = "#f7bc14";

              // 启用控件（移除showBufferCheck相关代码）
              bufferDistance.disabled = false;
              elevationOffset.disabled = false;
              clearBtn.disabled = false;

              showInfo(
                "分析模式已启动，请点击场景中的规划地块开始分析"
              );
            } else {
              // 停止分析模式
              analysisActive = false;
              startAnalysisBtn.textContent = "开始分析";
              startAnalysisBtn.style.backgroundColor = "#28a745";

              // 禁用控件（移除showBufferCheck相关代码）
              bufferDistance.disabled = true;
              elevationOffset.disabled = true;
              clearBtn.disabled = false; // 保持清除按钮可用

              // 不清除分析结果，只是停止分析模式
              // 移除高亮显示
              if (highlightHandle) {
                highlightHandle.remove();
                highlightHandle = null;
              }
              selectedFeature = null;

              showInfo("分析模式已停止，分析结果已保留");
            }
          });

          // 退红线分析点击事件
          view.on("click", (event) => {
            // 只有在分析模式激活时才响应点击
            if (!analysisActive) {
              return;
            }

            view.hitTest(event)
              .then(async (response) => {
                try {
                  const hitResult = response.results.find(
                    (result) =>
                      result.graphic &&
                      result.graphic.layer &&
                      result.graphic.geometry &&
                      result.graphic.geometry.type ===
                      "polygon"
                  );

                  if (hitResult) {
                    const hitGraphic = hitResult.graphic;

                    if (
                      !hitGraphic.geometry ||
                      hitGraphic.geometry.isEmpty
                    ) {
                      showError(
                        "选中的地块几何无效，请选择其他地块"
                      );
                      return;
                    }

                    const area = geometryEngine.planarArea(
                      hitGraphic.geometry,
                      "square-meters"
                    );
                    if (area < 1) {
                      showError(
                        "选中的地块面积过小，无法进行退红线分析"
                      );
                      return;
                    }

                    if (highlightHandle) {
                      highlightHandle.remove();
                      highlightHandle = null;
                    }

                    if (hitResult.layer) {
                      view.whenLayerView(hitResult.layer)
                        .then((layerView) => {
                          highlightHandle =
                            layerView.highlight(
                              hitGraphic
                            );
                        })
                        .catch((error) => {
                          console.warn(
                            "无法高亮显示要素:",
                            error
                          );
                        });
                    }

                    selectedFeature = hitGraphic;
                    bufferLayer.removeAll();

                    const distance = parseInt(
                      bufferDistance.value
                    );
                    const maxDistance = Math.sqrt(area) / 4;
                    if (distance > maxDistance) {
                      showError(
                        `建议退红线距离不超过 ${Math.floor(
                          maxDistance
                        )} 米`
                      );
                    }

                    // 在点击事件处理中
                    showInfo(
                      "正在分析选中地块，退红线距离: " +
                      distance +
                      "米"
                    );

                    // 直接执行缓冲区分析，不再检查复选框
                    performBufferAnalysis(
                      hitGraphic.geometry,
                      distance
                    );
                  } else {
                    showError(
                      "请点击规划地块（多边形要素）"
                    );
                  }
                } catch (error) {
                  console.error("处理点击事件时出错:", error);
                  showError("处理失败，请重试");
                }
              })
              .catch((error) => {
                console.error("分析过程中出错:", error);
                showError("分析失败，请重试");
              });
          });

          // 清除按钮事件
          clearBtn.addEventListener("click", () => {
            bufferLayer.removeAll();
            if (highlightHandle) {
              highlightHandle.remove();
              highlightHandle = null;
            }
            selectedFeature = null;
            showInfo(
              "已清除分析结果，请点击场景中的规划地块开始新的分析"
            );
          });

          // 距离变化时更新分析
          bufferDistance.addEventListener("change", updateBuffer);

          // 初始化幻灯片
          document.getElementById("slidesDiv").style.visibility =
            "visible";
          slides = scene.presentation.slides.toArray();

          if (slides.length > 0) {
            updateSlideDisplay();
          } else {
            slideTitle.textContent = "没有可用的幻灯片";
            prevSlideBtn.disabled = true;
            nextSlideBtn.disabled = true;
          }

          // 遮盖
          slidesReady = true;
          tryHideRightPanelLoading();

          // 确保概览地图已加载完成后执行 setupOverview 函数
          mapView.when(() => {
            setupOverview();
          });

          // 显示初始提示信息
          showInfo("请点击开始按钮启动分析功能");

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

    const onPRFinished = () => {
      if (isPRLoading.value) isPRLoading.value = false;
      prChart.off('finished', onPRFinished); // 可留可不留
    };
    prChart.on('finished', onPRFinished);
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

      const onBCFinished = () => {
        if (isBCLoading.value) isBCLoading.value = false;
        bcChart.off('finished', onBCFinished); // 可留可不留
      };
      bcChart.on('finished', onBCFinished);
      handleResize(bcChart);

    // 将事件监听器的设置移到onMounted钩子中
  });
});
}
  // 组件挂载时初始化地图
  onMounted(() => {
    // 动态创建 script 标签
    const script = document.createElement('script');
    script.src = './building.js'; // 路径根据文件位置调整
    document.body.appendChild(script);
    // 确保ArcGIS API已加载
    if (window.require) {
      initMap();
    } else {
      console.error("ArcGIS API未加载，请检查引入");
    }
  });

  // 组件卸载时清理
  onUnmounted(() => {
    // 销毁地图视图释放资源
    if (view) {
      view.destroy();
    }

    // 移除动态添加的脚本
    const script = document.querySelector('script[src="./building.js"]');
    if (script) {
      document.body.removeChild(script);
    }
  });
</script>

<style scoped>
@import "../CSS/智慧住建.css";
@import "../CSS/style.css";

/* 让卡片成为相对定位容器 */
.card {
  position: relative;
}

/* 地图容器尺寸（按你的布局需求可调） */
.map-host {
  width: 100%;
  height: 52vh;
}

/* 图表在侧栏的最小高度 */
.chart-card .chart-container {
  width: 100%;
  height: 100%;
  min-height: 220px;
}

/* ✅ 局部遮罩（覆盖各自卡片，不是全屏） */
.local-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 10;
  backdrop-filter: blur(2px);
  pointer-events: none; /* 如果你想屏蔽点击改成 auto */
}

/* 复用你原本卡片内元素样式 */
.loading-illust {
  width: 120px;
  margin-bottom: 10px;
  user-select: none;
}
.loading-text {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}
.loading-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
</style>
