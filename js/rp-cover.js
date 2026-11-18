(function(){
  if(window.__rpCoverReady) return;
  window.__rpCoverReady = true;

  var RP_COVER_KEY = 'mj_rp_cover_v1'; // { [roleId]: { key, opacity, blur } }

  function getRpCoverCfg() {
    var rid = getCurrentRoleId();
    var m = lsGet(RP_COVER_KEY, {});
    if (!m[rid]) m[rid] = { key: '', opacity: 100, blur: 0 };
    return m[rid];
  }
  function saveRpCoverCfg(cfg) {
    var rid = getCurrentRoleId();
    var m = lsGet(RP_COVER_KEY, {});
    m[rid] = cfg;
    lsSet(RP_COVER_KEY, m);
  }

  // 提供给外部获取背景样式的接口
  window.getRpCoverStyle = function() {
    var c = getRpCoverCfg();
    if (!c.key) return { has: false, css: '' };
    return { has: true, key: c.key, opacity: c.opacity, blur: c.blur };
  };

  // 用于在“上传背景”面板里渲染底部的红包封面设置区
  window.renderRpCoverPanel = function() {
    renderRpPanelState();
  };

  function renderRpPanelState() {
    var c = getRpCoverCfg();
    var prev = document.getElementById('rpCoverPreview');
    
    if (c.key && window.__idb) {
      window.__idb.toURL(c.key).then(function(url){
        if (url && prev) {
          prev.innerHTML = '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;display:block;">';
        }
      }).catch(function(){});
    } else if (prev) {
      prev.innerHTML = '<span class="ph" style="font-size:12px;color:#c8c8c8;">还没上传</span>';
    }

    var op = document.getElementById('rpCoverOpacity');
    if(op) op.value = c.opacity;
    var opv = document.getElementById('rpCoverOpacityVal');
    if(opv) opv.textContent = c.opacity + '%';
    
    var bl = document.getElementById('rpCoverBlur');
    if(bl) bl.value = c.blur;
    var blv = document.getElementById('rpCoverBlurVal');
    if(blv) blv.textContent = c.blur + 'px';
  }

  // ==== 裁切弹窗逻辑 ====
  var cState = { naturalW:0, naturalH:0, scale:1, baseScale:1, tx:0, ty:0, frameW:240, frameH:100 };
  var drag = { active:false, isPinch:false, startX:0, startY:0, startTx:0, startTy:0, startDist:0, startScale:1 };

  function openRpCrop(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var src = e.target.result;
      
      var oldMask = document.getElementById('rpCropMask');
      if (oldMask) oldMask.remove();
      
      var mask = document.createElement('div');
      mask.id = 'rpCropMask';
      mask.innerHTML = `
        <style>
          #rpCropMask { display: none; position: fixed; inset: 0; z-index: 99999; background: #111; flex-direction: column; font-family: inherit; }
          #rpCropMask.show { display: flex; }
          .rp-crop-head { flex:none; display:flex; justify-content:space-between; align-items:center; padding:16px 20px; color:#fff; position:relative; z-index:5; }
          .rp-crop-head .x { font-size:20px; cursor:pointer; font-weight:300; padding:4px; }
          .rp-crop-head .ok { font-size:14px; font-weight:500; cursor:pointer; letter-spacing:1px; padding:4px; }
          .rp-crop-workspace { flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
          .rp-crop-frame { width:min(88vw,360px); aspect-ratio:12/5; position:relative; z-index:2; border-radius:10px; touch-action:none; box-shadow: 0 0 0 2px #fff, 0 0 0 9999px rgba(0,0,0,0.4); }
          .rp-crop-frame::after { content:""; position:absolute; inset:0; border-radius:10px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); pointer-events:none; z-index:3; }
          .rp-crop-img { position:absolute; left:0; top:0; transform-origin:0 0; will-change:transform; touch-action:none; user-select:none; }
        </style>
        <div class="rp-crop-head">
          <div class="x" id="rpCropCancel">✕</div>
          <div class="ok" id="rpCropConfirm">确 定</div>
        </div>
        <div class="rp-crop-workspace">
          <div class="rp-crop-frame" id="rpCropFrame">
            <img id="rpCropImg" class="rp-crop-img" src="" alt="">
          </div>
        </div>
      `;
      document.body.appendChild(mask);
      bindRpCropEvents();
      
      var img = document.getElementById('rpCropImg');
      img.src = src;
      mask.classList.add('show');
      
      var tmp = new Image();
      tmp.onload = function() {
        cState.naturalW = tmp.width;
        cState.naturalH = tmp.height;
        var frame = document.getElementById('rpCropFrame');
        cState.frameW = frame.clientWidth;
        cState.frameH = frame.clientHeight;
        
        var scaleW = cState.frameW / cState.naturalW;
        var scaleH = cState.frameH / cState.naturalH;
        cState.baseScale = Math.max(scaleW, scaleH);
        cState.scale = 1;
        cState.tx = (cState.frameW - cState.naturalW * cState.baseScale) / 2;
        cState.ty = (cState.frameH - cState.naturalH * cState.baseScale) / 2;
        
        img.style.width = cState.naturalW + 'px';
        img.style.height = cState.naturalH + 'px';
        applyRpCropTransform();
      };
      tmp.src = src;
    };
    reader.readAsDataURL(file);
  }

  function applyRpCropTransform() {
    var s = cState.baseScale * cState.scale;
    var img = document.getElementById('rpCropImg');
    if(img) img.style.transform = 'translate(' + cState.tx + 'px, ' + cState.ty + 'px) scale(' + s + ')';
  }

  function clampRpCrop() {
    var fw = cState.frameW, fh = cState.frameH;
    var iw = cState.naturalW * cState.baseScale * cState.scale;
    var ih = cState.naturalH * cState.baseScale * cState.scale;
    if (iw <= fw) cState.tx = (fw - iw) / 2;
    else cState.tx = Math.min(0, Math.max(fw - iw, cState.tx));
    if (ih <= fh) cState.ty = (fh - ih) / 2;
    else cState.ty = Math.min(0, Math.max(fh - ih, cState.ty));
  }
    function bindRpCropEvents() {
    var frame = document.getElementById('rpCropFrame');
    
    frame.addEventListener('touchstart', function(e){
      if(e.touches.length === 1) {
        drag.active = true; drag.isPinch = false;
        drag.startX = e.touches[0].clientX; drag.startY = e.touches[0].clientY;
        drag.startTx = cState.tx; drag.startTy = cState.ty;
      } else if(e.touches.length === 2) {
        drag.active = false; drag.isPinch = true;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        drag.startDist = Math.sqrt(dx*dx + dy*dy);
        drag.startScale = cState.scale;
      }
    }, {passive: true});

    frame.addEventListener('touchmove', function(e){
      if(drag.active && e.touches.length === 1) {
        var dx = e.touches[0].clientX - drag.startX;
        var dy = e.touches[0].clientY - drag.startY;
        cState.tx = drag.startTx + dx;
        cState.ty = drag.startTy + dy;
        clampRpCrop();
        applyRpCropTransform();
        e.preventDefault();
      } else if(drag.isPinch && e.touches.length === 2) {
        var dx2 = e.touches[0].clientX - e.touches[1].clientX;
        var dy2 = e.touches[0].clientY - e.touches[1].clientY;
        var dist = Math.sqrt(dx2*dx2 + dy2*dy2);
        var s = drag.startScale * (dist / drag.startDist);
        if(s < 1) s = 1;
        if(s > 5) s = 5;
        cState.scale = s;
        clampRpCrop();
        applyRpCropTransform();
        e.preventDefault();
      }
    }, {passive: false});

    frame.addEventListener('touchend', function(){ drag.active = false; drag.isPinch = false; });
    
    // 鼠标支持
    frame.addEventListener('mousedown', function(e){
      drag.active = true;
      drag.startX = e.clientX; drag.startY = e.clientY;
      drag.startTx = cState.tx; drag.startTy = cState.ty;
      e.preventDefault();
    });
    window.addEventListener('mousemove', function(e){
      if(!drag.active) return;
      cState.tx = drag.startTx + (e.clientX - drag.startX);
      cState.ty = drag.startTy + (e.clientY - drag.startY);
      clampRpCrop();
      applyRpCropTransform();
    });
    window.addEventListener('mouseup', function(){ drag.active = false; });

    document.getElementById('rpCropCancel').onclick = function(){
      document.getElementById('rpCropMask').classList.remove('show');
    };

    document.getElementById('rpCropConfirm').onclick = function(){
      var outW = cState.frameW;
      var outH = cState.frameH;
      var canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      var ctx = canvas.getContext('2d');
      
      var s = cState.baseScale * cState.scale;
      var sx = -cState.tx / s;
      var sy = -cState.ty / s;
      var sw = outW / s;
      var sh = outH / s;

      var img = document.getElementById('rpCropImg');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      
      canvas.toBlob(function(blob){
        var key = 'rpcover_' + Date.now().toString(36);
        window.__idb.set(key, blob).then(function(){
          var c = getRpCoverCfg();
          if(c.key) window.__idb.del(c.key).catch(function(){});
          c.key = key;
          saveRpCoverCfg(c);
          
          document.getElementById('rpCropMask').classList.remove('show');
          renderRpPanelState();
          
          // 如果当前在看聊天，并且有历史消息，强制重绘一下红包卡片
          if(typeof window.__forceRenderChat === 'function') window.__forceRenderChat();
          if(typeof renderChat === 'function') renderChat();
          
          if(typeof toast === 'function') toast('红包封面已更新');
        }).catch(function(err){
          if(typeof toast === 'function') toast('保存失败：' + err.message);
        });
      }, 'image/jpeg', 0.85);
    };
  }

  // ==== 面板按钮事件绑定 ====
  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;

    if(t.closest('#btnRpCoverUpload')){
      e.preventDefault(); e.stopPropagation();
      /* 全局只建一次 input，且不用 display:none，避免部分内核吞 click */
      if(!window.__rpCoverFileInput){
        var inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0';
        inp.id = 'rpCoverFileInput';
        inp.addEventListener('change', function(){
          var f = inp.files && inp.files[0];
          inp.value = '';
          if(!f) return;
          openRpCrop(f);
        });
        document.body.appendChild(inp);
        window.__rpCoverFileInput = inp;
      }
      var fi = window.__rpCoverFileInput;
      fi.value = '';
      /* showPicker 优先，click 兜底，都在同步手势链里调 */
      var opened = false;
      try{
        if(typeof fi.showPicker === 'function'){ fi.showPicker(); opened = true; }
      }catch(err){}
      if(!opened){
        try{ fi.click(); }catch(err){
          if(typeof toast === 'function') toast('无法打开文件选择器');
        }
      }
      return;
    }

    if(t.closest('#btnRpCoverReset')){
      e.preventDefault(); e.stopPropagation();
      var c = getRpCoverCfg();
      if(c.key) window.__idb.del(c.key).catch(function(){});
      c.key = ''; c.opacity = 100; c.blur = 0;
      saveRpCoverCfg(c);

      renderRpPanelState();
      if(typeof window.__forceRenderChat === 'function') window.__forceRenderChat();
      if(typeof renderChat === 'function') renderChat();

      if(typeof toast === 'function') toast('已恢复默认封面');
      return;
    }
  }, true);

  document.addEventListener('input', function(e){
    var t = e.target;
    if(!t || !t.id) return;
    
    if(t.id === 'rpCoverOpacity'){
      var c = getRpCoverCfg(); c.opacity = parseInt(t.value, 10) || 0; saveRpCoverCfg(c);
      var v = document.getElementById('rpCoverOpacityVal'); if(v) v.textContent = c.opacity + '%';
      if(typeof window.__forceRenderChat === 'function') window.__forceRenderChat();
      if(typeof renderChat === 'function') renderChat();
    }
    if(t.id === 'rpCoverBlur'){
      var c2 = getRpCoverCfg(); c2.blur = parseInt(t.value, 10) || 0; saveRpCoverCfg(c2);
      var v2 = document.getElementById('rpCoverBlurVal'); if(v2) v2.textContent = c2.blur + 'px';
      if(typeof window.__forceRenderChat === 'function') window.__forceRenderChat();
      if(typeof renderChat === 'function') renderChat();
    }
  }, true);

  /* 每次点开「上传背景」面板时，强制确保红包封面区在 DOM 里 */
  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;
    if(!t.closest('#beautyPanel .bp-row[data-panel="bgimg"]')) return;
    setTimeout(renderRpCoverPanel, 0);
  }, true);

})();