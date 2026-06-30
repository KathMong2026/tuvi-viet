/**
 * Tử Vi Việt — Supabase Module
 * ==============================
 * Thay thế firebase.js + member.js. Giữ namespace HCD.firebase / HCD.member
 * để code các trang cũ chạy gần như không cần sửa.
 *
 * YÊU CẦU: nạp supabase-js TRƯỚC file này:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="js/supabase.js"></script>
 *
 * Bảng dùng (dùng chung project với shop, tiền tố tuvi_):
 *   tuvi_profiles, tuvi_horoscopes
 */
(function (global) {
  'use strict';

  // ── Cấu hình (anon key công khai — an toàn nhờ RLS) ──
  var SUPABASE_URL = 'https://odeslzfzgjwyczmnxpqb.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZXNsemZ6Z2p3eWN6bW54cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzAyNzcsImV4cCI6MjA5ODQwNjI3N30.xl_kyLTBMiTKOrXyDccOoRZmB8MZBbAdcV4-b60UdwU';

  if (!global.supabase || !global.supabase.createClient) {
    console.error('[Tử Vi Việt] Chưa nạp supabase-js. Thêm <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> TRƯỚC js/supabase.js');
    return;
  }

  var sb = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  var T_PROFILE = 'tuvi_profiles';
  var T_CHART = 'tuvi_horoscopes';

  // ── Auth helpers ──
  function currentUser() {
    return sb.auth.getUser()
      .then(function (r) { return (r && r.data) ? r.data.user : null; })
      .catch(function () { return null; });
  }
  function waitForAuth() {
    return sb.auth.getSession().then(function (r) {
      return (r.data && r.data.session) ? r.data.session.user : null;
    });
  }
  function loginWithEmail(email, pw) {
    return sb.auth.signInWithPassword({ email: email, password: pw })
      .then(function (r) { if (r.error) throw r.error; return r.data.user; });
  }
  function registerWithEmail(email, pw) {
    return sb.auth.signUp({ email: email, password: pw })
      .then(function (r) { if (r.error) throw r.error; return r.data.user; });
  }
  function loginWithGoogle() {
    return sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: global.location.origin + '/profile.html' }
    });
  }
  function resetPassword(email) {
    return sb.auth.resetPasswordForEmail(email, { redirectTo: global.location.origin + '/login.html' })
      .then(function (r) { if (r.error) throw r.error; return true; });
  }
  function logout() { return sb.auth.signOut(); }

  // ── Hồ sơ (tuvi_profiles) ──
  function rowToProfile(row, user) {
    row = row || {};
    return {
      displayName: row.display_name || '',
      email: row.email || (user && user.email) || '',
      birthYear: row.birth_year || null,
      birthMonth: row.birth_month || null,
      birthDay: row.birth_day || null,
      birthHour: row.birth_hour || null,
      gender: row.gender || 'nam',
      longitude: row.longitude || '105.85'
    };
  }
  function getProfile() {
    return currentUser().then(function (user) {
      if (!user) return {};
      return sb.from(T_PROFILE).select('*').eq('id', user.id).maybeSingle()
        .then(function (r) { if (r.error) throw r.error; return rowToProfile(r.data, user); });
    });
  }
  function updateProfile(data) {
    return currentUser().then(function (user) {
      if (!user) return Promise.reject(new Error('Chưa đăng nhập'));
      var row = {
        id: user.id,
        email: user.email,
        display_name: data.displayName,
        gender: data.gender,
        birth_year: data.birthYear,
        birth_month: data.birthMonth,
        birth_day: data.birthDay,
        birth_hour: data.birthHour,
        longitude: data.longitude,
        updated_at: new Date().toISOString()
      };
      Object.keys(row).forEach(function (k) { if (row[k] === undefined) delete row[k]; });
      return sb.from(T_PROFILE).upsert(row, { onConflict: 'id' })
        .then(function (r) { if (r.error) throw r.error; return true; });
    });
  }

  // ── Lá số (tuvi_horoscopes) — lưu nguyên payload vào cột data jsonb ──
  function saveChart(payload) {
    return currentUser().then(function (user) {
      if (!user) return Promise.reject(new Error('Chưa đăng nhập'));
      return sb.from(T_CHART).insert({ user_id: user.id, data: payload, notes: '' }).select('id')
        .then(function (r) { if (r.error) throw r.error; return r.data[0]; });
    });
  }
  function flattenChart(row) {
    var d = row.data || {};
    return Object.assign({}, d, { id: row.id, notes: row.notes || '', createdAt: row.created_at });
  }
  function getCharts() {
    return currentUser().then(function (user) {
      if (!user) return [];
      return sb.from(T_CHART).select('id,data,notes,created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false })
        .then(function (r) { if (r.error) throw r.error; return (r.data || []).map(flattenChart); });
    });
  }
  function getChart(id) {
    return sb.from(T_CHART).select('id,data,notes,created_at').eq('id', id).maybeSingle()
      .then(function (r) { if (r.error) throw r.error; return r.data ? flattenChart(r.data) : null; });
  }
  function updateChart(id, fields) {
    var upd = {};
    if (fields.notes !== undefined) upd.notes = fields.notes;
    return sb.from(T_CHART).update(upd).eq('id', id)
      .then(function (r) { if (r.error) throw r.error; return true; });
  }
  function deleteChart(id) {
    return sb.from(T_CHART).delete().eq('id', id)
      .then(function (r) { if (r.error) throw r.error; return true; });
  }

  // ── Compat API (tên cũ HCD.firebase) ──
  var api = {
    currentUser: currentUser,
    waitForAuth: waitForAuth,
    loginWithEmail: loginWithEmail,
    registerWithEmail: registerWithEmail,
    loginWithGoogle: loginWithGoogle,
    resetPassword: resetPassword,
    logout: logout,
    updateProfile: updateProfile,
    getProfile: getProfile,
    saveChart: saveChart,
    getCharts: getCharts,
    getChart: getChart,
    updateChart: updateChart,
    deleteChart: deleteChart
  };

  // ── HCD.member — UI dùng chung ──
  var member = {
    renderNavAuth: function (sel) {
      var nav = document.querySelector(sel);
      if (!nav) return;
      var slot = nav.querySelector('.kd-auth-slot');
      if (!slot) {
        slot = document.createElement('span');
        slot.className = 'kd-auth-slot';
        slot.style.cssText = 'display:inline-flex;align-items:center;gap:8px;margin-left:10px';
        nav.appendChild(slot);
      }
      waitForAuth().then(function (user) {
        if (user) {
          var label = (user.email || 'Hội viên').split('@')[0];
          slot.innerHTML =
            '<a href="profile.html" style="font-size:13px;color:var(--ink-2,#444);text-decoration:none">👤 ' + label + '</a>' +
            '<a href="#" class="kd-logout" style="font-size:13px;color:var(--seal,#9e3020);text-decoration:none">Đăng Xuất</a>';
          var lo = slot.querySelector('.kd-logout');
          if (lo) lo.addEventListener('click', function (e) {
            e.preventDefault();
            logout().then(function () { global.location.reload(); });
          });
        } else {
          slot.innerHTML = '<a href="login.html" style="font-size:13px;color:var(--seal,#9e3020);text-decoration:none">Đăng Nhập</a>';
        }
      });
    },

    autoFill: function (yId, mId, dId, hId, gId, locId) {
      return getProfile().then(function (p) {
        if (!p || !p.birthYear) return false;
        function set(id, val) {
          if (!id || val === undefined || val === null || val === '') return;
          var el = document.querySelector(id); if (!el) return;
          // Với <select>: chỉ gán nếu giá trị khớp một option (tránh để select rỗng
          // khi kinh độ hồ sơ không trùng option, gây NaN khi tính lá số).
          if (el.tagName === 'SELECT') {
            var ok = false;
            for (var i = 0; i < el.options.length; i++) {
              if (el.options[i].value === String(val)) { ok = true; break; }
            }
            if (!ok) return;
          }
          el.value = val;
        }
        set(yId, p.birthYear); set(mId, p.birthMonth); set(dId, p.birthDay);
        set(hId, p.birthHour); set(gId, p.gender); set(locId, p.longitude);
        return true;
      }).catch(function () { return false; });
    },

    renderSaveButton: function (containerSel, getData) {
      var box = document.querySelector(containerSel);
      if (!box || box.querySelector('.kd-save-chart')) return;
      var btn = document.createElement('button');
      btn.className = 'kd-save-chart';
      btn.type = 'button';
      btn.textContent = '💾 Lưu lá số';
      btn.style.cssText = 'margin-top:14px;padding:10px 20px;font-family:inherit;font-size:14px;font-weight:600;color:#fff;background:var(--seal,#9e3020);border:none;border-radius:5px;cursor:pointer';
      btn.addEventListener('click', function () {
        currentUser().then(function (user) {
          if (!user) {
            sessionStorage.setItem('hcd-redirect', global.location.href);
            global.location.href = 'login.html';
            return;
          }
          btn.disabled = true; btn.textContent = 'Đang lưu...';
          saveChart(getData()).then(function () {
            btn.textContent = '✓ Đã lưu';
            setTimeout(function () { btn.disabled = false; btn.textContent = '💾 Lưu lá số'; }, 2000);
          }).catch(function (err) {
            btn.disabled = false; btn.textContent = '💾 Lưu lá số';
            alert('Lỗi lưu lá số: ' + (err.message || ''));
          });
        });
      });
      box.appendChild(btn);
    }
  };

  // ── Xuất ra global ──
  global.HCD = global.HCD || {};
  global.HCD.supabase = sb;
  global.HCD.auth = api;
  global.HCD.firebase = api;   // alias tương thích code cũ
  global.HCD.member = member;
})(window);
