import { describeAccessScope, normalizeAccessScope } from '@/src/lib/auth/access';
import { APP_ROLES, normalizeRole, type AppRole } from '@/src/lib/auth/roles';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { createAuthUser, updateAuthUserRole } from './actions';
import type { EmployeeDirectoryOption } from '@/src/lib/employees/queries';

function formatDate(value?: string | null) {
  if (!value) {
    return '從未登入';
  }

  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getRoleLabel(role: AppRole) {
  const labels: Record<AppRole, string> = {
    super_admin: '系統管理員',
    boss: '老闆',
    hr_manager: '人力資源經理',
    department_manager: '分店主管',
    employee: '員工',
  };

  return labels[role];
}

export default async function UserManagementPanel({
  companies,
  branches,
}: {
  companies: EmployeeDirectoryOption[];
  branches: EmployeeDirectoryOption[];
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });

  if (error) {
    throw new Error(error.message);
  }

  const confirmedUsers = data.users.filter((user) => Boolean(user.email_confirmed_at)).length;
  const pendingUsers = data.users.length - confirmedUsers;
  const roleCount = new Set(
    data.users.map((user) => normalizeRole(String(user.user_metadata?.role ?? user.app_metadata?.role ?? 'employee')))
  ).size;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">系統登入用戶</h2>
          <p className="text-sm text-slate-500">集中建立登入帳戶、分配角色，並查看用戶登入狀態。</p>
        </div>
        <p className="text-sm font-medium text-slate-500">已載入 {data.users.length} 名用戶</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">已確認</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{confirmedUsers}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">待確認</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{pendingUsers}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">使用中角色</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{roleCount}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form action={createAuthUser} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">新增登入帳戶</h3>
            <p className="mt-1 text-sm text-slate-500">新帳戶會以已確認狀態建立，建立後可即時登入系統。</p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">姓名</span>
            <input name="fullName" type="text" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" placeholder="陳小美" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">電郵</span>
            <input name="email" type="email" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" placeholder="sarah@medimagic.com" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">臨時密碼</span>
            <input name="password" type="password" required minLength={8} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" placeholder="最少 8 個字元" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">角色</span>
            <select name="role" defaultValue="hr_manager" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20">
              {APP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
            建立登入帳戶
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead className="border-b border-slate-200 bg-slate-50/70">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">姓名</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">電郵</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">角色設定</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">最後登入</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">狀態</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">目前角色</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.users.map((user) => {
                  const currentRole = normalizeRole(
                    String(user.user_metadata?.role ?? user.app_metadata?.role ?? 'employee')
                  );
                  const currentScope = normalizeAccessScope(
                    user.user_metadata?.access_scope ?? user.app_metadata?.access_scope ?? null,
                    currentRole
                  );

                  return (
                    <tr key={user.id} className="align-top hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">
                          {String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '未命名用戶')}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{user.id}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{user.email ?? '-'}</td>
                      <td className="px-4 py-4">
                        <form action={updateAuthUserRole} className="space-y-3">
                          <input type="hidden" name="userId" value={user.id} />
                          <div className="flex items-center gap-2">
                            <select name="role" defaultValue={currentRole} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20">
                              {APP_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {getRoleLabel(role)}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                              儲存
                            </button>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
                            <div className="font-medium text-slate-700">資料範圍: {describeAccessScope(currentScope)}</div>
                            <div className="mt-2 flex flex-wrap gap-3">
                              <label className="inline-flex items-center gap-2">
                                <input type="checkbox" name="allCompanies" value="true" defaultChecked={currentScope.allCompanies} className="rounded border-slate-300 text-slate-900 focus:ring-[#D4AF37]" />
                                <span>全部公司</span>
                              </label>
                              <label className="inline-flex items-center gap-2">
                                <input type="checkbox" name="allBranches" value="true" defaultChecked={currentScope.allBranches} className="rounded border-slate-300 text-slate-900 focus:ring-[#D4AF37]" />
                                <span>全部分店</span>
                              </label>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div>
                                <div className="mb-1 font-medium text-slate-700">指定公司</div>
                                <div className="flex flex-wrap gap-2">
                                  {companies.map((company) => (
                                    <label key={`${user.id}-company-${company.id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                                      <input
                                        type="checkbox"
                                        name="companyIds"
                                        value={company.id}
                                        defaultChecked={currentScope.companyIds.includes(company.id)}
                                        className="rounded border-slate-300 text-slate-900 focus:ring-[#D4AF37]"
                                      />
                                      <span>{company.labelZh}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="mb-1 font-medium text-slate-700">指定分店</div>
                                <div className="flex flex-wrap gap-2">
                                  {branches.map((branch) => (
                                    <label key={`${user.id}-branch-${branch.id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                                      <input
                                        type="checkbox"
                                        name="branchIds"
                                        value={branch.id}
                                        defaultChecked={currentScope.branchIds.includes(branch.id)}
                                        className="rounded border-slate-300 text-slate-900 focus:ring-[#D4AF37]"
                                      />
                                      <span>{branch.labelZh}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatDate(user.last_sign_in_at)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.email_confirmed_at ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {user.email_confirmed_at ? '已確認' : '待確認'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-500">{getRoleLabel(currentRole)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}