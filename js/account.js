(function(){
  if(window.__accountReady) return;
  window.__accountReady = true;

  const ACCOUNT_KEY = 'mj_account_data_v1';

  function getAccountData() {
    let data = lsGet(ACCOUNT_KEY, null);
    
    // ★ 新用户或者重置数据时的初始化
    if (!data) {
      data = {
        myBalance: Math.floor(Math.random() * 9000) + 1000, // 我的初始资金：随机 1000~10000
        mySpent: 0,
        bindStatus: false,
        roleBalances: {},
        records: [] // 彻底清空，不做假记录
      };
      lsSet(ACCOUNT_KEY, data);
    }
    
    // 数据兜底兼容
    if (data.bindStatus === undefined) data.bindStatus = false;
    if (data.myBalance === undefined) data.myBalance = 1000;
    if (!data.roleBalances) data.roleBalances = {};
    
    // ★ 修复老数据：如果你之前看过了，记录里可能残留了旧明细，强制清空一次
    if (data.records && data.records.length > 0 && data.records[0].title === '「梦角」使用了亲情卡') {
      data.records = [];
      lsSet(ACCOUNT_KEY, data);
    }
    if (!data.records) data.records = [];

    // ★ 角色的随机余额（每个角色独立 1~10000）
    const currentRoleId = typeof getCurrentRoleId === 'function' ? getCurrentRoleId() : 'r1';
    if (data.roleBalances[currentRoleId] === undefined) {
      data.roleBalances[currentRoleId] = Math.floor(Math.random() * 10000) + 1;
      lsSet(ACCOUNT_KEY, data);
    }

    return data;
  }

  function saveAccountData(data) {
    lsSet(ACCOUNT_KEY, data);
  }

  // ★ 供外部调用的扣款接口（含真实账单记录）
  window.deductAccountBalance = function(amount, reason, bankId) {
    let data = lsGet(ACCOUNT_KEY, null);
    if(!data) return { success: false, msg: '找不到账户数据' };
    
    let currentBal = 0;
    if (bankId === 'me') {
      currentBal = data.myBalance;
    } else {
      if(!data.roleBalances) data.roleBalances = {};
      currentBal = data.roleBalances[bankId] || 0;
    }
    
    if(currentBal < amount) {
      return { success: false, msg: '余额不足' };
    }
    
    if (bankId === 'me') {
      data.myBalance -= amount;
      data.mySpent = (data.mySpent || 0) + amount;
    } else {
      data.roleBalances[bankId] -= amount;
    }
    
    if(!data.records) data.records = [];
    var d = new Date();
    var timeStr = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    
    data.records.unshift({
      id: Date.now().toString(36),
      title: reason || '购买字卡',
      time: timeStr,
      amount: -amount,
      type: 'minus',
      bankId: bankId || 'me'
    });
    
    saveAccountData(data);
    return { success: true };
  };

  window.addAccountBalance = function(amount, reason, bankId) {
    let data = lsGet(ACCOUNT_KEY, null);
    if(!data) return { success: false, msg: '找不到账户数据' };
    
    if (bankId === 'me') {
      data.myBalance = (data.myBalance || 0) + amount;
    } else {
      if(!data.roleBalances) data.roleBalances = {};
      data.roleBalances[bankId] = (data.roleBalances[bankId] || 0) + amount;
    }
    
    if(!data.records) data.records = [];
    var d = new Date();
    var timeStr = '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    
    data.records.unshift({
      id: Date.now().toString(36),
      title: reason || '收入',
      time: timeStr,
      amount: amount,
      type: 'plus',
      bankId: bankId || 'me'
    });
    
    saveAccountData(data);
    return { success: true };
  };

  function renderAccountScreen() {
    const data = getAccountData();
    const role = getRole();
    const roleName = displayName(role) || '梦角';

    const formatMoney = (num) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2 });

    let listHtml = '';
    if (data.records.length === 0) {
      listHtml = '<div style="text-align:center;padding:40px;color:#bbb;font-size:12px">还没有记录</div>';
    } else {
      listHtml = data.records.slice(0, 5).map(r => `
        <div class="clean-row">
          <div class="row-left">
            <div class="row-title">${escapeHTML(r.title)}</div>
            <div class="row-time">${escapeHTML(r.time)}</div>
          </div>
          <div class="row-amt ${r.amount > 0 ? 'plus' : 'minus'}">
            ${r.amount > 0 ? '+' : '-'} ₵ ${formatMoney(Math.abs(r.amount))}
          </div>
        </div>
      `).join('');
      if(data.records.length > 5) {
        listHtml += '<div id="accViewAllBtn" style="text-align:center;padding:16px 0;font-size:12px;color:#999;letter-spacing:2px;cursor:pointer;">查 看 全 部 明 细 ›</div>';
      }
    }

    const bindStatusHtml = data.bindStatus 
      ? `<div class="bottom-bind-card" id="btnUnbind">
           <div class="bottom-bind-info">
             <h4>亲情卡已绑定</h4>
             <p>Ta 可以花你的钱，你也可以花 Ta 的</p>
           </div>
           <div class="bottom-bind-btn" style="background:#fff;color:#111;border:1px solid #ddd">解绑</div>
         </div>`
      : `<div class="bottom-bind-card" id="btnBind">
           <div class="bottom-bind-info">
             <h4>亲情卡未绑定</h4>
             <p>Ta 可以花你的钱，你也可以花 Ta 的</p>
           </div>
           <div class="bottom-bind-btn">去绑定</div>
         </div>`;

    const html = `
      <div class="acc-wrap">
        <div class="acc-section">
          <div class="acc-section-title">
            <span>银行卡</span>
          </div>
          <div class="acc-card-scroll">
            <div class="acc-card-list">
              <div class="acc-coin-card">
                <div class="acc-card-head">
                  <div class="acc-card-name"><div class="acc-card-icon">₵</div>我的账户</div>
                </div>
                <div class="acc-card-bal-wrap">
                  <div class="acc-card-bal"><span class="currency">₵</span> ${formatMoney(data.myBalance)}</div>
                  <div class="acc-card-sub">我的可用余额</div>
                </div>
              </div>
              <div class="acc-coin-card" style="background: linear-gradient(135deg, #333333, #1a1a1a);">
                <div class="acc-card-head">
                  <div class="acc-card-name">
                    <div class="acc-card-avatar">${avatarHTML(role.avatar)}</div>
                    ${escapeHTML(role.remark || role.name || '角色')}的账户
                  </div>
                </div>
                <div class="acc-card-bal-wrap">
                  <div class="acc-card-bal"><span class="currency">₵</span> ${formatMoney(data.roleBalances[typeof getCurrentRoleId === 'function' ? getCurrentRoleId() : 'r1'])}</div>
                  <div class="acc-card-sub">Ta 的独立余额</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="acc-section">
          <div class="acc-section-title">
            <span>资金往来明细</span>
          </div>
          <div class="acc-clean-list">
            ${listHtml}
          </div>
        </div>

        ${bindStatusHtml}
      </div>
    `;

    const screen = document.getElementById('accountScreen');
    if(screen) {
      screen.innerHTML = `<div id="utopHostAccount"></div><div class="acc-body">${html}</div>`;
      renderTopBar({
        host: 'utopHostAccount',
        title: '资 产',
        onBack: function(){ closeScreen(); }
      });
    }

    const viewAllBtn = document.getElementById('accViewAllBtn');
    if (viewAllBtn) {
      viewAllBtn.onclick = function() {
        if (typeof window.openAccountAll === 'function') window.openAccountAll();
      };
    }

    // 这一段是绑定/解绑的事件，下一批发后半段
    const btnBind = document.getElementById('btnBind');
    if (btnBind) {
      btnBind.onclick = () => {
        let mask = document.getElementById('accBindMask');
        if(!mask) {
          mask = document.createElement('div');
          mask.id = 'accBindMask';
          mask.className = 'acc-modal-mask';
          mask.innerHTML = `
            <div class="acc-modal-sheet">
              <div class="acc-m-title">开通亲情卡</div>
              <div class="acc-m-sub">请设置您的虚拟支付密码<br>（本操作仅作模拟体验）</div>
              <input type="password" class="acc-m-input" id="accPwdInput" placeholder="请输入任意 6 位数字" maxlength="6">
              <div class="acc-m-actions">
                <button class="acc-m-btn cancel" id="accBtnCancel">取 消</button>
                <button class="acc-m-btn ok" id="accBtnConfirm">确 定 开 通</button>
              </div>
            </div>
          `;
          document.body.appendChild(mask);
          
          mask.querySelector('#accBtnCancel').onclick = () => {
            mask.classList.remove('show');
          };
          
          mask.querySelector('#accBtnConfirm').onclick = () => {
            const pwd = mask.querySelector('#accPwdInput').value.trim();
            if (pwd.length < 6) { toast('请输入完整的 6 位密码'); return; }
            
            mask.classList.remove('show');
            const newData = getAccountData();
            newData.bindStatus = true;
            newData.payPwd = pwd; // ★ 把密码存进账户数据里
            newData.records.unshift({ id: Date.now().toString(36), title: '成功绑定亲情卡', time: '刚刚', amount: 0, type: 'plus' });
            saveAccountData(newData);
            renderAccountScreen();
            toast('亲情卡绑定成功');
          };
        }
        const inp = mask.querySelector('#accPwdInput');
        if(inp) inp.value = '';
        mask.classList.add('show');
      };
    }

    const btnUnbind = document.getElementById('btnUnbind');
    if (btnUnbind) {
      btnUnbind.onclick = () => {
        uniConfirm({
          title: '解绑亲情卡',
          body: `确定要解除与「${roleName}」的亲情卡关系吗？`,
          okText: '确 定',
          cancelText: '取 消'
        }).then(ok => {
          if (!ok) return;
          const newData = getAccountData();
          newData.bindStatus = false;
          saveAccountData(newData);
          renderAccountScreen();
          toast('已解绑亲情卡');
        });
      };
    }
  }
    // 打开页面
  window.openAccountScreen = function() {
    let screen = document.getElementById('accountScreen');
    if(!screen) {
      screen = document.createElement('div');
      screen.id = 'accountScreen';
      screen.className = 'screen';
      document.body.appendChild(screen);
    }
    if(typeof showScreen === 'function') showScreen('accountScreen');
    
    // 注入 CSS
    if(!document.getElementById('accountStyle')) {
      const style = document.createElement('style');
      style.id = 'accountStyle';
      style.textContent = `
        .acc-body { flex: 1; overflow-y: auto; background: var(--th-bg2); display: flex; flex-direction: column; padding-bottom: 40px; scrollbar-width: none; }
        .acc-body::-webkit-scrollbar { display: none; }
        .acc-wrap { padding-top: 10px; }
        
        .acc-section { margin-bottom: 24px; }
        .acc-section-title { font-size: 12px; color: var(--th-text); font-weight: 500; padding: 0 22px 14px; display: flex; justify-content: space-between; align-items: flex-end; letter-spacing: 1px; }
        .acc-section-title span.sub { font-size: 10px; color: var(--th-text-soft); font-weight: 400; letter-spacing: 0; }
        
        .acc-card-scroll { padding: 0 22px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin-bottom: 16px; }
        .acc-card-scroll::-webkit-scrollbar { display: none; }
        .acc-card-list { display: flex; gap: 16px; padding-bottom: 12px; }
        
        .acc-coin-card { flex: none; width: 320px; height: 180px; background: linear-gradient(135deg, #2a2a2a, #111111); border-radius: 20px; padding: 24px; color: #fff; display: flex; flex-direction: column; justify-content: space-between; scroll-snap-align: start; box-shadow: 0 8px 20px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.15); position: relative; overflow: hidden; }
        .acc-coin-card::before { content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%); pointer-events: none; }
        
        .acc-card-head { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .acc-card-name { font-size: 14px; font-weight: 400; letter-spacing: 2px; display: flex; align-items: center; gap: 8px; }
        .acc-card-icon { width: 24px; height: 24px; background: #fff; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex:none; }
        
        .acc-card-avatar { width: 24px; height: 24px; border-radius: var(--avatar-radius, 12%); overflow: hidden; background: var(--th-bg1); flex: none; position: relative; }
        .acc-card-avatar .uni-avatar { width: 100%; height: 100%; }
        
        .acc-card-bal-wrap { z-index: 2; margin-top: auto; }
        .acc-card-bal { font-size: 38px; font-weight: 500; font-family: "Helvetica Neue", Helvetica, sans-serif; line-height: 1; display: flex; align-items: baseline; gap: 4px; }
        .acc-card-bal .currency { font-size: 16px; font-weight: 400; opacity: 0.6; }
        .acc-card-sub { font-size: 11px; opacity: 0.5; margin-top: 8px; letter-spacing: 0.5px; }
        
        .acc-clean-list { margin: 0 22px; background: var(--th-bg1); border-radius: 18px; padding: 8px 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 0.5px solid var(--th-line); }
        .acc-clean-list .clean-row { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 0.5px dashed var(--th-line); }
        .acc-clean-list .clean-row:last-child { border-bottom: none; }
        .acc-clean-list .row-left { display: flex; flex-direction: column; gap: 6px; }
        .acc-clean-list .row-title { font-size: 14px; font-weight: 400; color: var(--th-text); }
        .acc-clean-list .row-time { font-size: 11px; color: var(--th-text-soft); }
        .acc-clean-list .row-amt { font-size: 16px; font-weight: 500; font-family: "Helvetica Neue", Helvetica, sans-serif; }
        .acc-clean-list .row-amt.minus { color: var(--th-text); }
        .acc-clean-list .row-amt.plus { color: #999; }
        
        .bottom-bind-card { margin: 28px 22px 10px; padding: 16px 18px; background: var(--th-bg0); border-radius: 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .bottom-bind-info h4 { font-size: 13px; font-weight: 500; color: var(--th-text); margin-bottom: 4px; }
        .bottom-bind-info p { font-size: 11px; color: var(--th-text-soft); }
        .bottom-bind-btn { padding: 8px 16px; background: var(--th-text); color: var(--th-bg1); border-radius: 20px; font-size: 12px; font-weight: 500; white-space: nowrap; }
        
        .acc-modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 9999; }
        .acc-modal-mask.show { opacity: 1; pointer-events: auto; }
        .acc-modal-sheet { width: 100%; max-width: 320px; background: var(--th-bg1); border-radius: 20px; padding: 24px 20px; transform: translateY(20px); transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .acc-modal-mask.show .acc-modal-sheet { transform: translateY(0); }
        .acc-m-title { font-size: 15px; font-weight: 500; text-align: center; margin-bottom: 6px; color: var(--th-text); }
        .acc-m-sub { font-size: 11px; color: var(--th-text-soft); text-align: center; margin-bottom: 24px; line-height: 1.5; }
        .acc-m-input { width: 100%; height: 44px; border: 1px solid var(--th-line); border-radius: 12px; background: var(--th-bg0); padding: 0 16px; font-size: 14px; color: var(--th-text); outline: none; transition: border-color 0.2s; box-sizing: border-box; margin-bottom: 20px;}
        .acc-m-input:focus { border-color: var(--th-text); background: var(--th-bg1); }
        .acc-m-actions { display: flex; gap: 10px; margin-top: 28px; }
        .acc-m-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: opacity 0.2s; }
        .acc-m-btn:active { opacity: 0.7; }
        .acc-m-btn.cancel { background: var(--th-bg0); color: var(--th-text-soft); }
        .acc-m-btn.ok { background: var(--th-text); color: var(--th-bg1); }
      `;
      document.head.appendChild(style);
    }

    renderAccountScreen();
  };

  // 暴露给外部调用的清空账户数据方法
  window.clearAccountData = function() {
    try {
      localStorage.removeItem(ACCOUNT_KEY);
    } catch(e){}
  };

  // 初始化时生成一张角色卡（防呆） 
  setTimeout(() => {
    getAccountData();
  }, 1000);

})();