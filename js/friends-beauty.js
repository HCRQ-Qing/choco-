(function(){
  var B_KEY = 'mj_friends_bg_v1', O_KEY = 'mj_friends_opacity_v1', S_KEY = 'mj_friends_search_opacity_v1';
  
  function apply(){
    var p = document.getElementById('page-friends'); if(!p) return;
    var _hasBg = !!lsGet(B_KEY, '');
    var _op = lsGet(O_KEY, null);
    if(_op === null) _op = _hasBg ? 15 : 100;
    p.style.setProperty('--fr-bg-opacity', _op / 100);
    p.style.setProperty('--fr-search-opacity', lsGet(S_KEY, 100) / 100);
    var k = lsGet(B_KEY, '');
    if(k && window.__idb && __idb.toURL){
      __idb.toURL(k).then(function(u){ p.style.setProperty('--fr-bg-img', u ? 'url('+u+')' : 'none'); });
    } else {
      p.style.setProperty('--fr-bg-img', 'none');
    }
  }
  setTimeout(apply, 500);

  document.addEventListener('click', function(e){
    var t = e.target; if(!t || !t.closest) return;

    if(t.closest('#btnAdd')){
      setTimeout(function(){
        var m = document.getElementById('mAdd');
        if(!m) return;
        if(m.querySelector('#frAddBeautyBtn')) return;
        var div = document.createElement('div');
        div.className = 'it';
        div.id = 'frAddBeautyBtn';
        div.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3l2 5 5 .5-4 3.5 1.3 5L12 14.5 7.7 17l1.3-5-4-3.5L10 8z"/></svg>美 化';
        m.appendChild(div);
      }, 50);
    }
    
    if(t.closest('#frAddBeautyBtn')){
      e.preventDefault();
      var m = document.getElementById('mAdd');
      if(m) m.classList.remove('show');
      openModal();
    }
  }, true);

  function openModal(){
    var mod = document.getElementById('frBeautyModal');
    if(!mod){
      mod = document.createElement('div'); mod.id = 'frBeautyModal'; mod.className = 'modal';
      mod.innerHTML = 
        '<div class="overlay" onclick="document.getElementById(\'frBeautyModal\').classList.remove(\'show\')"></div>' +
        '<div class="sheet" style="max-width:320px;padding:22px 20px;border-radius:20px;background:#fff;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:0.6px solid #f0f0f0;padding-bottom:16px;margin-bottom:20px;">' +
            '<h3 style="margin:0;font-size:15px;font-weight:300;letter-spacing:4px;color:#1a1a1a;">美 化</h3>' +
            '<button onclick="document.getElementById(\'frBeautyModal\').classList.remove(\'show\')" style="border:none;background:none;font-size:20px;color:#bbb;cursor:pointer;padding:0;">✕</button>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:0.6px dashed #f5f5f5;">' +
            '<span style="font-size:14px;font-weight:300;">背景图</span>' +
            '<div>' +
              '<button id="frUp" style="padding:6px 14px;border:0.7px solid #1a1a1a;background:none;border-radius:14px;font-size:12px;color:#1a1a1a;cursor:pointer;">上传</button> ' +
              '<button id="frDel" style="padding:6px 14px;border:0.7px solid #eee;background:none;border-radius:14px;font-size:12px;color:#999;cursor:pointer;">清除</button>' +
            '</div>' +
          '</div>' +
          '<div style="padding:16px 0;border-bottom:0.6px dashed #f5f5f5;">' +
            '<div style="font-size:13px;font-weight:300;margin-bottom:12px;">背景透明</div>' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<input type="range" id="frOp" min="0" max="100" style="flex:1;-webkit-appearance:none;height:2px;background:#e0e0e0;outline:none;">' +
              '<span id="frOpV" style="font-size:12px;color:#999;width:30px;text-align:right;">100%</span>' +
            '</div>' +
          '</div>' +
          '<div style="padding:16px 0;">' +
            '<div style="font-size:13px;font-weight:300;margin-bottom:12px;">搜索栏透明</div>' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<input type="range" id="frSop" min="0" max="100" style="flex:1;-webkit-appearance:none;height:2px;background:#e0e0e0;outline:none;">' +
              '<span id="frSopV" style="font-size:12px;color:#999;width:30px;text-align:right;">100%</span>' +
            '</div>' +
          '</div>' +
          '<button id="frSave" style="width:100%;margin-top:10px;padding:14px;background:#1a1a1a;color:#fff;border:none;border-radius:22px;font-size:14px;letter-spacing:4px;font-family:inherit;cursor:pointer;">保 存</button>' +
        '</div>' +
        '<input type="file" id="frFile" accept="image/*" style="display:none">';
      document.body.appendChild(mod);

      // 添加滑块的黑色小圆点样式
      var style = document.createElement('style');
      style.innerHTML = '#frOp::-webkit-slider-thumb,#frSop::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#1a1a1a;cursor:pointer;}';
      document.head.appendChild(style);

      var inp = mod.querySelector('#frFile');
      var op = mod.querySelector('#frOp'), opV = mod.querySelector('#frOpV');
      var sop = mod.querySelector('#frSop'), sopV = mod.querySelector('#frSopV');

      op.oninput = function(){ opV.textContent = this.value + '%'; };
      sop.oninput = function(){ sopV.textContent = this.value + '%'; };

      mod.querySelector('#frUp').onclick = function(){ inp.value=''; inp.click(); };
      inp.onchange = function(){
        var f = this.files[0]; if(!f) return;
        var r = new FileReader(); r.onload = function(e){
          var img = new Image(); img.onload = function(){
            var cv = document.createElement('canvas'), MAX = 800, w = img.width, h = img.height;
            if(w > MAX || h > MAX){ var k = Math.min(MAX/w, MAX/h); w*=k; h*=k; }
            cv.width=w; cv.height=h; cv.getContext('2d').drawImage(img,0,0,w,h);
            cv.toBlob(function(b){ 
              var k = 'frbg_'+Date.now(); 
              __idb.set(k,b).then(function(){ 
                lsSet(B_KEY,k); 
                lsSet(O_KEY, 15); 
                op.value = 15; opV.textContent = '15%';
                apply(); 
                toast('已上传，已自动调整透明度'); 
              }); 
            },'image/jpeg',0.8);
          }; img.src = e.target.result;
        }; r.readAsDataURL(f);
      };

      mod.querySelector('#frDel').onclick = function(){ lsSet(B_KEY,''); apply(); toast('已清除'); };
      mod.querySelector('#frSave').onclick = function(){
        lsSet(O_KEY, parseInt(op.value));
        lsSet(S_KEY, parseInt(sop.value));
        apply(); mod.classList.remove('show'); toast('已保存');
      };
    }
    
    var op = mod.querySelector('#frOp'), opV = mod.querySelector('#frOpV');
    var sop = mod.querySelector('#frSop'), sopV = mod.querySelector('#frSopV');
    op.value = lsGet(O_KEY, 100); opV.textContent = op.value + '%';
    sop.value = lsGet(S_KEY, 100); sopV.textContent = sop.value + '%';
    mod.classList.add('show');
  }
})();