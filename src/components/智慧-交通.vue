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
      <div class="title">郑州市智慧交通系统🚦</div>
      <i class="layui-icon layui-icon-spread-left"></i>
    </div>
    <transferPage />
    </div>

  <div class="side-div top-right">
    <div id="QueryPanel">
      <div id="controlPanel">
        <h3>等时圈分析</h3>
        <div style="display: none;">
          <input type="text" id="longitude" value="113.6401" />
          <input type="text" id="latitude" value="34.7236" />
        </div>
        <div class="control-item">
          <label for="locationInput">地点名称:</label>
          <input type="text" id="locationInput" value="郑州市" placeholder="请输入地点名称" />
        </div>
        <div class="control-item">
          <button id="searchLocationBtn" style="margin-top: 5px; margin-bottom: 10px;">搜索地点</button>
        </div>
        <div class="control-item">
          <label for="profile">交通方式:</label>
          <select id="profile">
            <option value="driving">驾车</option>
            <option value="walking">步行</option>
            <option value="cycling">骑行</option>
          </select>
        </div>
        <div class="control-item">
          <label for="timeSettings">等时圈时间设置:</label>
          <div class="time-inputs">
            <div class="time-input">
              <input type="number" id="time1" value="5" min="1" max="120" />
            </div>
            <div class="time-input">
              <input type="number" id="time2" value="10" min="1" max="120" />
            </div>
            <div class="time-input">
              <input type="number" id="time3" value="15" min="1" max="120" />
            </div>
          </div>
          <small>可设置1-120分钟，最多3个时间段</small>
        </div>
        <button id="startIsochroneBtn" style="background-color: #4CAF50;">启动等时圈分析</button>
        <button id="analyzeBtn" style="margin-top: 10px;">开始分析</button>
        <button id="clearIsochroneBtn" style="background-color: #f44336; margin-top: 10px;">清除等时圈</button>
      </div>
      <div class="legend">
        <h4>等时圈图例</h4>
        <div id="legendContent">
          <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(107, 174, 214, 0.7);"></div>
            <span>5分钟</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(66, 146, 198, 0.6);"></div>
            <span>10分钟</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(33, 113, 181, 0.5);"></div>
            <span>15分钟</span>
          </div>
        </div>
      </div>
    </div>

  </div>
  <div class="side-div bottom-right">
    <div id="ClusterPanel">
      <div id="routePanel">
<h3>最短路径分析
          <span class="help-icon">
        <img src="../../asset/icon/问号.svg" alt="帮助" width="20" height="20" float="right">
        <div class="tooltip-content">
            <p>提示: 您也可以直接在地图上选择点位</p >
            <p>- 按住Shift键点击地图设置<span style="color: green;">起点</span></p >
            <p>- 按住Ctrl键点击地图设置<span style="color: red;">终点</span></p >
        </div>
    </span></h3>
        <div class="control-item">
          <label for="startLocationInput">起点:</label>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="startLocationInput" placeholder="请输入起点名称" style="flex: 1;" />
            <button id="searchStartBtn">起</button>
          </div>
        </div>
        <div class="control-item">
          <label for="endLocationInput">终点:</label>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="endLocationInput" placeholder="请输入终点名称" style="flex: 1;" />
            <button id="searchEndBtn">终</button>
          </div>
        </div>
        <div class="control-item">
          <label for="routeProfile">交通方式:</label>
          <select id="routeProfile">
            <option value="driving">驾车</option>
            <option value="walking">步行</option>
            <option value="cycling">骑行</option>
          </select>
        </div>
        <div id="RouteBtnControl" style="display: flex; flex-direction: column;">
          <button id="calculateRouteBtn" style="width: 100%; margin-bottom: 10px;">计算路径</button>
          <button id="clearRouteBtn" style="background-color: #f44336; width: 100%;">清除路径</button>
        </div>
        <div id="routeInfo" style="margin-top: 10px; display: none;">
          <h4>路径信息</h4>
          <div id="routeDistance"></div>
          <div id="routeDuration"></div>
          <div id="routeSteps" style="margin-top: 10px; max-height: 150px; overflow-y: auto; font-size: 13px;"></div>
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
  import { RouterLink } from 'vue-router';
  let view;
  let map;


  // 初始化地图
  const initMap = () => {
    // 使用ArcGIS的require加载必要模块
    window.require([
      "esri/Map",
      "esri/views/MapView",
      "esri/config",
      "esri/layers/FeatureLayer",
      "esri/widgets/BasemapToggle",
      "esri/widgets/ScaleBar",
      "esri/widgets/Home",
      "esri/Graphic",
      "esri/geometry/Point",
      "esri/layers/GraphicsLayer",
      "esri/geometry/Polygon",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/widgets/Search",
      "esri/widgets/Locate",
      "esri/widgets/Bookmarks",
      "esri/layers/WebTileLayer"
    ],
      (Map, MapView, config, FeatureLayer, BasemapToggle, ScaleBar, Home, Graphic, Point, GraphicsLayer, Polygon, SimpleFillSymbol, SimpleMarkerSymbol, Search) => {

      // 配置ArcGIS API密钥
      config.apiKey =
        "AAPTxy8BH1VEsoebNVZXo8HurFgltLjXSNfoH9uvV59bqkqEJx7TWKcGk6oIN87BcBQNZ8eM-8Z1VxKcZBFYrt5_m25_IFSmT0wxoA_NKi7bMMZoYYK_N79_-C_le2NwnPwGP5DE7Q260Yy6Oi5oziBWgfWy4d4oZpgvt3I81jSzrvL0NZs8pnwLtEv1eEBvsKYD2WMiPXC-LixXqBtvlJz3wHkWHyM493t1Tc-HlT5Gqpo.AT1_lBjdLix7";

      // 请替换为您的Mapbox访问令牌
      const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZGF5MzI3IiwiYSI6ImNtN2FpeWhtbzA0aDcycHB5eTBpNWw2MnIifQ.A9dTX6iqdgq_r9Nh5G-Njg';

      // 创建地图
      map = new Map({
        basemap: "arcgis/navigation"
      });

        // 创建地图视图
      view = new MapView({
          container: "viewDiv",
          map: map,
          center: [113.6401, 34.7236], // 郑州市中心坐标
          zoom: 12
        });


      const Levite_in = new FeatureLayer({
            url: 'https://www.geosceneonline.cn/server/rest/services/Hosted/羽化1/FeatureServer/17',
            renderer: {
              type: "simple",
              symbol: {
                //淡黄色
                type: "simple-fill",
                color: [255, 165, 0, 0.4], // 半透明
              }
            }
        })

        const Levite_out = new FeatureLayer({
            url: 'https://www.geosceneonline.cn/server/rest/services/Hosted/羽化2/FeatureServer/18',
            renderer: {
              type: "simple",
              symbol: {
                //橙色
                type: "simple-fill",
                color: [255, 165, 0, 0.1], // 半透明

              }

            }
        })

        map.add(Levite_out)
        map.add(Levite_in)

        // 创建图形图层用于显示等时圈
        const isochroneLayer = new GraphicsLayer();
        map.add(isochroneLayer);

        // 创建图形图层用于显示起点
        const pointLayer = new GraphicsLayer();
        map.add(pointLayer);

        let isochromeSelectionActive = false;

        // 添加底图切换控件
        const basemapToggle = new BasemapToggle({
          view: view,
          nextBasemap: "satellite"
        });
        view.ui.add(basemapToggle, "bottom-right");

        // 添加比例尺
        const scaleBar = new ScaleBar({
          view: view,
          unit: "metric"
        });
        view.ui.add(scaleBar, "bottom-left");

        // 添加Home按钮
        const homeBtn = new Home({
          view: view
        });
        view.ui.add(homeBtn, "top-left");

        // 等时圈颜色 - 直接使用 RGBA 数组格式
        const isochroneColors = [
          [[227, 82, 53, 0.7], [227, 82, 53, 1]],
          [[254, 244, 174, 0.6], [254, 244, 174, 1]],
          [[69, 115, 180, 0.5], [69, 115, 180, 1]],
        ];

        // 点击地图设置起点
        view.on("click", function (event) {
          // 获取点击位置的坐标
          if (!isochromeSelectionActive) {
            return;
          }
          const point = event.mapPoint;

          // 清除之前的点
          pointLayer.removeAll();

          // 添加新的点
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              color: [226, 119, 40],
              outline: {
                color: [255, 255, 255],
                width: 2
              },
              size: 12
            })
          });
          pointLayer.add(pointGraphic);
          // 更新坐标输入框
          document.getElementById("longitude").value = point.longitude.toFixed(6);
          document.getElementById("latitude").value = point.latitude.toFixed(6);
        });


        // 启动等时圈分析按钮点击事件
        document.getElementById("startIsochroneBtn").addEventListener("click", function () {
          // 切换等时圈选点模式状态
          isochromeSelectionActive = !isochromeSelectionActive;

          if (isochromeSelectionActive) {
            // 激活模式
            this.textContent = "关闭等时圈分析";
            this.style.backgroundColor = "#f44336";

            // 提示用户
            // alert("请在地图上点击选择等时圈分析的起点");
          } else {
            // 关闭模式
            this.textContent = "启动等时圈分析";
            this.style.backgroundColor = "#4CAF50";

            // 可选：清除已选择的点
            pointLayer.removeAll();
            document.getElementById("longitude").value = "113.6401";
            document.getElementById("latitude").value = "34.7236";
          }
        });


        // 分析按钮点击事件
        document.getElementById("analyzeBtn").addEventListener("click", function () {
          // 获取输入值
          const longitude = parseFloat(document.getElementById("longitude").value);
          const latitude = parseFloat(document.getElementById("latitude").value);
          const profile = document.getElementById("profile").value;


          // 获取用户设置的等时圈时间
          const minutes = [];
          for (let i = 1; i <= 3; i++) {
            const timeInput = document.getElementById(`time${i}`);
            const timeValue = parseInt(timeInput.value);
            if (!isNaN(timeValue) && timeValue > 0 && timeValue <= 120) {
              minutes.push(timeValue);
            }
          }


          // 验证输入
          if (isNaN(longitude) || isNaN(latitude)) {
            alert("请输入有效的经纬度坐标");
            return;
          }

          if (minutes.length === 0) {
            alert("请至少设置一个有效的等时圈时间（1-120分钟）");
            return;
          }
          // 对时间进行排序
          minutes.sort((a, b) => a - b);
          // 清除之前的等时圈
          isochroneLayer.removeAll();
          // 调用Mapbox Isochrone API
          getIsochrones(longitude, latitude, minutes, profile);
        });

        // 调用Mapbox Isochrone API获取等时圈数据
        function getIsochrones(longitude, latitude, minutes, profile) {
          // 更新图例
          updateLegend(minutes);

          // 构建API URL
          const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${longitude},${latitude}?contours_minutes=${minutes.join(',')}&polygons=true&access_token=${MAPBOX_ACCESS_TOKEN}`;

          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error('网络响应不正常');
              }
              return response.json();
            })
            .then(data => {
              // 处理返回的GeoJSON数据
              if (data && data.features) {
                // 正向遍历，较大的等时圈将显示在上面
                for (let i = 0; i < data.features.length; i++) {
                  const feature = data.features[i];
                  const contourMinutes = feature.properties.contour;
                  const colorIndex = minutes.indexOf(contourMinutes);

                  if (colorIndex !== -1) {
                    // 转换GeoJSON多边形为ArcGIS多边形
                    const rings = [];

                    // 处理多边形坐标
                    if (feature.geometry.type === "Polygon") {
                      feature.geometry.coordinates.forEach(ring => {
                        const arcgisRing = ring.map(coord => [coord[0], coord[1]]);
                        rings.push(arcgisRing);
                      });
                    }

                    const polygon = new Polygon({
                      rings: rings,
                      spatialReference: { wkid: 4326 }
                    });

                    // 创建填充符号
                    const fillSymbol = new SimpleFillSymbol({
                      color: isochroneColors[colorIndex][0],
                      outline: {
                        color: isochroneColors[colorIndex][1],
                        width: 1
                      }
                    });

                    // 创建图形并添加到图层
                    const graphic = new Graphic({
                      geometry: polygon,
                      symbol: fillSymbol,
                      attributes: {
                        minutes: contourMinutes
                      },
                      popupTemplate: {
                        title: "等时圈分析",
                        content: `从起点出发，${contourMinutes}分钟内可到达的区域`
                      }
                    });
                    isochroneLayer.add(graphic);
                  }
                }

                // 缩放到等时圈范围
                view.goTo(isochroneLayer.graphics);
              }
            })
            .catch(error => {
              console.error('获取等时圈数据出错:', error);
              alert('获取等时圈数据出错，请检查您的Mapbox访问令牌是否有效。');
            });
        }
        // 更新图例函数
        function updateLegend(minutes) {
          const legendContent = document.getElementById('legendContent');
          legendContent.innerHTML = '';

          minutes.forEach((minute, index) => {
            const color = isochroneColors[index] ? isochroneColors[index][0] : [100, 100, 100, 0.5];
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                        <div class="legend-color" style="background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});"></div>
                        <span>${minute}分钟</span>
                    `;
            legendContent.appendChild(legendItem);
          });
        }

        // 添加搜索小部件（不显示在界面上，仅用于地理编码）
        const searchWidget = new Search({
          view: view,
          popupEnabled: false,
          popupOpenOnSelect: false
        });

        // 修改分析按钮点击事件，增加对地名输入的检查
        document.getElementById("analyzeBtn").addEventListener("click", function () {
          // 检查是否已经搜索过地点
          const locationName = document.getElementById("locationInput").value.trim();
          const longitude = parseFloat(document.getElementById("longitude").value);
          const latitude = parseFloat(document.getElementById("latitude").value);

          // 如果有地名但没有经纬度，先进行地名搜索
          if (locationName && (isNaN(longitude) || isNaN(latitude))) {
            // 自动触发搜索按钮点击
            document.getElementById("searchLocationBtn").click();
            // 使用setTimeout等待搜索完成后再分析
            setTimeout(() => {
              // 重新获取经纬度
              const newLongitude = parseFloat(document.getElementById("longitude").value);
              const newLatitude = parseFloat(document.getElementById("latitude").value);
              if (!isNaN(newLongitude) && !isNaN(newLatitude)) {
                // 继续等时圈分析
                continueAnalysis(newLongitude, newLatitude);
              }
            }, 1500); // 等待1.5秒让搜索完成
            return;
          }
          // 直接进行分析
          continueAnalysis(longitude, latitude);
        });

        // 提取分析逻辑为单独函数
        function continueAnalysis(longitude, latitude) {
          const profile = document.getElementById("profile").value;
          // 获取用户设置的等时圈时间
          const minutes = [];
          for (let i = 1; i <= 3; i++) {
            const timeInput = document.getElementById(`time${i}`);
            const timeValue = parseInt(timeInput.value);
            if (!isNaN(timeValue) && timeValue > 0 && timeValue <= 120) {
              minutes.push(timeValue);
            }
          }
          // 验证输入
          if (isNaN(longitude) || isNaN(latitude)) {
            alert("请输入有效的地点名称或经纬度坐标");
            return;
          }
          if (minutes.length === 0) {
            alert("请至少设置一个有效的等时圈时间（1-120分钟）");
            return;
          }
          // 对时间进行排序
          minutes.sort((a, b) => a - b);
          // 清除之前的等时圈
          isochroneLayer.removeAll();
          // 调用Mapbox Isochrone API
          getIsochrones(longitude, latitude, minutes, profile);
        }

        // 地点搜索按钮点击事件
        document.getElementById("searchLocationBtn").addEventListener("click", function () {
          const locationName = document.getElementById("locationInput").value.trim();
          if (!locationName) {
            alert("请输入地点名称");
            return;
          }

          // 使用Search组件进行地理编码
          if (!searchWidget || typeof searchWidget.search !== 'function') {
            console.error('Search 组件尚未初始化，无法进行地理编码');
            alert('地图尚未初始化完成，暂时无法搜索起点');
            return;
          }
          searchWidget.search(locationName)
            .then(function (result) {
              if (result.results && result.results.length > 0) {
                const firstResult = result.results[0].results[0];
                const point = firstResult.feature.geometry;

                // 清除之前的点
                pointLayer.removeAll();

                // 添加新的点
                const pointGraphic = new Graphic({
                  geometry: point,
                  symbol: new SimpleMarkerSymbol({
                    color: [226, 119, 40],
                    outline: {
                      color: [255, 255, 255],
                      width: 2
                    },
                    size: 12
                  })
                });

                pointLayer.add(pointGraphic);
                // 缩放到搜索结果位置
                view.goTo({
                  target: point,
                  zoom: 14
                });

                // 保存经纬度（用于后续分析）
                document.getElementById("longitude").value = point.longitude.toFixed(6);
                document.getElementById("latitude").value = point.latitude.toFixed(6);
              } else {
                alert("未找到该地点，请尝试更精确的名称");
              }
            })
            .catch(function (error) {
              console.error("地理编码错误:", error);
              alert("搜索地点时出错，请稍后重试");
            });
        });

        // 清除等时圈按钮点击事件
        document.getElementById("clearIsochroneBtn").addEventListener("click", function () {
          // 清除等时圈图层和点图层
          isochroneLayer.removeAll();
          pointLayer.removeAll();

          // 清空地点输入框
          document.getElementById("locationInput").value = "";

          // 如果等时圈选点模式处于激活状态，重置它
          if (isochromeSelectionActive) {
            isochromeSelectionActive = false;
            const startBtn = document.getElementById("startIsochroneBtn");
            if (startBtn) {
              startBtn.textContent = "启动等时圈分析";
              startBtn.style.backgroundColor = "#4CAF50";
            } else {
              console.warn("未找到启动等时圈按钮(startIsochroneBtn)，请检查模板中的ID。");
            }
          }
        });



        // 创建图形图层用于显示路径
        const routeLayer = new GraphicsLayer();
        map.add(routeLayer);

        // 创建图形图层用于显示起点和终点
        const routePointsLayer = new GraphicsLayer();
        map.add(routePointsLayer);

        // 存储起点和终点坐标
        let startPoint = null;
        let endPoint = null;



        document.getElementById("searchStartBtn").addEventListener("click", function () {
          const locationName = document.getElementById("startLocationInput").value.trim();
          if (!locationName) {
            alert("请输入起点名称");
            return;
          }

          // 使用Search组件进行地理编码
          searchWidget.search(locationName)
            .then(function (result) {
              if (result.results && result.results.length > 0) {
                const firstResult = result.results[0].results[0];
                startPoint = firstResult.feature.geometry;

                // 检查是否已存在起点，如果存在则先清除
                routePointsLayer.graphics.some(function (graphic) {
                  if (graphic.attributes && graphic.attributes.type === "起点") {
                    routePointsLayer.remove(graphic);
                    return true;
                  }
                  return false;
                });

                // 添加起点标记
                addRoutePoint(startPoint, [0, 255, 0], "起点");

                // 缩放到搜索结果位置
                view.goTo({
                  target: startPoint,
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

        // 搜索终点按钮点击事件
        document.getElementById("searchEndBtn").addEventListener("click", function () {
          const locationName = document.getElementById("endLocationInput").value.trim();
          if (!locationName) {
            alert("请输入终点名称");
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


        // 添加路径点（起点或终点）
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

        // 计算路径按钮点击事件
        document.getElementById("calculateRouteBtn").addEventListener("click", function () {
          // 验证起点和终点
          if (!startPoint || !endPoint) {
            alert("请先设置起点和终点");
            return;
          }

          // 获取交通方式
          const profile = document.getElementById("routeProfile").value;

          // 清除之前的路径
          routeLayer.removeAll();

          // 调用Mapbox Directions API
          calculateRoute(startPoint.longitude, startPoint.latitude,
            endPoint.longitude, endPoint.latitude, profile,view,routeLayer);
        });

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

        // 添加地图点击事件，允许用户直接在地图上选择起点和终点
        view.on("click", function (event) {
          // 如果按住Shift键，则设置为起点
          if (event.native.shiftKey) {
            // 检查起点是否已存在
            const hasStartPoint = routePointsLayer.graphics.some(function (graphic) {
              return graphic.attributes && graphic.attributes.type === "起点";
            });

            startPoint = event.mapPoint;
            // 如果存在起点，先清除
            if (hasStartPoint) {
              routePointsLayer.graphics.some(function (graphic) {
                if (graphic.attributes && graphic.attributes.type === "起点") {
                  routePointsLayer.remove(graphic);
                  return true;
                }
                return false;
              });
            }
            addRoutePoint(startPoint, [0, 255, 0], "起点");
          }
          // 如果按住Ctrl键，则设置为终点
          else if (event.native.ctrlKey) {
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
            addRoutePoint(endPoint, [255, 0, 0], "终点");
          }
        });

        // 清除路径按钮点击事件
        document.getElementById("clearRouteBtn").addEventListener("click", function () {
          // 清除路径点和路径
          routePointsLayer.removeAll();
          routeLayer.removeAll();

          // 重置起点和终点变量
          startPoint = null;
          endPoint = null;

          // 隐藏路径信息
          document.getElementById("routeInfo").style.display = "none";
        });
      });
    // 将事件监听器的设置移到onMounted钩子中
  }

function initTrafficChart() {
  const chartDom = document.getElementById('edu');
  const myChart = echarts.init(chartDom);

  fetch('../../json/trans.json') // 注意 trans.json 要放到 public/json 下
    .then(response => response.json())
    .then(jsonData => {
      const areas = ['中原区', '二七区', '管城回族区', '金水区', '惠济区'];
      const hours = jsonData.map(item => item.Date);
      const timelineData = hours;

      // 计算全局最大值
      const maxValue = Math.max(...jsonData.flatMap(row => areas.map(a => row[a])));

      // 每个行政区固定颜色
      const areaColors = {
        '中原区': '#00BFFF',
        '二七区': '#FFD700',
        '管城回族区': '#FF7F50',
        '金水区': '#FF4500',
        '惠济区': '#8B0000',
      };

      // 构建每一帧 option（升序排序）
      const options = timelineData.map((hour, hIdx) => {
        const valueList = areas.map(area => ({
          area: area,
          value: jsonData[hIdx][area]
        }));
        valueList.sort((a, b) => a.value - b.value);
        const sortedAreas = valueList.map(item => item.area);
        const sortedValues = valueList.map(item => item.value);

        return {
          title: {
            text: `各区交通流量（${hour}时）`,
            left: 'center',
            top: 10
          },
          yAxis: {
            type: 'category',
            data: sortedAreas,
            name: '行政区',
            axisLabel: { fontWeight: 'bold', fontSize: 12 } // 字体更大
          },
          series: [{
            name: '交通流量',
            type: 'bar',
            data: sortedValues.map((v, i) => ({
              value: v,
              itemStyle: {
                color: areaColors[sortedAreas[i]] // 每个行政区固定颜色
              }
            })),
            label: {
              show: true,
              position: 'right',
              color: '#222',
              formatter: function (params) {
                return Math.floor(params.value); // 只取整数部分
              }
            },
            barWidth: 30
          }]
        };
      });

      // 主配置
      const option = {
        baseOption: {
          timeline: {
            axisType: 'category',
            autoPlay: true,
            playInterval: 1200,
            data: timelineData,
            left: '-4%',
            right: '1%',
            bottom: '2%',
            height: 40,
            symbol: 'circle',
            label: { formatter: '{value}时', fontSize: 12 }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: params => {
              if (!params.length) return '';
              return `${params[0].name}<br/>流量: ${params[0].value}`;
            }
          },
          grid: {
            left: '0%',  // 整个 y 轴往左移
            right: '8%',
            bottom: '18%',
            top: '18%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            name: '交通流量',
            min: 0,
            max: maxValue
          },
          yAxis: {
            type: 'category',
            data: areas,
            name: '行政区',
              axisLine: {
                show: true,
                lineStyle: {
                  color: '#ddd',   // 浅灰色
                  width: 1
                }
              },
            axisTick: { show: false },
            axisLabel:
              { fontWeight: 'bold',
                fontSize: 12
              },
                nameTextStyle:
              {
                color: '#000',      // 👈 只让“行政区”是黑色
                fontWeight: 'bold'  // 你也可以加粗
              },
          },
          series: [{ type: 'bar' }]
        },
        options: options
      };

      myChart.setOption(option);

      // 监听窗口变化
      window.addEventListener('resize', () => myChart.resize());

      // 在组件卸载时销毁图表
      onUnmounted(() => {
        myChart.dispose();
      });
    });
}

// 交通出行方式
function initTrafficStyleChart() {
    const chartDom = document.getElementById('age'); // 左上角容器
    if (!chartDom) {
        console.error("未找到 id 为 'age' 的元素");
        return;
    }
    const chart = echarts.init(chartDom);

    const data = [
        { value: 25, name: '地铁' },
        { value: 20, name: '公交' },
        { value: 18, name: '步行' },
        { value: 22, name: '驾车' },
        { value: 15, name: '其他' }
    ];

    const option = {
        color: ['#5886A5', '#FFD166', '#73C476', '#FF6F59', '#8FB339'],
        title: {
            text: '居民出行通勤方式占比',
            left: 'center',
            top: '2%'
        },
        tooltip: { trigger: 'item' },
        legend: { top: '10%', left: 'center' },
        series: [
            {
                name: '通勤方式占比',
                type: 'pie',
                radius: '60%',
                center: ['50%', '60%'],
                roseType: 'radius',
                itemStyle: { borderRadius: 10 },
                label: {
                    show: true,
                    fontSize: 14,
                    formatter: '{b}\n{d}%'
                },
                emphasis: {
                    label: { show: true, fontSize: 20, fontWeight: 'bold' }
                },
                data
            }
        ]
    };

    chart.setOption(option);

    window.addEventListener('resize', () => chart.resize());


    onUnmounted(() => {
        chart.dispose();
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

    initTrafficChart();
    initTrafficStyleChart();

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
  @import '../CSS/智慧交通.css';
  @import '../CSS/style.css';

</style>
