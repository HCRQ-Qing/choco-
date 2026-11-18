/* ============================================================
   小游戏：2048 + 斗兽棋
   - 入口：聊天抽屉 → 小游戏
   - 仅一对一聊天可用
   ============================================================ */
(function(){
  if(document.getElementById('gamesScreenStyle')) return;

  var st = document.createElement('style');
  st.id = 'gamesScreenStyle';
  st.textContent = [
    '#gamesLobby{position:fixed;inset:0;z-index:1500;max-width:520px;margin:0 auto;background:#f7f7f7;display:none;flex-direction:column;font-family:"Songti SC","STSong","SimSun","宋体",serif;color:#1a1a1a}',
    '#gamesLobby.on{display:flex}',
    '#gamesLobby .gl-top{flex:none;display:flex;align-items:center;gap:12px;padding:20px 22px 12px;border-bottom:0.6px dashed #ebebeb}',
    '#gamesLobby .gl-back{width:38px;height:38px;flex:none;border:none;background:transparent;font-size:22px;color:#1a1a1a;cursor:pointer;opacity:.55;font-family:inherit;padding:0 0 4px;display:flex;align-items:center;justify-content:center}',
    '#gamesLobby .gl-title{flex:1;text-align:center;font-size:15px;font-weight:300;letter-spacing:6px;text-indent:6px;-webkit-text-stroke:0.15px #1a1a1a}',
    '#gamesLobby .gl-body{flex:1;overflow-y:auto;padding:10px 22px}',
    '#gamesLobby .gl-card{background:transparent;padding:22px 4px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.6px solid #f0f0f0;cursor:pointer;transition:opacity .15s}',
    '#gamesLobby .gl-card:active{opacity:.5}',
    '#gamesLobby .gl-card:last-child{border-bottom:none}',
    '#gamesLobby .gl-info{flex:1;display:flex;flex-direction:column;gap:6px}',
    '#gamesLobby .gl-name{font-size:15px;font-weight:300;letter-spacing:3px;color:#1a1a1a;-webkit-text-stroke:0.1px #1a1a1a}',
    '#gamesLobby .gl-desc{font-size:11px;color:#bbb;margin-top:0;letter-spacing:.5px;line-height:1.5}',
    '#gamesLobby .gl-en{font-size:9px;color:#ccc;font-family:Georgia,serif;letter-spacing:2px}',
    '#gamesLobby .gl-arr{color:#ccc;font-size:14px;font-family:Arial,sans-serif}',

    /* 2048 */
    '#game2048{position:fixed;inset:0;z-index:1501;max-width:520px;margin:0 auto;display:none;flex-direction:column;font-family:"Songti SC","STSong",serif;overflow:hidden;--bg-color:#F2F4F7;--board-bg:#E6E7E7;--cell-bg:#FFFFFF;--text-main:#373133;--text-soft:#8A8490;--t2-bg:#E6E7E7;--t2-c:#373133;--t4-bg:#CFD6E2;--t4-c:#373133;--t8-bg:#B1C6DE;--t8-c:#fff;--t16-bg:#8EA9C6;--t16-c:#fff;--t32-bg:#7A8799;--t32-c:#fff;--t64-bg:#665152;--t64-c:#fff;--t128-bg:#574544;--t128-c:#fff;--t256-bg:#483938;--t256-c:#fff;--t512-bg:#3D302F;--t512-c:#fff;--t1024-bg:#373133;--t1024-c:#fff;--t2048-bg:#242022;--t2048-c:#fff;--theme-color:#665152;background:var(--bg-color);color:var(--text-main)}',
    '#game2048.on{display:flex}',
    '#game2048.theme-blue{--bg-color:#FAFCFF;--board-bg:#F2F8FF;--cell-bg:#FFFFFF;--text-main:#1E88E5;--text-soft:#90CAF9;--t2-bg:#F2F8FF;--t2-c:#0066CC;--t4-bg:#E1F0FF;--t4-c:#0066CC;--t8-bg:#CCE6FF;--t8-c:#0066CC;--t16-bg:#B3DBFF;--t16-c:#fff;--t32-bg:#99CFFF;--t32-c:#fff;--t64-bg:#80C4FF;--t64-c:#fff;--t128-bg:#66B8FF;--t128-c:#fff;--t256-bg:#4DADFF;--t256-c:#fff;--t512-bg:#33A1FF;--t512-c:#fff;--t1024-bg:#1A96FF;--t1024-c:#fff;--t2048-bg:#0088FF;--t2048-c:#fff;--theme-color:#0088FF}',
    '#game2048.theme-green{--bg-color:#F7F9F4;--board-bg:#F0EFE2;--cell-bg:#FFFFFF;--text-main:#5B6B4A;--text-soft:#97A887;--t2-bg:#F0EFE2;--t2-c:#5B6B4A;--t4-bg:#E7EACB;--t4-c:#5B6B4A;--t8-bg:#D5DEB4;--t8-c:#5B6B4A;--t16-bg:#CADEA5;--t16-c:#5B6B4A;--t32-bg:#A3C57D;--t32-c:#fff;--t64-bg:#8DB166;--t64-c:#fff;--t128-bg:#769A50;--t128-c:#fff;--t256-bg:#61833D;--t256-c:#fff;--t512-bg:#4C6C2B;--t512-c:#fff;--t1024-bg:#39551B;--t1024-c:#fff;--t2048-bg:#283F0F;--t2048-c:#fff;--theme-color:#A3C57D}',
    '#game2048.theme-yellow{--bg-color:#FFFDF8;--board-bg:#F3ECE0;--cell-bg:#FFFFFF;--text-main:#A97855;--text-soft:#D4B29B;--t2-bg:#F3ECE0;--t2-c:#A97855;--t4-bg:#FBD897;--t4-c:#A97855;--t8-bg:#F5B895;--t8-c:#fff;--t16-bg:#FAC8C3;--t16-c:#fff;--t32-bg:#EFA895;--t32-c:#fff;--t64-bg:#E08E78;--t64-c:#fff;--t128-bg:#CA745D;--t128-c:#fff;--t256-bg:#AE5B45;--t256-c:#fff;--t512-bg:#8F4530;--t512-c:#fff;--t1024-bg:#70321F;--t1024-c:#fff;--t2048-bg:#522112;--t2048-c:#fff;--theme-color:#F5B895}',
    '#game2048.theme-brown{--bg-color:#FAF9F6;--board-bg:#F4EFEA;--cell-bg:#FFFFFF;--text-main:#6A5E53;--text-soft:#A39689;--t2-bg:#F4EFEA;--t2-c:#6A5E53;--t4-bg:#F1DCD0;--t4-c:#6A5E53;--t8-bg:#FCE8B2;--t8-c:#6A5E53;--t16-bg:#D9B9A6;--t16-c:#fff;--t32-bg:#C1B59B;--t32-c:#fff;--t64-bg:#A89A82;--t64-c:#fff;--t128-bg:#8E7E69;--t128-c:#fff;--t256-bg:#756553;--t256-c:#fff;--t512-bg:#5D4E3F;--t512-c:#fff;--t1024-bg:#47392C;--t1024-c:#fff;--t2048-bg:#33271C;--t2048-c:#fff;--theme-color:#C1B59B}',
    '#game2048 .g-top{width:100%;display:flex;align-items:center;justify-content:space-between;padding:20px 22px 12px;border-bottom:0.6px dashed rgba(0,0,0,0.1);flex:none}',
    '#game2048 .g-back{width:38px;height:38px;flex:none;border:none;background:transparent;font-size:24px;color:var(--theme-color);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#game2048 .g-title{font-size:16px;font-weight:500;letter-spacing:6px;text-indent:6px;flex:1;text-align:center;color:var(--text-main)}',
    '#game2048 .theme-btn{width:38px;height:38px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:opacity 0.2s,transform 0.1s}',
    '#game2048 .theme-btn:active{transform:scale(0.9)}',
    '#game2048 .theme-btn svg{width:20px;height:20px;stroke:var(--theme-color);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}',
    '#game2048 .theme-btn svg circle{fill:var(--theme-color);stroke:none}',
    '#game2048 .g-score{width:100%;display:flex;gap:12px;padding:20px 22px 10px;flex:none}',
    '#game2048 .g-sc-box{flex:1;background:var(--cell-bg);border:0.7px solid rgba(0,0,0,0.05);border-radius:12px;padding:12px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.02)}',
    '#game2048 .g-sc-l{font-size:10px;letter-spacing:2px;color:var(--text-soft);margin-bottom:4px}',
    '#game2048 .g-sc-v{font-size:22px;font-weight:bold;font-family:sans-serif;color:var(--text-main)}',
    '#game2048 .g-board{flex:1;display:flex;align-items:center;justify-content:center;padding:10px 22px;width:100%}',
    '#game2048 .g-grid{width:min(100%,400px);aspect-ratio:1;background:var(--board-bg);border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:10px;position:relative;touch-action:none;box-shadow:inset 0 0 10px rgba(0,0,0,0.03)}',
    '#game2048 .g-cell{background:var(--cell-bg);border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.02)}',
    '#game2048 .g-tile{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:500;border-radius:8px;font-size:26px;font-family:sans-serif;-webkit-font-smoothing:antialiased;transition:transform .1s ease-out;will-change:transform}',
    '#game2048 .g-tile[data-v="2"]{background:var(--t2-bg);color:var(--t2-c)}',
    '#game2048 .g-tile[data-v="4"]{background:var(--t4-bg);color:var(--t4-c)}',
    '#game2048 .g-tile[data-v="8"]{background:var(--t8-bg);color:var(--t8-c)}',
    '#game2048 .g-tile[data-v="16"]{background:var(--t16-bg);color:var(--t16-c)}',
    '#game2048 .g-tile[data-v="32"]{background:var(--t32-bg);color:var(--t32-c)}',
    '#game2048 .g-tile[data-v="64"]{background:var(--t64-bg);color:var(--t64-c)}',
    '#game2048 .g-tile[data-v="128"]{background:var(--t128-bg);color:var(--t128-c);font-size:22px}',
    '#game2048 .g-tile[data-v="256"]{background:var(--t256-bg);color:var(--t256-c);font-size:22px}',
    '#game2048 .g-tile[data-v="512"]{background:var(--t512-bg);color:var(--t512-c);font-size:22px}',
    '#game2048 .g-tile[data-v="1024"]{background:var(--t1024-bg);color:var(--t1024-c);font-size:18px}',
    '#game2048 .g-tile[data-v="2048"]{background:var(--t2048-bg);color:var(--t2048-c);font-size:18px}',
    '#game2048 .g-tile[data-v="4096"],#game2048 .g-tile[data-v="8192"]{background:var(--theme-color);color:#fff;font-size:16px}',
    '#game2048 .g-ctrl{flex:none;padding:20px 22px 40px;display:flex;justify-content:center;width:100%}',
    '#game2048 .g-btn-text{padding:10px 20px;border:none;background:transparent;font-size:14px;letter-spacing:6px;color:var(--theme-color);cursor:pointer;font-family:inherit;font-weight:500;opacity:0.8;transition:opacity 0.2s}',
    '#game2048 .g-btn-text:active{opacity:1}',
    '#game2048 .modal-mask{position:absolute;inset:0;background:rgba(0,0,0,0.3);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.25s;z-index:100}',
    '#game2048 .modal-mask.show{opacity:1;pointer-events:auto}',
    '#game2048 .modal-box{width:80%;max-width:300px;background:#fff;border-radius:20px;padding:24px;text-align:center;transform:translateY(20px);transition:transform 0.25s;box-shadow:0 10px 30px rgba(0,0,0,0.1)}',
    '#game2048 .modal-mask.show .modal-box{transform:translateY(0)}',
    '#game2048 .modal-title{font-size:18px;font-weight:bold;letter-spacing:2px;color:var(--text-main);margin-bottom:20px}',
    '#game2048 .modal-reward-box{background:var(--board-bg);border-radius:12px;padding:20px 0;margin-bottom:24px}',
    '#game2048 .modal-reward-label{font-size:12px;color:var(--theme-color);margin-bottom:6px;letter-spacing:1px}',
    '#game2048 .modal-reward-val{font-size:32px;font-weight:bold;font-family:sans-serif;color:var(--theme-color)}',
    '#game2048 .modal-actions{display:flex;flex-direction:row;gap:12px;margin-top:10px}',
    '#game2048 .modal-btn{flex:1;padding:12px 0;border-radius:24px;border:none;font-size:14px;letter-spacing:2px;cursor:pointer;font-family:inherit;transition:opacity 0.2s}',
    '#game2048 .modal-btn.primary{background:var(--theme-color);color:#fff;box-shadow:0 4px 10px rgba(0,0,0,0.1)}',
    '#game2048 .modal-btn.secondary{background:var(--board-bg);color:var(--theme-color)}',
    '#game2048 .modal-btn:active{opacity:0.8}',
    '#game2048 .loading-spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:g2048Spin 0.8s linear infinite;vertical-align:middle;margin-right:6px;}',
    '@keyframes g2048Spin{to{transform:rotate(360deg)}}',
    
    /* 斗兽棋 */
    '#gameJungle{position:fixed;inset:0;z-index:1501;max-width:520px;margin:0 auto;background:#f7f7f7;display:none;flex-direction:column;font-family:"Songti SC","STSong",serif;color:#1a1a1a}',
    '#gameJungle.on{display:flex}',
    '#gameJungle .j-top{flex:none;display:flex;align-items:center;padding:18px 20px 10px}',
    '#gameJungle .j-back{width:36px;height:36px;border:none;background:transparent;font-size:24px;color:#1a1a1a;cursor:pointer;font-family:inherit;padding:0 0 4px;opacity:.55}',
    '#gameJungle .j-title{flex:1;text-align:center;font-size:15px;font-weight:300;letter-spacing:6px;text-indent:6px}',
    '#gameJungle .j-turn{flex:none;text-align:center;padding:6px 20px;font-size:13px;letter-spacing:2px;color:#666}',
    '#gameJungle .j-turn span.r{color:#1a1a1a;font-weight:700}',
    '#gameJungle .j-turn span.b{color:#666;font-weight:700}',
    '#gameJungle .j-board-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:10px}',
    '#gameJungle .j-board{width:min(92vw,440px);aspect-ratio:7/9;display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(9,1fr);gap:1px;background:#ccc;border:2px solid #bbb;border-radius:8px;overflow:hidden;user-select:none}',
    '#gameJungle .j-cell{background:#fff;position:relative;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer}',
    '#gameJungle .j-cell.water{background:#f0f0f0;background-image:radial-gradient(#e0e0e0 1px, transparent 1px);background-size:10px 10px}',
    '#gameJungle .j-cell.trap{background:#fafafa}',
    '#gameJungle .j-cell.den{background:#f5f5f5}',
    '#gameJungle .j-cell.sel{box-shadow:inset 0 0 0 3px #1a1a1a}',
    '#gameJungle .j-cell.move::after{content:"";position:absolute;width:24%;height:24%;border-radius:50%;background:rgba(26,26,26,.3);z-index:1}',
    '#gameJungle .j-piece{width:86%;height:86%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;letter-spacing:1px;z-index:2;transition:transform .2s;border:1px solid transparent;box-shadow:0 1px 3px rgba(0,0,0,.1)}',
    '#gameJungle .j-piece.r{background:#1a1a1a;color:#fff;border-color:#000}',
    '#gameJungle .j-piece.b{background:#fff;color:#1a1a1a;border-color:#999;box-shadow:0 1px 3px rgba(0,0,0,.15)}',
    '#gameJungle .j-cell.sel .j-piece{transform:scale(1.1);box-shadow:0 0 0 2px #fff, 0 0 0 4px #1a1a1a}',
    '#gameJungle .j-ctrl{flex:none;padding:14px 20px 28px;display:flex;gap:10px;justify-content:center}',
    '#gameJungle .j-btn{padding:10px 22px;border-radius:22px;border:none;background:#1a1a1a;color:#fff;font-size:12px;letter-spacing:3px;cursor:pointer;font-family:inherit}',
    '#gameJungle .j-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10;display:none;align-items:center;justify-content:center;padding:24px}',
    '#gameJungle .j-overlay.show{display:flex}',
    '#gameJungle .j-win{background:#fff;border-radius:16px;padding:30px 36px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.1);min-width:200px;border:0.6px solid #eee}',
    '#gameJungle .j-win-t{font-size:20px;font-weight:400;letter-spacing:4px;margin-bottom:6px;color:#1a1a1a}',
    '#gameJungle .j-win-coin{font-size:11px;letter-spacing:2px;color:#666;margin-top:14px;font-weight:300}',
    '#gameJungle .j-win-coin b{color:#1a1a1a;font-weight:400;font-family:Georgia,serif;margin:0 2px}',
    '#gameJungle .j-btn.j-win-ok{margin-top:20px;padding:9px 28px;border-radius:20px;font-size:12px;letter-spacing:3px}'
  ].join('');
  document.head.appendChild(st);

  /* ===== 游戏大厅 ===== */
  var lobby = document.createElement('div');
  lobby.id = 'gamesLobby';
  lobby.innerHTML =
    '<div class="gl-top">' +
      '<button class="gl-back" id="glBack">‹</button>' +
      '<div class="gl-title">小 游 戏</div>' +
      '<div style="width:38px"></div>' +
    '</div>' +
    '<div class="gl-body">' +
      '<div class="gl-card" data-game="2048">' +
        '<div class="gl-info">' +
          '<div class="gl-name">2 0 4 8</div>' +
          '<div class="gl-desc">滑动合并相同数字，挑战 2048！</div>' +
          '<div class="gl-en">PUZZLE</div>' +
        '</div>' +
        '<div class="gl-arr">→</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(lobby);

  lobby.querySelector('#glBack').onclick = function(){ lobby.classList.remove('on'); };
  lobby.querySelectorAll('.gl-card').forEach(function(c){
    c.onclick = function(){
      var g = c.dataset.game;
      if(g === '2048'){ start2048(); }
    };
  });

  window.openGameLobby = function(){ lobby.classList.add('on'); };

  /* ===== 2048 ===== */
  var g2048 = document.createElement('div');
  g2048.id = 'game2048';
  g2048.innerHTML =
    '<div class="g-top">' +
      '<button class="g-back" id="g2048Back">‹</button>' +
      '<div class="g-title" id="g2048Title">2048</div>' +
      '<button class="theme-btn" id="g2048ThemeBtn">' +
        '<svg viewBox="0 0 24 24">' +
          '<path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.5 5 15 7 15H8C9 15 9.5 15.5 9.5 16.5V17C9.5 18.5 10.5 20 12 20Z" />' +
          '<circle cx="8" cy="10" r="1.2"/>' +
          '<circle cx="12" cy="8" r="1.2"/>' +
          '<circle cx="16" cy="10" r="1.2"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +
    '<div class="g-score">' +
      '<div class="g-sc-box" id="g2048Sc1"><div class="g-sc-l" id="g2048ScL1">SCORE</div><div class="g-sc-v" id="g2048Score">0</div></div>' +
      '<div class="g-sc-box" id="g2048Sc2"><div class="g-sc-l" id="g2048ScL2">BEST</div><div class="g-sc-v" id="g2048Best">0</div></div>' +
    '</div>' +
    '<div class="g-board"><div class="g-grid" id="g2048Grid"></div></div>' +
    '<div class="g-ctrl">' +
      '<button class="g-btn-text" id="g2048EndBtn">结 束 游 戏</button>' +
    '</div>' +
    '<div class="modal-mask" id="g2048Modal">' +
      '<div class="modal-box">' +
        '<div class="modal-title" id="g2048MTitle">结 算</div>' +
        '<div class="modal-reward-box" id="g2048MRewardBox">' +
          '<div class="modal-reward-label" id="g2048MRLabel">本局获得奖励</div>' +
          '<div class="modal-reward-val" id="g2048Money">₵ 0.00</div>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button class="modal-btn primary" id="g2048SaveBtn">保存退出</button>' +
          '<button class="modal-btn secondary" id="g2048RestartBtn">结 算</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="modal-mask" id="g2048ExitModal">' +
      '<div class="modal-box">' +
        '<div class="modal-title">是否退出？</div>' +
        '<div class="modal-actions">' +
          '<button class="modal-btn primary" id="g2048ExitConfirm">退 出</button>' +
          '<button class="modal-btn secondary" id="g2048ExitCancel">取 消</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(g2048);

  var themeList = ['', 'theme-blue', 'theme-green', 'theme-yellow', 'theme-brown'];
  var curThemeIdx = 0;

  function applyTheme(idx) {
    g2048.classList.remove(themeList[curThemeIdx]);
    curThemeIdx = idx;
    if(themeList[curThemeIdx]) g2048.classList.add(themeList[curThemeIdx]);
  }

  g2048.querySelector('#g2048ThemeBtn').onclick = function(){
    curThemeIdx = (curThemeIdx + 1) % themeList.length;
    applyTheme(curThemeIdx);
  };

  g2048.querySelector('#g2048Back').onclick = function(){
    var money = (score / 10).toFixed(2);
    g2048.querySelector('#g2048Money').textContent = '₵ ' + money;
    g2048.querySelector('#g2048Modal').classList.add('show');
  };

 
  
  g2048.querySelector('#g2048EndBtn').onclick = function(){
    var money = (score / 10).toFixed(2);
    g2048.querySelector('#g2048Money').textContent = '₵ ' + money;
    g2048.querySelector('#g2048Modal').classList.add('show');
  };

  g2048.querySelector('#g2048Modal').onclick = function(e) {
    if (e.target === this) {
      this.classList.remove('show');
    }
  };

  g2048.querySelector('#g2048SaveBtn').onclick = function(){
    var btn = this;
    if(btn.disabled) return;
    btn.disabled = true;
    var origText = btn.textContent;
    btn.innerHTML = '<span class="loading-spin"></span> 保存中...';
    
    localStorage.setItem('mj_2048_save', JSON.stringify({ grid: grid, score: score }));
    
    setTimeout(function() {
      btn.innerHTML = '保存成功';
      setTimeout(function() {
        btn.textContent = origText;
        btn.disabled = false;
        g2048.querySelector('#g2048Modal').classList.remove('show');
        g2048.classList.remove('on');
        lobby.classList.add('on');
      }, 400);
    }, 600);
  };

  g2048.querySelector('#g2048RestartBtn').onclick = function(){
    g2048.querySelector('#g2048Modal').classList.remove('show');
    var money = (score / 10).toFixed(2);
    if(typeof window.addAccountBalance === 'function') {
      window.addAccountBalance(parseFloat(money), '2048游戏奖励', 'me');
    }
    localStorage.removeItem('mj_2048_save'); 
    grid = null;
    if(window.toast) toast('结算成功 +₵ ' + money);
    init2048(true);
  };

  var grid, score, best, over;
  var SIZE = 4;

  var tiles = [];
  var locked = false;
  var geo = null;
  var lastDir = null;
  function measure(){
    var el = document.getElementById('g2048Grid');
    if(!el) return;
    var g = el.getBoundingClientRect();
    var pad = g.width * 0.03;
    var gap = g.width * 0.03;
    var inner = g.width - pad*2;
    var cell = (inner - gap*(SIZE-1)) / SIZE;
    geo = { w: g.width, pad: pad, gap: gap, cell: cell };
  }
  function posOf(r,c){
    return { x: geo.pad + c*(geo.cell+geo.gap), y: geo.pad + r*(geo.cell+geo.gap) };
  }
  function styleTile(el, v){
    el.style.width = geo.cell + 'px';
    el.style.height = geo.cell + 'px';
    el.dataset.v = v;
    el.textContent = v;
  }
  function placeTile(el, r, c){
    var p = posOf(r,c);
    el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
  }
  function makeTile(v, r, c, isNew){
    var el = document.createElement('div');
    el.className = 'g-tile';
    styleTile(el, v);
    placeTile(el, r, c);
 
    document.getElementById('g2048Grid').appendChild(el);
    return { el: el, v: v };
  }
  function init2048(isNewGame){
    if (isNewGame) {
      localStorage.removeItem('mj_2048_save');
      grid = null;
    }
    
    var saved = localStorage.getItem('mj_2048_save');
    if (saved && !isNewGame) {
      try {
        var data = JSON.parse(saved);
        grid = data.grid;
        score = data.score;
      } catch(e) { localStorage.removeItem('mj_2048_save'); grid = null; }
    }

    if (!grid) {
      grid = Array.from({length:SIZE},function(){return Array(SIZE).fill(0);});
      score = 0;
    }

    over = false;
    locked = false;
    best = parseInt(localStorage.getItem('mj_2048_best')||'0',10);
    document.getElementById('g2048Score').textContent = score;
    document.getElementById('g2048Best').textContent = best;
    var el = document.getElementById('g2048Grid');
    if(!el) return;
    if(!el.__inited){
      el.__inited = true;
      el.innerHTML = '';
      for(var i=0;i<SIZE*SIZE;i++){
        var cell = document.createElement('div');
        cell.className = 'g-cell';
        el.appendChild(cell);
      }
    }
    el.querySelectorAll('.g-tile').forEach(function(t){ t.remove(); });
    tiles = Array.from({length:SIZE},function(){return Array(SIZE).fill(null);});
    measure();
    
    if (saved && !isNewGame) {
      for(var r=0; r<SIZE; r++) {
        for(var c=0; c<SIZE; c++) {
          if (grid[r][c] > 0) {
            tiles[r][c] = makeTile(grid[r][c], r, c, false);
          }
        }
      }
    } else {
      addRandom();
      setTimeout(function(){ addRandom(); }, 50);
    }
    if(typeof applyTheme === 'function') applyTheme(0);
  }
  function addRandom(){
    var empty = [];
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++) if(!tiles[r][c]) empty.push([r,c]);
    if(!empty.length) return;
    var p = empty[Math.floor(Math.random()*empty.length)];
    var v = Math.random()<0.9?2:4;
    grid[p[0]][p[1]] = v;
    var nt = makeTile(v, p[0], p[1], true);
    nt.el.style.opacity = '0';
    nt.el.style.transition = 'transform .1s ease-out, opacity .15s ease-out';
    var from = { r: p[0], c: p[1] };
    if(lastDir === 'left') from.c = SIZE;
    else if(lastDir === 'right') from.c = -1;
    else if(lastDir === 'up') from.r = -1;
    else if(lastDir === 'down') from.r = SIZE;
    var fp = posOf(from.r, from.c);
    nt.el.style.transform = 'translate(' + fp.x + 'px,' + fp.y + 'px)';
    tiles[p[0]][p[1]] = nt;
    requestAnimationFrame(function(){
      var tp = posOf(p[0], p[1]);
      nt.el.style.transform = 'translate(' + tp.x + 'px,' + tp.y + 'px)';
      nt.el.style.opacity = '1';
    });
  }
  function move(dir){
    if(locked || over) return;
    locked = true;
    lastDir = dir;
    var moved = false;
    function lineCoords(dir, index){
      var out = [];
      for(var k=0;k<SIZE;k++){
        if(dir==='left')  out.push([index, k]);
        if(dir==='right') out.push([index, SIZE-1-k]);
        if(dir==='up')    out.push([k, index]);
        if(dir==='down')  out.push([SIZE-1-k, index]);
      }
      return out;
    }
    var newVals = Array.from({length:SIZE}, function(){ return Array(SIZE).fill(0); });
    for(var i=0;i<SIZE;i++){
      var coords = lineCoords(dir, i);
      var seq = [];
      for(var k=0;k<SIZE;k++){
        var val = grid[coords[k][0]][coords[k][1]];
        if(val > 0) seq.push({ v: val, r: coords[k][0], c: coords[k][1] });
      }
      var targetIdx = 0;
      for(var j=0;j<seq.length;j++){
        var curr = seq[j];
        var next = seq[j+1];
        var tr = coords[targetIdx][0];
        var tc = coords[targetIdx][1];

        if(next && curr.v === next.v){
          newVals[tr][tc] = curr.v * 2;
          score += curr.v * 2;
          j++;
        } else {
          newVals[tr][tc] = curr.v;
        }
        targetIdx++;
      }
    }
    for(var r0=0;r0<SIZE;r0++){
      for(var c0=0;c0<SIZE;c0++){
        if(grid[r0][c0] !== newVals[r0][c0]) moved = true;
      }
    }
    if(!moved){
      locked = false;
      return;
    }
    if(score>best){ best = score; document.getElementById('g2048Best').textContent = best; localStorage.setItem('mj_2048_best', best); }

    var oldTiles = tiles;
    var newTiles = Array.from({length:SIZE},function(){return Array(SIZE).fill(null);});

    for(var i=0;i<SIZE;i++){
      var coords = lineCoords(dir, i);
      var seq = [];
      for(var k=0;k<SIZE;k++){
        var t0 = oldTiles[coords[k][0]][coords[k][1]];
        if(t0) seq.push({ tile: t0, idx: k });
      }
      var ti = 0;
      for(var j=0;j<seq.length;j++){
        var curr = seq[j];
        var next = seq[j+1];
        var tr = coords[ti][0];
        var tc = coords[ti][1];

        if(next && curr.tile.v === next.tile.v){
          placeTile(curr.tile.el, tr, tc);
          placeTile(next.tile.el, tr, tc);
          (function(el){ setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 120); })(next.tile.el);
          var mergedV = curr.tile.v * 2;
          var mergedEl = document.createElement('div');
          mergedEl.className = 'g-tile';
          mergedEl.dataset.v = mergedV;
          mergedEl.textContent = mergedV;
          mergedEl.style.width = geo.cell + 'px';
          mergedEl.style.height = geo.cell + 'px';
          mergedEl.style.opacity = '0';
          var pp = posOf(tr, tc);
          mergedEl.style.transform = 'translate(' + pp.x + 'px,' + pp.y + 'px)';
          document.getElementById('g2048Grid').appendChild(mergedEl);
          setTimeout(function(el){ return function(){ el.style.opacity = '1'; }; }(mergedEl), 110);
          if(curr.tile.el.parentNode) curr.tile.el.parentNode.removeChild(curr.tile.el);
          newTiles[tr][tc] = { el: mergedEl, v: mergedV };
          j++;
        } else {
          newTiles[tr][tc] = curr.tile;
          placeTile(curr.tile.el, tr, tc);
        }
        ti++;
      }
    }

    tiles = newTiles;
    grid = newVals;
    for(var r=0;r<SIZE;r++){
      for(var c=0;c<SIZE;c++){
        if(grid[r][c] !== 0 && !tiles[r][c]){
          tiles[r][c] = makeTile(grid[r][c], r, c, false);
        }
      }
    }
    addRandom();
    check2048Over();
    locked = false;
  }
  function check2048Over(){
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
      if(!grid[r][c]) return;
      if(c<SIZE-1 && grid[r][c]===grid[r][c+1]) return;
      if(r<SIZE-1 && grid[r][c]===grid[r+1][c]) return;
    }
    over = true;
    if(window.toast) toast('游戏结束！得分 ' + score);
  }
  function start2048(){
    lobby.classList.remove('on');
    g2048.classList.add('on');
    init2048();
  }
  var tsx=0, tsy=0, tracking=false;
  var gridDom = document.getElementById('g2048Grid');
  g2048.addEventListener('touchstart', function(e){
    var p = e.touches[0];
    tsx = p.clientX; tsy = p.clientY; tracking = true;
  }, {passive:true});
  g2048.addEventListener('touchmove', function(e){
    if(!tracking) return;
    var p = e.touches[0];
    var dx = p.clientX - tsx;
    var dy = p.clientY - tsy;
    if(Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
    tracking = false;
    if(Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }, {passive:true});
  g2048.addEventListener('touchend', function(){
    tracking = false;
  }, {passive:true});
  window.addEventListener('resize', function(){
    if(!g2048.classList.contains('on') || !geo) return;
    measure();
    for(var r=0;r<SIZE;r++){
      for(var c=0;c<SIZE;c++){
        var t = tiles[r][c];
        if(!t) continue;
        styleTile(t.el, t.v);
        placeTile(t.el, r, c);
      }
    }
  });
  /* 键盘 */
  document.addEventListener('keydown', function(e){
    if(!g2048.classList.contains('on')) return;
    if(e.key==='ArrowLeft'){move('left');e.preventDefault();}
    else if(e.key==='ArrowRight'){move('right');e.preventDefault();}
    else if(e.key==='ArrowUp'){move('up');e.preventDefault();}
    else if(e.key==='ArrowDown'){move('down');e.preventDefault();}
  });

   

})();

/* ============================================================
   群聊飞行棋（openGroupLudo）
   ------------------------------------------------------------
   - 群成员 + 我，最多 4 方，每人 1 枚棋子
   - 掷到 6 起飞；每回合按骰子前进
   - 绕场一圈（40 格）先到终点者获胜
   - 同一格撞到别人 → 对方回机场重新起飞
   - 角色自动掷骰，用户点按钮掷
   ============================================================ */
(function(){
  'use strict';
  var mask = null;
  var state = null;
  var gen = 0;                 /* 每次重开/关闭 +1，用来作废旧定时器 */
  var PERIM = 40;

  function cellPos(i){
    if(i < 11) return [0, i];
    if(i < 21) return [i - 10, 10];
    if(i < 31) return [10, 10 - (i - 20)];
    return [10 - (i - 30), 0];
  }

  function ensureMask(){
    if(mask) return mask;
    mask = document.createElement('div');
    mask.id = 'gchLudo';
    mask.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;background:#fff;max-width:520px;margin:0 auto;' +
      'display:none;flex-direction:column;overflow:hidden;font-family:inherit;color:#1a1a1a';
    document.body.appendChild(mask);
    return mask;
  }

  function buildBoard(){
    var map = {};
    for(var i = 0; i < PERIM; i++){
      var p = cellPos(i);
      map[p[0] * 11 + p[1]] = i;
    }
    var html = '<div style="display:grid;grid-template-columns:repeat(11,1fr);grid-template-rows:repeat(11,1fr);gap:2px;' +
      'width:min(88vw,342px);aspect-ratio:1/1;margin:0 auto">';
    for(var r = 0; r < 11; r++){
      for(var c = 0; c < 11; c++){
        var k = r * 11 + c;
        if(map[k] !== undefined){
          var idx = map[k];
          var bg = '#ffffff';
          if(idx === 0) bg = '#eef7ee';
          else if(idx === PERIM - 1) bg = '#fdf3e7';
          html += '<div class="ld-cell" data-idx="' + idx + '" style="position:relative;display:flex;align-items:center;' +
            'justify-content:center;background:' + bg + ';border:0.6px solid rgba(0,0,0,.12);border-radius:4px;overflow:hidden"></div>';
        } else {
          html += '<div></div>';
        }
      }
    }
    html += '</div>';
    return html;
  }

  function initState(){
    var players = [];
    var uname = (typeof userName === 'function') ? userName() : '我';
    players.push({ name: uname, isUser: true, color: '#1a1a1a', pos: -1, started: false, done: false });
    var g = (typeof getGroupById === 'function') ? getGroupById(window.__curGroupId) : null;
    var colors = ['#e57373', '#64b5f6', '#81c784'];
    var mem = (g && g.members || []).slice(0, 3);
    mem.forEach(function(rid, i){
      var r = (typeof getRoleById === 'function') ? getRoleById(rid) : null;
      if(!r) return;
      players.push({
        name: (typeof displayName === 'function' ? displayName(r) : r.name) || '?',
        isUser: false,
        color: colors[i % 3],
        pos: -1, started: false, done: false
      });
    });
    return { players: players, turn: 0, busy: false, over: false, logs: [] };
  }

  function log(t){
    if(!state) return;
    state.logs.unshift(t);
    if(state.logs.length > 30) state.logs.length = 30;
    var box = mask.querySelector('#ldLog');
    if(box){
      box.innerHTML = state.logs.map(function(s){ return '<div>' + escapeHTML(s) + '</div>'; }).join('');
    }
  }

  function renderHangar(){
    var box = mask.querySelector('#ldHangar');
    if(!box || !state) return;
    box.innerHTML = state.players.map(function(p){
      if(p.done) return '<span style="color:' + p.color + '">🏁 ' + escapeHTML(p.name) + ' 已到终点</span>';
      if(p.started) return '<span style="color:' + p.color + '">● ' + escapeHTML(p.name) + ' 第 ' + (p.pos + 1) + ' 格</span>';
      return '<span>○ ' + escapeHTML(p.name) + ' 待起飞</span>';
    }).join('');
  }

  function renderPieces(){
    if(!mask || !state) return;
    mask.querySelectorAll('.ld-cell').forEach(function(cell){ cell.innerHTML = ''; });
    state.players.forEach(function(p){
      if(!p.started) return;
      var idx = p.done ? PERIM - 1 : p.pos;
      var cell = mask.querySelector('.ld-cell[data-idx="' + idx + '"]');
      if(!cell) return;
      var dot = document.createElement('div');
      dot.style.cssText = 'width:66%;aspect-ratio:1/1;border-radius:50%;background:' + p.color +
        ';border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2)';
      cell.appendChild(dot);
    });
  }

  function renderInfo(){
    var info = mask.querySelector('#ldInfo');
    if(!info || !state) return;
    if(state.over){
      var w = state.players.find(function(x){ return x.done; });
      info.innerHTML = '<div style="font-size:15px;letter-spacing:2px">🏁 ' + escapeHTML(w ? w.name : '') + ' 获胜</div>';
      return;
    }
    var p = state.players[state.turn];
    var diceShown = (typeof state.lastDice === 'number') ? state.lastDice : '🎲';
    info.innerHTML = '<div style="font-size:12px;color:#999;letter-spacing:1px">' +
      (p && p.isUser ? '轮到你掷骰子' : '轮到 ' + escapeHTML(p ? p.name : '') + ' 掷骰子') +
      '</div><div id="ldDice" style="font-size:30px;line-height:1.3;font-weight:300;letter-spacing:2px">' + diceShown + '</div>';
  }

  function rollFor(p){
    var dice = 1 + Math.floor(Math.random() * 6);
    state.lastDice = dice;
    var diceEl = mask.querySelector('#ldDice');
    if(diceEl) diceEl.textContent = dice;
    if(!p.started){
      if(dice === 6){ p.started = true; p.pos = 0; log(p.name + ' 掷出 6，起飞！'); }
      else log(p.name + ' 掷出 ' + dice + '，还没起飞');
      return;
    }
    p.pos += dice;
    if(p.pos >= PERIM){
      p.pos = PERIM - 1;
      p.done = true;
      log(p.name + ' 掷出 ' + dice + '，到达终点！');
      return;
    }
    log(p.name + ' 掷出 ' + dice + '，走到第 ' + (p.pos + 1) + ' 格');
    /* 撞子：同格的其他已起飞玩家回机场 */
    state.players.forEach(function(q){
      if(q === p || !q.started || q.done) return;
      if(q.pos === p.pos){
        q.pos = -1; q.started = false;
        log(p.name + ' 把 ' + q.name + ' 撞回了机场');
      }
    });
  }

  function nextTurn(token){
    if(!state || state.over || token !== gen) return;
    state.busy = false;
    state.turn = (state.turn + 1) % state.players.length;
    renderInfo();
    var p = state.players[state.turn];
    if(p && !p.isUser){
      setTimeout(function(){
        if(!state || state.over || token !== gen) return;
        if(state.players[state.turn] !== p) return;
        doRoll(p);
      }, 800 + Math.random() * 700);
    }
  }

  function doRoll(p){
    if(!state || state.busy || state.over) return;
    state.busy = true;
    var token = gen;
    renderInfo();
    rollFor(p);
    renderHangar();
    renderPieces();
    renderInfo();
    if(p.done){
      state.over = true;
      renderInfo();
      var btn = mask.querySelector('#ldRoll');
      if(btn) btn.style.opacity = '.4';
      return;
    }
    setTimeout(function(){ nextTurn(token); }, 700);
  }

  function restart(){
    gen++;
    state = initState();
    var btn = mask.querySelector('#ldRoll');
    if(btn) btn.style.opacity = '1';
    renderHangar();
    renderPieces();
    renderInfo();
    log('新的一局开始，掷到 6 才能起飞');
  }

  window.openGroupLudo = function(){
    if(typeof getGroupById === 'function' && !getGroupById(window.__curGroupId)){
      if(typeof toast === 'function') toast('先打开一个群聊再玩飞行棋');
      return;
    }
    var m = ensureMask();
    if(!m.__built){
      m.__built = true;
      m.innerHTML =
        '<div style="flex:none;display:flex;align-items:center;gap:10px;padding:18px 18px 8px">' +
          '<button id="ldBack" type="button" style="width:36px;height:36px;flex:none;border:none;background:transparent;font-size:22px;opacity:.6">‹</button>' +
          '<div style="flex:1;text-align:center;font-size:15px;font-weight:300;letter-spacing:6px">飞 行 棋</div>' +
          '<div style="width:36px;flex:none"></div>' +
        '</div>' +
        '<div id="ldHangar" style="flex:none;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;padding:0 16px 8px;font-size:11px;color:#999"></div>' +
        '<div style="flex:none;padding:0 12px">' + buildBoard() + '</div>' +
        '<div id="ldInfo" style="flex:none;text-align:center;padding:12px 18px 2px"></div>' +
        '<div id="ldLog" style="flex:1;overflow-y:auto;padding:4px 20px;font-size:11.5px;color:#999;line-height:1.75"></div>' +
        '<div style="flex:none;padding:10px 18px 20px;display:flex;gap:10px">' +
          '<button id="ldRoll" type="button" style="flex:1;height:46px;border:none;border-radius:23px;background:#1a1a1a;color:#fff;font-size:14px;letter-spacing:4px">掷 骰 子</button>' +
          '<button id="ldRestart" type="button" style="flex:none;width:94px;height:46px;border:0.6px solid rgba(0,0,0,.15);border-radius:23px;background:#fff;color:#1a1a1a;font-size:13px">重开</button>' +
        '</div>';
      m.querySelector('#ldBack').onclick = function(){
        gen++;
        m.style.display = 'none';
        if(state) state.over = true;
      };
      m.querySelector('#ldRestart').onclick = function(){ restart(); };
      m.querySelector('#ldRoll').onclick = function(){
        if(!state) return;
        var p = state.players[state.turn];
        if(!p) return;
        if(!p.isUser){
          if(typeof toast === 'function') toast('轮到 ' + p.name + ' 了');
          return;
        }
        doRoll(p);
      };
    }
    m.style.display = 'flex';
    restart();
  };
})();
