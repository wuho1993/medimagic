import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://tudqrvisnmpschkqkzvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZHFydmlzbm1wc2Noa3FrenZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDgyODQsImV4cCI6MjA4OTIyNDI4NH0.OafLR7yUI_8LIRAqy76EDm-lQoDfgOrrRVZUVvtkR6k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'medimagic-hrms-trial-auth',
  },
});

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const clearStatusButton = document.getElementById('clearStatusButton');
const statusBanner = document.getElementById('statusBanner');

const welcomeName = document.getElementById('welcomeName');
const sidebarUserName = document.getElementById('sidebarUserName');
const sidebarUserRole = document.getElementById('sidebarUserRole');
const authStatePill = document.getElementById('authStatePill');
const metricSession = document.getElementById('metricSession');
const metricEmail = document.getElementById('metricEmail');
const metricEmployee = document.getElementById('metricEmployee');
const accountEmail = document.getElementById('accountEmail');
const accountUserId = document.getElementById('accountUserId');
const accountLastSignIn = document.getElementById('accountLastSignIn');
const employeeSummary = document.getElementById('employeeSummary');
const employeeCode = document.getElementById('employeeCode');
const employeeNameZh = document.getElementById('employeeNameZh');
const employeeMeta = document.getElementById('employeeMeta');

function setStatus(message, tone = 'info') {
  if (!message) {
    statusBanner.hidden = true;
    statusBanner.textContent = '';
    statusBanner.className = 'status-banner';
    return;
  }

  statusBanner.hidden = false;
  statusBanner.textContent = message;
  statusBanner.className = `status-banner${tone === 'error' ? ' is-error' : tone === 'success' ? ' is-success' : ''}`;
}

function setLoading(isLoading) {
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? '登入中...' : '登入試用版';
}

function formatDateTime(value) {
  if (!value) return '—';

  try {
    return new Intl.DateTimeFormat('zh-HK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function updateDashboardForSignedOut() {
  loginView.hidden = false;
  dashboardView.hidden = true;
  metricSession.textContent = '未登入';
  metricEmail.textContent = '-';
  metricEmployee.textContent = '未載入';
}

function updateDashboardForUser(user) {
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || '試用用戶';

  loginView.hidden = true;
  dashboardView.hidden = false;

  welcomeName.textContent = displayName;
  sidebarUserName.textContent = displayName;
  sidebarUserRole.textContent = user.app_metadata?.role || user.user_metadata?.role || 'Authenticated User';
  authStatePill.textContent = '已登入';
  metricSession.textContent = '有效';
  metricEmail.textContent = user.email || '—';
  accountEmail.textContent = user.email || '—';
  accountUserId.textContent = user.id;
  accountLastSignIn.textContent = formatDateTime(user.last_sign_in_at);
}

async function loadEmployeePreview(user) {
  metricEmployee.textContent = '載入中';
  employeeSummary.textContent = '正在嘗試讀取對應員工資料。';
  employeeCode.textContent = '—';
  employeeNameZh.textContent = '—';
  employeeMeta.textContent = '—';

  const { data, error } = await supabase
    .from('employees')
    .select('employee_code, name_zh, name_en, hire_date, position:positions(name_zh), branch:branches(name_zh)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) {
    metricEmployee.textContent = '讀取失敗';
    employeeSummary.textContent = `員工資料查詢失敗：${error.message}`;
    return;
  }

  if (!data) {
    metricEmployee.textContent = '未綁定';
    employeeSummary.textContent = '這個登入帳號暫時未對應到員工主檔。你仍然可以用這個試用版驗證登入流程。';
    return;
  }

  metricEmployee.textContent = data.employee_code || '已載入';
  employeeSummary.textContent = '成功讀取到員工主檔資料。';
  employeeCode.textContent = data.employee_code || '—';
  employeeNameZh.textContent = data.name_zh || data.name_en || '—';
  employeeMeta.textContent = `${data.position?.name_zh || '未設定職位'} / ${data.branch?.name_zh || '未設定分店'}`;
}

async function applySession(session) {
  if (!session?.user) {
    updateDashboardForSignedOut();
    return;
  }

  updateDashboardForUser(session.user);
  await loadEmployeePreview(session.user);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');
  setLoading(true);

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);

  if (error) {
    setStatus(error.message || '登入失敗，請檢查帳號密碼。', 'error');
    return;
  }

  setStatus('登入成功，正在載入試用儀表板。', 'success');

  passwordInput.value = '';
});

logoutButton?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    setStatus(error.message || '登出失敗。', 'error');
    return;
  }

  updateDashboardForSignedOut();
  setStatus('你已安全登出。', 'success');
});

clearStatusButton?.addEventListener('click', () => {
  setStatus('');
});

supabase.auth.onAuthStateChange(async (_event, session) => {
  await applySession(session);
});

const { data: { session } } = await supabase.auth.getSession();
await applySession(session);