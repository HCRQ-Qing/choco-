/* ============================================================
   独立音乐模块 (重构修复版)
   ============================================================ */
(function(){
  if(document.getElementById('musicScreen')) return;

  var st = document.createElement('style');
  st.id = 'musicScreenStyle';
  st.textContent = [
    '#musicScreen{position:fixed;inset:0;z-index:1200;max-width:520px;margin:0 auto;background:#fafafa;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,"PingFang SC",sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;}',
    '#musicScreen.on{display:flex}',
    '#musicScreen.in-desk{position:absolute;max-width:none;z-index:1}',
    
    /* 顶部栏 */
    '#musicScreen .ms-top{display:flex;align-items:center;justify-content:space-between;padding:54px 24px 16px;flex:none;z-index:50}',
    '#musicScreen .ms-back{width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#1a1a1a;cursor:pointer;opacity:.5}',
    '#musicScreen .ms-title{font-size:15px;letter-spacing:8px;font-weight:300;text-indent:8px;color:#1a1a1a;font-family:Georgia,serif}',
    '#musicScreen .ms-add{width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#1a1a1a;cursor:pointer;opacity:.5}',

    /* 页面切换容器 */
    '#musicScreen .ms-pages{flex:1;position:relative;overflow:hidden}',
    '#musicScreen .ms-page{position:absolute;inset:0;display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .35s;opacity:0;pointer-events:none;background:#fafafa;z-index:10}',
    '#musicScreen .ms-page.active{opacity:1;pointer-events:auto;transform:translateX(0)}',
    '#musicScreen .ms-page.slide-left{transform:translateX(-20%);opacity:0}',

    /* 页面 1：首页 */
    '#musicScreen .ms-home-header{flex:none;padding:0 24px 16px;display:flex;align-items:center;gap:16px}',
    '#musicScreen .ms-mini-av{width:44px;height:44px;border-radius:var(--avatar-radius,12%);background:var(--th-av-bg,#f2f2f2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none}',
    '#musicScreen .ms-mini-av svg{width:100%;height:100%;fill:var(--th-av-sil,#c8c8c8)}',
    '#musicScreen .ms-user-info{flex:1;display:flex;flex-direction:column;gap:4px}',
    '#musicScreen .ms-home-name{font-size:20px;font-family:"Songti SC",serif;font-weight:300;letter-spacing:1px;color:#1a1a1a}',
    '#musicScreen .ms-home-hint{font-size:10px;color:#bbb;font-weight:300;letter-spacing:1px}',
    
    '#musicScreen .ms-view-head{display:flex;align-items:center;justify-content:space-between;padding:16px 24px 12px}',
    '#musicScreen .ms-view-title{font-size:12px;letter-spacing:1px;font-weight:300;color:#888}',
    '#musicScreen .ms-switch-btn{font-size:11px;color:#1a1a1a;letter-spacing:1px;padding:4px 12px;border-radius:20px;border:0.5px solid #1a1a1a;background:transparent;cursor:pointer;font-weight:300}',

    '#musicScreen .ms-home-body{flex:1;overflow-y:auto;padding:0 24px 40px;scrollbar-width:none}',
    '#musicScreen .ms-home-body::-webkit-scrollbar{display:none}',
    '#musicScreen .ms-list-view{display:flex;flex-direction:column;gap:0}',
    '#musicScreen .ms-list-item{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:0.5px dashed #eaeaea;cursor:pointer}',
    '#musicScreen .ms-list-item:active{opacity:.6}',
    '#musicScreen .ms-li-cover{width:56px;height:56px;border-radius:8px;background:var(--th-av-bg,#f2f2f2);display:flex;align-items:center;justify-content:center;flex:none;font-family:"Songti SC",serif;font-size:20px;color:var(--th-av-sil,#c8c8c8)}',
    '#musicScreen .ms-li-info{flex:1;min-width:0}',
    '#musicScreen .ms-li-name{font-size:15px;color:#1a1a1a;font-weight:300;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px}',
    '#musicScreen .ms-li-count{font-size:11px;color:#bbb;letter-spacing:.5px;font-weight:300;font-family:Georgia,serif}',
        /* 页面 2：播放页 */
    '#musicScreen .ms-player-header{padding:8px 24px 0;flex:none;display:flex;justify-content:space-between;align-items:flex-start}',
    '#musicScreen .ms-title-area{flex:1;padding-top:10px}',
    '#musicScreen .ms-p-title{font-family:"Songti SC",serif;font-size:34px;line-height:1.15;letter-spacing:2px;color:#1a1a1a;font-weight:300;white-space:normal;word-break:break-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '#musicScreen .ms-p-title small{display:block;font-family:Georgia,serif;font-size:9px;letter-spacing:6px;color:#bbb;margin-bottom:8px;font-weight:normal}',
    '#musicScreen .ms-p-meta{font-size:10px;color:#bbb;letter-spacing:2px;font-family:Georgia,serif;margin-top:16px;padding-bottom:16px;border-bottom:0.5px solid #e0e0e0;width:80%}',

    '#musicScreen .ms-together-wrapper{width:100px;height:100px;display:flex;align-items:center;justify-content:center;position:relative;margin-top:10px;margin-right:-10px;flex:none}',
    '#musicScreen .ms-stack-group{position:relative;width:90px;height:75px}',
    '#musicScreen .ms-t-card{position:absolute;width:54px;height:54px;background:var(--th-av-bg,#f2f2f2);border:1px solid #f5f5f5;box-shadow:0 4px 12px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:12px}',
    '#musicScreen .ms-t-card svg{width:100%;height:100%;fill:var(--th-av-sil,#c8c8c8)}',
    '#musicScreen .ms-t-card:nth-child(1){left:20px;top:30px;z-index:1;transform:rotate(-20deg)}',
    '#musicScreen .ms-t-card:nth-child(2){right:20px;bottom:10px;z-index:2;transform:rotate(15deg)}',

    '#musicScreen .ms-lyrics-zone{flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;margin-top:10px;-webkit-mask-image:linear-gradient(to bottom,transparent 0%,#000 15%,#000 85%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0%,#000 15%,#000 85%,transparent 100%)}',
    '#musicScreen .ms-ly-inner{transition:transform .4s cubic-bezier(.2,.8,.2,1);text-align:center;padding:0 24px}',
    '#musicScreen .ms-ly-line{font-family:"Songti SC",serif;font-size:20px;color:#dcdcdc;padding:16px 0;line-height:1.5;letter-spacing:1px;transition:all .3s}',
    '#musicScreen .ms-ly-line.active{font-size:34px;color:#1a1a1a;font-weight:500}',

    '#musicScreen .ms-controls{flex:none;padding:0 30px 40px}',
    '#musicScreen .ms-prog-bar{display:flex;align-items:center;gap:10px;margin-bottom:24px}',
    '#musicScreen .ms-p-time{font-size:10px;color:#999;font-family:Georgia,serif;width:32px}',
    '#musicScreen .ms-p-time.r{text-align:right}',
    '#musicScreen .ms-p-track{flex:1;height:2px;background:#e0e0e0;position:relative;cursor:pointer}',
    '#musicScreen .ms-p-fill{position:absolute;left:0;top:0;bottom:0;width:0%;background:#1a1a1a}',
    '#musicScreen .ms-p-fill::after{content:"";position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;background:#1a1a1a}',
  
    '#musicScreen .ms-ctrl-btns{display:flex;align-items:center;justify-content:space-between;padding:0 10px}',
    '#musicScreen .ms-c-btn{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#1a1a1a;opacity:.8;background:transparent;border:none;padding:0;cursor:pointer}',
    '#musicScreen .ms-c-btn svg{width:20px;height:20px;fill:currentColor}',
    '#musicScreen .ms-c-play{width:60px;height:60px;border-radius:50%;background:#1a1a1a;color:#fafafa;display:flex;align-items:center;justify-content:center;border:none;padding:0;cursor:pointer}',
    '#musicScreen .ms-c-play svg{width:22px;height:22px;margin-left:4px;fill:currentColor}',

    /* 侧边菜单 */
    '#musicScreen .ms-menu-mask{position:absolute;inset:0;background:rgba(250,250,250,0.7);z-index:200;opacity:0;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
    '#musicScreen .ms-menu-mask.show{opacity:1;pointer-events:auto}',
    '#musicScreen .ms-menu-panel{position:absolute;top:0;left:0;bottom:0;width:260px;background:#fafafa;z-index:201;transform:translateX(-100%);transition:transform .3s cubic-bezier(.22,1,.36,1);box-shadow:4px 0 24px rgba(0,0,0,0.02);padding-top:60px;display:flex;flex-direction:column;border-right:0.5px solid #eaeaea}',
    '#musicScreen .ms-menu-mask.show .ms-menu-panel{transform:translateX(0)}',
    '#musicScreen .ms-menu-head{padding:0 24px 16px;font-size:16px;font-family:"Songti SC",serif;font-weight:300;letter-spacing:2px;border-bottom:0.5px dashed #eaeaea;margin-bottom:10px}',
    '#musicScreen .ms-more-list{flex:1;overflow-y:auto;padding:10px 0}',
    '#musicScreen .ms-more-item{display:flex;align-items:center;padding:16px 24px;cursor:pointer;transition:background .2s}',
    '#musicScreen .ms-more-item:active{background:#f0f0f0}',
    '#musicScreen .ms-more-item .ic{width:32px;height:32px;margin-right:16px;display:flex;align-items:center;justify-content:center}',
    '#musicScreen .ms-more-item .ic svg{width:18px;height:18px;fill:none;stroke:#1a1a1a;stroke-width:1.2}',
    '#musicScreen .ms-more-item .txt{flex:1;font-size:14px;color:#1a1a1a;letter-spacing:1px;font-weight:300}',
    '#musicScreen .ms-more-item .sub{font-size:10px;color:#bbb;margin-top:4px;font-weight:300}'
  ].join('');
  document.head.appendChild(st);
  var wrap = document.createElement('div');
  wrap.className = 'screen';
  wrap.id = 'musicScreen';
  wrap.innerHTML =
    '<div class="ms-top" style="padding:20px 22px 24px;justify-content:space-between;align-items:center;background:#fafafa;z-index:10;">' +
      '<button class="ms-back" id="msBackBtn" type="button" style="width:32px;height:32px;font-size:22px;color:#1a1a1a;opacity:0.8;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;border:none;padding:0;">‹</button>' +
      '<div class="ms-title" style="font-size:13px;letter-spacing:6px;text-indent:6px;font-weight:300;font-family:\'Songti SC\',serif;color:#1a1a1a;">MUSIC</div>' +
      '<button class="ms-add" id="msMenuBtn" type="button" style="width:32px;height:32px;opacity:0.8;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;border:none;padding:0;">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="ms-pages">' +
      '<div class="ms-page active" id="msPageHome">' +
        '<div class="ms-home-header" style="display:flex;flex-direction:column;align-items:center;padding:12px 0 20px;gap:0;">' +
          '<div class="ms-mini-av" id="msUserAvatar" style="width:48px;height:48px;border-radius:50%;background:#f2f2f2;border:1px solid #eee;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:8px;flex:none;">' +
            '<svg viewBox="0 0 100 100" style="width:100%;height:100%;fill:#c8c8c8;"><circle cx="50" cy="38" r="19"/><path d="M12 100 C12 74 28 62 50 62 C72 62 88 74 88 100 Z"/></svg>' +
          '</div>' +
          '<div class="ms-user-info" style="align-items:center;text-align:center;">' +
            '<div class="ms-home-name" id="msUserName" style="font-size:14px;font-weight:400;letter-spacing:1px;margin-bottom:2px;color:#1a1a1a;">我</div>' +
            '<div class="ms-home-hint" style="font-size:9.5px;color:#bbb;letter-spacing:0.5px;">我的音乐空间</div>' +
          '</div>' +
        '</div>' +
        '<div class="ms-view-head" style="display:flex;justify-content:space-between;padding:10px 22px;border-bottom:0.6px dashed #eaeaea;margin-bottom:4px;align-items:center;">' +
          '<div class="ms-view-title" id="msViewTitle" style="font-size:13px;font-weight:300;letter-spacing:1px;color:#1a1a1a;">最近播放</div>' +
          '<div class="ms-view-mode-text" id="msViewTxt" style="font-size:10.5px;color:#bbb;">列表视图</div>' +
        '</div>' +
        '<div class="ms-home-body" style="padding:0 22px;">' +
          '<div class="ms-list-view" id="msListView" style="display:flex;flex-direction:column;"></div>' +
          '<div class="ms-list-view" id="msGridView" style="display:none;flex-direction:column;"></div>' +
        '</div>' +
      '</div>' +
      '<div class="ms-page" id="msPagePlayer">' +
        '<div class="ms-player-header">' +
          '<div class="ms-title-area">' +
            '<div class="ms-p-title"><small>NOW PLAYING</small><span id="msNowName">还没选歌</span></div>' +
            '<div class="ms-p-meta" id="msNowSub">NO TRACK SELECTED</div>' +
          '</div>' +
          '<div class="ms-together-wrapper" id="msTogether" style="display:none;">' +
            '<div class="ms-stack-group">' +
              '<div class="ms-t-card"><svg viewBox="0 0 100 100"><circle cx="50" cy="38" r="19"/><path d="M12 100 C12 74 28 62 50 62 C72 62 88 74 88 100 Z"/></svg></div>' +
              '<div class="ms-t-card"><svg viewBox="0 0 100 100"><circle cx="50" cy="38" r="19"/><path d="M12 100 C12 74 28 62 50 62 C72 62 88 74 88 100 Z"/></svg></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ms-lyrics-zone"><div class="ms-ly-inner" id="msLyricsInner"></div></div>' +
        '<div class="ms-controls">' +
          '<div class="ms-prog-bar">' +
            '<div class="ms-p-time" id="msCur">0:00</div>' +
            '<div class="ms-p-track" id="msPbar"><div class="ms-p-fill" id="msPfill"></div></div>' +
            '<div class="ms-p-time r" id="msDur">0:00</div>' +
          '</div>' +
          '<div class="ms-ctrl-btns">' +
            '<button class="ms-c-btn" id="msShuffle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg></button>' +
            '<button class="ms-c-btn" id="msPrev"><svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM6.5 12L18 18V6z"/></svg></button>' +
            '<button class="ms-c-play" id="msPlay"><svg id="msIcoPlay" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg id="msIcoPause" viewBox="0 0 24 24" style="display:none"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg></button>' +
            '<button class="ms-c-btn" id="msNext"><svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM18 12L6.5 18V6z"/></svg></button>' +
            '<button class="ms-c-btn" id="msRepeat"><svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="ms-menu-mask" id="msMenuMask" style="position:absolute;inset:0;background:rgba(0,0,0,0.15);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:.3s;z-index:200;">' +
      '<div class="ms-menu-panel" style="position:absolute;top:0;right:0;bottom:0;width:220px;background:#fff;transform:translateX(100%);transition:.3s cubic-bezier(0.22,1,0.36,1);padding-top:80px;box-shadow:-4px 0 24px rgba(0,0,0,0.06);">' +
        '<div style="padding:0 24px 16px;font-size:15px;font-family:\'Songti SC\',serif;font-weight:300;letter-spacing:3px;color:#1a1a1a;border-bottom:0.6px solid #f0f0f0;margin-bottom:8px;">菜 单</div>' +
        '<div class="ms-more-item" id="msMenuAdd" style="padding:16px 24px;font-size:13.5px;color:#1a1a1a;display:flex;align-items:center;cursor:pointer;border-bottom:0.6px dashed #f6f6f6;font-weight:300;letter-spacing:1px;transition:background .2s;">＋ 导入歌曲</div>' +
        '<div class="ms-more-item" id="msMenuToggleView" style="padding:16px 24px;font-size:13.5px;color:#1a1a1a;display:flex;align-items:center;cursor:pointer;border-bottom:0.6px dashed #f6f6f6;font-weight:300;letter-spacing:1px;transition:background .2s;">↺ 切换视图</div>' +
        '<div class="ms-more-item" id="msMenuTogether" style="padding:16px 24px;font-size:13.5px;color:#1a1a1a;display:flex;align-items:center;cursor:pointer;font-weight:300;letter-spacing:1px;transition:background .2s;">♫ 一起听</div>' +
      '</div>' +
    '</div>' +
    '<input type="file" id="msFilePick" accept="audio/*" multiple style="display:none">' +
    '<input type="file" id="msLyricPick" accept=".lrc,.txt,text/plain" style="display:none">';
  document.body.appendChild(wrap);

  /* ---- JS 逻辑 ---- */
  var _msLists = { list: [] };
  var _msLyrics = {};
  var _msState = { idx: 0, together: false };
  var _msAudio = new Audio();
  _msAudio.preload = 'metadata';
  _msAudio.volume = 0.7;

  window.openMusicScreen = window.openMusicScreen || function(){
    var el = document.getElementById('musicScreen');
    if(!el) return;
    if(el.classList.contains('on')) return;
    if(window.__deskMode && typeof openDeskFeature === 'function'){
      openDeskFeature('musicScreen');
    } else {
      document.querySelectorAll('.screen.on').forEach(function(s){ s.classList.remove('on'); });
      el.classList.add('on');
    }
    
    // 读取真实的用户名字和头像
    try{
      if(typeof userName === 'function' && document.getElementById('msUserName')){
        document.getElementById('msUserName').textContent = userName();
      }
      if(typeof userProfile !== 'undefined' && typeof avatarHTML === 'function' && document.getElementById('msUserAvatar')){
        document.getElementById('msUserAvatar').innerHTML = avatarHTML(userProfile.avatar);
      }
    }catch(e){ console.error('音乐页读取用户信息失败', e); }
  };

  window.closeMusicScreen = function(){
    var el = document.getElementById('musicScreen');
    if(!el) return;
    if(el.classList.contains('in-desk') && typeof closeDeskFeature === 'function'){
      closeDeskFeature();
      return;
    }
    el.classList.remove('on');
  };

  window.__msPlayAt = function(index){
    var elHome = document.getElementById('msPageHome');
    var elPlayer = document.getElementById('msPagePlayer');
    if(elHome && elPlayer){
      elHome.classList.add('slide-left');
      elHome.classList.remove('active');
      elPlayer.classList.add('active');
    }
    document.getElementById('msNowName').textContent = '演示歌曲 ' + (index+1);
    document.getElementById('msNowSub').textContent = 'TRACK 0' + (index+1) + ' · 3:42';
    var inner = document.getElementById('msLyricsInner');
    if(inner) inner.innerHTML = '<div class="ms-ly-line">第一行歌词</div><div class="ms-ly-line active">正在播放的歌词</div><div class="ms-ly-line">第三行歌词</div>';
  };
  
  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;

    if(t.closest('#msBackBtn')){
      e.preventDefault(); e.stopPropagation();
      if(window.closeMusicScreen) window.closeMusicScreen();
      return;
    }

    if(t.closest('#msMenuBtn')){
      e.preventDefault(); e.stopPropagation();
      var mask = document.getElementById('msMenuMask');
      if(mask){
        mask.style.opacity = '1';
        mask.style.pointerEvents = 'auto';
        var panel = mask.querySelector('.ms-menu-panel');
        if(panel) panel.style.transform = 'translateX(0)';
      }
      return;
    }
    if(t.id === 'msMenuMask'){
      var mask = document.getElementById('msMenuMask');
      if(mask){
        mask.style.opacity = '0';
        mask.style.pointerEvents = 'none';
        var panel = mask.querySelector('.ms-menu-panel');
        if(panel) panel.style.transform = 'translateX(100%)';
      }
      return;
    }

    if(t.closest('#msMenuAdd')){
      e.preventDefault(); e.stopPropagation();
      var mask = document.getElementById('msMenuMask');
      if(mask){
        mask.style.opacity = '0'; mask.style.pointerEvents = 'none';
        var panel = mask.querySelector('.ms-menu-panel');
        if(panel) panel.style.transform = 'translateX(100%)';
      }
      var fp = document.getElementById('msFilePick');
      if(fp){ fp.value = ''; fp.click(); }
      return;
    }

    if(t.closest('#msMenuTogether')){
      e.preventDefault(); e.stopPropagation();
      var mask = document.getElementById('msMenuMask');
      if(mask){
        mask.style.opacity = '0'; mask.style.pointerEvents = 'none';
        var panel = mask.querySelector('.ms-menu-panel');
        if(panel) panel.style.transform = 'translateX(100%)';
      }
      _msState.together = !_msState.together;
      var tog = document.getElementById('msTogether');
      if(tog) tog.style.display = _msState.together ? 'flex' : 'none';
      if(typeof toast === 'function') toast(_msState.together ? '已开启一起听' : '已关闭一起听');
      return;
    }

    if(t.closest('#msMenuToggleView')){
      e.preventDefault(); e.stopPropagation();
      var mask = document.getElementById('msMenuMask');
      if(mask){ mask.style.opacity = '0'; mask.style.pointerEvents = 'none'; mask.querySelector('.ms-menu-panel').style.transform = 'translateX(100%)'; }
      
      var lv = document.getElementById('msListView');
      var gv = document.getElementById('msGridView');
      var txt = document.getElementById('msViewTxt');
      if(lv.style.display === 'none'){
        lv.style.display = 'flex';
        gv.style.display = 'none';
        if(txt) txt.textContent = '列表视图';
      } else {
        lv.style.display = 'none';
        gv.style.display = 'flex';
        if(txt) txt.textContent = '封面视图';
      }
      return;
    }
  }, true);
    document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;

    /* 播放 / 暂停 */
    if(t.closest('#msPlay')){
      e.preventDefault();
      if(_msAudio.paused){
        _msAudio.play().then(function(){
          var ipp = document.getElementById('msIcoPlay'); if(ipp) ipp.style.display = 'none';
          var ipa = document.getElementById('msIcoPause'); if(ipa) ipa.style.display = '';
        }).catch(function(){});
      } else {
        _msAudio.pause();
        var ip2 = document.getElementById('msIcoPlay'); if(ip2) ip2.style.display = '';
        var ipa2 = document.getElementById('msIcoPause'); if(ipa2) ipa2.style.display = 'none';
      }
      return;
    }

    /* 进度条 */
    var bar = t.closest('#msPbar');
    if(bar){
      e.preventDefault();
      if(!_msAudio.duration) return;
      var r = bar.getBoundingClientRect();
      var p = (e.clientX - r.left) / r.width;
      _msAudio.currentTime = p * _msAudio.duration;
      return;
    }
  }, true);

  /* 播放器事件绑定 */
  _msAudio.ontimeupdate = function(){
    var curEl = document.getElementById('msCur');
    var fillEl = document.getElementById('msPfill');
    if(curEl) curEl.textContent = msFmt(_msAudio.currentTime);
    if(_msAudio.duration){
      var p = _msAudio.currentTime / _msAudio.duration * 100;
      if(fillEl) fillEl.style.width = p + '%';
    }
  };
  
  _msAudio.onloadedmetadata = function(){
    var durEl = document.getElementById('msDur');
    if(durEl) durEl.textContent = msFmt(_msAudio.duration);
  };

  function msFmt(s){
    if(!isFinite(s)) return '0:00';
    var m = Math.floor(s/60), sec = Math.floor(s%60);
    return m + ':' + (sec<10?'0':'') + sec;
  }

  function loadMusicFiles(files){
    var meta = JSON.parse(localStorage.getItem('mj_music_meta') || '[]');
    var done = 0;
    files.forEach(function(f){
      var id = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
      var key = 'music_' + id;
      __idb.set(key, f).then(function(){
        meta.push({ id: id, key: key, name: f.name.replace(/\.[^.]+$/, '') });
        localStorage.setItem('mj_music_meta', JSON.stringify(meta));
        __idb.toURL(key).then(function(url){
          _msLists.list.push({ id: id, key: key, name: f.name, url: url });
          done++;
          if(done === files.length) renderMusicList();
        });
      }).catch(function(err){
        console.error(err);
        if(typeof toast === 'function') toast('保存音乐失败');
      });
    });
  }

  function renderMusicList(){
    var viewList = document.getElementById('msListView');
    var viewGrid = document.getElementById('msGridView');
    
    if(!viewList || !viewGrid) return;
    if(!_msLists.list.length){
      var emptyHtml = '<div style="text-align:center;color:#bbb;padding:50px 20px;font-size:13px;letter-spacing:1px">还没有导入音乐</div>';
      viewList.innerHTML = emptyHtml;
      viewGrid.innerHTML = emptyHtml;
      return;
    }

    var listHtml = '';
    var gridHtml = '';

    _msLists.list.forEach(function(t, i){
      var idxStr = String(i+1).padStart(2, '0');
      listHtml += '<div class="ms-list-item" onclick="window.__msPlayAt(' + i + ')">' +
        '<div class="ms-li-cover">' + idxStr + '</div>' +
        '<div class="ms-li-info">' +
          '<div class="ms-li-name">' + t.name + '</div>' +
          '<div class="ms-li-count">LOCAL AUDIO</div>' +
        '</div>' +
      '</div>';
      
      gridHtml += '<div class="ms-grid-item" onclick="window.__msPlayAt(' + i + ')">' +
        '<div class="ms-gi-cover">' + idxStr + '</div>' +
        '<div class="ms-gi-name">' + t.name + '</div>' +
      '</div>';
    });

    viewList.innerHTML = listHtml;
    viewGrid.innerHTML = gridHtml;
  }
  
  var fp = document.getElementById('msFilePick');
  if(fp){
    fp.addEventListener('change', function(){
      var files = Array.from(this.files || []);
      this.value = '';
      if(files.length) loadMusicFiles(files);
    });
  }

  setTimeout(function(){
    var meta = JSON.parse(localStorage.getItem('mj_music_meta') || '[]');
    meta.forEach(function(t){
      __idb.toURL(t.key).then(function(url){
        if(url) _msLists.list.push({ id: t.id, key: t.key, name: t.name, url: url });
        renderMusicList();
      });
    });
  }, 500);

})();