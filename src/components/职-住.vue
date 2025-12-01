<template>
  <div id="viewDiv"></div>
</template>
<script setup lang="js">
  window.require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/config",
    "esri/widgets/LayerList",
    "esri/widgets/Expand",
    "esri/Graphic"
  ], function (Map, MapView, FeatureLayer, config, LayerList, Expand, Graphic) {
    config.apiKey =
      "AAPTxy8BH1VEsoebNVZXo8HurFgltLjXSNfoH9uvV59bqkqEJx7TWKcGk6oIN87BcBQNZ8eM-8Z1VxKcZBFYrt5_m25_IFSmT0wxoA_NKi7bMMZoYYK_N79_-C_le2NwnPwGP5DE7Q260Yy6Oi5oziBWgfWy4d4oZpgvt3I81jSzrvL0NZs8pnwLtEv1eEBvsKYD2WMiPXC-LixXqBtvlJz3wHkWHyM493t1Tc-HlT5Gqpo.AT1_lBjdLix7";
    const map = new Map({
      basemap: "arcgis/navigation",
    });

    const view = new MapView({
      container: "viewDiv",
      map,
      center: [113.667, 34.765],
      zoom: 9.9,
      constraints: {
        snapToZoom: false, // 关键：允许非整数缩放
      },
    });
    // 新增的6个图层定义
    const DrivingOrigin = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/3",
      title: "驾车出行",
      outFields: ["*"],
      visible: false,
      popupEnabled: true,
      popupTemplate: {
        title: "驾车出行",
        content: [],
      },
    });

    const DrivingDirection = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/4",
      title: "DrivingDirection",
      outFields: ["*"],
      visible: false,
      popupEnabled: false,
    });

    const Driving = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/5",
      title: "Driving",
      outFields: ["*"],
      visible: false,
      popupEnabled: false,
    });

    const TransitOrigin = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/6",
      title: "公交出行",
      outFields: ["*"],
      visible: false,
      popupEnabled: true,
      popupTemplate: {
        title: "公交出行",
        content: [],
      },
    });

    const TransitDirection = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/7",
      title: "TransitDirection",
      outFields: ["*"],
      visible: false,
      popupEnabled: false,
    });

    const Transit = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/8",
      title: "Transit",
      outFields: ["*"],
      visible: false,
      popupEnabled: false,
    });
    const SubwayOrigin = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/0",
      title: "地铁出行",
      outFields: ["*"],
      visible: false,
      popupEnabled: true,
      popupTemplate: {
        title: "地铁出行",
        content: [],
      },
    });
    map.add(SubwayOrigin);
    map.add(DrivingOrigin);
    map.add(TransitOrigin);

    // 动态构建弹窗字段，确保只展示有效字段，避免因特殊字段导致弹窗失败
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
        layer.popupTemplate = {
          title: popupTitle,
          content: [
            { type: "fields", fieldInfos }
          ]
        };
      });
    }

    // 为三个Origin图层设置弹窗模板
    setupPopupTemplate(SubwayOrigin);
    setupPopupTemplate(DrivingOrigin);
    setupPopupTemplate(TransitOrigin);

    const SubwayDirection = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/1",
      title: "SubwayDirection",
      outFields: ["*"],
      visible: false, // 默认不显示，仅在点击后展示匹配要素
      popupEnabled: false,
    });
    const Subway = new FeatureLayer({
      url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/%E8%81%8C%E4%BD%8F/FeatureServer/2",
      title: "Subway",
      outFields: ["*"],
      visible: false, // 默认不显示，仅在点击后展示匹配要素
      popupEnabled: false,
    });
    // 确保所有图层加入地图（虽然默认不可见），否则有时 fields 不会初始化
    map.addMany([SubwayDirection, Subway, DrivingDirection, Driving, TransitDirection, Transit]);

    // 在视图中缓存所有图层的 LayerView，用于 highlight
    let directionLayerView, subwayLayerView, directionHighlight, subwayHighlight;
    let drivingDirectionLayerView, drivingLayerView, drivingDirectionHighlight, drivingHighlight;
    let transitDirectionLayerView, transitLayerView, transitDirectionHighlight, transitHighlight;

    view.whenLayerView(SubwayDirection).then(lv => { directionLayerView = lv; });
    view.whenLayerView(Subway).then(lv => { subwayLayerView = lv; });
    view.whenLayerView(DrivingDirection).then(lv => { drivingDirectionLayerView = lv; });
    view.whenLayerView(Driving).then(lv => { drivingLayerView = lv; });
    view.whenLayerView(TransitDirection).then(lv => { transitDirectionLayerView = lv; });
    view.whenLayerView(Transit).then(lv => { transitLayerView = lv; });

    // 工具函数：找到字段的真实名称（不区分大小写）
    function findFieldName(fields, name) {
      const lower = name.toLowerCase();
      const f = fields.find(fi => fi.name.toLowerCase() === lower);
      return f ? f.name : name;
    }
    // 构造 where 子句，按字段类型自动加引号（若还未加载字段，则根据值类型判断）
    function buildWhere(layer, oFieldName, dFieldName, oValue, dValue) {
      const fields = layer.fields || [];
      const findBy = (name) => {
        const f = fields.find(fi => fi.name.toLowerCase() === name.toLowerCase());
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

    // 根据几何类型选择渲染符号（用于临时渲染，让结果更醒目）
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

    // 点击Origin图层时，显示满足条件的Direction与主图层要素，并进行渲染标示
    view.on('click', async (event) => {
      try {
        const hit = await view.hitTest(event);

        // 检测点击的是哪个Origin图层
        let originLayer, directionLayer, mainLayer, directionLayerViewRef, mainLayerViewRef;

        const subwayOriginRes = hit.results.find(r => r.graphic && r.graphic.layer === SubwayOrigin);
        const drivingOriginRes = hit.results.find(r => r.graphic && r.graphic.layer === DrivingOrigin);
        const transitOriginRes = hit.results.find(r => r.graphic && r.graphic.layer === TransitOrigin);

        if (subwayOriginRes) {
          originLayer = SubwayOrigin;
          directionLayer = SubwayDirection;
          mainLayer = Subway;
          directionLayerViewRef = () => directionLayerView;
          mainLayerViewRef = () => subwayLayerView;

        } else if (drivingOriginRes) {
          originLayer = DrivingOrigin;
          directionLayer = DrivingDirection;
          mainLayer = Driving;
          directionLayerViewRef = () => drivingDirectionLayerView;
          mainLayerViewRef = () => drivingLayerView;

        } else if (transitOriginRes) {
          originLayer = TransitOrigin;
          directionLayer = TransitDirection;
          mainLayer = Transit;
          directionLayerViewRef = () => transitDirectionLayerView;
          mainLayerViewRef = () => transitLayerView;

        } else {
          return; // 不是点击在任何Origin图层上就不处理
        }

        const originRes = subwayOriginRes || drivingOriginRes || transitOriginRes;

        // 确保三个图层都已加载，避免 fields 为空导致报错
        await Promise.all([originLayer.load(), directionLayer.load(), mainLayer.load()]);

        const g = originRes.graphic;
        const attrs = g.attributes || {};
        const oFieldName = findFieldName(originLayer.fields, 'o_grid');
        const dFieldName = findFieldName(originLayer.fields, 'd_grid');
        const oVal = attrs[oFieldName];
        const dVal = attrs[dFieldName];
        if (oVal == null || dVal == null) {
          console.warn(`点击的 ${originLayer.title} 要素缺少 o_grid 或 d_grid 字段`);
          return;
        }

        // 清理上一次的渲染（清理所有可能的高亮）
        if (directionHighlight) directionHighlight.remove();
        if (subwayHighlight) subwayHighlight.remove();
        if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
        if (drivingHighlight) drivingHighlight.remove();
        if (transitDirectionHighlight) transitDirectionHighlight.remove();
        if (transitHighlight) transitHighlight.remove();
        view.graphics.removeAll();

        // 隐藏所有Direction和主图层
        SubwayDirection.visible = false;
        Subway.visible = false;
        DrivingDirection.visible = false;
        Driving.visible = false;
        TransitDirection.visible = false;
        Transit.visible = false;

        // 设置当前选中图层组的过滤条件，仅显示满足条件的要素
        const dirWhere = buildWhere(directionLayer, oFieldName, dFieldName, oVal, dVal);
        const mainWhere = buildWhere(mainLayer, oFieldName, dFieldName, oVal, dVal);
        directionLayer.definitionExpression = dirWhere;
        mainLayer.definitionExpression = mainWhere;
        directionLayer.visible = true;
        mainLayer.visible = true;

        // 查询满足条件的要素，并在视图中进行渲染（highlight + 临时图形）
        const [dirFS, mainFS] = await Promise.all([
          directionLayer.queryFeatures({ where: dirWhere, outFields: ['*'], returnGeometry: true }),
          mainLayer.queryFeatures({ where: mainWhere, outFields: ['*'], returnGeometry: true })
        ]);

        const dirLayerView = directionLayerViewRef();
        const mainLayerView = mainLayerViewRef();

        if (dirLayerView && dirFS.features.length) {
          if (originLayer === SubwayOrigin) {
            directionHighlight = dirLayerView.highlight(dirFS.features);
          } else if (originLayer === DrivingOrigin) {
            drivingDirectionHighlight = dirLayerView.highlight(dirFS.features);
          } else if (originLayer === TransitOrigin) {
            transitDirectionHighlight = dirLayerView.highlight(dirFS.features);
          }
        }
        if (mainLayerView && mainFS.features.length) {
          if (originLayer === SubwayOrigin) {
            subwayHighlight = mainLayerView.highlight(mainFS.features);
          } else if (originLayer === DrivingOrigin) {
            drivingHighlight = mainLayerView.highlight(mainFS.features);
          } else if (originLayer === TransitOrigin) {
            transitHighlight = mainLayerView.highlight(mainFS.features);
          }
        }

        const tempGraphics = [];
        dirFS.features.forEach(f => tempGraphics.push(new Graphic({ geometry: f.geometry, symbol: getSymbol(f.geometry), attributes: f.attributes })));
        mainFS.features.forEach(f => tempGraphics.push(new Graphic({ geometry: f.geometry, symbol: getSymbol(f.geometry), attributes: f.attributes })));
        view.graphics.addMany(tempGraphics);

        const features = dirFS.features.concat(mainFS.features);
        if (features.length) {
          view.goTo(features).catch(() => { });
        } else {
          console.warn(`没有找到满足条件的 ${originLayer.title} 相关要素`);
          // 没有结果时保持不可见
          directionLayer.visible = false;
          mainLayer.visible = false;
        }
      } catch (e) {
        console.error('点击筛选并渲染标示时出错：', e);
      }
    });

    // 创建出行方式选择器
    const travelModeContainer = document.createElement('div');
    travelModeContainer.style.cssText = `
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-family: Arial, sans-serif;
        `;

    const title = document.createElement('div');
    title.textContent = '出行方式选择';
    title.style.cssText = `
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
          font-size: 14px;
        `;
    travelModeContainer.appendChild(title);

    // 创建三个单选按钮
    const modes = [
      { id: 'subway', label: '地铁出行', layer: SubwayOrigin, checked: true },
      { id: 'driving', label: '驾车出行', layer: DrivingOrigin, checked: false },
      { id: 'transit', label: '公交出行', layer: TransitOrigin, checked: false }
    ];

    modes.forEach(mode => {
      const radioContainer = document.createElement('div');
      radioContainer.style.cssText = `
            margin: 5px 0;
            display: flex;
            align-items: center;
          `;

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'travelMode';
      radio.id = mode.id;
      radio.checked = mode.checked;
      radio.style.marginRight = '8px';

      const label = document.createElement('label');
      label.htmlFor = mode.id;
      label.textContent = mode.label;
      label.style.cssText = `
            cursor: pointer;
            font-size: 13px;
            color: #555;
          `;

      // 添加切换事件
      radio.addEventListener('change', () => {
        if (radio.checked) {
          // 隐藏所有Origin图层
          SubwayOrigin.visible = false;
          DrivingOrigin.visible = false;
          TransitOrigin.visible = false;

          // 隐藏所有Direction和主图层
          SubwayDirection.visible = false;
          Subway.visible = false;
          DrivingDirection.visible = false;
          Driving.visible = false;
          TransitDirection.visible = false;
          Transit.visible = false;

          // 清理所有高亮
          if (directionHighlight) directionHighlight.remove();
          if (subwayHighlight) subwayHighlight.remove();
          if (drivingDirectionHighlight) drivingDirectionHighlight.remove();
          if (drivingHighlight) drivingHighlight.remove();
          if (transitDirectionHighlight) transitDirectionHighlight.remove();
          if (transitHighlight) transitHighlight.remove();
          view.graphics.removeAll();

          // 显示选中的Origin图层
          mode.layer.visible = true;
        }
      });

      radioContainer.appendChild(radio);
      radioContainer.appendChild(label);
      travelModeContainer.appendChild(radioContainer);
    });

    // 创建Expand组件
    const travelModeExpand = new Expand({
      content: travelModeContainer,
      expandIconClass: 'esri-icon-directions',
      expandTooltip: '选择出行方式',
      collapseTooltip: '收起出行方式选择器',
      expanded: false
    });

    // 将Expand组件添加到视图
    view.ui.add(travelModeExpand, 'top-right');

    // 默认显示地铁出行
    SubwayOrigin.visible = true;
  });
</script>



<style scoped>
      #viewDiv {
        padding: 0;
        margin: 0;
        height: 100vh;
        width: 100vw;
      }
</style>
