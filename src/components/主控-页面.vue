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
            <img src="../../asset/icon/home.svg" style="width: 18px" />
          </RouterLink>
        </div>
        <div class="title">郑州市城市管理一张图🗺️</div>
        <div class="user-info" v-if="userStore.userInfo.isLoggedIn">
          <span>{{ userStore.userInfo.username }}</span>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
        <i class="layui-icon layui-icon-spread-left"></i>
      </div>
      <transferPage />
      <div id="districtSelector">
        <ul>
          <li class="active area-btn" data-area="zhongyuan">中原区</li>
          <li class="area-btn" data-area="erqi">二七区</li>
          <li class="area-btn" data-area="guancheng">管城回族区</li>
          <li class="area-btn" data-area="jinshui">金水区</li>
          <li class="area-btn" data-area="huiji">惠济区</li>
          <li class="layer-btn active" data-layer="pop">安居乐业</li>
          <li class="layer-btn" data-layer="density">民生便利</li>
          <li class="layer-btn" data-layer="ndvi">生态宜人</li>
        </ul>
      </div>

    </div>
    <div class="side-div top-right">
      <div id="whr" class="chart-container"></div>
    </div>
    <div class="side-div bottom-right">
      <div id="language" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup lang="js">
  import { onMounted, onUnmounted } from 'vue';
  // import * as echarts from 'echarts';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '../stores/user';
  import transferPage from './跳转-过渡.vue'

  const router = useRouter();
  const userStore = useUserStore();

  // 退出登录处理
  const handleLogout = () => {
    userStore.logout();
    router.push('/login');
  };

  // 地图实例变量声明
  let map = null;
  let view = null;
  let hgRatioMale = null;
  let hgRatioFemale = null;
  let wgRatioMale = null;
  let wgRatioFemale = null;

  // 初始化地图
  const initMap = () => {
    // 使用ArcGIS的require加载必要模块
    window.require([
      "esri/Map",
      "esri/views/MapView",
      "esri/config",
      "esri/layers/FeatureLayer",
      "esri/widgets/Legend",
      "esri/widgets/Expand",
      "esri/smartMapping/renderers/relationship",
      "esri/Graphic",
      "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"
    ],
      (Map, MapView, config, FeatureLayer, Legend, Expand, relationship, Graphic, echarts) => {

        // 配置ArcGIS API密钥
        config.apiKey =
          "AAPTxy8BH1VEsoebNVZXo8HurFgltLjXSNfoH9uvV59bqkqEJx7TWKcGk6oIN87BcBQNZ8eM-8Z1VxKcZBFYrt5_m25_IFSmT0wxoA_NKi7bMMZoYYK_N79_-C_le2NwnPwGP5DE7Q260Yy6Oi5oziBWgfWy4d4oZpgvt3I81jSzrvL0NZs8pnwLtEv1eEBvsKYD2WMiPXC-LixXqBtvlJz3wHkWHyM493t1Tc-HlT5Gqpo.AT1_lBjdLix7";

        // 创建地图实例
        map = new Map({
          basemap: "arcgis/navigation"
        });

        // 视图
        view = new MapView({
          container: "viewDiv",
          map,
          center: [113.667, 34.765],
          zoom: 9.9,
          constraints: {
            snapToZoom: false   // 关键：允许非整数缩放
          }
        });



        // 加载主城区要素图层
        // 主城区要素图层渲染器
        const renderer = {
          type: "unique-value",
          field: "NAME", // 用 NAME 区分五个面
          uniqueValueInfos: [
            {
              value: "中原区",
              symbol: {
                type: "simple-fill",
                color: [230, 57, 70, 0.65],        // RGBA: 填充色+透明度
                outline: { color: [255, 255, 255, 1], width: 1 } // 白色描边增强对比
              },
              label: "中原区"
            },
            {
              value: "二七区",
              symbol: {
                type: "simple-fill",
                color: [29, 111, 191, 0.65],
                outline: { color: [255, 255, 255, 1], width: 1 }
              },
              label: "二七区"
            },
            {
              value: "管城回族区",
              symbol: {
                type: "simple-fill",
                color: [38, 166, 91, 0.65],
                outline: { color: [255, 255, 255, 1], width: 1 }
              },
              label: "管城回族区"
            },
            {
              value: "金水区",
              symbol: {
                type: "simple-fill",
                color: [255, 159, 28, 0.65],
                outline: { color: [255, 255, 255, 1], width: 1 }
              },
              label: "金水区"
            },
            {
              value: "惠济区",
              symbol: {
                type: "simple-fill",
                color: [156, 39, 176, 0.65],
                outline: { color: [255, 255, 255, 1], width: 1 }
              },
              label: "惠济区"
            }
          ]
        };
         const renderer2 = {
          type: "unique-value",
          field: "NAME", // 用 NAME 区分五个面
          uniqueValueInfos: [
            {
              value: "中原区",
              symbol: {
                type: "simple-fill",
                color:[255, 255, 255, 0],
                outline: { color: [0, 0, 0, 1,0.5], width: 1 } // 白色描边增强对比
              },
              label: "中原区"
            },
            {
              value: "二七区",
              symbol: {
                type: "simple-fill",
                color:[255, 255, 255, 0],
                outline: { color: [0, 0, 0, 1,0.5], width: 1 }
              },
              label: "二七区"
            },
            {
              value: "管城回族区",
              symbol: {
                type: "simple-fill",
                color:[255, 255, 255, 0],
                outline: { color: [0, 0, 0, 1,0.5], width: 1 }
              },
              label: "管城回族区"
            },
            {
              value: "金水区",
              symbol: {
                type: "simple-fill",
                color:[255, 255, 255, 0],
                outline: { color: [0, 0, 0, 1,0.5], width: 1 }
              },
              label: "金水区"
            },
            {
              value: "惠济区",
              symbol: {
                type: "simple-fill",
                color:[255, 255, 255, 0],
                outline: { color: [0, 0, 0, 1,0.5], width: 1 }
              },
              label: "惠济区"
            }
          ]
        };

        // 主城区图层标注设置
        const labeling = [{
          labelExpressionInfo: { expression: "$feature.NAME" },
          symbol: {
            type: "text",
            color: [20, 24, 35, 1],   // 深色文字
            haloColor: [255, 255, 255, 0.7],
            haloSize: 1.5,            // 1.5 pt
            font: {
              family: "Microsoft YaHei",
              size: 12,               // 初始字号；可配合缩放动态调整
              weight: "bold"
            }
          },
          labelPlacement: "center-center", // 面要素推荐用中心放置
          deconflictionStrategy: "static"  // 或 "dynamic"，看你的密度
        }];

        // 主城区要素图层创建 及 地图要素图层的添加
        const POILayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%AE%BE%E6%96%BD%E5%8D%A0%E6%AF%94/FeatureServer",
          title: "郑州区划",
          renderer,
          labelingInfo: labeling,
          labelsVisible: true
        });

        map.add(POILayer);
        // 添加L2街区要素图层（+ 人口数据）
        const L2LevelLayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/l2_SpatialJoin/FeatureServer",
          title: "街区",
          outFields: ["*"],
          blendMode: "normal",
          visible: false,   // ✅ 初始时隐藏
          renderer: {
            type: "simple", // 简单渲染器
            symbol: {
              type: "simple-fill", // 面填充符号
              color: [145, 204, 117],
              outline: {
                // color: [255, 255, 255, 1], // 白色描边
                width: 0.5
              }
            }
          }
        });

        map.add(L2LevelLayer);

        // NDVI要素图层渲染器（9个颜色分级）
        const ndviRenderer = {
          type: "class-breaks",
          field: "ZonalSt_l2_Spat2_MEAN",
          legendOptions: { title: "NDVI（红=低，绿=高）" },
          classBreakInfos: [
            {
              minValue: 0, maxValue: 0.2,
              symbol: { type: "simple-fill", color: "#f46d43", outline: { color: [255, 255, 255, 0.4], width: 0.3 } },
              label: "0.0 - 0.2"
            },
            {
              minValue: 0.2, maxValue: 0.3,
              symbol: { type: "simple-fill", color: "#fdae61", outline: { color: [255, 255, 255, 0.4], width: 0.3 } },
              label: "0.2 - 0.3"
            },
            {
              minValue: 0.3, maxValue: 0.4,
              symbol: { type: "simple-fill", color: "#fee08b", outline: { color: [255, 255, 255, 0.4], width: 0.3 } },
              label: "0.3 - 0.4"
            },
            {
              minValue: 0.4, maxValue: 0.5,
              symbol: { type: "simple-fill", color: "#d9ef8b", outline: { color: [255, 255, 255, 0.4], width: 0.3 } },
              label: "0.4 - 0.5"
            },
            {
              minValue: 0.5, maxValue: 1,
              symbol: { type: "simple-fill", color: "#a6d96a", outline: { color: [255, 255, 255, 0.4], width: 0.3 } },
              label: "≥ 0.5"
            },
          ]
        };

        // NDVI要素图层
        const NDVILayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/NDVI%E6%95%B0%E6%8D%AE/FeatureServer",
          title: "街区NDVI数据",
          renderer: ndviRenderer,
          visible: false,
        });
        map.add(NDVILayer);

        // 街区职住要素数据

        const PopLayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/ArcGIS/rest/services/职住人口二元变量/FeatureServer/0",
          title: "街区职住人口",
          outFields: ["*"],        // 保障统计有字段
          visible: false
        });
        map.add(PopLayer);

        Promise.all([view.when(), PopLayer.when()]).then(() => {
          PopLayer.definitionExpression = "home IS NOT NULL AND work_ IS NOT NULL";
          view.goTo(PopLayer.fullExtent).catch(() => { });
          const params = {
            layer: PopLayer,
            view: view,
            field1: { field: "home" },
            field2: { field: "work_" },   // ← 关键：真实字段名有下划线
            numClasses: 3,
            focus: "HH",
          };
          return relationship.createRenderer(params);
        }).then(({ renderer }) => {
          // 自定义 9 个格子的颜色
          const customColors = {
            "LL": "#f7f4f9",  // home低, work低 → 很浅的灰粉
            "LM": "#fddde6",  // 低-中 → 浅粉
            "LH": "#fca4b6",  // 低-高 → 中粉
            "ML": "#fde0ef",  // 中-低 → 淡粉紫
            "MM": "#e7cbe2",  // 中-中 → 粉紫
            "MH": "#b3e2cd",  // 中-高 → 淡青绿
            "HL": "#ccebc5",  // 高-低 → 浅绿
            "HM": "#80cdc1",  // 高-中 → 青绿
            "HH": "#35978f"   // 高-高 → 深绿青
          };
          renderer.uniqueValueInfos.forEach((info) => {
            let color = customColors[info.value] || "#cccccc";
            info.symbol = {
              type: "simple-fill",
              color: color,
              outline: { color: "#ffffff", width: 0.3 }
            };
          });
          renderer.defaultLabel = "无数据";
          renderer.defaultSymbol = {
            type: "simple-fill",
            color: [230, 230, 230, 0.2],
            outline: { color: "#999", width: 0.25 }
          };

          PopLayer.renderer = renderer;
        }).catch(err => {
          console.error("关系渲染器失败：", err);
        });

        // 设施密度分级渲染器
        const densityRenderer = {
          type: "class-breaks",
          field: "intensity",
          legendOptions: { title: "设施密度（单位/平方公里）" },
          classBreakInfos: [
            {
              minValue: 0,
              maxValue: 0.5,
              symbol: { type: "simple-fill", color: "#f7fbff", outline: { color: "#999999", width: 0.3 } },
              label: "≤ 2.34"
            },
            {
              minValue: 0.5,
              maxValue: 1,
              symbol: { type: "simple-fill", color: "#c6dbef", outline: { color: "#999999", width: 0.3 } },
              label: "2.34 - 4.68"
            },
            {
              minValue: 1,
              maxValue: 5.02,
              symbol: { type: "simple-fill", color: "#6baed6", outline: { color: "#999999", width: 0.3 } },
              label: "4.68 - 7.02"
            },
            {
              minValue: 5.02,
              maxValue: 9.36,
              symbol: { type: "simple-fill", color: "#2171b5", outline: { color: "#999999", width: 0.3 } },
              label: "7.02 - 9.36"
            },
            {
              minValue: 9.36,
              maxValue: 11.8,
              symbol: { type: "simple-fill", color: "#08306b", outline: { color: "#999999", width: 0.3 } },
              label: "≥ 9.36"
            }
          ]
        };

        // 设施密度人口要素图层创建 及 地图要素图层的添加
        const DensityLayer = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%A1%97%E5%8C%BA%E8%AE%BE%E6%96%BD%E5%AF%86%E5%BA%A6/FeatureServer",
          title: "街区设施密度",
          renderer: densityRenderer,
          visible: false,
        });
        map.add(DensityLayer);

        // === 职住出行图层与交互（替代“安居乐业”）开始 ===
        // Origin 图层（点击后触发显示方向与主图层）
        const SubwayOrigin = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/0",
          title: "地铁出行",
          outFields: ["*"],
          visible: false,
          popupEnabled: true,
          popupTemplate: {
            title: "地铁出行",
            content: []
          }
        });
        const DrivingOrigin = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/3",
          title: "驾车出行",
          outFields: ["*"],
          visible: false,
          popupEnabled: true,
          popupTemplate: {
            title: "驾车出行",
            content: []
          }
        });
        const TransitOrigin = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/6",
          title: "公交出行",
          outFields: ["*"],
          visible: false,
          popupEnabled: true,
          popupTemplate: {
            title: "公交出行",
            content: []
          }
        });
        map.addMany([SubwayOrigin, DrivingOrigin, TransitOrigin]);

        // 动态构建弹窗字段，确保只展示有效字段
        function setupPopupTemplate(layer) {
          layer.load().then(() => {
            const fieldInfos = layer.fields
              .filter(f => !["geometry", "blob", "raster", "guid", "global-id"].includes(f.type))
              .map(f => {
                const info = { fieldName: f.name, label: f.alias || f.name };
                if (["double", "single", "float", "small-integer", "integer", "long"].includes(f.type)) {
                  info.format = { digitSeparator: true, places: 0 };
                }
                if (f.type === "date") {
                  info.format = { dateFormat: "short-date" };
                }
                return info;
              });
            const hasNAME = layer.fields.some(f => f.name === "NAME");
            const popupTitle = hasNAME ? "{NAME}" : layer.title;
            layer.popupTemplate = { title: popupTitle, content: [{ type: "fields", fieldInfos }] };
          });
        }
        setupPopupTemplate(SubwayOrigin);
        setupPopupTemplate(DrivingOrigin);
        setupPopupTemplate(TransitOrigin);

        // Direction 与 主图层（点击 Origin 后按 o_grid/d_grid 筛选显示）
        const SubwayDirection = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/1",
          title: "SubwayDirection",
          outFields: ["*"],
          visible: false,
          popupEnabled: false
        });
        const Subway = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/2",
          title: "Subway",
          outFields: ["*"],
          visible: false,
          popupEnabled: false
        });
        const DrivingDirection = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/4",
          title: "DrivingDirection",
          outFields: ["*"],
          visible: false,
          popupEnabled: false
        });
        const Driving = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/5",
          title: "Driving",
          outFields: ["*"],
          visible: false,
          popupEnabled: false
        });
        const TransitDirection = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/7",
          title: "TransitDirection",
          outFields: ["*"],
          visible: false,
          popupEnabled: false
        });
        const Transit = new FeatureLayer({
          url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/8",
          title: "Transit",
          outFields: ["*"],
          visible: false,
          popupEnabled: false
        });
        map.addMany([SubwayDirection, Subway, DrivingDirection, Driving, TransitDirection, Transit]);

        // 缓存 LayerView 与高亮句柄
        let directionLayerView, subwayLayerView, directionHighlight, subwayHighlight;
        let drivingDirectionLayerView, drivingLayerView, drivingDirectionHighlight, drivingHighlight;
        let transitDirectionLayerView, transitLayerView, transitDirectionHighlight, transitHighlight;

        view.whenLayerView(SubwayDirection).then(lv => { directionLayerView = lv; });
        view.whenLayerView(Subway).then(lv => { subwayLayerView = lv; });
        view.whenLayerView(DrivingDirection).then(lv => { drivingDirectionLayerView = lv; });
        view.whenLayerView(Driving).then(lv => { drivingLayerView = lv; });
        view.whenLayerView(TransitDirection).then(lv => { transitDirectionLayerView = lv; });
        view.whenLayerView(Transit).then(lv => { transitLayerView = lv; });

        // 工具函数
        function findFieldName(fields, name) {
          const lower = name.toLowerCase();
          const f = fields.find(fi => fi.name.toLowerCase() === lower);
          return f ? f.name : name;
        }
        function buildWhere(layer, oFieldName, dFieldName, oValue, dValue) {
          const fields = layer.fields || [];
          const findBy = (n) => {
            const f = fields.find(fi => fi.name.toLowerCase() === n.toLowerCase());
            return f ? f.name : null;
          };
          const oName = findBy(oFieldName) || findBy('o_grid') || oFieldName || 'o_grid';
          const dName = findBy(dFieldName) || findBy('d_grid') || dFieldName || 'd_grid';
          const oField = fields.find(f => f.name === oName);
          const dField = fields.find(f => f.name === dName);
          const oIsString = oField ? oField.type === 'string' : (typeof oValue === 'string');
          const dIsString = dField ? dField.type === 'string' : (typeof dValue === 'string');
          const esc = (v) => String(v).replace(/'/g, "''");
          const oValStr = oIsString ? `'${esc(oValue)}'` : `${oValue}`;
          const dValStr = dIsString ? `'${esc(dValue)}'` : `${dValue}`;
          return `${oName} = ${oValStr} AND ${dName} = ${dValStr}`;
        }
        function getSymbol(geometry) {
          const c = '#00FFFF';
          if (!geometry) return { type: 'simple-marker', color: c, size: 8 };
          switch (geometry.type) {
            case 'point':
            case 'multipoint':
              return { type: 'simple-marker', color: c, size: 12, outline: { color: '#003333', width: 1.5 } };
            case 'polyline':
              return { type: 'simple-line', color: c, width: 4 };
            case 'polygon':
              return { type: 'simple-fill', color: [0, 255, 255, 0.15], outline: { color: c, width: 2 } };
            default:
              return { type: 'simple-marker', color: c, size: 8 };
          }
        }

        // 点击 Origin 要素时，高亮并显示对应 Direction 与主图层要素
        view.on('click', async (event) => {
          try {
            const hit = await view.hitTest(event);

            let originLayer, directionLayer, mainLayer, directionLayerViewRef, mainLayerViewRef;
            const subwayOriginRes = hit.results.find(r => r.graphic && r.graphic.layer === SubwayOrigin);
            const drivingOriginRes = hit.results.find(r => r.graphic && r.graphic.layer === DrivingOrigin);
            const transitOriginRes = hit.results.find(r => r.graphic && r.graphic.layer === TransitOrigin);

            if (subwayOriginRes) {
              originLayer = SubwayOrigin; directionLayer = SubwayDirection; mainLayer = Subway;
              directionLayerViewRef = () => directionLayerView; mainLayerViewRef = () => subwayLayerView;
            } else if (drivingOriginRes) {
              originLayer = DrivingOrigin; directionLayer = DrivingDirection; mainLayer = Driving;
              directionLayerViewRef = () => drivingDirectionLayerView; mainLayerViewRef = () => drivingLayerView;
            } else if (transitOriginRes) {
              originLayer = TransitOrigin; directionLayer = TransitDirection; mainLayer = Transit;
              directionLayerViewRef = () => transitDirectionLayerView; mainLayerViewRef = () => transitLayerView;
            } else {
              return; // 非 Origin 图层点击不处理
            }

            const originRes = subwayOriginRes || drivingOriginRes || transitOriginRes;
            await Promise.all([originLayer.load(), directionLayer.load(), mainLayer.load()]);

            const g = originRes.graphic; const attrs = g.attributes || {};
            const oFieldName = findFieldName(originLayer.fields, 'o_grid');
            const dFieldName = findFieldName(originLayer.fields, 'd_grid');
            const oVal = attrs[oFieldName]; const dVal = attrs[dFieldName];
            if (oVal == null || dVal == null) { console.warn(`点击的 ${originLayer.title} 要素缺少 o_grid 或 d_grid 字段`); return; }

            // 清理上一次的高亮与临时图形
            if (directionHighlight) directionHighlight.remove();
            if (subwayHighlight) subwayHighlight.remove();
            if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
            if (drivingHighlight) drivingHighlight.remove();
            if (transitDirectionHighlight) transitDirectionHighlight.remove();
            if (transitHighlight) transitHighlight.remove();
            view.graphics.removeAll();

            // 隐藏所有 Direction 与主图层
            SubwayDirection.visible = false; Subway.visible = false;
            DrivingDirection.visible = false; Driving.visible = false;
            TransitDirection.visible = false; Transit.visible = false;

            // 设置过滤条件并显示
            const dirWhere = buildWhere(directionLayer, oFieldName, dFieldName, oVal, dVal);
            const mainWhere = buildWhere(mainLayer, oFieldName, dFieldName, oVal, dVal);
            directionLayer.definitionExpression = dirWhere; mainLayer.definitionExpression = mainWhere;
            directionLayer.visible = true; mainLayer.visible = true;

            const [dirFS, mainFS] = await Promise.all([
              directionLayer.queryFeatures({ where: dirWhere, outFields: ['*'], returnGeometry: true }),
              mainLayer.queryFeatures({ where: mainWhere, outFields: ['*'], returnGeometry: true })
            ]);

            const dirLV = directionLayerViewRef(); const mainLV = mainLayerViewRef();
            if (dirLV && dirFS.features.length) {
              if (originLayer === SubwayOrigin) directionHighlight = dirLV.highlight(dirFS.features);
              else if (originLayer === DrivingOrigin) drivingDirectionHighlight = dirLV.highlight(dirFS.features);
              else if (originLayer === TransitOrigin) transitDirectionHighlight = dirLV.highlight(dirFS.features);
            }
            if (mainLV && mainFS.features.length) {
              if (originLayer === SubwayOrigin) subwayHighlight = mainLV.highlight(mainFS.features);
              else if (originLayer === DrivingOrigin) drivingHighlight = mainLV.highlight(mainFS.features);
              else if (originLayer === TransitOrigin) transitHighlight = mainLV.highlight(mainFS.features);
            }

            const tempGraphics = [];
            dirFS.features.forEach(f => tempGraphics.push(new Graphic({ geometry: f.geometry, symbol: getSymbol(f.geometry), attributes: f.attributes })));
            mainFS.features.forEach(f => tempGraphics.push(new Graphic({ geometry: f.geometry, symbol: getSymbol(f.geometry), attributes: f.attributes })));
            view.graphics.addMany(tempGraphics);

            const features = dirFS.features.concat(mainFS.features);
            if (features.length) { view.goTo(features).catch(() => { }); }
            else {
              console.warn(`没有找到满足条件的 ${originLayer.title} 相关要素`);
              directionLayer.visible = false; mainLayer.visible = false;
            }
          } catch (e) { console.error('点击筛选并渲染标示时出错：', e); }
        });

        // 出行方式选择器（Expand）
        const travelModeContainer = document.createElement('div');
        travelModeContainer.style.cssText = `
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-family: Arial, sans-serif;`;
        const title = document.createElement('div');
        title.textContent = '出行方式选择';
        title.style.cssText = `font-weight: bold; margin-bottom: 10px; color: #333; font-size: 14px;`;
        travelModeContainer.appendChild(title);
        const modes = [
          { id: 'subway', label: '地铁出行', layer: SubwayOrigin, checked: true },
          { id: 'driving', label: '驾车出行', layer: DrivingOrigin, checked: false },
          { id: 'transit', label: '公交出行', layer: TransitOrigin, checked: false }
        ];
        modes.forEach(mode => {
          const radioContainer = document.createElement('div');
          radioContainer.style.cssText = `margin: 5px 0; display: flex; align-items: center;`;
          const radio = document.createElement('input');
          radio.type = 'radio'; radio.name = 'travelMode'; radio.id = mode.id; radio.checked = mode.checked; radio.style.marginRight = '8px';
          const label = document.createElement('label');
          label.htmlFor = mode.id; label.textContent = mode.label; label.style.cssText = `cursor: pointer; font-size: 13px; color: #555;`;
          radio.addEventListener('change', () => {
            if (radio.checked) {
              // 隐藏所有 Origin 与 Direction/主图层
              SubwayOrigin.visible = false; DrivingOrigin.visible = false; TransitOrigin.visible = false;
              SubwayDirection.visible = false; Subway.visible = false; DrivingDirection.visible = false; Driving.visible = false; TransitDirection.visible = false; Transit.visible = false;
              // 清理高亮与临时图形
              if (directionHighlight) directionHighlight.remove();
              if (subwayHighlight) subwayHighlight.remove();
              if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
              if (drivingHighlight) drivingHighlight.remove();
              if (transitDirectionHighlight) transitDirectionHighlight.remove();
              if (transitHighlight) transitHighlight.remove();
              view.graphics.removeAll();
              // 显示选中的 Origin
              mode.layer.visible = true;
              // 将 Origin 图层置顶，确保可点击
              map.reorder(POILayer, 1);
              map.reorder(mode.layer, 0);
            }
          });
          radioContainer.appendChild(radio); radioContainer.appendChild(label); travelModeContainer.appendChild(radioContainer);
        });
        const travelModeExpand = new Expand({
          content: travelModeContainer,
          expandIconClass: 'esri-icon-directions',
          expandTooltip: '选择出行方式',
          collapseTooltip: '收起出行方式选择器',
          expanded: false
        });
        view.ui.add(travelModeExpand, 'top-right');
        // 默认不显示任何 Origin 图层，待点击“安居乐业”后由按钮控制显示
        SubwayOrigin.visible = false; DrivingOrigin.visible = false; TransitOrigin.visible = false;
        // === 职住出行图层与交互结束 ===

        // 图例
        const legend = new Legend({
          view: view,
        });
        const legendExpand = new Expand({
          view: view,
          content: legend,
          expanded: false, // 默认折叠
          expandIconClass: "esri-icon-legend" // 图标可选
        });
        // 图例说明
        view.ui.add(legendExpand, "top-right")
        let districtName = "郑州市主城区"

        // 初始化区域选择器(主页下方的按钮)的点击事件 默认查询中原区
        function initDistrictSelector() {
          // 定义变量items 为 页面中所有'#districtSelector li'元素的集合
          const items = document.querySelectorAll('#districtSelector li');

          // 遍历每个item
          items.forEach(item => {
            // 为每个item 添加点击事件
            item.addEventListener('click', function () {
              // 获取点击的区域名称
             districtName = this.textContent;
             if (districtName == "安居乐业" || districtName == "生态宜人" || districtName == "民生便利") {
              districtName = "郑州市主城区"
             }
              // 调用查询函数
              queryDistrict(districtName);
              // 图表变化
              ChartChange(districtName);
            });
          });

          // 默认查询中原区
          queryDistrict('郑州市主城区');
          ChartChange('郑州市主城区');
        }
        view.when(() => {
          const layerButtons = document.querySelectorAll(".layer-btn");

          layerButtons.forEach(btn => {
            btn.addEventListener("click", function () {

              layerButtons.forEach(b => b.classList.remove("active"));
              this.classList.add("active");

              const layerType = this.getAttribute("data-layer");


              switch (layerType) {
                case "pop": // 点击“安居乐业”
                  // 使用职-住.vue 的出行功能替代原人口关系图层
                  PopLayer.visible = false; // 不再显示原“街区职住人口”图层
                  // 主城区边界改为透明描边
                  POILayer.visible = false;

                  // 默认显示地铁 Origin 图层，可通过右上角选择器切换
                  SubwayOrigin.visible = true;
                  DrivingOrigin.visible = false;
                  TransitOrigin.visible = false;

                  // 隐藏其它专题图层
                  DensityLayer.visible = false; // 隐藏民生便利（设施密度）
                  NDVILayer.visible = false; // 隐藏生态宜人（NDVI）

                  // 隐藏所有 Direction 与主图层
                  SubwayDirection.visible = false; Subway.visible = false;
                  DrivingDirection.visible = false; Driving.visible = false;
                  TransitDirection.visible = false; Transit.visible = false;

                  // 清理所有高亮与临时图形
                  if (directionHighlight) directionHighlight.remove();
                  if (subwayHighlight) subwayHighlight.remove();
                  if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
                  if (drivingHighlight) drivingHighlight.remove();
                  if (transitDirectionHighlight) transitDirectionHighlight.remove();
                  if (transitHighlight) transitHighlight.remove();
                  view.graphics.removeAll();

                  // 将当前 Origin 图层置顶，确保可点击
                  map.reorder(SubwayOrigin, 0);
                  break;

                case "density":
                  // 隐藏职住出行相关图层
                  SubwayOrigin.visible = false; DrivingOrigin.visible = false; TransitOrigin.visible = false;
                  SubwayDirection.visible = false; Subway.visible = false; DrivingDirection.visible = false; Driving.visible = false; TransitDirection.visible = false; Transit.visible = false;
                  if (directionHighlight) directionHighlight.remove();
                  if (subwayHighlight) subwayHighlight.remove();
                  if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
                  if (drivingHighlight) drivingHighlight.remove();
                  if (transitDirectionHighlight) transitDirectionHighlight.remove();
                  if (transitHighlight) transitHighlight.remove();
                  view.graphics.removeAll();

                  DensityLayer.visible = true;
                  POILayer.renderer = renderer2;
                  map.reorder(POILayer,1)
                  map.reorder(DensityLayer,0)
                  PopLayer.visible = false;
                  NDVILayer.visible = false;
                  break;

                case "ndvi":
                  // 隐藏职住出行相关图层
                  SubwayOrigin.visible = false; DrivingOrigin.visible = false; TransitOrigin.visible = false;
                  SubwayDirection.visible = false; Subway.visible = false; DrivingDirection.visible = false; Driving.visible = false; TransitDirection.visible = false; Transit.visible = false;
                  if (directionHighlight) directionHighlight.remove();
                  if (subwayHighlight) subwayHighlight.remove();
                  if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
                  if (drivingHighlight) drivingHighlight.remove();
                  if (transitDirectionHighlight) transitDirectionHighlight.remove();
                  if (transitHighlight) transitHighlight.remove();
                  view.graphics.removeAll();

                  NDVILayer.visible = true;
                  POILayer.renderer = renderer2;
                  map.reorder(POILayer,1)
                  map.reorder(NDVILayer,0)
                  PopLayer.visible = false;
                  DensityLayer.visible = false;
                  break;

                default:
                  // 隐藏职住出行相关图层
                  SubwayOrigin.visible = false; DrivingOrigin.visible = false; TransitOrigin.visible = false;
                  SubwayDirection.visible = false; Subway.visible = false; DrivingDirection.visible = false; Driving.visible = false; TransitDirection.visible = false; Transit.visible = false;
                  if (directionHighlight) directionHighlight.remove();
                  if (subwayHighlight) subwayHighlight.remove();
                  if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
                  if (drivingHighlight) drivingHighlight.remove();
                  if (transitDirectionHighlight) transitDirectionHighlight.remove();
                  if (transitHighlight) transitHighlight.remove();
                  view.graphics.removeAll();

                  PopLayer.visible = false;
                  DensityLayer.visible = false;
                  NDVILayer.visible = false;
                  POILayer.visible = true;
              }
            });
          });
        });

        // 等待地图视图加载完成后 在执行括号中的代码
        view.when(() => {

          // 首页home按钮点击事件
          const homeIcon = document.querySelector(".home-icon");
          homeIcon.addEventListener("click", () => {
            // 重置地图视图 至 郑州市主城区
            //将districtName 重置为 郑州市主城区
            // 将Echarts图改为 郑州市主城区的图表

            districtName = "郑州市主城区"
            queryDistrict(districtName);
            PopLayer.visible = false;
            DensityLayer.visible = false;
            NDVILayer.visible = false;
            POILayer.visible = true;
            POILayer.renderer = renderer;

            // 隐藏职住出行相关图层并清理高亮与临时图形
            SubwayOrigin.visible = false; DrivingOrigin.visible = false; TransitOrigin.visible = false;
            SubwayDirection.visible = false; Subway.visible = false; DrivingDirection.visible = false; Driving.visible = false; TransitDirection.visible = false; Transit.visible = false;
            if (directionHighlight) directionHighlight.remove();
            if (subwayHighlight) subwayHighlight.remove();
            if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
            if (drivingHighlight) drivingHighlight.remove();
            if (transitDirectionHighlight) transitDirectionHighlight.remove();
            if (transitHighlight) transitHighlight.remove();
            view.graphics.removeAll();

            view.goTo({
              center: [113.667, 34.765],
              zoom: 10,
            });

            // 重置区域选择器中的活动项，将所有区域设置为不选中
            const districtItems = document.querySelectorAll("#districtSelector li");
            districtItems.forEach((item) => {
              item.classList.remove("active");
            });

            // 获取所有行政区名称
            const areas = ['中原区', '二七区', '管城回族区', '金水区', '惠济区', '郑州市主城区'];

            // 重置图表图例选择状态，将所有区域设置为不选中

            // 设置图表 图例选择状态
            areas.forEach(area => {
              // TransOption设置为选中所有区域
              TransOption.legend.selected[area] = true;

              // AQIoption只选中"郑州市主城区"
              AQIoption.legend.selected[area] = (area === '郑州市主城区');
            });

            // 应用更新后的配置
            myChart.setOption(TransOption);
            myAQIChart.setOption(AQIoption);
          });

          // 区域设施图
          initDistrictSelector();

          // 区域切换功能
          const areaButtons = document.querySelectorAll(".area-btn");

          // 设置中心点的经纬度
          const centerPoints = {
            "zhongyuan": [113.51189, 34.77105],
            "erqi": [113.60501, 34.68392],
            "guancheng": [113.7385, 34.68392],
            "jinshui": [113.7385, 34.80992],
            "huiji": [113.62850, 34.87125]
          };

          areaButtons.forEach(btn => {
            btn.addEventListener("click", function () {
              // 移除所有按钮的active类
              areaButtons.forEach(b => b.classList.remove("active"));
              // 给当前点击的按钮添加active类
              this.classList.add("active");

              // 解释一下
              const areaId = this.getAttribute("data-area");

              // 使用ArcGIS API移动地图到相应区域
              if (centerPoints[areaId]) {
                // 先缩小一点
                view.goTo({
                  center: centerPoints[areaId],
                  zoom: 11
                }, {
                  duration: 1000,
                  easing: "ease-in-out"
                })
              }
            });
          });
        });

        // 创建查询对象
        const staQuery = L2LevelLayer.createQuery();

        // 定义统计字段
        staQuery.outStatistics = [
          {
            // 要统计的原始字段
            onStatisticField: "w_geder3",
            // 统计结果输出时的字段名
            outStatisticFieldName: "w_geder3",
            // 统计类型
            statisticType: "sum"
          },
          {
            onStatisticField: "w_geder2",
            outStatisticFieldName: "w_geder2",
            statisticType: "sum"
          },
          {
            onStatisticField: "w_geder1",
            outStatisticFieldName: "w_geder1",
            statisticType: "sum"
          },
          {
            onStatisticField: "w_age4",
            outStatisticFieldName: "w_age4",
            statisticType: "sum"
          },
          {
            onStatisticField: "w_age3",
            outStatisticFieldName: "w_age3",
            statisticType: "sum"
          },
          {
            onStatisticField: "w_age2",
            outStatisticFieldName: "w_age2",
            statisticType: "sum"
          },
          {
            onStatisticField: "w_age1",
            outStatisticFieldName: "w_age1",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_geder3",
            outStatisticFieldName: "h_geder3",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_geder2",
            outStatisticFieldName: "h_geder2",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_geder1",
            outStatisticFieldName: "h_geder1",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_age4",
            outStatisticFieldName: "h_age4",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_age3",
            outStatisticFieldName: "h_age3",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_age2",
            outStatisticFieldName: "h_age2",
            statisticType: "sum"
          },
          {
            onStatisticField: "h_age1",
            outStatisticFieldName: "h_age1",
            statisticType: "sum"
          }
        ];

        // 执行查询统计
        L2LevelLayer.queryFeatures(staQuery).then(
          (result) => {
            // 定义变量记录查询结果
            const staResult = result

            // 检查查询结果是否为空
            if (!staResult || !staResult.features || staResult.features.length === 0) {
              console.log('没有统计数据可供处理');
              return null;
            }

            // 获取统计数据
            const statData = staResult.features[0].attributes;

            // 计算职住人口/常住人口 性别比例
            hgRatioMale = statData.h_geder1 / (statData.h_geder1 + statData.h_geder2)
            hgRatioFemale = statData.h_geder2 / (statData.h_geder1 + statData.h_geder2)
            wgRatioMale = statData.w_geder1 / (statData.w_geder1 + statData.w_geder2)
            wgRatioFemale = statData.w_geder2 / (statData.w_geder1 + statData.w_geder2)

            // 把数据加工成echarts图表可以直接用的数据格式
            // 职住人口/常住人口 性别男/女 具体的数量
            const chartData = {
              // 年龄段1、2、3、4 性别男 常住人口 的 具体数量
              h_ageData_M: [
                { name: '年龄1', value: (statData.h_age1 * hgRatioMale).toFixed(0) },
                { name: '年龄2', value: (statData.h_age2 * hgRatioMale).toFixed(0) },
                { name: '年龄3', value: (statData.h_age3 * hgRatioMale).toFixed(0) },
                { name: '年龄4', value: (statData.h_age4 * hgRatioMale).toFixed(0) }
              ],
              // 年龄段1、2、3、4 性别女 常住人口 的 具体数量
              h_ageData_F: [
                { name: '年龄1', value: (statData.h_age1 * hgRatioFemale).toFixed(0) },
                { name: '年龄2', value: (statData.h_age2 * hgRatioFemale).toFixed(0) },
                { name: '年龄3', value: (statData.h_age3 * hgRatioFemale).toFixed(0) },
                { name: '年龄4', value: (statData.h_age4 * hgRatioFemale).toFixed(0) }
              ],
              // 年龄段1、2、3、4 性别男 职住人口 的 具体数量
              w_ageData_M: [
                { name: '年龄1', value: (statData.w_age1 * wgRatioMale).toFixed(0) },
                { name: '年龄2', value: (statData.w_age2 * wgRatioMale).toFixed(0) },
                { name: '年龄3', value: (statData.w_age3 * wgRatioMale).toFixed(0) },
                { name: '年龄4', value: (statData.w_age4 * wgRatioMale).toFixed(0) }
              ],
              // 年龄段1、2、3、4 性别女 职住人口 的 具体数量
              w_ageData_F: [
                { name: '年龄1', value: (statData.w_age1 * wgRatioFemale).toFixed(0) },
                { name: '年龄2', value: (statData.w_age2 * wgRatioFemale).toFixed(0) },
                { name: '年龄3', value: (statData.w_age3 * wgRatioFemale).toFixed(0) },
                { name: '年龄4', value: (statData.w_age4 * wgRatioFemale).toFixed(0) }
              ],
            };

            // 定义一个echarts的option(配置项)
            let option = {
              // 标题
              title: {
                text: '郑州市职住人口年龄结构',
                left: 'center',  // 标题居中
                top: '10%'
              },
              // 提示框
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  // Use axis to trigger tooltip
                  type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
              },
              // 图例
              legend: {
                show: true,
                selectedMode: 'multiple',
                selected: {
                  '18岁以下': false,
                }
              },
              // 网格布局
              grid: {
                left: '3%',
                right: '0%',
                bottom: '3%',
                containLabel: true
              },
              xAxis: {
                type: 'value'
              },
              yAxis: {
                type: 'category',
                data: ['住/男', '工/男', '住/女', '工/女']
              },
              series: [
                {
                  name: '18岁以下',
                  type: 'bar',
                  stack: 'total',
                  label: {
                    show: false
                  },
                  emphasis: {
                    focus: 'series'
                  },
                  data: [
                    chartData.h_ageData_M[0].value,
                    chartData.w_ageData_M[0].value,
                    chartData.h_ageData_F[0].value,
                    chartData.w_ageData_F[0].value
                  ]
                },
                {
                  name: '19-34',
                  type: 'bar',
                  stack: 'total',
                  label: {
                    show: false
                  },
                  emphasis: {
                    focus: 'series'
                  },
                  data: [
                    chartData.h_ageData_M[1].value,
                    chartData.w_ageData_M[1].value,
                    chartData.h_ageData_F[1].value,
                    chartData.w_ageData_F[1].value
                  ]
                },
                {
                  name: '35-64',
                  type: 'bar',
                  stack: 'total',
                  label: {
                    show: false
                  },
                  emphasis: {
                    focus: 'series'
                  },
                  data: [
                    chartData.h_ageData_M[2].value,
                    chartData.w_ageData_M[2].value,
                    chartData.h_ageData_F[2].value,
                    chartData.w_ageData_F[2].value
                  ]
                },
                {
                  name: '65以上',
                  type: 'bar',
                  stack: 'total',
                  label: {
                    show: false
                  },
                  emphasis: {
                    focus: 'series'
                  },
                  data: [
                    chartData.h_ageData_M[3].value,
                    chartData.w_ageData_M[3].value,
                    chartData.h_ageData_F[3].value,
                    chartData.w_ageData_F[3].value
                  ]
                }
              ]
            };

            // 初始化图表
            const h_ageChart = echarts.init(document.getElementById('age'));

            // 配置图表的内容
            h_ageChart.setOption(option);

            // 响应窗口大小变化
            window.addEventListener('resize', function () {
              h_ageChart.resize();
            });
          });


        // 左下角 交通流量 图表

        // 初始化图表
        const chartDom = document.getElementById('edu');
        const myChart = echarts.init(chartDom);

        // 定义图表的option
        let TransOption;

        fetch('./json/trans.json')
          .then(response => response.json())
          .then(jsonData => {

            // 处理数据
            const areas = ['中原区', '二七区', '管城回族区', '金水区', '惠济区'];

            // 把每行的Date字段取出来
            const hours = jsonData.map(item => item.Date);

            // 配置渐变色
            const gradientColors = [
              ['rgb(128, 255, 165)', 'rgb(1, 191, 236)'],
              ['rgb(0, 221, 255)', 'rgb(77, 119, 255)'],
              ['rgb(55, 162, 255)', 'rgb(116, 21, 219)'],
              ['rgb(255, 0, 135)', 'rgb(135, 0, 157)'],
              ['rgb(255, 191, 0)', 'rgb(224, 62, 76)'],
            ];

            // 创建系列数据
            const seriesData = areas.map((area, index) => {
              return {
                name: area,
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                  width: 0
                },
                showSymbol: false,
                areaStyle: {
                  opacity: 0.8,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: gradientColors[index][0]
                    },
                    {
                      offset: 1,
                      color: gradientColors[index][1]
                    }
                  ])
                },
                emphasis: {
                  focus: 'series'
                },
                data: jsonData.map(item => item[area])
              };
            });

            // 为最后一个系列添加标签
            seriesData[seriesData.length - 1].label = {
              show: true,
              position: 'top'
            };

            // 配置图表选项
            TransOption = {
              color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00',],
              // title: {
              //     text: '郑州各区每小时交通流量渐变堆叠面积图'
              // },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  label: {
                    backgroundColor: '#6a7985'
                  }
                }
              },
              legend: {
                data: areas,
                selectedMode: 'multiple',
                selected: {
                  '中原区': false,
                  '二七区': false,
                  '管城回族区': false,
                  '金水区': false,
                  '惠济区': false,
                }
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '25%',
                containLabel: true
              },
              xAxis: [
                {
                  type: 'category',
                  boundaryGap: false,
                  data: hours,
                  name: '小时',
                  axisLabel: {
                    formatter: '{value}时'
                  }
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  name: '交通流量'
                }
              ],
              series: seriesData
            };

            // 使用配置项和数据显示图表
            myChart.setOption(TransOption);

            // 响应窗口大小变化
            window.addEventListener('resize', function () {
              myChart.resize();
            });
          })

        // 初始化ECharts实例
        const AQIchartDom = document.getElementById('language');
        const myAQIChart = echarts.init(AQIchartDom);
        let AQIoption;

        // 加载JSON数据
        fetch('../../json/AQI.json')
          .then(response => response.json())
          .then(jsonData => {
            // 处理数据
            const areas = ['中原区', '二七区', '惠济区', '管城回族区', '金水区', '郑州市主城区'];
            const seriesData = areas.map(area => {
              return {
                name: area,
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: jsonData.map(item => {
                  return [item[' DATE'], item[area]];
                })
              };
            });

            // 配置图表选项
            AQIoption = {
              grid: {
                left: '15%',    // 左边距
                right: '5%',   // 右边距
                top: '25%',    // 上边距
                bottom: '20%'  // 下边距，如果有 dataZoom 需要留出足够空间
              },
              title: {
                left: 'center',
                text: '郑州各区AQI指数时序变化图'
              },
              tooltip: {
                trigger: 'axis',
                position: function (pt) {
                  return [pt[0], '10%'];
                }
              },
              legend: {
                data: areas,
                top: 30,
                show: true,
                selectedMode: 'multiple',
                selected: {
                  '中原区': false,
                  '二七区': false,
                  '金水区': false,
                  '管城回族区': false,
                  '惠济区': false,
                }
              },
              xAxis: {
                type: 'time',
                boundaryGap: false
              },
              yAxis: {
                type: 'value',
                min: 0,       // 最小值
                max: 650,     // 最大值
                interval: 100, // 刻度间隔，可选
                boundaryGap: [0, '100%']
              },
              dataZoom: [
                {
                  type: 'inside',
                  start: 98,
                  end: 100
                },
                {
                  start: 98,
                  end: 100
                }
              ],
              series: seriesData
            };

            // 使用配置项和数据显示图表
            myAQIChart.setOption(AQIoption);

            // 响应窗口大小变化
            window.addEventListener('resize', function () {
              myAQIChart.resize();
            });
          })

        // 只初始化一次 DOM
        const POIchartDom = document.getElementById('whr');
        let myPOIChart = null;
        let hasBoundResize = false;

        // 抽出一个通用的绘图函数
        function renderPOIChart(districtName, chartData) {
          if (districtName =="安居乐业" || districtName == "生态宜人" || districtName == "民生便利") {
            districtName = "郑州市主城区"
          }
          const option = {
            tooltip: { trigger: 'item' },
            legend: { top: '10%', left: 'center' },
            title: { text: `${districtName}设施占比`, left: 'center', top: '2%' },
            series: [{
              name: '设施占比',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '55%'],
              avoidLabelOverlap: false,
              padAngle: 5,
              itemStyle: { borderRadius: 10 },
              label: { show: false, position: 'center' },
              emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
              labelLine: { show: false },
              data: chartData
            }]
          };

          if (myPOIChart) myPOIChart.dispose();
          myPOIChart = echarts.init(POIchartDom);
          myPOIChart.setOption(option);

          if (!hasBoundResize) {
            hasBoundResize = true;
            window.addEventListener('resize', () => myPOIChart && myPOIChart.resize(), { passive: true });
          }
        }

        // 主函数：查询并绘图
        function queryDistrict(districtName) {
          //  先处理“郑州市主城区”——直接走自定义/汇总数据，不查图层
          if (districtName === '郑州市主城区') {
            const synthetic = { 医疗: 500, 政府: 120, 教育: 300, 生活: 800, 购物: 400, name: '郑州市主城区' };
            const chartData = [
              { value: synthetic.医疗, name: '医疗' },
              { value: synthetic.政府, name: '政府' },
              { value: synthetic.教育, name: '教育' },
              { value: synthetic.生活, name: '生活' },
              { value: synthetic.购物, name: '购物' },
            ];
            renderPOIChart(synthetic.name, chartData);
            updateActiveDistrict(districtName);
            return;
          }

          // 按图层查找
          const query = POILayer.createQuery();
          // 注意：若 districtName 来自用户输入，最好转义单引号
          const safeName = String(districtName).replace(/'/g, "''");
          query.where = `NAME='${safeName}'`;
          query.outFields = ['*'];
          query.returnGeometry = true;

          POILayer.queryFeatures(query).then((result) => {
            if (!result.features?.length) {
              console.error('未找到匹配的区域数据：', districtName);
              renderPOIChart(`${districtName}`, []);
              return;
            }

            const attrs = result.features[0].attributes;
            const picked = {
              医疗: attrs.医疗个,
              政府: attrs.政府机,
              教育: attrs.教育培,
              生活: attrs.生活服,
              购物: attrs.购物个,
              name: attrs.NAME
            };

            const chartData = [
              { value: picked.医疗, name: '医疗' },
              { value: picked.政府, name: '政府' },
              { value: picked.教育, name: '教育' },
              { value: picked.生活, name: '生活' },
              { value: picked.购物, name: '购物' },
            ];

            renderPOIChart(picked.name, chartData);
            updateActiveDistrict(districtName);

            // 如果以后要缩放到该区，可解开：
            // if (result.features[0].geometry) {
            //   view.goTo(result.features[0].geometry.extent.expand(1.5));
            // }
          }).catch((err) => {
            console.error('查询失败：', err);
            renderPOIChart(`${districtName}`, []); // 兜底
          });
        }

        // 更新选择器中的活动项
        function updateActiveDistrict(districtName) {
          const items = document.querySelectorAll('#districtSelector li');
          items.forEach(item => {
            if (item.textContent === districtName) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }


        function ChartChange(districtName) {
          // 获取所有行政区名称
          const areas = ['中原区', '二七区', '管城回族区', '金水区', '惠济区', '郑州市主城区'];

          // 遍历所有行政区，设置图例显示状态
          areas.forEach(area => {
            if (districtName === "郑州市主城区" || districtName =="安居乐业" || districtName =="民生便利" || districtName == "生态宜人" ) {
              // 全选：所有区域都设为 true
              TransOption.legend.selected[area] = true;
              AQIoption.legend.selected[area] =(area === "郑州市主城区");
            } else {
              // 普通逻辑：只显示当前选中的行政区
              TransOption.legend.selected[area] = (area === districtName);
              AQIoption.legend.selected[area] = (area === districtName);
            }
          });

          // 应用更新后的配置
          myChart.setOption(TransOption);
          myAQIChart.setOption(AQIoption);
        }
      });
    // 导航条切换事件已移至跳转-过渡.vue组件中
  };

  // 组件挂载时初始化地图
  onMounted(() => {
    // 确保ArcGIS API已加载
    if (window.require) {
      initMap();
    } else {
      console.error("ArcGIS API未加载，请检查引入");
    }
  });

  // 组件卸载时清理
  onUnmounted(() => {
    if (view) {
      view.destroy(); // 销毁地图视图释放资源
    }
  });

</script>

<style scoped>
  @import "../CSS/style.css";
  @import "../CSS/主控页面.css";
</style>
