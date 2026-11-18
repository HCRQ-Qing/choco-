(function(){
  if(window.__accountAllReady) return;
  window.__accountAllReady = true;

  function formatMoney(num) {
    return Number(num || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  window.openAccountAll = function() {
    var mask = document.getElementById('accAllMask');
    if (!mask) {
      mask = document.createElement('div');
      mask.id = 'accAllMask';
      mask.className = 'screen';
      mask.style.cssText = 'z-index: 9999; background: #f7f7f7; display: none; flex-direction: column;';
      document.body.appendChild(mask);
    }

    var currentBankId = 'me';
    var friends = typeof getFriends === 'function' ? getFriends().filter(function(f){ return !f.hidden && !f.builtin; }) : [];

    function renderUI() {
      var data = {};
      try {
        var accRaw = localStorage.getItem('mj_account_data_v1');
        if (accRaw) data = JSON.parse(accRaw);
      } catch(e) { data = {}; }
      
      var rawRecords = data.records || [];
      var records = rawRecords.filter(function(r) {
        var rBank = r.bankId || 'me';
        return rBank === currentBankId;
      });

      var groups = {};
      records.forEach(function(r) {
        var t = r.time || '';
        var day = t.split(' ')[0] || '未知时间';
        if (!groups[day]) groups[day] = [];
        groups[day].push(r);
      });
            var categories = { '字卡': 0, '红包': 0, '其他': 0 };
      records.forEach(function(r) {
        if (r.amount < 0) {
          var amt = Math.abs(r.amount);
          var title = r.title || '';
          if (title.indexOf('购买字卡') >= 0) {
            categories['字卡'] += amt;
          } else if (title.indexOf('红包') >= 0) {
            categories['红包'] += amt;
          } else {
            categories['其他'] += amt;
          }
        }
      });

      var totalExp = categories['字卡'] + categories['红包'] + categories['其他'];
      var pct1 = totalExp ? Math.round((categories['字卡'] / totalExp) * 100) : 0;
      var pct2 = totalExp ? Math.round((categories['红包'] / totalExp) * 100) : 0;
      var pct3 = 100 - pct1 - pct2;
      if (pct3 < 0) pct3 = 0;

      var conicGradient = 'conic-gradient(#1a1a1a 0% ' + pct1 + '%, #666 ' + pct1 + '% ' + (pct1 + pct2) + '%, #ccc ' + (pct1 + pct2) + '% 100%)';
      if (totalExp === 0) {
        conicGradient = 'conic-gradient(#e0e0e0 0% 100%)';
      }

      var roleTabsHTML = '<div style="display:flex; overflow-x:auto; white-space:nowrap; padding:12px 16px; gap:10px; scrollbar-width:none; background:#fff; border-bottom:0.5px solid #eee;">';
      var isMe = currentBankId === 'me';
      roleTabsHTML += '<div class="acc-tab' + (isMe ? ' on' : '') + '" data-bid="me">我的账户</div>';
      
      friends.forEach(function(f) {
        var isOn = currentBankId === f.id;
        roleTabsHTML += '<div class="acc-tab' + (isOn ? ' on' : '') + '" data-bid="' + f.id + '">' + (f.remark || f.name || '角色') + '</div>';
      });
      roleTabsHTML += '</div>';

      var html = 
        '<div class="utop">' +
          '<button class="utop-back" id="accAllBack" type="button">‹</button>' +
          '<div class="utop-title">资 金 明 细</div>' +
          '<div class="utop-right"></div>' +
        '</div>' +
        roleTabsHTML +
        '<div style="flex:1; overflow-y:auto; padding-bottom:40px;">' +
          '<div style="background:#fff;border-radius:16px;padding:24px 20px;margin:16px 12px 0;display:flex;align-items:center;gap:24px;box-shadow:0 2px 8px rgba(0,0,0,0.02)">' +
            '<div style="width:110px;height:110px;border-radius:50%;position:relative;flex:none;display:flex;align-items:center;justify-content:center;background:' + conicGradient + ';">' +
              '<div style="width:84px;height:84px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
                '<div style="font-size:10px;color:#999;margin-bottom:2px;letter-spacing:1px;">总支出</div>' +
                '<div style="width:72px;display:flex;justify-content:center;align-items:center;overflow:hidden;">' +
                  '<div id="accTotalAmt" style="font-size:16px;font-family:Helvetica Neue,sans-serif;font-weight:600;white-space:nowrap;transform-origin:center;">₵ ' + formatMoney(totalExp) + '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="flex:1;display:flex;flex-direction:column;gap:12px;">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;">' +
                '<div style="display:flex;align-items:center;gap:8px;color:#555;"><div style="width:8px;height:8px;border-radius:50%;background:#1a1a1a;"></div>字卡</div>' +
                '<div style="font-family:Helvetica Neue,sans-serif;color:#1a1a1a;font-weight:500;">' + pct1 + '%</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;">' +
                '<div style="display:flex;align-items:center;gap:8px;color:#555;"><div style="width:8px;height:8px;border-radius:50%;background:#666;"></div>红包</div>' +
                '<div style="font-family:Helvetica Neue,sans-serif;color:#1a1a1a;font-weight:500;">' + pct2 + '%</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;">' +
                '<div style="display:flex;align-items:center;gap:8px;color:#555;"><div style="width:8px;height:8px;border-radius:50%;background:#ccc;"></div>其他</div>' +
                '<div style="font-family:Helvetica Neue,sans-serif;color:#1a1a1a;font-weight:500;">' + pct3 + '%</div>' +
              '</div>' +
            '</div>' +
          '</div>';

      if (records.length === 0) {
        html += '<div style="text-align:center;padding:60px 20px;color:#bbb;font-size:13px;">还没有明细记录</div>';
      } else {
        Object.keys(groups).forEach(function(day) {
          html += '<div style="margin:16px 12px 0;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.02);">' +
            '<div style="padding:14px 18px;font-size:12px;color:#999;letter-spacing:1px;border-bottom:0.5px dashed #f0f0f0;">' + day + '</div>';
          
          groups[day].forEach(function(r) {
            var isPlus = r.amount > 0;
            var amtStr = isPlus ? ('+ ₵ ' + formatMoney(r.amount)) : (r.amount < 0 ? ('- ₵ ' + formatMoney(Math.abs(r.amount))) : '—');
            var amtCls = isPlus ? 'color:#777;' : (r.amount < 0 ? 'color:#1a1a1a;' : 'color:#ccc;');
            var timePart = (r.time || '').split(' ')[1] || '';
            
            html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:0.5px solid #f7f7f7;">' +
              '<div>' +
                '<div style="font-size:14px;color:#1a1a1a;">' + (r.title || '未知记录') + '</div>' +
                '<div style="font-size:11px;color:#bbb;margin-top:4px;">' + timePart + '</div>' +
              '</div>' +
              '<div style="font-size:15px;font-weight:500;font-family:Helvetica Neue,sans-serif;' + amtCls + '">' + amtStr + '</div>' +
            '</div>';
          });
          html += '</div>';
        });
      }

      html += '</div>';
      
      if(!document.getElementById('accAllStyle')) {
        var st = document.createElement('style');
        st.id = 'accAllStyle';
        st.textContent = '.acc-tab{padding:8px 16px;border-radius:20px;font-size:13px;color:#666;background:#f5f5f5;cursor:pointer;flex:none;transition:all 0.2s;}' +
          '.acc-tab.on{background:#1a1a1a;color:#fff;font-weight:500;}';
        document.head.appendChild(st);
      }

      mask.innerHTML = html;
      mask.style.display = 'flex';
      setTimeout(function(){ mask.classList.add('on'); }, 10);

      mask.querySelector('#accAllBack').onclick = function() {
        mask.style.display = 'none';
        mask.classList.remove('on');
      };

      mask.querySelectorAll('.acc-tab').forEach(function(tab) {
        tab.onclick = function() {
          currentBankId = this.getAttribute('data-bid');
          renderUI();
        };
      });

      var amtEl = mask.querySelector('#accTotalAmt');
      if (amtEl) {
        var wrapWidth = 72;
        var textWidth = amtEl.scrollWidth;
        if (textWidth > wrapWidth) {
          var scale = wrapWidth / textWidth;
          amtEl.style.transform = 'scale(' + scale + ')';
        }
      }
    }

    renderUI();
  };
})();