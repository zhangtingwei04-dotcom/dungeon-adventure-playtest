(function () {
  'use strict';

  const city = window.DungeonCityOpeningV1;
  const time = window.DungeonGameTimeV1;
  const catalog = window.DungeonInteriorFurnitureV1;
  const layout = window.DungeonInteriorLayoutV1;
  const storageKey = 'dungeon_rental_room_layout_v1';
  const get = id => document.getElementById(id);
  const editor = get('layoutEditor');
  const weather = window.DungeonWeatherV1;
  const weatherPicker = get('windowWeather');
  const thunderButton = get('windowThunder');
  let thunderSound = false;
  const weatherSeed = 'city-opening-v1';
  const glassDryMinutes = 90;
  let lastWeatherPreview = 'auto';
  let previewRainEndedAt = null;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = matchMedia('(orientation:portrait) and (max-width:767px), (orientation:portrait) and (pointer:coarse)');
  for (const [kind, details] of Object.entries(weather.kinds)) {
    weatherPicker.add(new Option(details.name + '預覽', kind));
  }
  let weatherFrame = 0;
  let lastWeatherFrame = 0;
  const itemPicker = get('layoutItem');
  const labels = new Map(city.objects.map(item => [item.id, item.name]));
  const decorations = { chair: '椅子', rug: '地毯', shelves: '壁架', lamp: '吊燈', 'left-shelf': '左牆木架', 'wall-map': '左牆掛圖', 'right-wall-map': '右牆掛圖' };
  const detailFields = {
    mirror: {
      skewY: { label: '鏡面上下緣斜度 (°)', min: -35, max: 35, step: 0.5, initial: -16 },
      skewX: { label: '鏡面左右邊垂直度 (°)', min: -15, max: 15, step: 0.5, initial: 0 }
    },
    chest: {
      depth: { label: '景深：往內 + / 往外 − (%)', min: -20, max: 35, step: 0.5, initial: 19.5 },
      depthDirection: { label: '景深方向角度 (°)', min: -25, max: 65, step: 1, initial: 0 },
      pitch: { label: '箱身上下角度 (°)', min: -45, max: 45, step: 0.5, initial: 0 },
      yaw: { label: '箱身左右朝向 (°)', min: -25, max: 25, step: 0.5, initial: 0 },
      leftLean: { label: '左側邊線傾斜 (°)', min: -15, max: 15, step: 0.5, initial: 0 },
      rightLean: { label: '右側邊線傾斜 (°)', min: -15, max: 15, step: 0.5, initial: 0 },
      leftHeight: { label: '左側上緣高低 (%)', min: -15, max: 15, step: 0.5, initial: 0 },
      rightHeight: { label: '右側上緣高低 (%)', min: -15, max: 15, step: 0.5, initial: 0 },
      openX: { label: '開蓋 X (%箱寬)', min: -60, max: 60, step: 0.5, initial: 0 },
      openY: { label: '開蓋 Y (%箱高，向下)', min: -60, max: 60, step: 0.5, initial: 0 },
      openScale: { label: '開蓋大小 (倍)', min: 0.5, max: 2, step: 0.01, initial: 1 },
      openAngle: { label: '開蓋角度 (°)', min: -45, max: 45, step: 0.5, initial: 0 },
      openSkew: { label: '開蓋斜度 (°)', min: -30, max: 30, step: 0.5, initial: 0 },
      openWidth: { label: '開蓋橫向比例', min: 0.5, max: 1.5, step: 0.01, initial: 1 }
    }
  };
  const clamp = (n, field) => Math.max(field.min, Math.min(field.max, n));
  const detailValue = (id, key) => {
    const field = detailFields[id][key];
    const n = overrides[id]?.[key];
    return Number.isFinite(n) ? clamp(n, field) : field.initial;
  };
  let chestPreview = 'open';
  let game = city.create();
  let selected = null;
  let overrides = {};

  try {
    overrides = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    // The default room is usable when browser storage is unavailable.
  }
  // Restore the new front-facing chest defaults once, without resetting any other furniture.
  try {
    const restoreKey = 'dungeon_rental_room_chest_front_v1';
    if (localStorage.getItem(restoreKey) !== '1') {
      if (overrides && typeof overrides === 'object') delete overrides.chest;
      localStorage.setItem(storageKey, JSON.stringify(overrides));
      localStorage.setItem(restoreKey, '1');
    }
  } catch { if (overrides && typeof overrides === 'object') delete overrides.chest; }
  // Older saves wrote every field. Keep only fields changed from the previous layout.
  const previous = {
    bed: { x: 28, y: 92 }, wardrobe: { x: 18, y: 68 }, desk: { x: 63, y: 84 },
    window: { x: 46, y: 51 }, door: { x: 85, y: 74 }, mirror: { x: 69, y: 47 },
    rug: { x: 48, y: 96 }
  };
  overrides = Object.fromEntries(layout.rentalRoom.map(item => {
    const saved = overrides?.[item.id];
    const fields = Object.keys(layout.fields).filter(key => Number.isFinite(saved?.[key]));
    const edited = fields.filter(key => !Object.hasOwn(saved, 'width')
      || saved[key] !== (previous[item.id]?.[key] ?? item[key]));
    const values = Object.fromEntries(edited.map(key => [key, saved[key]]));
    for (const [key, field] of Object.entries(detailFields[item.id] || {})) {
      if (Number.isFinite(saved?.[key])) values[key] = clamp(saved[key], field);
    }
    return [item.id, values];
  }));
  let placements = layout.applyOverrides(layout.rentalRoom, overrides);

  function button(label, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.onclick = action;
    return element;
  }

  function select(id) {
    selected = id;
    get('status').textContent = '';
    render();
  }

  const furniture = new Map();
  for (const item of placements) {
    const interactive = labels.has(item.id);
    const label = labels.get(item.id) ?? decorations[item.id];
    const image = document.createElement('img');
    image.src = catalog[item.id];
    image.alt = '';
    const element = interactive
      ? button('', () => select(item.id))
      : document.createElement('div');
    if (interactive) {
      element.setAttribute('aria-label', label);
      element.title = label;
    } else {
      element.style.pointerEvents = 'none';
    }
    element.className = 'furniture';
    element.dataset.item = item.id;
    element.append(image);
    if (item.id === 'wardrobe') {
      const open = document.createElement('span');
      open.className = 'furniture-open-image';
      const openImage = document.createElement('img');
      openImage.alt = '';
      openImage.src = catalog['wardrobe-open'];
      const interior = document.createElement('span');
      interior.className = 'wardrobe-interior';
      for (let slot = 1; slot <= 4; slot++) {
        const hook = document.createElement('span');
        hook.className = 'wardrobe-hook';
        hook.dataset.hangerSlot = String(slot);
        interior.append(hook);
      }
      open.append(openImage, interior);
      image.classList.add('furniture-closed-image');
      element.append(open);
    }
    if (item.id === 'chest') {
      const openImage = document.createElement('img');
      openImage.alt = '';
      openImage.className = 'chest-open-image';
      openImage.src = catalog['chest-open'];
      image.classList.add('furniture-closed-image');
      const group = document.createElement('span');
      group.className = 'chest-perspective';
      group.append(image, openImage);
      element.append(group);
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => renderChestPerspective(element));
        observer.observe(group);
      }
    }
    if (item.id === 'door') {
      const opening = document.createElement('span');
      opening.className = 'door-opening';
      element.prepend(opening);
      image.classList.add('door-leaf');
    }
    if (item.id === 'window') {
      const motion = document.createElement('span');
      motion.className = 'window-motion';
      motion.setAttribute('aria-hidden', 'true');
      const bird = document.createElement('span');
      bird.className = 'window-bird';
      motion.append(bird);
      element.append(motion);
      window.DungeonRentalWindowSkyV1.mount(image, motion);
      const glassWeather = document.createElement('canvas');
      glassWeather.className = 'window-weather';
      glassWeather.setAttribute('aria-hidden', 'true');
      element.append(window.DungeonRentalWindowSkyV1.createRoofSnow(image), glassWeather);
      weather.bind(glassWeather);
      const wetGlass = document.createElement('span');
      wetGlass.className = 'window-weather window-wet-glass';
      wetGlass.setAttribute('aria-hidden', 'true');
      for (const [x, y, length] of [[30, 29, 9], [39, 51, 12], [45, 76, 8],
        [58, 26, 10], [65, 51, 14], [72, 33, 7], [68, 75, 11], [27, 57, 8]]) {
        const drop = document.createElement('i');
        drop.style.left = x + '%';
        drop.style.top = y + '%';
        drop.style.setProperty('--drop-length', length + '%');
        wetGlass.append(drop);
      }
      element.append(wetGlass);
      const curtains = document.createElement('span');
      curtains.className = 'curtain-cover';
      curtains.setAttribute('aria-hidden', 'true');
      for (const side of ['left','right']) {
        const cloth = document.createElement('span');
        cloth.className = 'curtain-panel curtain-' + side;
        curtains.append(cloth);
      }
      element.append(curtains);
    }
    get('furniture').append(element);
    furniture.set(item.id, element);
    itemPicker.add(new Option(label, item.id));
  }
  get('targets').append(button('返回出租屋', () => select('return')));
  const returnButton = get('targets').firstElementChild;
  returnButton.className = 'spot';
  returnButton.style.left = '17%';
  returnButton.style.top = '62%';

  // Project the full sprite, preserving the common body/lid silhouette.
  // The bottom two corners are fixed; left and right upper corners move independently.
  function renderChestPerspective(element) {
    const group = element.querySelector('.chest-perspective');
    if (!group) return;
    const w = group.offsetWidth, h = group.offsetHeight;
    if (!w || !h) return;
    const d = key => detailValue('chest', key);
    const pitch = d('pitch'), yaw = d('yaw');
    const ll = d('leftLean'), rl = d('rightLean'), lh = d('leftHeight'), rh = d('rightHeight');
    if (![pitch,yaw,ll,rl,lh,rh].some(Boolean)) { group.style.transform = 'none'; return; }
    const rad = Math.PI / 180;
    const x0 = Math.tan(ll*rad)*h, y0 = lh*h/100;
    const x1 = w+Math.tan(rl*rad)*h, y1 = rh*h/100;
    const x2 = w, y2 = h, x3 = 0, y3 = h;
    const dx1=x1-x2, dx2=x3-x2, dx3=x0-x1+x2-x3;
    const dy1=y1-y2, dy2=y3-y2, dy3=y0-y1+y2-y3;
    const det=dx1*dy2-dx2*dy1;
    if (Math.abs(det)<1e-8) { group.style.transform='none'; return; }
    const g=(dx3*dy2-dx2*dy3)/det, k=(dx1*dy3-dx3*dy1)/det;
    const a=x1-x0+g*x1, b=x3-x0+k*x3;
    const c=y1-y0+g*y1, e=y3-y0+k*y3;
    // Limit extreme extrapolation for the open lid above the closed sprite.
    if (Math.min(1,1+g,1+k,1+g+k,1-k,1+g-k)<0.25) { group.style.transform='none'; return; }
    const matrix=[a/w,c/w,0,g/w,b/h,e/h,0,k/h,0,0,1,0,x0,y0,0,1];
    group.style.transform = `perspective(${Math.max(w,h)*6}px) translate(${w/2}px,${h}px) rotateX(${pitch}deg) rotateY(${yaw}deg) translate(${-w/2}px,${-h}px) matrix3d(${matrix.join(',')})`;
  }

  // The room art is a 2D perspective view, so depth moves the floor anchor
  // toward its estimated vanishing point and scales the entire chest together.
  function projectChestDepth(item, depth, direction = 0) {
    const factor = 1 - depth / 100;
    const vanishing = { x: 50, y: 43 };
    const aspect = 16 / 9;
    const dx = (vanishing.x - item.x) * aspect;
    const dy = vanishing.y - item.y;
    const theta = direction * Math.PI / 180;
    const vx = (dx * Math.cos(theta) - dy * Math.sin(theta)) / aspect;
    const vy = dx * Math.sin(theta) + dy * Math.cos(theta);
    return { ...item,
      x: Math.max(0, Math.min(100, item.x + vx * depth / 100)),
      y: Math.max(0, Math.min(100, item.y + vy * depth / 100)),
      scale: item.scale * factor
    };
  }

  function renderFurniture() {
    for (const item of placements) {
      const element = furniture.get(item.id);
      layout.position(element, item.id === 'chest' ? projectChestDepth(item, detailValue('chest', 'depth'), detailValue('chest', 'depthDirection')) : item);
      if (item.id === 'wardrobe' || item.id === 'chest') {
        const preview = item.id === 'chest' && editor.open && itemPicker.value === 'chest' && chestPreview !== 'actual';
        element.dataset.open = String(preview ? chestPreview === 'open' : city.isOpen(game, item.id));
      }
      if (['door','lamp','window'].includes(item.id)) {
        element.dataset.open = String(city.isOpen(game, item.id));
      }
      if (item.id === 'mirror') {
        element.querySelector('img').style.transform = `skewY(${detailValue('mirror', 'skewY')}deg) skewX(${detailValue('mirror', 'skewX')}deg)`;
      }
      if (item.id === 'chest') {
        const img = element.querySelector('.chest-open-image');
        img.style.left = detailValue('chest', 'openX') + '%';
        img.style.bottom = -detailValue('chest', 'openY') + '%';
        img.style.width = (100 * detailValue('chest', 'openScale')) + '%';
        img.style.transformOrigin = 'left bottom';
        img.style.transform = `rotate(${detailValue('chest', 'openAngle')}deg) skewY(${detailValue('chest', 'openSkew')}deg) scaleX(${detailValue('chest', 'openWidth')})`;
        renderChestPerspective(element);
      }
      if (labels.has(item.id)) {
        element.setAttribute('aria-pressed', String(selected === item.id));
      }
      element.classList.toggle('is-editing', editor.open && itemPicker.value === item.id);
    }
  }

  function drawWeather(ms) {
    if (ms - lastWeatherFrame >= 33) {
      weather.draw(ms, 1);
      lastWeatherFrame = ms;
    }
    weatherFrame = requestAnimationFrame(drawWeather);
  }

  function glassWetness(actual, visible, preview) {
    const now = game.worldMinutes;
    if (preview !== 'auto') {
      if (visible.snow || visible.rain) return 0;
      return previewRainEndedAt === null
        ? 0 : Math.max(0, 1 - (now - previewRainEndedAt) / glassDryMinutes);
    }
    if (actual.snow || actual.rain) return 0;
    const blockStart = actual.block * 180;
    const elapsed = now - blockStart;
    if (blockStart === 0 || elapsed >= glassDryMinutes) return 0;
    const previous = weather.at(weatherSeed, blockStart - 1, 'home');
    return previous.rain ? 1 - elapsed / glassDryMinutes : 0;
  }

  function renderWeather() {
    const room = game.scene === 'rental-room';
    const preview = weatherPicker.value;
    const actual = weather.at(weatherSeed, game.worldMinutes, 'home');
    const visible = preview === 'auto'
      ? actual
      : { ...actual, snow: 0, overcast: 0, ...weather.kinds[preview], kind: preview };
    const windowObject = furniture.get('window');
    windowObject.dataset.weather = visible.kind;
    const wetGlass = windowObject.querySelector('.window-wet-glass');
    wetGlass.hidden = Boolean(visible.rain);
    wetGlass.style.opacity =
      String(glassWetness(actual, visible, preview));
    const roofCover = preview === 'auto'
      ? Math.max(actual.snowCover, actual.snow * 0.18)
      : preview === 'blizzard' ? 0.95 : preview === 'snow' ? 0.72 : 0;
    windowObject.querySelector('.window-roof-snow').style.opacity = String(roofCover);
    windowObject.dataset.birds = !visible.rain && !visible.snow &&
      weather.activity('bird', visible) && weather.wildlifeWindMode('bird', visible.wind) === 'normal'
      ? 'normal' : 'quiet';
    get('roomWeather').hidden = !room;
    const label = visible.name + (preview === 'auto' ? '' : '（預覽）');
    const status = get('windowWeatherStatus');
    if (status.textContent !== label) status.textContent = label;

    const active = room && !portrait.matches && !document.hidden && visible.kind !== 'clear';
    weather.set(visible, !active, reduceMotion.matches, { scene: 'home', particleSize: 3.4, sound: thunderSound });
    if (active && !weatherFrame) weatherFrame = requestAnimationFrame(drawWeather);
    if (!active && weatherFrame) {
      cancelAnimationFrame(weatherFrame);
      weatherFrame = 0;
      lastWeatherFrame = 0;
    }
  }

  thunderButton.onclick = () => {
    thunderSound = !thunderSound;
    if (thunderSound) weather.unlockAudio();
    thunderButton.textContent = thunderSound ? '雷聲已開啟' : '雷聲已關閉';
    thunderButton.setAttribute('aria-pressed', String(thunderSound));
    renderWeather();
  };
  weatherPicker.onchange = () => {
    const next = weatherPicker.value;
    if (next === 'auto' || weather.kinds[next]?.snow) previewRainEndedAt = null;
    else if (weather.kinds[lastWeatherPreview]?.rain && !weather.kinds[next]?.rain) {
      previewRainEndedAt = game.worldMinutes;
    }
    lastWeatherPreview = next;
    renderWeather();
  };
  reduceMotion.addEventListener('change', renderWeather);
  portrait.addEventListener('change', renderWeather);
  document.addEventListener('visibilitychange', renderWeather);

  function render() {
    const room = game.scene === 'rental-room';
    get('scene').dataset.scene = game.scene;
    get('room').dataset.lamp = city.isOpen(game, 'lamp') ? 'on' : 'off';
    get('room').dataset.curtains = city.isOpen(game, 'window') ? 'open' : 'closed';
    editor.hidden = !room;
    get('clock').textContent = time.format(game.worldMinutes);
    get('place').textContent = room ? '城鎮出租屋' : '城鎮街道';
    get('description').textContent = room ? '住宅區・私人房間' : '住宅區・街道';
    get('clothes').textContent = (city.ready(game) ? '白色布衣、旅行褲、鞋子' : '室內衣著')
      + (game.equipmentV1.bag ? '；已配戴側包、披風與手套' : '');
    get('notice').textContent = game.flags.noticeRead ? '校方通知已讀；待後續報到安排。' : '可查看桌上的校方通知。';

    const entries = [...game.travelLog].reverse().map(entry => {
      const row = document.createElement('div');
      row.className = 'entry';
      const message = document.createElement('div');
      message.textContent = entry.message;
      const thought = document.createElement('small');
      thought.textContent = entry.thought || time.format(entry.worldMinute);
      row.append(message, thought);
      return row;
    });
    get('log').replaceChildren(...entries);
    renderFurniture();
    renderWeather();
    returnButton.setAttribute('aria-pressed', String(selected === 'return'));

    const view = city.inspect(game, selected);
    const choices = get('choices');
    choices.replaceChildren();
    if (!view) {
      get('dialogTitle').textContent = room ? '出租屋' : '住宅區街道';
      get('dialogText').textContent = room
        ? '你記得自己是受軍校安排來到這座城鎮。今天先安頓生活。'
        : '街坊正開始一天的生活。';
      return;
    }

    get('dialogTitle').textContent = room ? labels.get(selected) : '返回出租屋';
    get('dialogText').textContent = view.text;
    for (const [key, label] of view.actions) {
      choices.append(button(label, () => {
        const result = city.act(game, selected, key);
        get('status').textContent = result.ok
          ? result.message + (result.minutes ? '（' + result.minutes + '分鐘）' : '')
          : result.reason;
        if (result.ok && (key === 'leave' || key === 'return')) selected = null;
        render();
      }));
    }
  }

  function renderFields() {
    const item = placements.find(placement => placement.id === itemPicker.value);
    const special = detailFields[item.id] || {};
    const valueFor = key => Object.hasOwn(special, key) ? detailValue(item.id, key) : placements.find(p => p.id === item.id)[key];
    const chestOrder = ['depth','pitch','yaw','depthDirection','y','x','leftLean','rightLean','leftHeight','rightHeight','angle','scale','z','openX','openY','openScale','openAngle','openSkew','openWidth'];
    const allFields = { ...layout.fields, ...special };
    const fields = (item.id === 'chest' ? chestOrder.map(key => [key,allFields[key]]) : Object.entries(allFields)).map(([key, field]) => {
      const label = document.createElement('label');
      label.textContent = item.id === 'chest' && key === 'y' ? '上下位置 Y (%)' : field.label;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = field.min;
      input.max = field.max;
      input.step = field.step;
      input.value = valueFor(key);
      input.inputMode = 'decimal';
      input.oninput = () => {
        if (!Number.isFinite(input.valueAsNumber)) return;
        (overrides[item.id] ??= {})[key] = clamp(input.valueAsNumber, field);
        placements = layout.applyOverrides(layout.rentalRoom, overrides);
        get('layoutStatus').textContent = '配置尚未儲存。';
        renderFurniture();
      };
      input.onchange = () => {
        const value = valueFor(key);
        if (overrides[item.id]) overrides[item.id][key] = value;
        input.value = value;
      };
      const controls = document.createElement('span');
      controls.style.cssText = 'display:flex;align-items:center;gap:3px';
      const nudge = direction => {
        input.value = clamp(Number((valueFor(key) + direction * field.step).toFixed(4)), field);
        input.oninput();
        input.onchange();
      };
      const minus = button('−', () => nudge(-1));
      const plus = button('+', () => nudge(1));
      minus.setAttribute('aria-label', field.label + ' 減少');
      plus.setAttribute('aria-label', field.label + ' 增加');
      minus.style.padding = plus.style.padding = '4px 9px';
      controls.append(minus, input, plus);
      label.append(controls);
      return label;
    });
    if (item.id === 'chest') {
      const label = document.createElement('label');
      label.textContent = '木箱狀態（僅預覽）';
      const picker = document.createElement('select');
      for (const [value, name] of [['open','開蓋'],['closed','關閉'],['actual','實際遊戲狀態']]) picker.add(new Option(name,value));
      picker.value = chestPreview;
      picker.onchange = () => { chestPreview = picker.value; renderFurniture(); };
      label.append(picker);
      fields.unshift(label);
    }
    const resetOne = button('恢復此家具預設', () => {
      delete overrides[item.id];
      placements = layout.applyOverrides(layout.rentalRoom, overrides);
      get('layoutStatus').textContent = '配置尚未儲存。';
      renderFields();
    });
    const exportButton = button('顯示配置 JSON', () => {
      const area = document.createElement('textarea');
      area.readOnly = true;
      area.rows = 5;
      area.style.width = '100%';
      area.value = JSON.stringify({ format: 'dungeon-rental-room-layout-v1', overrides }, null, 2);
      const status = get('layoutStatus');
      status.replaceChildren(document.createTextNode('長按下方文字即可複製配置。'), area);
      area.focus(); area.select();
    });
    get('layoutFields').replaceChildren(...fields, resetOne, exportButton);
    renderFurniture();
  }

  function saveLayout(reset) {
    try {
      if (reset) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(overrides));
      get('layoutStatus').textContent = reset ? '已恢復預設配置。' : '配置已儲存在這個瀏覽器。';
    } catch {
      get('layoutStatus').textContent = '瀏覽器無法儲存，配置僅套用於目前頁面。';
    }
  }

  itemPicker.value = 'bed';
  itemPicker.onchange = () => { chestPreview = 'open'; renderFields(); };
  editor.ontoggle = renderFurniture;
  get('layoutSave').onclick = () => saveLayout(false);
  get('layoutReset').onclick = () => {
    placements = layout.applyOverrides(layout.rentalRoom);
    overrides = {};
    renderFields();
    saveLayout(true);
  };
  get('reset').onclick = () => {
    if (!confirm('重新開始城鎮開場試玩？')) return;
    game = city.create();
    weatherPicker.value = 'auto';
    lastWeatherPreview = 'auto';
    previewRainEndedAt = null;
    selected = null;
    get('status').textContent = '';
    render();
  };

  renderFields();
  render();
})();
