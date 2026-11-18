(function(){
  if(window.__shopReady) return;
  window.__shopReady = true;

  var state = { top: '字卡', sub: '普通字卡', openCard: null };

  window.sendGiftToChat = function(cardId, giftName, desc) {
    let msgObj = {
      id: 'msg' + Date.now().toString(36),
      type: 'gift',
      giftName: giftName || '神秘礼物',
      desc: desc || '', 
      time: Date.now(),
      isUser: false
    };
    try {
      let chatKey = 'mj_chat_v5_' + (typeof getCurrentRoleId === 'function' ? getCurrentRoleId() : 'r1');
      let msgs = JSON.parse(localStorage.getItem(chatKey) || '[]');
      msgs.push(msgObj);
      localStorage.setItem(chatKey, JSON.stringify(msgs));
      
      if(typeof renderChatFull === 'function') renderChatFull();
      if(typeof toast === 'function') toast('Ta 给你送了一份礼物');
    } catch(e) { console.error('送礼消息发送失败', e); }
    return msgObj;
  };

  window.roleSendGiftToMe = function(cardId) {
    var allCards = [];
    Object.keys(window.SHOP_DATA.cats).forEach(function(top) {
      var subData = window.SHOP_DATA.cats[top].data;
      Object.keys(subData).forEach(function(sub) {
        subData[sub].forEach(function(c) { allCards.push(c); });
      });
    });
    
    var c = allCards.find(function(x) { return x.id === cardId; });
    if(!c) return { success: false, msg: '找不到该合集' };

    var allow = lsGet('mj_shop_gift_allow_v1', false);
    if(!allow) return { success: false, msg: '你未开启接收礼物' };

    var healthMode = lsGet('mj_shop_health_v1', true);
    var allowNon = lsGet('mj_shop_gift_nonhealth_v1', false);
    if(healthMode === false && allowNon === false) {
      var isNegative = (c.tags || []).some(function(t) { return t === '负能量' || t === '攻击性' || t === '虐'; });
      if(isNegative) return { success: false, msg: '仅允许送健康物品' };
    }

    var rid = typeof getCurrentRoleId === 'function' ? getCurrentRoleId() : 'r1';
    var price = c.price || 0;
    var accRaw = localStorage.getItem('mj_account_data_v1');
    var acc = accRaw ? JSON.parse(accRaw) : { roleBalances: {} };
    if(!acc.roleBalances) acc.roleBalances = {};
    var roleBal = acc.roleBalances[rid] || 0;

    if(price > 0 && roleBal < price) {
      return { success: false, msg: '角色余额不足' };
    }

    if(price > 0) {
      acc.roleBalances[rid] = roleBal - price;
      if(!acc.records) acc.records = [];
      acc.records.unshift({
        id: Date.now().toString(36),
        title: '角色赠送字卡：' + c.name,
        time: '今天 ' + new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,'0'),
        amount: -price,
        type: 'minus',
        bankId: rid
      });
      localStorage.setItem('mj_account_data_v1', JSON.stringify(acc));
    }

    var pList = lsGet('mj_shop_purchased_v1', []);
    if (!pList.includes(c.id)) {
      pList.push(c.id);
      lsSet('mj_shop_purchased_v1', pList);
    }

    var gifts = lsGet('mj_shop_gifts_v1', []);
    gifts.push({ id: c.id, name: c.name, time: Date.now() });
    lsSet('mj_shop_gifts_v1', gifts);

    window.sendGiftToChat(c.id, c.name);
    return { success: true, card: c };
  };

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function ensureDom(){
    if(document.getElementById('shopScreen')) return;
    var d = document.createElement('div');
    d.className = 'screen';
    d.id = 'shopScreen';
    d.innerHTML =
      '<div id="utopHostShop"></div>' +
      '<div class="shop-toprow" id="shopTopRow"></div>' +
      '<div class="shop-subrow" id="shopSubRow"></div>' +
      '<div class="shop-list" id="shopList"></div>' +
      '<div class="shop-preview" id="shopPreview"></div>' +
      '<div class="shop-mask" id="shopDrawerMask"></div>' +
      '<div class="shop-drawer" id="shopDrawer">' +
        '<div class="shop-dr-head"><div class="shop-dr-title">筛 选</div></div>' +
        '<div class="shop-dr-body">' +
          '<div class="shop-dr-sec">' +
            '<div class="shop-dr-row" style="margin-bottom:12px;">' +
              '<div class="shop-dr-txt"><div class="shop-dr-name">允许角色送商城物品</div><div class="shop-dr-desc">开：角色会花钱买东西送你</div></div>' +
              '<label class="shop-sw"><input type="checkbox" id="shopGiftAllowSw"><span class="shop-sl"></span></label>' +
            '</div>' +
            '<div class="shop-dr-row" id="shopGiftNonHealthRow" style="display:none;">' +
              '<div class="shop-dr-txt"><div class="shop-dr-name">允许角色送非健康物品</div><div class="shop-dr-desc">关：只能送健康模式下的合集</div></div>' +
              '<label class="shop-sw"><input type="checkbox" id="shopGiftNonHealthSw"><span class="shop-sl"></span></label>' +
            '</div>' +
          '</div>' +
          '<div class="shop-dr-sec">' +
            '<div class="shop-dr-row">' +
              '<div class="shop-dr-txt"><div class="shop-dr-name">健康模式</div><div class="shop-dr-desc">开：仅显示甜向合集<br>关：显示所有合集</div></div>' +
              '<label class="shop-sw"><input type="checkbox" id="shopHealthSw"><span class="shop-sl"></span></label>' +
            '</div>' +
          '</div>' +
          '<div class="shop-dr-sec">' +
            '<div class="shop-dr-lbl">购 买 状 态</div>' +
            '<div class="shop-dr-chips" id="shopBuyStatusChips">' +
              '<span class="shop-chip on" data-bstatus="all">全部</span>' +
              '<span class="shop-chip" data-bstatus="bought">已购</span>' +
              '<span class="shop-chip" data-bstatus="unbought">未购</span>' +
            '</div>' +
          '</div>' +
          '<div class="shop-dr-sec">' +
            '<div class="shop-dr-lbl">标 签</div>' +
            '<div class="shop-dr-chips"><span class="shop-chip on" data-tag="">全部</span><span class="shop-chip" data-tag="基础">基础</span><span class="shop-chip" data-tag="日常">日常</span><span class="shop-chip" data-tag="名词">名词</span><span class="shop-chip" data-tag="亲昵">亲昵</span><span class="shop-chip" data-tag="占有欲">占有欲</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="shop-dr-foot"><button id="shopDrReset">重 置</button><button id="shopDrOk">确 定</button></div>' +
      '</div>' +
      '<div class="shop-mask" id="shopDisMask">' +
        '<div class="shop-modal">' +
          '<div class="shop-modal-title">使 用 须 知</div>' +
          '<div class="shop-modal-body">' +
            '<p>本商场提供的字卡内容只是作者太懒给自己做的<span class="hl">存档</span>，因为个人xp原因，部分合集包含<span class="hl">负能量、攻击性</span>或情绪化表达，也包含大量歌词字卡，属于甜宠的内容不多。在使用前应确认自身可接受此类内容。</p>' +
            '<p>选择「<span class="hl">不接受</span>」后，将屏蔽所有非甜向合集；用户可随时重新进入商场更改此选择。本商场不接受因内容风格不符预期而产生的投诉。</p>' +
            '<p>如果有不愉快的声音出现，一些攻击性字卡会变成<span class="hl">输入密码</span>才可使用。不过不管怎么样，有攻击性字卡纯粹是作者<span class="hl">抖m属性大爆发</span>，大家要和梦角好好的不要吵架呀。</p>' +
          '</div>' +
          '<div class="shop-modal-note">可联系 @001（小红书号：27739216821）投稿<br>禁搬运别人写的字卡来投稿</div>' +
          '<div class="shop-modal-acts"><button class="no" id="shopDisNo">不 接 受</button><button class="yes" id="shopDisYes">接 受</button></div>' +
        '</div>' +
      '</div>' +
      '<div class="shop-mask" id="shopVerMask">' +
        '<div class="shop-modal">' +
          '<div class="shop-modal-title" style="margin-bottom:6px">确 认 使 用</div>' +
          '<div class="shop-modal-sub">请完整输入下方文字，以便确认</div>' +
          '<div class="shop-modal-quote">我接受使用带有攻击性、负能量的字卡，并且不会抱怨和攻击作者。</div>' +
          '<textarea class="shop-modal-input" id="shopVerInput" rows="3" placeholder="请在这里一字不差地输入…"></textarea>' +
          '<div class="shop-modal-hint" id="shopVerHint">输入不完整将无法继续</div>' +
          '<div class="shop-modal-acts" style="margin-top:20px"><button class="no" id="shopVerCancel">取 消</button><button class="yes" id="shopVerOk">确 定</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);
  }

  function renderTopBarSafe(){
    var host = document.getElementById('utopHostShop');
    if(!host) return;
    host.innerHTML =
      '<div class="utop">' +
        '<button class="utop-back" type="button">‹</button>' +
        '<div class="utop-title">商 场</div>' +
        '<div class="utop-right"></div>' +
      '</div>';
    host.querySelector('.utop-back').onclick = function(){
      document.querySelectorAll('.screen.on').forEach(function(s){ s.classList.remove('on'); });
      if(typeof goToPage === 'function') goToPage('me');
    };
  }

  function renderTop(){
    var box = document.getElementById('shopTopRow');
    var tops = window.SHOP_DATA.top;
    box.innerHTML = tops.map(function(t){
      return '<div class="shop-top' + (t === state.top ? ' on' : '') + '" data-top="' + esc(t) + '">' + esc(t) + '</div>';
    }).join('');
    box.querySelectorAll('[data-top]').forEach(function(el){
      el.onclick = function(){
        state.top = el.dataset.top;
        var subs = (window.SHOP_DATA.cats[state.top] || {}).subs || [];
        state.sub = subs[0] || '';
        renderAll();
      };
    });
  }

  function renderSub(){
    var box = document.getElementById('shopSubRow');
    var subs = (window.SHOP_DATA.cats[state.top] || {}).subs || [];
    if(!subs.length){ box.innerHTML = ''; box.style.display = 'none'; return; }
    box.style.display = 'flex';
    box.innerHTML = subs.map(function(s){
      return '<div class="shop-sub' + (s === state.sub ? ' on' : '') + '" data-sub="' + esc(s) + '">' + esc(s) + '</div>';
    }).join('');
    box.querySelectorAll('[data-sub]').forEach(function(el){
      el.onclick = function(){ state.sub = el.dataset.sub; renderAll(); };
    });
  }

  function renderList(){
    var box = document.getElementById('shopList');
    var arr = ((window.SHOP_DATA.cats[state.top] || {}).data || {})[state.sub] || [];
    arr = arr.slice().reverse();
    if(state.healthMode){
      arr = arr.filter(function(c){
        if(c.id === 'adj-size' || c.id === 'adj-trait') return false;
        if(c.id === 'philosophy-dark' || c.id === 'daily-chat' || c.id === 'daily-chat-2') return false;
        return !(c.tags || []).some(function(t){ return t === '负能量' || t === '攻击性' || t === '虐'; });
      });
    }
    if(state.filterTag){
      arr = arr.filter(function(c){
        return (c.tags || []).indexOf(state.filterTag) >= 0;
      });
    }
    if(state.filterBought && state.filterBought !== 'all'){
      var pList = lsGet('mj_shop_purchased_v1', []);
      arr = arr.filter(function(c){
        var isB = pList.includes(c.id);
        if(state.filterBought === 'bought') return isB;
        if(state.filterBought === 'unbought') return !isB;
        return true;
      });
    }
    if(!arr.length){
      box.innerHTML = '<div class="shop-empty">没有符合筛选的合集</div>';
      return;
    }
    var purchasedList = lsGet('mj_shop_purchased_v1', []);
    box.innerHTML = arr.map(function(c){
      var tags = (c.tags || []).filter(function(t){ return t !== '负能量' && t !== '攻击性'; }).map(function(t){ return '<span class="shop-tag">' + esc(t) + '</span>'; }).join('');
      var author = c.author ? ('<span class="shop-author">' + esc(c.author) + '</span>') : '';
      var isBought = purchasedList.includes(c.id);
      var boughtBadge = isBought ? '<span style="font-size:9px;color:#fff;background:var(--th-text);padding:2px 6px;border-radius:4px;margin-left:6px;letter-spacing:1px;vertical-align:middle;">已购</span>' : '';
      
      return '<div class="shop-fold" data-cid="' + esc(c.id) + '">' +
        '<div class="shop-fold-main">' +
          '<div class="shop-fold-name">' + esc(c.name) + boughtBadge + '</div>' +
          '<div class="shop-fold-desc">' + esc(c.desc) + '</div>' +
          '<div class="shop-fold-meta">' + author + tags + '</div>' +
        '</div>' +
        '<span class="shop-arrow">›</span>' +
      '</div>';
    }).join('');
    box.querySelectorAll('[data-cid]').forEach(function(el){
      el.onclick = function(){ openPreview(el.dataset.cid); };
    });
  }

  function initLogic(){
    var hasVerified = lsGet('mj_shop_verified_v1', false);
    var disMask = document.getElementById('shopDisMask');
    var verMask = document.getElementById('shopVerMask');
    var verInput = document.getElementById('shopVerInput');
    var verHint = document.getElementById('shopVerHint');
    var drMask = document.getElementById('shopDrawerMask');
    var dr = document.getElementById('shopDrawer');
    var healthSw = document.getElementById('shopHealthSw');
    var giftAllowSw = document.getElementById('shopGiftAllowSw');
    var giftNonHealthSw = document.getElementById('shopGiftNonHealthSw');
    var giftNonHealthRow = document.getElementById('shopGiftNonHealthRow');

    state.healthMode = lsGet('mj_shop_health_v1', !hasVerified);

    window.openVerifyDialog = function(cb){
      verInput.value = '';
      verHint.textContent = '输入不完整将无法继续';
      verHint.classList.remove('err');
      verMask.classList.add('on');
      window.__shopVerCb = cb;
    };

    document.getElementById('shopVerCancel').onclick = function(){ verMask.classList.remove('on'); };
    document.getElementById('shopVerOk').onclick = function(){
      var txt = verInput.value.trim().replace(/\s+/g, '');
      if(txt === '我接受使用带有攻击性、负能量的字卡，并且不会抱怨和攻击作者。'){
        lsSet('mj_shop_verified_v1', true);
        verMask.classList.remove('on');
        if(typeof window.__shopVerCb === 'function') window.__shopVerCb();
      } else {
        verHint.textContent = '文字不匹配，请一字不差地输入';
        verHint.classList.add('err');
      }
    };

    document.getElementById('shopDisYes').onclick = function(){
      disMask.classList.remove('on');
      window.openVerifyDialog(function(){
        state.healthMode = false;
        lsSet('mj_shop_health_v1', false);
        healthSw.checked = false;
        renderList();
      });
    };
    document.getElementById('shopDisNo').onclick = function(){
      disMask.classList.remove('on');
      state.healthMode = true;
      lsSet('mj_shop_health_v1', true);
      healthSw.checked = true;
      renderList();
    };

    document.getElementById('shopDrawerMask').onclick = function(){
      drMask.classList.remove('on'); dr.classList.remove('on');
    };
    document.getElementById('shopDrOk').onclick = function(){
      drMask.classList.remove('on'); dr.classList.remove('on');
      renderList();
    };
    document.getElementById('shopDrReset').onclick = function(){
      document.querySelectorAll('.shop-chip').forEach(function(el){
        el.classList.toggle('on', el.dataset.tag === '');
      });
      state.filterTag = '';
    };
    document.querySelectorAll('.shop-chip').forEach(function(el){
      el.onclick = function(){
        // 如果是购买状态，去对应的容器里取消高亮
        if (el.hasAttribute('data-bstatus')) {
          document.querySelectorAll('#shopBuyStatusChips .shop-chip').forEach(function(e){ e.classList.remove('on'); });
          el.classList.add('on');
          state.filterBought = el.dataset.bstatus || 'all';
        } else {
          document.querySelectorAll('.shop-chip:not([data-bstatus])').forEach(function(e){ e.classList.remove('on'); });
          el.classList.add('on');
          state.filterTag = el.dataset.tag || '';
        }
      };
    });

    // 初始化送礼开关状态
    var giftAllow = lsGet('mj_shop_gift_allow_v1', false);
    var giftNonHealth = lsGet('mj_shop_gift_nonhealth_v1', false);
    if (giftAllowSw) giftAllowSw.checked = giftAllow;
    if (giftNonHealthSw) giftNonHealthSw.checked = giftNonHealth;
    
    function updateGiftRows() {
      if (giftNonHealthRow) {
        giftNonHealthRow.style.display = state.healthMode ? 'none' : 'flex';
      }
    }
    updateGiftRows();

    if (giftAllowSw) {
      giftAllowSw.onchange = function() {
        lsSet('mj_shop_gift_allow_v1', this.checked);
        if(typeof toast === 'function') toast(this.checked ? '已允许角色送礼' : '已关闭角色送礼');
      };
    }

    if (giftNonHealthSw) {
      giftNonHealthSw.onchange = function() {
        lsSet('mj_shop_gift_nonhealth_v1', this.checked);
        if(typeof toast === 'function') toast(this.checked ? '已允许非健康送礼' : '已限制非健康送礼');
      };
    }

    healthSw.checked = state.healthMode;
    healthSw.onchange = function(){
      var isChecked = this.checked;
      if(!isChecked && !lsGet('mj_shop_verified_v1', false)){
        this.checked = true;
        window.openVerifyDialog(function(){
          state.healthMode = false;
          healthSw.checked = false;
          lsSet('mj_shop_health_v1', false);
        });
      } else {
        state.healthMode = isChecked;
        lsSet('mj_shop_health_v1', isChecked);
      }
    };

    window.__shopShowMask = function(){
      if(!lsGet('mj_shop_verified_v1', false) && lsGet('mj_shop_health_v1', null) === null){
        disMask.classList.add('on');
      }
    };
  }

  function addCollectionToStore(c){
    if(!c || !Array.isArray(c.cards)) return { added: 0, dup: 0, groupName: '' };
    var groups = cardStore.public;

    var targetName = '普通字卡';
    var targetId = 'g-normal';
    if(c.id === 'mood'){ targetName = '心情'; targetId = 'g-mood'; }
    else if(c.id === 'status' || c.id === 'clean'){ targetName = '状态'; targetId = 'g-status'; }
    else if(c.id === 'choco-demand' || c.id === 'base-demand'){ targetName = '字卡需求'; targetId = 'g-demand'; }

    var g = groups.find(function(x){ return x && (x.id === targetId || x.name === targetName); });
    if(!g){
      g = { id: targetId, name: targetName, icon: 'doc', sub: '', cats: [] };
      groups.push(g);
    }
    if(!Array.isArray(g.cats)) g.cats = [];

    var catName = c.name || '未命名合集';
    var cat = g.cats.find(function(x){ return x && x.name === catName; });
    if(!cat){
      cat = { id: 'c-shop-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: catName, list: [] };
      g.cats.push(cat);
    }
    if(!Array.isArray(cat.list)) cat.list = [];

    var exist = {};
    cat.list.forEach(function(it){
      var t = (typeof it === 'string') ? it : (it && it.text ? it.text : '');
      if(t) exist[String(t).trim()] = 1;
    });

    var added = 0, dup = 0;
    c.cards.forEach(function(t){
      var s = String(t || '').trim();
      if(!s) return;
      if(exist[s]){ dup++; return; }
      cat.list.push({ text: s, t: Date.now() });
      exist[s] = 1;
      added++;
    });

    saveCardStore();
    return { added: added, dup: dup, groupName: targetName + ' / ' + catName };
  }

  function downloadCollection(c){
    if(!c || !Array.isArray(c.cards)) return;
    var gid = 'g-import-' + Date.now().toString(36);
    var data = {
      __type: 'choco-cards',
      __version: 1,
      exportedAt: Date.now(),
      public: [{
        id: gid,
        name: c.name || '未命名合集',
        icon: 'doc',
        sub: c.desc || '',
        cats: [{ id: 'c-import-1', name: '全部', list: c.cards.map(function(t){ return { text: String(t), t: Date.now() }; }) }]
      }],
      roles: {}
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (c.name || '字卡') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  function findCard(id){
    var arr = ((window.SHOP_DATA.cats[state.top] || {}).data || {})[state.sub] || [];
    for(var i = 0; i < arr.length; i++){ if(arr[i].id === id) return arr[i]; }
    return null;
  }

  function openPreview(id){
    var c = findCard(id);
    if(!c) return;
    state.openCard = c;
    
    // 检查是否买过这个合集
    var purchasedList = lsGet('mj_shop_purchased_v1', []);
    var isBought = purchasedList.includes(c.id);
    var showBuyStyle = isBought ? 'display:none;' : '';
    var showActionStyle = isBought ? 'display:flex;' : 'display:none;';

    var pv = document.getElementById('shopPreview');
    pv.innerHTML =
      '<div class="shop-pv-top">' +
        '<button class="shop-pv-back" type="button">‹</button>' +
        '<div class="shop-pv-title">' + esc(c.name) + '</div>' +
        '<div class="shop-pv-right"></div>' +
      '</div>' +
      '<div class="shop-pv-body">' +
        '<div class="shop-pv-desc">' + esc(c.desc) + '</div>' +
        (c.cards || []).map(function(t){ return '<div class="shop-pv-line">' + esc(t) + '</div>'; }).join('') +
      '</div>' +
      '<div class="shop-pv-btns" id="shopPvBtns" style="padding: 16px 22px calc(16px + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: center; background: var(--th-bg1); border-top: 0.5px dashed var(--th-line); box-sizing: border-box; width: 100%; height: 72px;">' +
        // 状态1：未购买
        '<div id="shopStateBuy" style="display: flex; justify-content: center; width: 100%; ' + showBuyStyle + '">' +
          '<button id="shopBuyBtn" type="button" style="font-size: 16px; color: var(--th-text); letter-spacing: 2px; background: transparent; border: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center;">' +
            '<span style="font-family: \'Helvetica Neue\', Helvetica, sans-serif; margin-right: 6px; font-weight: 500;">₵ ' + (c.price ? c.price.toFixed(2) : '0.00') + '</span> ' + (c.price ? '购买' : '获取') +
          '</button>' +
        '</div>' +
        // 状态2：已购买
        '<div id="shopStateUse" style="display: ' + (isBought ? 'flex' : 'none') + '; justify-content: space-between; width: 100%; align-items: center;">' +
          '<button id="shopUseBtn" type="button" style="flex: 1; text-align: center; background: transparent; border: none; font-size: 15px; letter-spacing: 2px; cursor: pointer; font-family: inherit; padding: 10px 0; color: var(--th-text); font-weight: 500;">直接使用</button>' +
          '<div style="width: 1px; height: 16px; background: var(--th-line); margin: 0 20px;"></div>' +
          '<button id="shopDlBtn" type="button" style="flex: 1; text-align: center; background: transparent; border: none; font-size: 15px; letter-spacing: 2px; cursor: pointer; font-family: inherit; padding: 10px 0; color: var(--th-text-soft);">下载</button>' +
        '</div>' +
      '</div>';
    pv.classList.add('on');
    pv.querySelector('.shop-pv-back').onclick = closePreview;

    var buyBtn = pv.querySelector('#shopBuyBtn');
    var useBtn = pv.querySelector('#shopUseBtn');
    var dlBtn = pv.querySelector('#shopDlBtn');

    var stateBuy = pv.querySelector('#shopStateBuy');
    var stateUse = pv.querySelector('#shopStateUse');

    buyBtn.onclick = function(){
      var price = c.price || 0;
      
      if (price > 0) {
        // ★ 获取账户状态，判断是否绑定了亲情卡
        var accountData = { myBalance: 0, bindStatus: false };
        try {
          var accRaw = localStorage.getItem('mj_account_data_v1');
          if(accRaw) accountData = JSON.parse(accRaw);
        } catch(e){}

        // ★ 如果绑定了亲情卡：直接走九宫格收银台
        if (accountData.bindStatus) {
          if(typeof window.openPaymentDesk === 'function') {
            window.openPaymentDesk(price, c.name, function() {
              var purchasedList = lsGet('mj_shop_purchased_v1', []);
              if (!purchasedList.includes(c.id)) {
                purchasedList.push(c.id);
                lsSet('mj_shop_purchased_v1', purchasedList);
              }
              if(stateBuy) stateBuy.style.display = 'none';
              if(stateUse) stateUse.style.display = 'flex';
              if(typeof toast === 'function') toast('支付成功，已解锁');
              if(typeof renderList === 'function') renderList();
            });
          } else {
            if(typeof toast === 'function') toast('支付模块加载失败');
          }
          return;
        }

        // ★ 未绑定亲情卡：先弹通用确认框
        if (typeof uniConfirm === 'function') {
          uniConfirm({
            title: '购买字卡',
            body: '确认花费 ₵ ' + price.toFixed(2) + ' 购买「' + c.name + '」吗？',
            okText: '确 认',
            cancelText: '取 消'
          }).then(function(ok){
            if (!ok) return;

            // 点确认后，走原来的直接扣款逻辑
            if ((accountData.myBalance || 0) < price) {
              if(typeof toast === 'function') toast('余额不足，请前往资产页充值');
              return;
            }

            try {
              accountData.myBalance -= price;
              accountData.mySpent = (accountData.mySpent || 0) + price;
              if(!accountData.records) accountData.records = [];
              var d = new Date();
              var timeStr = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
              accountData.records.unshift({
                id: Date.now().toString(36),
                title: '购买字卡：' + c.name,
                time: timeStr,
                amount: -price,
                type: 'minus'
              });
              localStorage.setItem('mj_account_data_v1', JSON.stringify(accountData));
            } catch(e) { console.error('扣款失败', e); }

            var purchasedList = lsGet('mj_shop_purchased_v1', []);
            if (!purchasedList.includes(c.id)) {
              purchasedList.push(c.id);
              lsSet('mj_shop_purchased_v1', purchasedList);
            }
            if(stateBuy) stateBuy.style.display = 'none';
            if(stateUse) stateUse.style.display = 'flex';
            if(typeof toast === 'function') toast('支付成功，已解锁');
            if(typeof renderList === 'function') renderList();
          });
          return;
        }

        // ★ 兜底：如果没拿到 uniConfirm，直接扣款
        if ((accountData.myBalance || 0) < price) {
          if(typeof toast === 'function') toast('余额不足，请前往资产页充值或使用亲情卡');
          return;
        }

        // ★ 兜底：如果没拿到 uniConfirm，直接扣款
        if ((accountData.myBalance || 0) < price) {
          if(typeof toast === 'function') toast('余额不足，请前往资产页充值或使用亲情卡');
          return;
        }

        // ★ 核心修复：无论走不走弹窗，都要确保已购记录被存下来
        try {
          accountData.myBalance -= price;
          accountData.mySpent = (accountData.mySpent || 0) + price;
          if(!accountData.records) accountData.records = [];
          var d = new Date();
          var timeStr = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          accountData.records.unshift({
            id: Date.now().toString(36),
            title: '购买字卡：' + c.name,
            time: timeStr,
            amount: -price,
            type: 'minus'
          });
          localStorage.setItem('mj_account_data_v1', JSON.stringify(accountData));
        } catch(e) { console.error('扣款失败', e); }

        var purchasedList = lsGet('mj_shop_purchased_v1', []);
        if (!purchasedList.includes(c.id)) {
          purchasedList.push(c.id);
          lsSet('mj_shop_purchased_v1', purchasedList);
        }
        if(stateBuy) stateBuy.style.display = 'none';
        if(stateUse) stateUse.style.display = 'flex';
        if(typeof toast === 'function') toast('支付成功，已解锁');
        
      } else {
        // 免费获取
        var purchasedList = lsGet('mj_shop_purchased_v1', []);
        if (!purchasedList.includes(c.id)) {
          purchasedList.push(c.id);
          lsSet('mj_shop_purchased_v1', purchasedList);
        }
        if(stateBuy) stateBuy.style.display = 'none';
        if(stateUse) stateUse.style.display = 'flex';
        if(typeof toast === 'function') toast('已解锁，请选择操作');
      }
    };

    dlBtn.onclick = function(){
      downloadCollection(c);
      if(typeof toast === 'function') toast('已下载');
    };

    useBtn.onclick = function(){
      var r = addCollectionToStore(c);
      var msg = '已添加到：' + r.groupName;
      if(r.dup) msg += '（跳过 ' + r.dup + ' 条重复）';
      
      var t = document.getElementById('shopToast');
      if(!t){
        t = document.createElement('div');
        t.id = 'shopToast';
        t.className = 'shop-toast';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(function(){ t.classList.remove('show'); }, 2500);
      closePreview();
    };
  }

  function closePreview(){
    document.getElementById('shopPreview').classList.remove('on');
    state.openCard = null;
  }

  function renderAll(){ renderTop(); renderSub(); renderList(); }

  function openShop(){
    ensureDom();
    renderTopBarSafe();
    if(!window.__shopLogicInited){
      initLogic();
      window.__shopLogicInited = true;
    }
    state.top = '字卡';
    var subs = (window.SHOP_DATA.cats['字卡'] || {}).subs || [];
    state.sub = subs[0] || '';
    renderAll();
    
    if(typeof showScreen === 'function') showScreen('shopScreen');
    else {
      document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('on'); });
      document.getElementById('shopScreen').classList.add('on');
    }

    var rightHost = document.querySelector('#utopHostShop .utop-right');
    if(rightHost){
      rightHost.innerHTML = '<button class="utop-act txt" id="shopFilterBtn" type="button" style="letter-spacing:1px;padding-right:4px">筛选</button>';
      document.getElementById('shopFilterBtn').onclick = function(){
        document.getElementById('shopDrawerMask').classList.add('on');
        document.getElementById('shopDrawer').classList.add('on');
      };
    }
    
    if(window.__shopShowMask) window.__shopShowMask();
  }

  window.openShop = openShop;

  document.addEventListener('click', function(e){
    var row = e.target && e.target.closest ? e.target.closest('#page-me .me-row[data-func="shop"]') : null;
    if(!row) return;
    e.preventDefault();
    e.stopPropagation();
    openShop();
  }, true);

  // ================= 极简九宫格收银台 =================
  window.openPaymentDesk = function(price, cardName, onSuccess) {
    var mask = document.createElement('div');
    mask.className = 'pay-mask';
    mask.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.98);display:flex;align-items:center;justify-content:center;z-index:2147483647;animation:fadeIn 0.3s ease;';

    // 获取真实的账户数据
    var accountData = { myBalance: 0, roleBalances: {} };
    try {
      var accRaw = localStorage.getItem('mj_account_data_v1');
      if (accRaw) accountData = JSON.parse(accRaw);
    } catch(e) {}
    if (typeof accountData.myBalance !== 'number') accountData.myBalance = 1000;
    if (!accountData.roleBalances) accountData.roleBalances = {};
    var role = typeof getRole === 'function' ? getRole() : { id: 'r1', name: '角色' };
    var roleName = (typeof displayName === 'function') ? displayName(role) : (role.name || '角色');
    var roleId = role.id || 'r1';

    // 构建当前银行卡列表
    var banks = [
      { id: 'me', name: '我的银行卡', balance: accountData.myBalance, isRole: false },
      { id: roleId, name: '「' + roleName + '」的亲情卡', balance: accountData.roleBalances[roleId] || 0, isRole: true }
    ];

    var lastPayBankId = '';
    try { lastPayBankId = localStorage.getItem('mj_last_pay_bank') || ''; } catch(e) {}
    var currentBank = banks.find(function(b) { return b.id === lastPayBankId; }) || banks[0];
    var currentPwd = '';

    function renderUI() {
      mask.innerHTML = 
        '<div style="width:100%;max-width:400px;background:#fff;padding:40px 30px;display:flex;flex-direction:column;box-sizing:border-box;font-family:\'Songti SC\',STSong,SimSun,serif;position:relative;">' +
          '<div id="payCloseBtn" style="position:absolute;top:20px;left:20px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#111;cursor:pointer;font-family:Arial,sans-serif;font-weight:300;padding-bottom:4px;">‹</div>' +
          '<div style="text-align:center;margin-bottom:24px;">' +
            '<div style="font-size:11px;color:#999;letter-spacing:4px;margin-bottom:16px;">支 付 金 额</div>' +
            '<div style="font-size:42px;font-weight:300;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:2px;"><small style="font-size:20px;margin-right:6px;">₵</small>' + price.toFixed(2) + '</div>' +
          '</div>' +
          '<div id="payMethodBox" style="border-top:0.5px dashed #eee;border-bottom:0.5px dashed #eee;padding:16px 0;margin-bottom:36px;display:flex;flex-direction:column;gap:10px;cursor:pointer;">' +
            '<div style="font-size:11px;color:#999;letter-spacing:1px;">付 款 方 式</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div class="pay-method-av" style="width:28px;height:28px;flex:none;border-radius:var(--avatar-radius,12%);overflow:hidden;position:relative;background:#f5f5f5;border:0.5px solid #eee;">' +
                  (currentBank.id === 'me' ? (typeof userAvHTML === 'function' ? userAvHTML(userProfile.avatar) : '') : (typeof avatarHTML === 'function' ? avatarHTML(role.avatar) : '')) +
                  '<style>.pay-method-av * { width:100% !important; height:100% !important; margin:0 !important; padding:0 !important; max-width:28px !important; max-height:28px !important; object-fit:cover !important; border-radius:inherit !important; display:block !important; }</style>' +
                '</div>' +
                '<div style="font-size:14px;color:#111;font-weight:500;">' + currentBank.name + '</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="font-size:12px;color:#999;font-family:\'Helvetica Neue\',sans-serif;">余额 ₵ ' + currentBank.balance.toFixed(2) + '</div>' +
                '<div style="font-size:14px;color:#ccc;font-family:Arial,sans-serif;">›</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:center;gap:22px;margin-bottom:50px;" id="payDots">' +
            '<div class="p-dot" style="width:8px;height:8px;border-radius:50%;background:#e8e8e8;transition:all 0.2s;"></div>'.repeat(6) +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px 0;">' +
            ['1','2','3','4','5','6','7','8','9','','0','del'].map(k => {
              if(k === '') return '<div></div>';
              if(k === 'del') return '<div class="p-key" data-k="del" style="height:60px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#111"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg></div>';
              return '<div class="p-key" data-k="' + k + '" style="height:60px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:400;cursor:pointer;color:#111;transition:opacity 0.1s;">' + k + '</div>';
            }).join('') +
          '</div>' +
        '</div>';

      // 绑定输入键盘
      mask.querySelectorAll('.p-key').forEach(function(btn) {
        btn.onclick = function() {
          var k = this.getAttribute('data-k');
          if (k === 'del') {
            currentPwd = currentPwd.slice(0, -1);
          } else {
            if (currentPwd.length >= 6) return;
            if (currentBank.balance < price) {
              if(typeof toast === 'function') toast('当前选中的卡余额不足！');
              return;
            }
            currentPwd += k;
          }
          updateDots();
          if (currentPwd.length === 6) {
            setTimeout(doPay, 200);
          }
        };
      });

      // 绑定关闭按钮
      mask.querySelector('#payCloseBtn').onclick = function(e) {
        e.stopPropagation();
        mask.remove();
      };

      // 绑定换卡点击
      mask.querySelector('#payMethodBox').onclick = function(e) {
        e.stopPropagation();
        openBankList();
      };
    }

    function updateDots() {
      var dots = mask.querySelectorAll('.p-dot');
      dots.forEach(function(dot, i) {
        dot.style.background = i < currentPwd.length ? '#111' : '#e8e8e8';
        dot.style.transform = i < currentPwd.length ? 'scale(1.3)' : 'scale(1)';
      });
    }

    function openBankList() {
      var bankHtml = banks.map(function(b) {
        var isOn = b.id === currentBank.id;
        return '<div class="bank-item" data-id="' + b.id + '" style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;cursor:pointer;border-bottom:0.5px dashed #eee;">' +
          '<div style="display:flex;align-items:center;gap:16px;">' +
            '<div class="pay-bank-av" style="width:32px;height:32px;flex:none;border-radius:var(--avatar-radius,12%);overflow:hidden;position:relative;background:#f5f5f5;border:0.5px solid #eee;">' +
              (b.id === 'me' ? (typeof userAvHTML === 'function' ? userAvHTML(userProfile.avatar) : '') : (typeof avatarHTML === 'function' ? avatarHTML(role.avatar) : '')) +
              '<style>.pay-bank-av * { width:100% !important; height:100% !important; margin:0 !important; padding:0 !important; max-width:32px !important; max-height:32px !important; object-fit:cover !important; border-radius:inherit !important; display:block !important; }</style>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
              '<div style="font-size:15px;color:#111;letter-spacing:1px;">' + b.name + '</div>' +
              '<div style="font-size:11px;color:#999;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">可用余额 ₵ ' + b.balance.toFixed(2) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="width:16px;height:16px;border-radius:50%;border:1px solid #ccc;' + (isOn ? 'background:#111;border-color:#111;' : '') + '"></div>' +
        '</div>';
      }).join('');

      var listMask = document.createElement('div');
      listMask.style.cssText = 'position:absolute;inset:0;background:#fff;z-index:110;display:flex;flex-direction:column;animation:slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);';
      listMask.innerHTML = 
        '<div style="display:flex;align-items:center;padding:20px 24px;border-bottom:0.5px dashed #eee;">' +
          '<div id="closeBankBtn" style="font-size:22px;color:#111;cursor:pointer;padding-right:20px;font-weight:300;">‹</div>' +
          '<div style="font-size:14px;letter-spacing:4px;">付 款 方 式</div>' +
        '</div>' +
        '<div style="padding:20px 0;overflow-y:auto;">' + bankHtml + '</div>';

      mask.appendChild(listMask);

      listMask.querySelector('#closeBankBtn').onclick = function() {
        listMask.remove();
      };

      listMask.querySelectorAll('.bank-item').forEach(function(item) {
        item.onclick = function() {
          var bid = this.getAttribute('data-id');
          currentBank = banks.find(function(b) { return b.id === bid; });
          currentPwd = '';
          listMask.remove();
          renderUI();
        };
      });
    }

    function doPay() {
      // ★ 核心校验：去拿真正的密码
      var realPwd = '';
      try {
        var accRaw = localStorage.getItem('mj_account_data_v1');
        if (accRaw) {
          var acc = JSON.parse(accRaw);
          realPwd = acc.payPwd || '';
        }
      } catch(e) {}

      // 如果设置过密码，且输入的跟设置的不一样，就报错
      if (realPwd && currentPwd !== realPwd) {
        if(typeof toast === 'function') toast('支付密码错误');
        currentPwd = '';
        updateDots();
        return;
      }

      if (currentBank.balance < price) {
        if(typeof toast === 'function') toast('余额不足');
        currentPwd = '';
        updateDots();
        return;
      }

      // ★ 真实扣款并写入账单
      try {
        var accRaw = localStorage.getItem('mj_account_data_v1');
        var data = accRaw ? JSON.parse(accRaw) : { myBalance: 1000, mySpent: 0, bindStatus: false, roleBalances: {}, records: [] };
        
        if (currentBank.id === 'me') {
          data.myBalance = (data.myBalance || 0) - price;
          data.mySpent = (data.mySpent || 0) + price;
        } else {
          data.roleBalances[currentBank.id] = (data.roleBalances[currentBank.id] || 0) - price;
        }
        
        if(!data.records) data.records = [];
        var d = new Date();
        var timeStr = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        data.records.unshift({
          id: Date.now().toString(36),
          title: '购买字卡：' + cardName,
          time: timeStr,
          amount: -price,
          type: 'minus'
        });
        
        localStorage.setItem('mj_account_data_v1', JSON.stringify(data));
      } catch(e) { console.error('扣款失败', e); }

      try { localStorage.setItem('mj_last_pay_bank', currentBank.id); } catch(e) {}
      if(typeof toast === 'function') toast('支付成功');
      mask.remove();
      if (typeof onSuccess === 'function') onSuccess();
    }

    // 初始化
    renderUI();
    document.body.appendChild(mask);
  }; // ★ 注意这里变成了分号，因为上面改成了 window.openPaymentDesk = function 赋值写法

  // ================= 每日 0 点送礼摇号机制 =================
  function initDailyGiftScheduler() {
    var rid = typeof getCurrentRoleId === 'function' ? getCurrentRoleId() : 'r1';
    var todayStr = new Date().toDateString();
    var recordKey = 'mj_gift_schedule_' + rid;
    var rec = lsGet(recordKey, null);

    if (!rec || rec.date !== todayStr) {
      var willGift = Math.random() < 0.10; // 10% 概率触发
      var schedule = { date: todayStr, willGift: willGift, tasks: [] };

      if (willGift) {
        var count = Math.floor(Math.random() * 5) + 1; // 1~5 次
        for (var i = 0; i < count; i++) {
          var hour = Math.floor(Math.random() * 15) + 8;
          var min = Math.floor(Math.random() * 60);
          schedule.tasks.push({ time: String(hour).padStart(2,'0') + ':' + String(min).padStart(2,'0'), done: false });
        }
        schedule.tasks.sort(function(a, b) { return a.time.localeCompare(b.time); });
      }
      lsSet(recordKey, schedule);
      rec = schedule;
    }

    if (rec && rec.willGift) {
      var now = new Date();
      var nowTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      
      var hasNewGift = false;
      rec.tasks.forEach(function(task) {
        if (!task.done && nowTimeStr >= task.time) {
          if (typeof window.roleSendGiftToMe === 'function') {
            var allCards = [];
            Object.keys(window.SHOP_DATA.cats).forEach(function(top) {
              var subData = window.SHOP_DATA.cats[top].data;
              Object.keys(subData).forEach(function(sub) {
                subData[sub].forEach(function(c) { allCards.push(c); });
              });
            });
            
            // ★ 核心修复：把用户已经拥有的（已购列表里）剔除掉
            var pList = (typeof lsGet === 'function') ? lsGet('mj_shop_purchased_v1', []) : [];
            var unpurchasedCards = allCards.filter(function(c) {
              return !pList.includes(c.id);
            });

            if(unpurchasedCards.length > 0) {
              var c = unpurchasedCards[Math.floor(Math.random() * unpurchasedCards.length)];
              window.roleSendGiftToMe(c.id);
            } else {
              console.log('角色想送礼，但用户已经买齐了所有东西');
            }
          }
          task.done = true;
          hasNewGift = true;
        }
      });

      if (hasNewGift) lsSet(recordKey, rec);
    }
  }

  setTimeout(initDailyGiftScheduler, 3000);
  setInterval(initDailyGiftScheduler, 60000);

  // ================= 聊天界面礼物自动渲染补丁 =================
  function patchGiftRender() {
    var box = document.getElementById('chatList');
    if (!box) return;

    // 避免重复插入同一个礼物
    var rid = typeof getCurrentRoleId === 'function' ? getCurrentRoleId() : 'r1';
    var msgs = JSON.parse(localStorage.getItem('mj_chat_v5_' + rid) || '[]');
    var gifts = msgs.filter(function(m) { return m.type === 'gift'; });

    if (gifts.length === 0) return;

    gifts.forEach(function(g) {
      if (box.querySelector('[data-gift-id="' + g.id + '"]')) return;

      var desc = g.desc || '这个合集应该很适合你';
      var html = `
        <div class="gift-card-wrap" data-gift-id="${g.id}">
          <div class="gift-card-hint">Ta 给你送了一份礼物</div>
          <div class="gift-card-box">
            <h3 class="gift-card-title">「${g.giftName}」</h3>
            <p class="gift-card-desc">${desc}</p>
            <button class="gift-card-btn" onclick="if(typeof openShop==='function') { if(typeof closeAllThings==='function') closeAllThings(); openShop(); }">去商城使用</button>
          </div>
        </div>`;
      box.insertAdjacentHTML('beforeend', html);
    });

    // 自动滚动到底部
    setTimeout(function() {
      box.scrollTop = box.scrollHeight;
    }, 100);
  }

  // 监听聊天界面的变化（每次有新消息或刷新都会触发）
  setInterval(patchGiftRender, 1000); // 每秒检查一次

})();