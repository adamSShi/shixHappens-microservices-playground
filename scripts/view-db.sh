#!/bin/bash

echo "=== 查看所有資料庫 ==="
docker exec -it postgres psql -U admin -c "\l"

echo ""
echo "=== 查看 db_svc1 的 records 表 ==="
docker exec -it postgres psql -U admin -d db_svc1 -c "SELECT * FROM records;"

echo ""
echo "=== 查看 db_svc2 的 records 表 ==="
docker exec -it postgres psql -U admin -d db_svc2 -c "SELECT * FROM records;"

echo ""
echo "=== 查看 db_svc3 的 records 表 ==="
docker exec -it postgres psql -U admin -d db_svc3 -c "SELECT * FROM records;"

echo ""
echo "=== 查看 db_svc4 的 records 表 ==="
docker exec -it postgres psql -U admin -d db_svc4 -c "SELECT * FROM records;"

