# ShixHappens Microservices Playground

一個完整的微服務架構示範專案，使用 Node.js + TypeScript 構建，涵蓋 API Gateway、四個後端服務、React 前端與 PostgreSQL。內容聚焦在現代化拆分、容器化與自動化部署的最佳實務。

## 🌐 微服務與架構演進

傳統的 **Monolithic** 架構把所有功能封裝在單一部署單元，早期開發成本低，但在功能擴張或部署頻率提升時容易出現瓶頸：更新涉及整體程式碼、測試與回滾變得困難、難以針對單一模組擴展。  
**Microservices** 則將系統拆分為多個可獨立部署的服務，透過輕量通訊協定合作，每個服務維護自己的資料與邏輯。優勢包含：
- 各服務可 **獨立部署與擴展**，降低單次改動的風險。
- 團隊可以依服務挑選最適技術棧，提升開發效率。
- 與 DevOps、CI/CD 流程高度契合，支援頻繁發版。

但微服務也提高了分散式系統的複雜度：跨服務通訊、資料一致性、觀測與部署流程都需要更嚴謹的設計。本專案示範如何在 Node.js 生態下實作一組微服務並搭配現代化的交付流程。

## 🧱 本專案的微服務設計

- **API Gateway**：提供 HTTP 入口，處理 CORS、路由與錯誤管理，並透過 TCP Socket 呼叫後端服務，統一封裝跨服務通訊細節。
- **四個後端服務（svc1~svc4）**：各自負責一塊業務域，收/發 TCP JSON 訊息並存取專屬資料庫，示範服務自治與資料隔離。
- **Frontend (React + Vite)**：以 Vite 開發、Nginx 發佈，透過環境變數決定 API Gateway 位置，支援本地與雲端環境切換。
- **PostgreSQL**：以四個資料庫 (`db_svc1`~`db_svc4`) 詮釋「每個服務擁有自己的資料」的理念。

此架構把跨域 concern 集中在 Gateway，讓微服務專注在領域邏輯，也方便日後擴充更多服務或整合其他通訊協定。

## 🏗️ 架構概覽

```
       ┌─────────────┐
       │   Frontend  │ (React + Vite)
       │   Port 5173 │
       └──────┬──────┘
              │ HTTP
              ▼
       ┌─────────────┐
       │   Gateway   │ (Node.js + TypeScript)
       │  Port 3000  │
       └──────┬──────┘
              │ TCP Socket
   ├───────┬───────┬───────┐
   ▼       ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│Svc1 │ │Svc2 │ │Svc3 │ │Svc4 │
│4001 │ │4002 │ │4003 │ │4004 │
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───────┴───────┴───────┘
               │
               ▼
       ┌───────────────┐
       │   PostgreSQL  │
       │   Port 5432   │
       └───────────────┘
```

## 🛠️ 技術棧

### Backend
- **Node.js 22** + **TypeScript**
- **TCP Socket** 進行微服務間通訊
- **HTTP Server** (Gateway)
- **PostgreSQL 15** 資料庫

### Frontend
- **React 18**
- **Vite**
- **TypeScript**

### DevOps
- **Docker** + **Docker Compose**
- **npm Workspaces** (Monorepo)

## 🐳 Docker 策略與權衡

- **多階段 Dockerfile**：每個服務採 builder/runner 階段，先在 builder 內 `npm ci` + `npm run build`，再把產物複製到精簡 runner，降低映像體積與攻擊面。
- **docker-compose.dev.yml**：開發模式一次啟動 Gateway、四個服務、前端與 PostgreSQL，並透過 volume 掛載原始碼以支援熱重載。
- **優勢**：
  - 建置流程可重現，團隊無需手動安裝依賴。
  - 每個服務獨立 `node_modules`，避免交叉汙染。
  - 容易過渡到容器平台（ECS、Kubernetes）。
- **限制**：
  - 多容器在開發機上耗用較多資源。
  - Production 仍需專業編排（如 ECS/Fargate）才能彈性伸縮。
  - 必須維護 `package-lock.json`，確保 `npm ci` 在 CI/CD 中穩定執行。

## 🔁 CI/CD：GitHub Actions 工作流程

GitHub Actions 是 GitHub 內建的 CI/CD 平台，可設定事件觸發、Runner 與腳本。本專案的 `.github/workflows/deploy.yml` 在 `main` 分支 push 時執行：

1. **Checkout repo**：抓取最新程式碼。
2. **Setup SSH**：將 `EC2_HOST`、`EC2_USER`、`EC2_KEY` secrets 寫入臨時 SSH 設定，安全連線到雲端。
3. **Run deploy script on EC2**：透過 SSH 執行 `/opt/microservices/shixHappens-microservices-playground/scripts/deploy.sh`，內含 `git pull`、`docker compose up --build` 等部署流程。

如此便能在提交程式後自動更新 EC2 環境，避免人工部署的風險並保留審核紀錄。

## ⚖️ CI/CD 工具比較

| 工具 | 優點 | 注意事項 / 限制 |
| --- | --- | --- |
| **GitHub Actions** | 與 GitHub 無縫整合、Marketplace actions 豐富、設定簡潔。 | 綁定 GitHub；複雜流程可能需要自架 runner；免費額度依方案而定。 |
| **GitLab CI/CD** | 內建於 GitLab，同步管理程式碼與 pipeline，支援 Auto DevOps。 | 自托管需維護 Runner；雲端版免費分鐘有限。 |
| **Jenkins** | 歷史悠久、外掛生態完整，可高度自訂與私有化。 | 需自行維運主機、升級與安全性；設定曲線相對陡峭。 |

本專案源碼托管於 GitHub，直接使用 Actions 能以最低門檻完成自動部署。若未來跨平台或需更彈性的 Pipeline，可再評估 GitLab 或 Jenkins。

## ☁️ 雲端部署策略與選型

- **平台策略**：目前以 EC2 為主，快速上線並保有完整主機控制權；長期規劃則可平滑遷移到 **ECS Fargate**，因為服務已容器化。
- **網路設計**：在 `ap-southeast-2` 建立自訂 VPC (`10.0.0.0/16`)，劃分兩組 AZ 的 Public/Private 子網，掛載 Internet Gateway 供外部存取，並於 Public 子網建立 NAT Gateway 讓 Private 子網安全地對外更新。
- **安全組與 IAM**：定義 `web-sg`、`app-sg`、`db-sg` 控制 HTTP/HTTPS、內部 TCP 與 PostgreSQL 流量，並建立 `ec2-microservices-role` 授權 EC2 存取必要的 AWS 資源（如 CloudWatch、ECR）。
- **資料庫策略**：初期資料庫部署在 EC2 內降低成本；若需求提升，建議遷移至 Amazon RDS for PostgreSQL，享受自動備份、Multi-AZ 與維運簡化。
- **自動部署**：GitHub Actions 透過 SSH 觸發 EC2 上的部署腳本，配合 Docker Compose 在遠端一次更新所有容器。
- **未來擴展**：架構已預留導入 RDS、ECS Fargate、CloudFront/ALB 以及更進階的 CI/CD Pipeline 的空間。

## 📦 專案結構

```
.
├── apps/
│   ├── services/
│   │   ├── gateway/      # API Gateway (Port 3000)
│   │   │     └── Dockerfile 
│   │   ├── service-1/    # 微服務 1 (Port 4001)
│   │   │      └── Dockerfile 
│   │   ├── service-2/    # 微服務 2 (Port 4002)
│   │   │      └── Dockerfile 
│   │   ├── service-3/    # 微服務 3 (Port 4003)
│   │   │      └── Dockerfile 
│   │   └── service-4/    # 微服務 4 (Port 4004)
│   │         └── Dockerfile 
│   └── webSite/          # 前端應用 (Port 5173)
├── db/
│   └── init/             # 資料庫初始化腳本
├── scripts/              # 工具腳本（含 deploy.sh）
├── docker-compose.dev.yml # Docker Compose 配置
└── package.json          # 根目錄 package.json (npm workspaces)
可以再幫我生webSite、gateway跟每個service下都有docker file嗎?
```

## 🚀 快速開始

### 前置需求

- Node.js 22+
- Docker & Docker Compose
- npm

### 使用 Docker Compose（推薦）

**從遠端倉庫克隆後，無需安裝任何依賴，直接啟動即可！**

1. **克隆專案**
```bash
git clone https://github.com/adamSShi/shixHappens-microservices-playground.git
cd shixHappens-microservices-playground
```

2. **啟動所有服務**（自動安裝依賴並啟動）
```bash
docker compose -f docker-compose.dev.yml up
```

每個容器會：
- 自動在容器內安裝自己的 `node_modules`（獨立於本地環境）
- 自動啟動服務
- 不需要本地安裝任何 Node.js 依賴

3. **訪問前端**
```
http://localhost:5173
```

4. **停止服務**
```bash
docker compose -f docker-compose.dev.yml down
```

> **注意**：即使本地沒有 `node_modules` 或根目錄沒有安裝依賴，Docker Compose 也能正常運行，因為每個容器都在自己的環境中獨立安裝依賴。

### 本地開發（不使用 Docker）

1. **安裝依賴**
```bash
npm install
```

2. **啟動 PostgreSQL**（需要先啟動資料庫）
```bash
docker compose -f docker-compose.dev.yml up postgres -d
```

3. **啟動所有服務**
```bash
npm run dev:all
```

## 🗄️ 資料庫

專案使用 PostgreSQL，包含 4 個資料庫：
- `db_svc1` - 服務 1 的資料庫
- `db_svc2` - 服務 2 的資料庫
- `db_svc3` - 服務 3 的資料庫
- `db_svc4` - 服務 4 的資料庫

每個資料庫都有一個 `records` 表：
```sql
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 環境變數

### Backend Services

每個服務需要以下環境變數：
- `DATABASE_HOST` - 資料庫主機（預設: `postgres`）
- `DATABASE_PORT` - 資料庫端口（預設: `5432`）
- `DATABASE_USER` - 資料庫用戶（預設: `admin`）
- `DATABASE_PASSWORD` - 資料庫密碼（預設: `admin123`）
- `DATABASE_NAME` - 資料庫名稱（`db_svc1`, `db_svc2`, `db_svc3`, `db_svc4`）

### Gateway

- `SVC1_HOST`, `SVC2_HOST`, `SVC3_HOST`, `SVC4_HOST` - 微服務主機地址（Docker 環境使用服務名稱，本地使用 `127.0.0.1`）

### Frontend

- `VITE_API_TARGET` - API Gateway 地址（Docker 環境: `http://gateway:3000`，本地: `http://localhost:3000`）

## 📝 API 端點

### Gateway

- `POST /api/svc1/whoami` - 呼叫服務 1
- `POST /api/svc2/whoami` - 呼叫服務 2
- `POST /api/svc3/whoami` - 呼叫服務 3
- `POST /api/svc4/whoami` - 呼叫服務 4

### 微服務（TCP Socket）

每個微服務透過 TCP Socket 接收 JSON 格式的指令：
```json
{
  "cmd": "whoami",
  "data": {}
}
```

## 🎯 功能特色

- ✅ 微服務架構（4 個獨立服務）
- ✅ API Gateway 模式
- ✅ TCP Socket 通訊
- ✅ PostgreSQL 資料庫整合
- ✅ Docker 容器化
- ✅ 熱重載開發環境
- ✅ npm Workspaces 管理
- ✅ TypeScript 全端開發

## 📄 License

MIT

