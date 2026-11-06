(() => {
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const load = k => { try { return JSON.parse(localStorage.getItem('hoctap.' + k)); } catch (e) { return null; } };
  const save = (k, v) => { try { localStorage.setItem('hoctap.' + k, JSON.stringify(v)); } catch (e) {} };

  /* Bộ đếm tập trung: 25 phút tập trung, 5 phút nghỉ */
  const T = {focus:1500, rest:300}, C = 276.46;
  let mode = 'focus', left = T.focus, iv = null, end = 0;
  const fmt = s => pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  function fRender() {
    $('#arc').style.strokeDashoffset = C * (1 - left / T[mode]);
    $('#ft').textContent = fmt(left);
    $('#fl').textContent = mode === 'focus' ? 'Tập trung' : 'Nghỉ ngơi';
    $('#fgo').textContent = iv ? 'Tạm dừng' : 'Bắt đầu';
    document.title = iv ? fmt(left) + ' · Học tập' : 'Học tập';
  }
  function fToggle() {
    if (iv) { clearInterval(iv); iv = null; }
    else {
      end = Date.now() + left * 1000;
      iv = setInterval(() => {
        left = Math.max(0, Math.round((end - Date.now()) / 1000));
        if (!left) { clearInterval(iv); iv = null; mode = mode === 'focus' ? 'rest' : 'focus'; left = T[mode]; }
        fRender();
      }, 250);
    }
    fRender();
  }
  $('#fgo').onclick = fToggle;
  $('#frs').onclick = () => { clearInterval(iv); iv = null; mode = 'focus'; left = T.focus; fRender(); };
  fRender();

  /* Việc cần làm (lưu trên trình duyệt, tối đa 6 việc) */
  let todos = load('todo') || [];
  function tRender() {
    $('#tl').innerHTML = todos.length
      ? todos.map((t, i) => `<li><label><input type="checkbox" data-i="${i}"${t.d ? ' checked' : ''}><span${t.d ? ' class="d"' : ''}>${esc(t.t)}</span></label><button class="x" type="button" data-x="${i}" aria-label="Xóa: ${esc(t.t)}">&times;</button></li>`).join('')
      : '<li class="empty">Chưa có việc nào. Ghi một việc cho hôm nay.</li>';
    $('#ti').disabled = todos.length >= 6;
    $('#ti').placeholder = todos.length >= 6 ? 'Đã đủ 6 việc' : 'Thêm một việc';
    save('todo', todos);
  }
  $('#tl').addEventListener('change', e => {
    const i = e.target.dataset.i; if (i === undefined) return;
    todos[i].d = e.target.checked; e.target.nextElementSibling.classList.toggle('d', e.target.checked); save('todo', todos);
  });
  $('#tl').addEventListener('click', e => {
    const b = e.target.closest('[data-x]'); if (!b) return;
    todos.splice(+b.dataset.x, 1); tRender(); $('#ti').focus();
  });
  $('#tf').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#ti').value.trim();
    if (v && todos.length < 6) { todos.push({t:v, d:false}); $('#ti').value = ''; tRender(); $('#ti').focus(); }
  });
  tRender();
})();