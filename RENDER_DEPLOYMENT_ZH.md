# Render 真網站部署教學

這份教學是給 `Medi Magic HRMS` 真正上線用的。

這個方案會部署你 repo 入面的 `ui/` Next.js 應用，所以打開網址第一頁會是真正的登入頁，不是 GitHub Pages 靜態展示頁。

## 部署前提

你需要準備好以下資料：

- GitHub repo：`wuho1993/medimagic`
- Supabase 專案 URL
- Supabase `anon` key
- Supabase `service_role` key

## 已經幫你準備好的檔案

Repo 根目錄已加好：

- `render.yaml`

Render 會知道：

- 專案根目錄是 `ui`
- build command 是 `npm install && npm run build`
- start command 是 `npm run start`

## Render 設定步驟

1. 打開 `https://render.com/`
2. 用 GitHub 帳號登入
3. 在 Dashboard 按 `New +`
4. 選 `Blueprint`
5. 選擇 GitHub repo：`wuho1993/medimagic`
6. Render 會讀到 repo 內的 `render.yaml`
7. 建立 service

## 需要填入的環境變數

在 Render 的 Environment 頁面加入：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 去哪裡找這些值

1. 打開 Supabase project
2. 進入 `Project Settings`
3. 進入 `API`
4. 複製：
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key -> `SUPABASE_SERVICE_ROLE_KEY`

## 部署成功後

Render 會給你一個網址，例如：

- `https://medimagic-hrms.onrender.com`

這條網址打開後，首頁應該就是登入頁。

## 首次驗證

部署完成後，檢查：

1. 首頁是否是登入頁
2. 輸入帳號密碼能否登入
3. 儀表板能否正常開啟
4. 員工、出勤、薪酬頁面能否正常載入

## 常見問題

### 1. 打開網站後白屏或 500

通常是環境變數未填齊，先檢查：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. 可以開首頁，但登入失敗

通常是：

- Supabase Auth 設定未完成
- 帳號密碼本身不正確
- service role key / anon key 填錯

### 3. Render 無法找到正確專案目錄

這個 repo 已經有 `render.yaml`，其中 `rootDir` 已設為 `ui`。

## 補充

GitHub Pages 保留作展示入口頁。
真正可登入、可操作的 HRMS 網站，請用 Render 這條部署線。