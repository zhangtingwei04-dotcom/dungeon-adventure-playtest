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
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = matchMedia('(orientation:portrait) and (max-width:767px), (orientation:portrait) and (pointer:coarse)');
  for (const [kind, details] of Object.entries(weather.kinds)) {
    weatherPicker.add(new Option(details.name + '預覽', kind));
  }
  let weatherFrame = 0;
  let lastWeatherFrame = 0;
  const itemPicker = get('layoutItem');
  const labels = new Map(city.objects.map(item => [item.id, item.name]));
  const decorations = { rug: '地毯', shelves: '壁架', chest: '木箱', lamp: '吊燈', 'left-shelf': '左牆木架', 'wall-map': '左牆掛圖', 'right-wall-map': '右牆掛圖' };
  let game = city.create();
  let selected = null;
  let overrides = {};

  try {
    overrides = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    // The default room is usable when browser storage is unavailable.
  }
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
    return [item.id, Object.fromEntries(edited.map(key => [key, saved[key]]))];
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
      element.append(glassWeather);
      weather.bind(glassWeather);
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

  function renderFurniture() {
    for (const item of placements) {
      const element = furniture.get(item.id);
      layout.position(element, item);
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

  function renderWeather() {
    const room = game.scene === 'rental-room';
    const preview = weatherPicker.value;
    const actual = weather.at('city-opening-v1', game.worldMinutes, 'home');
    const visible = preview === 'auto'
      ? actual
      : { ...actual, snow: 0, overcast: 0, ...weather.kinds[preview], kind: preview };
    const windowObject = furniture.get('window');
    windowObject.dataset.weather = visible.kind;
    windowObject.dataset.birds = !visible.rain && !visible.snow &&
      weather.activity('bird', visible) && weather.wildlifeWindMode('bird', visible.wind) === 'normal'
      ? 'normal' : 'quiet';
    get('roomWeather').hidden = !room;
    const label = visible.name + (preview === 'auto' ? '' : '（預覽）');
    const status = get('windowWeatherStatus');
    if (status.textContent !== label) status.textContent = label;

    const active = room && !portrait.matches && !document.hidden && visible.kind !== 'clear';
    weather.set(visible, !active, reduceMotion.matches, { scene: 'home', particleSize: 3.4 });
    if (active && !weatherFrame) weatherFrame = requestAnimationFrame(drawWeather);
    if (!active && weatherFrame) {
      cancelAnimationFrame(weatherFrame);
      weatherFrame = 0;
      lastWeatherFrame = 0;
    }
  }

  weatherPicker.onchange = renderWeather;
  reduceMotion.addEventListener('change', renderWeather);
  portrait.addEventListener('change', renderWeather);
  document.addEventListener('visibilitychange', renderWeather);

  function render() {
    const room = game.scene === 'rental-room';
    get('scene').dataset.scene = game.scene;
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
    const fields = Object.entries(layout.fields).map(([key, field]) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = field.min;
      input.max = field.max;
      input.step = field.step;
      input.value = item[key];
      input.oninput = () => {
        if (!Number.isFinite(input.valueAsNumber)) return;
        (overrides[item.id] ??= {})[key] = input.valueAsNumber;
        placements = layout.applyOverrides(layout.rentalRoom, overrides);
        get('layoutStatus').textContent = '配置尚未儲存。';
        renderFurniture();
      };
      input.onchange = () => {
        const value = placements.find(placement => placement.id === item.id)[key];
        if (overrides[item.id]) overrides[item.id][key] = value;
        input.value = value;
      };
      label.append(input);
      return label;
    });
    get('layoutFields').replaceChildren(...fields);
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
  itemPicker.onchange = renderFields;
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
    selected = null;
    get('status').textContent = '';
    render();
  };

  renderFields();
  render();
})();
