#!/bin/sh
echo "🚀 Waiting for services to be ready..."

# 安裝必要的工具（如果需要的話）
if ! command -v nc >/dev/null 2>&1; then
  apk add --no-cache netcat-openbsd >/dev/null 2>&1 || true
fi

# 等待 TCP 服務
wait_for_tcp() {
  host=$1
  port=$2
  name=$3
  max_attempts=30
  attempt=0
  
  echo "⏳ Waiting for $name..."
  while [ $attempt -lt $max_attempts ]; do
    if nc -z "$host" "$port" 2>/dev/null; then
      echo "✅ $name is ready"
      return 0
    fi
    attempt=$((attempt + 1))
    if [ $((attempt % 5)) -eq 0 ]; then
      echo "   Still waiting... ($attempt/$max_attempts)"
    fi
    sleep 1
  done
  
  echo "⚠️  $name not ready (continuing anyway)"
  return 0
}

# 等待 HTTP 服務
wait_for_http() {
  host=$1
  port=$2
  name=$3
  max_attempts=30
  attempt=0
  
  echo "⏳ Waiting for $name..."
  while [ $attempt -lt $max_attempts ]; do
    # 使用 nc 檢查端口是否可以連接
    if nc -z "$host" "$port" 2>/dev/null; then
      echo "✅ $name is ready"
      return 0
    fi
    attempt=$((attempt + 1))
    if [ $((attempt % 5)) -eq 0 ]; then
      echo "   Still waiting... ($attempt/$max_attempts)"
    fi
    sleep 1
  done
  
  echo "⚠️  $name not ready (continuing anyway)"
  return 0
}

# 等待所有服務（不強制要求全部成功）
wait_for_tcp svc1 4001 "Service-1"
wait_for_tcp svc2 4002 "Service-2"
wait_for_tcp svc3 4003 "Service-3"
wait_for_tcp svc4 4004 "Service-4"
wait_for_http gateway 3000 "Gateway"

echo ""
echo "✅ Service check completed!"
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ShixHappens 微服務 Demo 已啟動      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🌐 前端網址:"
echo "   👉 http://localhost:5173"
echo ""
echo "🔌 Gateway:"
echo "   http://localhost:3000"
echo ""
echo "📡 微服務 API:"
echo "   svc1: http://localhost:3000/svc1/whoami"
echo "   svc2: http://localhost:3000/svc2/whoami"
echo "   svc3: http://localhost:3000/svc3/whoami"
echo "   svc4: http://localhost:3000/svc4/whoami"
echo ""
echo "✨ 啟動前端開發服務器..."
echo ""

