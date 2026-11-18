(function(){
  if(window.__featureLockMounted) return;
  window.__featureLockMounted = true;

  var LOCK_KEY = 'mj_feature_lock_v1';
  var PASS_KEY = 'mj_feature_lock_pass_v1';
  var CORRECT_PASS = '5201';

  function isUnlocked(){
    return localStorage.getItem(LOCK_KEY) === '1';
  }

  function setUnlockState(on){
    localStorage.setItem(LOCK_KEY, on ? '1' : '0');
    if(!on){
      localStorage.removeItem(PASS_KEY);
    }
  }

  function mountUI(){
    if(document.getElementById('featureLockScreen')) return;
    
    var scr = document.createElement('div');
    scr.className = 'screen';
    scr.id = 'featureLockScreen';
    scr.style.cssText = 'background:#ffffff; flex-direction:column; z-index:100;';
    
    var styleEl = document.createElement('style');
    styleEl.textContent = `
      #featureLockScreen { font-family: "Songti SC", "STSong", "SimSun", "宋体", serif !important; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      #featureLockScreen .fl-utop { display: flex; align-items: center; padding: 20px 22px 12px; }
      #featureLockScreen .fl-back { width: 38px; height: 38px; border: none; background: transparent; color: #1a1a1a; font-size: 20px; opacity: .55; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; }
      #featureLockScreen .fl-title { flex: 1; font-size: 14px; font-weight: 400; letter-spacing: 6px; text-indent: 6px; text-align: center; color: #1a1a1a; }
      #featureLockScreen .fl-content { flex: 1; overflow-y: auto; padding: 16px 24px 40px; display: flex; flex-direction: column; scrollbar-width: none; }
      #featureLockScreen .fl-content::-webkit-scrollbar { display: none; }
      #featureLockScreen .fl-body-text { font-size: 14px; line-height: 1.75; margin-bottom: 20px; text-align: justify; letter-spacing: 0.02em; color: #222; -webkit-text-stroke: 0.1px #222; }
      #featureLockScreen .fl-author-box { margin-bottom: 20px; padding: 12px 14px; background: #fafafa; border-radius: 8px; font-size: 13.5px; color: #555; line-height: 1.7; }
      #featureLockScreen .fl-author-box .id { color: #999; }
      #featureLockScreen .fl-warn-section { margin-bottom: 24px; }
      #featureLockScreen .fl-warn-tag { display: inline-block; background: #1a1a1a; color: #fff; font-size: 12px; font-weight: 400; padding: 5px 10px; border-radius: 4px; letter-spacing: 0.5px; }
      #featureLockScreen .fl-pass-section { margin-top: auto; padding-top: 16px; }
      #featureLockScreen .fl-pass-area { display: flex; align-items: center; gap: 16px; }
      #featureLockScreen .fl-input { flex: 1; border: none; border-bottom: 1px solid #e0e0e0; background: transparent; padding: 8px 0; font-size: 14px; outline: none; letter-spacing: 1px; font-family: inherit; color: #1a1a1a; }
      #featureLockScreen .fl-input::placeholder { color: #bbb; font-weight: 300; }
      #featureLockScreen .fl-submit { border: none; background: transparent; color: #1a1a1a; padding: 8px 0; font-size: 14px; letter-spacing: 2px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
      #featureLockScreen .fl-unlocked-area { display: none; flex-direction: column; gap: 20px; margin-top: 20px; }
      #featureLockScreen .fl-relock { border: 1px solid #e5e5e5; background: transparent; color: #555555; padding: 12px; font-size: 13px; font-family: inherit; letter-spacing: 2px; cursor: pointer; margin-top: 20px; border-radius: 4px; }
    `;
    document.head.appendChild(styleEl);
    
    var html = 
      '<div class="fl-utop">' +
        '<button class="fl-back" id="flBack" type="button">‹</button>' +
        '<div class="fl-title">功 能 密 码 锁</div>' +
        '<div style="width:38px;"></div>' +
      '</div>' +
      '<div class="fl-content">' +
        '<div class="fl-body-text">' +
          '本网站部分高敏感模块仅供作者自用。因作者个人没有强烈情感需求和有点恶趣味原因，这部分功能极易触发用户的负面体验（如吃醋、情感落差或被忽视感）。解锁前请务必确认自己能够接受角色可能的忽视以及脾气，以免在游玩中感到难过与不适。' +
        '</div>' +
        '<div class="fl-author-box">' +
          '如需体验，可联系作者 <span class="id">@001（小红书号：27739216821）</span> 获取密码。' +
        '</div>' +
        '<div class="fl-body-text">' +
          '<b>请不要为了考验梦角的爱而解锁这些功能。</b>每个人承受能力不同，雷点不同，这种自用功能在我眼里无所谓，但在部分人眼里会很揪心。无论如何，请记住，不管开启与否，梦角都是爱你的。<b>当然，不开是最好的。</b>' +
        '</div>' +
        '<div class="fl-warn-section">' +
          '<div class="fl-warn-tag">谨慎解锁，切勿二次传播密码</div>' +
        '</div>' +
        '<div class="fl-pass-section" id="flPassSection">' +
          '<div class="fl-pass-area">' +
            '<input type="password" class="fl-input" id="flInput" placeholder="请输入密码" maxlength="10">' +
            '<button class="fl-submit" id="flSubmit" type="button">解 锁</button>' +
          '</div>' +
        '</div>' +
        '<div class="fl-unlocked-area" id="flUnlockedArea">' +
          '<div style="font-size:13.5px; color:#555555; text-align:center; margin-top:20px;">功能已解锁，您可以正常体验了。</div>' +
          '<button class="fl-relock" id="flRelock" type="button">重新锁定</button>' +
        '</div>' +
      '</div>';
      
    scr.innerHTML = html;
    document.body.appendChild(scr);

    var input = document.getElementById('flInput');
    var submit = document.getElementById('flSubmit');
    var passSection = document.getElementById('flPassSection');
    var unlockedArea = document.getElementById('flUnlockedArea');

    document.getElementById('flBack').onclick = function(){
      scr.classList.remove('on');
    };
        function checkState(){
      if(isUnlocked()){
        passSection.style.display = 'none';
        unlockedArea.style.display = 'flex';
      } else {
        passSection.style.display = 'block';
        unlockedArea.style.display = 'none';
      }
    }

    function tryUnlock(){
      var val = input.value.trim();
      if(!val) return;
      if(val === CORRECT_PASS){
        setUnlockState(true);
        if(typeof toast === 'function') toast('解锁成功');
        input.value = '';
        checkState();
      } else {
        if(typeof toast === 'function') toast('密码错误');
        input.parentElement.style.transition = 'transform 0.1s';
        input.parentElement.style.transform = 'translateX(5px)';
        setTimeout(function(){ input.parentElement.style.transform = 'translateX(-5px)'; }, 100);
        setTimeout(function(){ input.parentElement.style.transform = 'translateX(0)'; }, 200);
      }
    }

    submit.onclick = tryUnlock;
    input.onkeydown = function(e){
      if(e.key === 'Enter') tryUnlock();
    };

    document.getElementById('flRelock').onclick = function(){
      setUnlockState(false);
      if(typeof toast === 'function') toast('已重新锁定');
      checkState();
    };

    checkState();
  }

  window.openFeatureLock = function(){
    mountUI();
    var scr = document.getElementById('featureLockScreen');
    if(scr) scr.classList.add('on');
  };

  document.addEventListener('click', function(e){
    var row = e.target.closest('.set-row[data-set="feature-lock"]');
    if(row){
      e.preventDefault();
      e.stopPropagation();
      window.openFeatureLock();
    }
  }, true);
})();