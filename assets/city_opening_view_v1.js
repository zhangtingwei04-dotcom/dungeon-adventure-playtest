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
  const exterior = window.DungeonCityExteriorV1;
  const lighting=window.DungeonLightingV1;
  const lightPreview=get('lightingPreview');
  const corridorPreview=get('corridorLightingPreview');
  const lightCanvas=get('roomLighting');
  const lightBeam=get('windowLightBeam');
  let lightState=null,lightTarget=null,lightFrame=0;
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
  const sceneOnly=new URLSearchParams(location.search).get('mode')==='scene';
  if(sceneOnly)document.documentElement.dataset.renderer='scene';
  const campaignMode=!sceneOnly&&new URLSearchParams(location.search).get('mode')==='game';
  const campaign=window.DungeonCityCampaignSaveV1;
  document.documentElement.dataset.campaign=campaignMode?'game':'dev';
  const saveStatus=get('campaignSaveStatus');
  let saveBlocked=false;
  let game = city.create();
  if(campaignMode){
    saveStatus.hidden=false;
    let slot;
    try{slot=campaign.load(localStorage);}catch{slot={status:'unavailable'};}
    const params=new URLSearchParams(location.search);
    const newRun=params.get('start')==='new';
    const replace=newRun&&['ok','invalid'].includes(slot.status)&&confirm('開始新的城鎮旅程？目前城鎮存檔會保留一份備份。舊版森林存檔不受影響。');
    if(slot.status==='ok'&&!replace)game=slot.state;
    else if(slot.status==='invalid'&&!replace){saveBlocked=true;saveStatus.textContent='城鎮存檔無法讀取。暫不覆寫，重新開始需另行確認。';}
    else if(replace){try{saveBlocked=!campaign.write(localStorage,game,{replace:true});}catch{saveBlocked=true;}}
    if(slot.status==='unavailable')saveBlocked=true;
    if(newRun){params.delete('start');history.replaceState(null,'',location.pathname+'?'+params.toString()+location.hash);}
  }
  function saveCampaign(){
    if(!campaignMode||saveBlocked)return;
    try{saveStatus.textContent=campaign.write(localStorage,game)?'城鎮進度已儲存':'無法儲存城鎮進度';}
    catch{saveStatus.textContent='瀏覽器儲存不可用';}
  }
  if(campaignMode&&saveBlocked&&!saveStatus.textContent)saveStatus.textContent='儲存不可用；目前進度僅保留於此頁。';
  let selected = null;
  let observingWindow=false;
  let curtainAnimating=false;
  const curtainDuration=800;
  let doorTransit = false;
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
  if(campaignMode||sceneOnly)overrides={};
  let placements = layout.applyOverrides(layout.rentalRoom, overrides);

  function button(label, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.onclick = action;
    return element;
  }

  function select(id) {
    if(doorTransit||curtainAnimating||observingWindow)return;
    selected = id;
    get('status').textContent = '';
    render();
  }

  const furniture = new Map();
  for (const item of placements) {
    const interactive = labels.has(item.id);
    const label = labels.get(item.id) ?? decorations[item.id];
    const image = document.createElement('img');
    if(item.id!=='window')image.src = catalog[item.id];
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
    if(item.id==='desk'){
      // The lamp is baked into the existing desk sprite. Reuse exactly the same
      // sprite in a clipped overlay so only its glass is dimmed when extinguished.
      const darkGlass=document.createElement('span');
      darkGlass.className='desk-lamp-glass';
      darkGlass.style.backgroundImage='url("'+catalog.desk+'")';
      darkGlass.setAttribute('aria-hidden','true');
      element.append(darkGlass);
      const hit=document.createElement('span');
      hit.className='desk-lamp-hit';
      hit.title='桌上油燈';
      hit.setAttribute('aria-hidden','true');
      hit.addEventListener('click',event=>{event.stopPropagation();select('desk-lamp');});
      element.append(hit);
    }
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
      const stored=document.createElement('span');
      stored.className='wardrobe-stored-items';
      for(const item of city.wardrobeItems){
        const piece=document.createElement('span');
        piece.className='wardrobe-stored-item '+(item.home.startsWith('hanger')?'hanging':'shelf-item');
        piece.dataset.storedItem=item.id;piece.title=item.name;
        piece.style.left=((Number(item.home.split('-')[1])-.5)*25)+'%';
        const art=document.createElement('img');art.src=item.asset;art.alt='';
        piece.append(art);
        piece.addEventListener('click',event=>{event.stopPropagation();if(city.isOpen(game,'wardrobe'))select('wardrobe-item:'+item.id);});
        stored.append(piece);
      }
      interior.append(stored);
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
      // No corridor image; the shared light compositor controls doorway spill.
      // Keep the original frame, jamb and threshold geometry.
      const reveal = document.createElementNS('http://www.w3.org/2000/svg','svg');
      reveal.setAttribute('class','door-reveal');
      reveal.setAttribute('viewBox','0 0 100 100');
      reveal.setAttribute('preserveAspectRatio','none');
      reveal.setAttribute('aria-hidden','true');
      reveal.innerHTML = '<defs><linearGradient id="rentalJamb" x1="0" x2="1"><stop stop-color="#4b2e20"/><stop offset=".5" stop-color="#96623e"/><stop offset="1" stop-color="#523626"/></linearGradient><linearGradient id="rentalSill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#795136"/><stop offset=".55" stop-color="#68432c"/><stop offset="1" stop-color="#4a3020"/></linearGradient></defs>'
        + '<path d="M25 12L34 14L34 92.4L25 93Z" fill="url(#rentalJamb)"/>'
        + '<path d="M25 12L98 6L98 8.9L34 14Z" fill="#64412b"/>'
        + '<path d="M34 92.4L98 96.8L98 98L25 93Z" fill="url(#rentalSill)"/>'
        + '<path d="M34 14L34 92.4L98 96.8" fill="none" stroke="#38281e" stroke-width=".55" vector-effect="non-scaling-stroke"/>'
        + '<path class="jamb-light" d="M29 14L34 15L34 92.4L29 92.8Z"/>';
      opening.append(reveal);
      const frame = document.createElement('span');
      frame.className = 'door-frame';
      const leaf = document.createElement('span');
      leaf.className = 'door-swing';
      for (const part of [opening, frame, leaf]) part.setAttribute('aria-hidden', 'true');
      image.classList.add('door-leaf');
      element.prepend(opening);
      const seam=document.createElementNS('http://www.w3.org/2000/svg','svg');
      seam.setAttribute('class','door-seam');seam.setAttribute('viewBox','0 0 100 100');seam.setAttribute('preserveAspectRatio','none');seam.setAttribute('aria-hidden','true');
      seam.innerHTML='<path d="M34 92.4L98 96.8" fill="none" stroke="currentColor" stroke-width=".8" vector-effect="non-scaling-stroke"/>';
      element.append(frame,leaf,seam);
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
      // Trace individual panes in the original 456×349 sprite coordinates.
      // Slight overlap onto the inner bevel removes bright daylight seams at night.
      const shade = document.createElementNS('http://www.w3.org/2000/svg','svg');
      shade.setAttribute('class','window-exterior-shade');
      shade.setAttribute('viewBox','0 0 456 349');
      shade.setAttribute('preserveAspectRatio','none');
      shade.setAttribute('aria-hidden','true');
      shade.innerHTML='<path d="M108 45H226V139H96L97 101Z M246 45H352L367 139H246Z M96 148H156V228H96Z M161 148H226V228H161Z M246 148H368V228H246Z M96 234H156V304H96Z M161 234H226V304H161Z M246 234H368V304H246Z M75 155V228H52L55 193Z M52 234H76V304H64L52 274Z M383 153L405 191L414 228H383Z M383 234H414L402 304H383Z" fill="#101a2c"/>';
      element.append(shade);
      const curtains = document.createElement('span');
      curtains.className = 'curtain-cover';
      curtains.setAttribute('aria-hidden', 'true');
      for (const side of ['left','right']) {
        const cloth = document.createElement('span');
        cloth.className = 'curtain-panel curtain-' + side;
        curtains.append(cloth);
      }
      element.append(curtains);
      window.DungeonRentalWindowSkyV1.prepareWindow(image,catalog[item.id]);
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
  const stairsButton=button('樓梯',()=>select('stairs'));stairsButton.className='spot';stairsButton.style.left='65%';stairsButton.style.top='76%';get('targets').append(stairsButton);
  const reportButton=button('燈火會報到（流程測試）',()=>select('report-office'));reportButton.className='spot';reportButton.style.left='65%';reportButton.style.top='65%';get('targets').append(reportButton);

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

  let curtainSwapFrame = null;
  function updateCurtainState(element, state) {
    const open=state==='open';
    const next = String(open);
    const first = !element.hasAttribute('data-tied-hidden');
    if (element.dataset.curtain === state && !first) return;
    if (curtainSwapFrame !== null) cancelAnimationFrame(curtainSwapFrame);
    curtainSwapFrame = null;
    element.dataset.curtainFrom=element.dataset.curtain||state;
    element.dataset.open = next;
    element.dataset.curtain=state;
    if (first || reduceMotion.matches) {
      element.dataset.tiedHidden = String(!open);
      return;
    }
    const panels = [...element.querySelectorAll('.curtain-panel')];
    const cover = element.querySelector('.curtain-cover');
    const started = performance.now();
    function track(now) {
      // Both strips must actually cover the tied-curtain mask, not just reach a timer.
      const width = element.getBoundingClientRect().width;
      const enough = width > 0 && cover && panels.length === 2 && panels.every(panel =>
        panel.getBoundingClientRect().width >= width * .30 &&
        Number(getComputedStyle(panel).opacity) >= .98);
      element.dataset.tiedHidden = String(enough);
      if (now - started < curtainDuration && element.dataset.curtain === state) {
        curtainSwapFrame = requestAnimationFrame(track);
      } else {
        element.dataset.tiedHidden = String(!open);
        curtainSwapFrame = null;
      }
    }
    curtainSwapFrame = requestAnimationFrame(track);
  }

  // Widen horizontally around the right edge, retaining the original vertical size.
  const doorWidthFactor = 1.16;
  function doorGeometry(item) {
    const baseWidth=item.width*item.scale;
    const width=baseWidth*doorWidthFactor;
    const right=item.x+baseWidth/2;
    return {width,right,left:right-width,x:right-width/2,baseWidth};
  }
  function positionRoomDoor(element,item) {
    const g=doorGeometry(item);
    layout.position(element,{...item,x:g.x});
    element.style.transform += ' scaleX('+doorWidthFactor+')';

  }

  function renderFurniture() {
    for (const item of placements) {
      const element = furniture.get(item.id);
      if (item.id === 'door') positionRoomDoor(element,item);
      else if (item.id === 'mirror' && !Number.isFinite(overrides?.mirror?.x)) {
        layout.position(element,{...item,x:item.x-.65});
      } else layout.position(element, item.id === 'chest' ? projectChestDepth(item, detailValue('chest', 'depth'), detailValue('chest', 'depthDirection')) : item);
      if (item.id === 'wardrobe' || item.id === 'chest') {
        const preview = item.id === 'chest' && editor.open && itemPicker.value === 'chest' && chestPreview !== 'actual';
        element.dataset.open = String(preview ? chestPreview === 'open' : city.isOpen(game, item.id));
      }
      if(item.id==='wardrobe'){
        const visible=new Set(city.wardrobeContents(game).map(item=>item.id));
        for(const piece of element.querySelectorAll('[data-stored-item]'))piece.hidden=!visible.has(piece.dataset.storedItem);
      }
      if (['door','lamp'].includes(item.id)) {
        element.dataset.open = String(city.isOpen(game, item.id));
      }
      if(item.id==='desk'){
        element.dataset.deskLamp=city.isOpen(game,'desk-lamp')?'on':'off';
        element.setAttribute('aria-pressed',String(selected==='desk'||selected==='desk-lamp'));
      }
      if (item.id === 'window') updateCurtainState(element, city.curtainState(game));
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
      if (labels.has(item.id) && item.id!=='desk') {
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
    const previous = weather.at(exterior.area.weatherSeed, blockStart - 1, 'home');
    return previous.rain ? 1 - elapsed / glassDryMinutes : 0;
  }

  // Ambient daylight uses the game clock, not the device clock.
  function corridorLighting(light,minute) {
    // Provisional public-hall schedule; the preview never changes world time.
    const hour=((minute%1440+1440)%1440)/60;
    const lampOn=corridorPreview.value==='on'||(corridorPreview.value==='auto'&&(hour>=18||hour<6));
    const result=lighting.adjacent({exterior:light,naturalReach:.48,lamps:[{on:lampOn,strength:.52,color:[244,185,112]}]});
    return {...result,lampOn};
  }
  function renderDoorAmbient(portal) {
    const door=furniture.get('door');
    if(!door)return;
    const rgb=portal.color;
    const shade=(base,mult)=>'rgb('+base.map((v,i)=>Math.round(v+rgb[i]*portal.strength*mult)).join(',')+')';
    door.style.setProperty('--portal-dark',shade([21,17,14],.30));
    door.style.setProperty('--portal-mid',shade([34,26,20],.48));
    door.style.setProperty('--portal-edge',shade([43,32,23],.58));
    door.style.setProperty('--door-light-core','rgb('+rgb.join(',')+')');
    door.style.setProperty('--door-light-strength',String(portal.strength*.48));
    const hall=get('corridor');
    hall.dataset.lamp=portal.lampOn?'on':'off';
    hall.style.setProperty('--corridor-brightness',String(.28+portal.strength*.86));
    hall.style.setProperty('--corridor-window-shade',String(Math.min(.9,1-portal.natural/.48)));
    get('corridorLightingStatus').textContent=(portal.lampOn?'走廊壁燈亮著':'走廊壁燈熄滅')+'・'+(portal.natural>.12?'有自然光':'自然光微弱');
  }

  function paintRoomLight(state) {
    lightState=state;
    lighting.paint(lightCanvas,state);
    const door=furniture.get('door');
    if(door){door.style.setProperty('--door-seam-strength',String(state.portalProjection.seam));door.style.setProperty('--door-seam-color','rgb('+state.portalProjection.color.map(Math.round).join(',')+')');}
    lightBeam.style.opacity=String(state.beam);
    lightBeam.style.setProperty('--beam-width',String(state.beamWidth));
    lightBeam.style.setProperty('--beam-color','rgb('+state.beamColor.map(Math.round).join(',')+')');
  }
  function renderRoomLighting(light,portal) {
    const windowPlacement=placements.find(p=>p.id==='window'),lampPlacement=placements.find(p=>p.id==='lamp');
    const deskPlacement=placements.find(p=>p.id==='desk');
    // Sprite coordinates: lantern flame (293,60) on the 341×269 desk asset.
    // Position from bottom-centre anchor, including editor rotation and scale.
    const width=deskPlacement.width*deskPlacement.scale/100;
    const dx=(293/341-.5)*width,dy=(60-269)/341*width*16/9;
    const a=deskPlacement.angle*Math.PI/180;
    const deskX=deskPlacement.x/100+dx*Math.cos(a)-dy*9/16*Math.sin(a);
    const deskY=deskPlacement.y/100+dx*16/9*Math.sin(a)+dy*Math.cos(a);
    const doorPlacement=placements.find(p=>p.id==='door');
    const roomRect=get('room').getBoundingClientRect(),doorRect=furniture.get('door').getBoundingClientRect();
    const doorBounds=roomRect.width>0&&roomRect.height>0&&doorRect.width>0?{x:(doorRect.left-roomRect.left)/roomRect.width,y:(doorRect.top-roomRect.top)/roomRect.height,w:doorRect.width/roomRect.width,h:doorRect.height/roomRect.height}:null;
    const state=lighting.sample({portal,doorBounds,doorOpen:city.isOpen(game,'door'),doorX:doorPlacement.x/100,doorY:doorPlacement.y/100-.22,exterior:light,curtain:city.curtainState(game),lamp:city.isOpen(game,'lamp'),deskLamp:city.isOpen(game,'desk-lamp'),windowX:windowPlacement.x/100,lampX:lampPlacement.x/100,lampY:lampPlacement.y/100,deskX,deskY});
    const key=JSON.stringify(state);
    if(key===lightTarget)return;
    lightTarget=key;
    if(lightFrame)cancelAnimationFrame(lightFrame);
    lightFrame=0;
    if(!lightState||reduceMotion.matches||game.scene!=='rental-room'||document.hidden){paintRoomLight(state);return;}
    const start=lightState,at=performance.now(),duration=Math.abs(start.transmission-state.transmission)>.01?curtainDuration:Math.abs(start.portalProjection.strength-state.portalProjection.strength)>.01?720:420;
    function step(now){const t=Math.min(1,(now-at)/duration);paintRoomLight(lighting.interpolate(start,state,t*t*(3-2*t)));if(t<1)lightFrame=requestAnimationFrame(step);else lightFrame=0;}
    lightFrame=requestAnimationFrame(step);
  }
  window.addEventListener('resize',()=>{if(game.scene==='rental-room')renderWeather();});

  function renderWeather() {
    const room = game.scene === 'rental-room';
    const preview = weatherPicker.value;
    const outside = exterior.sample(weather, game.worldMinutes, preview);
    const {actual, visible} = outside;
    const previewMinute={morning:420,noon:720,evening:1080,night:0}[lightPreview.value];
    const light=previewMinute===undefined?outside.light:exterior.ambient(previewMinute,visible.kind);
    const portal=corridorLighting(light,previewMinute??game.worldMinutes);
    renderRoomLighting(light,portal);
    renderDoorAmbient(portal);
    get('street').style.filter = 'brightness('+Math.max(.14,light.outsideBrightness)+') saturate('+light.outsideSaturation+')';
    const windowShade = furniture.get('window').querySelector('.window-exterior-shade');
    windowShade.style.opacity=String(Math.max(0,Math.min(.78,(1-(light.outsideBrightness-.1)/.98)*.78)));
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
    get('roomWeather').hidden = campaignMode||(!room && game.scene!=='rental-corridor');
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
  lightPreview.onchange=renderWeather;
  corridorPreview.onchange=renderWeather;
  weatherPicker.onchange = () => {
    const next = weatherPicker.value;
    if (next === 'auto' || weather.kinds[next]?.snow) previewRainEndedAt = null;
    else if (weather.kinds[lastWeatherPreview]?.rain && !weather.kinds[next]?.rain) {
      previewRainEndedAt = game.worldMinutes;
    }
    lastWeatherPreview = next;
    renderWeather();
  };
  reduceMotion.addEventListener('change',()=>{lightTarget=null;renderWeather();});
  portrait.addEventListener('change', renderWeather);
  document.addEventListener('visibilitychange', renderWeather);

  // One travel action; the two door toggles are visual-only and cost no world time.
  async function leaveThroughDoor() {
    if(doorTransit || game.scene!=='rental-room')return;
    doorTransit=true;
    const activeGame=game;
    const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduceMotion.matches?0:ms));
    const show=message=>{
      render();
      get('status').textContent=message;
    };
    let result;
    try{
      try{
        if(!city.isOpen(game,'door')){
          city.act(game,'door','door-open');
          show('打開房門……');
          await wait(760);
        }
        show('走出房間……');
        await wait(240);
        city.act(game,'door','door-close');
        show('隨手關上房門……');
        await wait(760);
      }catch(error){
        console.warn('Door animation interrupted; completing travel.',error);
      }
      if(game!==activeGame)return;
      if(game.scene==='rental-room')result=city.act(game,'door','leave');
      if(result?.ok)selected=null;
    }catch(error){
      console.error('Room exit failed',error);
      result={ok:false,reason:'未能切換地點，請再試一次。'};
    }finally{
      doorTransit=false;
      get('reset').disabled=false;
      get('layoutQuick').disabled=false;
      if(result)get('status').textContent=result.ok?result.message+'（'+result.minutes+'分鐘）':result.reason;
      render();
    }
  }

  // All curtain commands use the same transition and lock, including window close-up.
  async function changeCurtain(key){
    if(curtainAnimating||doorTransit||game.scene!=='rental-room')return;
    const result=city.act(game,'window',key);
    if(!result.ok){get('status').textContent=result.reason;return;}
    curtainAnimating=true;
    selected='window';
    const activeGame=game;
    try{
      get('status').textContent=result.message;
      render();
      await new Promise(resolve=>setTimeout(resolve,reduceMotion.matches?0:curtainDuration+40));
      if(activeGame!==game)return;
      if(city.curtainState(game)==='closed'&&observingWindow){
        await new Promise(resolve=>setTimeout(resolve,reduceMotion.matches?0:180));
        observingWindow=false;
      }
    }finally{
      curtainAnimating=false;
      render();
    }
  }

  function render() {
    saveCampaign();
    const room = game.scene === 'rental-room';
    if(!room||(!curtainAnimating&&city.curtainState(game)==='closed'))observingWindow=false;
    get('scene').dataset.scene = game.scene;
    get('room').dataset.observing=String(observingWindow);
    get('room').dataset.lamp = city.isOpen(game, 'lamp') ? 'on' : 'off';
    get('room').dataset.curtains = city.curtainState(game);
    editor.hidden = !room||observingWindow;
    get('clock').textContent = time.format(game.worldMinutes);
    const corridor=game.scene==='rental-corridor';
    get('place').textContent = room ? '城鎮出租屋' : corridor?'二樓公共走廊':'城鎮街道';
    get('description').textContent = observingWindow?'住宅區・二樓窗前觀景':room ? '住宅區・二樓私人房間' : corridor?'住宅區・二樓住宿區':'住宅區・街道';
    stairsButton.style.display=corridor?'':'none';returnButton.textContent=corridor?'返回房間':'返回住宅走廊';
    stairsButton.setAttribute('aria-pressed',String(selected==='stairs'));
    get('clothes').textContent = city.wornNames(game).join('、')||'室內衣著';
    reportButton.style.display=game.scene==='rental-street'?'':'none';
    reportButton.setAttribute('aria-pressed',String(selected==='report-office'));
    const report=city.reportStatus(game);
    const notice=get('notice');
    notice.textContent=report.completed?report.message:!report.read&&report.notice==='desk'?'可查看桌上的校方通知。':'燈火會報到｜第1日 09:00–11:00\n'+report.message+'\n'+report.requirements.map(r=>(r.ok?'✓ ':'○ ')+r.label).join('\n');
    notice.style.whiteSpace='pre-line';

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
    get('reset').disabled=doorTransit||curtainAnimating;
    get('layoutQuick').disabled=doorTransit||curtainAnimating||observingWindow;
    choices.replaceChildren();
    if(observingWindow){
      get('dialogTitle').textContent='窗外的城鎮';
      get('dialogText').textContent=curtainAnimating?'正在拉動窗簾……':'從二樓的窗戶望出去，屋頂與街巷在遠方延伸。';
      for(const [key,label] of city.inspect(game,'window').actions.filter(([key])=>key.startsWith('curtain-'))){
        const control=button(label,()=>{void changeCurtain(key);});
        control.disabled=curtainAnimating;
        choices.append(control);
      }
      const back=button('離開窗前',()=>{if(curtainAnimating)return;observingWindow=false;selected='window';get('status').textContent='';render();});
      back.disabled=curtainAnimating;
      choices.append(back);
      return;
    }
    if (!view) {
      get('dialogTitle').textContent = room ? '出租屋' : corridor?'二樓公共走廊':'住宅區街道';
      get('dialogText').textContent = room
        ? '你記得自己是受軍校安排來到這座城鎮。今天先安頓生活。'
        : corridor?'木造走廊通往其他房間及下樓的樓梯。':'街坊正開始一天的生活。';
      return;
    }

    get('dialogTitle').textContent = selected==='report-notice'?'報到須知':selected==='report-office'?'燈火會報到（流程測試）':room ? (labels.get(selected)??(selected==='wardrobe-items'?'衣物管理':city.wardrobeItems.find(item=>'wardrobe-item:'+item.id===selected)?.name??'衣櫃')) : selected==='stairs'?'樓梯':corridor?'返回房間':'返回住宅走廊';
    get('dialogText').textContent = view.text;
    for (const [key, label] of view.actions) {
      const choice=button(label, () => {
        if(doorTransit||curtainAnimating)return;
        if(key==='notice-back'){select('desk');return;}
        if(key==='report-back'){select(selected==='report-notice'?'report-office':null);return;}
        if(key==='notice-view'){select('report-notice');return;}
        if(key==='storage-list'){select('wardrobe-items');return;}
        if(key==='storage-back'){select('wardrobe');return;}
        if(key.startsWith('item:')){select('wardrobe-item:'+key.slice(5));return;}
        if(key.startsWith('curtain-')){void changeCurtain(key);return;}
        if(key==='leave'){void leaveThroughDoor();return;}
        const result = city.act(game, selected, key);
        get('status').textContent = result.ok
          ? result.message + (result.minutes ? '（' + result.minutes + '分鐘）' : '')
          : result.reason;
        if(result.ok&&key==='read')selected='report-notice';
        if(result.ok&&key==='look'){observingWindow=true;editor.open=false;}
        if (result.ok && (['leave','return','downstairs'].includes(key))) selected = null;
        render();
      });
      choice.disabled=doorTransit||curtainAnimating;
      choices.append(choice);
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
        renderWeather();
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
    if(doorTransit||curtainAnimating)return;
    if (!confirm(campaignMode?'重新開始城鎮旅程？目前城鎮存檔將備份，舊版森林存檔不受影響。':'重新開始城鎮開場試玩？')) return;
    const fresh=city.create();
    if(campaignMode){try{saveBlocked=!campaign.write(localStorage,fresh,{replace:true});}catch{saveBlocked=true;}if(saveBlocked)saveStatus.textContent='無法儲存，重新開始僅套用於此頁。';}
    game = fresh;
    observingWindow=false;
    weatherPicker.value = 'auto';
    lightPreview.value='auto';
    corridorPreview.value='auto';
    lastWeatherPreview = 'auto';
    previewRainEndedAt = null;
    selected = null;
    get('status').textContent = '';
    render();
  };

  renderFields();
  render();
  if(sceneOnly){
    let svgSource='',svgImage=null;
    function thumbnail(canvas){
      const g=canvas.getContext('2d'),bounds=get('scene').getBoundingClientRect();
      if(!g||!bounds.width||!bounds.height)return false;
      const width=canvas.width,height=canvas.height;
      const draw=(node)=>{if(node.tagName==='IMG'&&(!node.complete||!node.naturalWidth))return;const r=node.getBoundingClientRect();if(!r.width||!r.height)return;let opacity=1;for(let el=node;el&&el!==get('scene');el=el.parentElement){const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||el.hidden)return;opacity*=Number(cs.opacity);}if(opacity<.01)return;g.save();g.globalAlpha=opacity;try{const filter=getComputedStyle(node).filter;if(filter&&filter!=='none')g.filter=filter;g.drawImage(node,(r.left-bounds.left)*width/bounds.width,(r.top-bounds.top)*height/bounds.height,r.width*width/bounds.width,r.height*height/bounds.height);}finally{g.restore();}};
      if(game.scene!=='rental-room'){
        const svg=get(game.scene==='rental-corridor'?'corridor':'street');
        const copy=svg.cloneNode(true);copy.setAttribute('width','960');copy.setAttribute('height','540');
        const source=new XMLSerializer().serializeToString(copy);
        if(source!==svgSource){svgSource=source;svgImage=new Image();svgImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);}
        if(!svgImage?.complete||!svgImage.naturalWidth)return false;
        g.clearRect(0,0,width,height);g.save();try{g.filter=getComputedStyle(svg).filter;g.drawImage(svgImage,0,0,width,height);}finally{g.restore();}return true;
      }
      const base=get('room').querySelector('.room-base');if(!base?.complete||!base.naturalWidth)return false;
      g.clearRect(0,0,width,height);
      if(observingWindow){g.fillStyle='#211a15';g.fillRect(0,0,width,height);}
      else draw(base);
      const items=[...furniture.values()].sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0));
      for(const item of items)for(const image of item.querySelectorAll('img,canvas'))draw(image);
      draw(get('roomLighting'));return true;
    }
    window.DungeonCitySceneRendererV1=Object.freeze({update(state,observe=false){game=JSON.parse(JSON.stringify(state));observingWindow=!!observe;selected=null;render();},thumbnail});
  }
})();
