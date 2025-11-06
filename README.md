# ShixHappens Microservices Playground

一個完整的微服務架構示範專案，使用 Node.js + TypeScript 構建，包含 API Gateway、多個微服務、前端應用和 PostgreSQL 資料庫。

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

## 📦 專案結構

```
.
├── apps/
│   ├── services/
│   │   ├── gateway/      # API Gateway (Port 3000)
│   │   ├── service-1/    # 微服務 1 (Port 4001)
│   │   ├── service-2/    # 微服務 2 (Port 4002)
│   │   ├── service-3/    # 微服務 3 (Port 4003)
│   │   └── service-4/    # 微服務 4 (Port 4004)
│   └── webSite/          # 前端應用 (Port 5173)
├── db/
│   └── init/             # 資料庫初始化腳本
├── scripts/              # 工具腳本
├── docker-compose.dev.yml # Docker Compose 配置
└── package.json          # 根目錄 package.json (npm workspaces)
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

