# PowerShell script to view PostgreSQL databases

Write-Host "=== 查看所有資料庫 ===" -ForegroundColor Cyan
docker exec -it postgres psql -U admin -c "\l"

Write-Host "`n=== 查看 db_svc1 的 records 表 ===" -ForegroundColor Yellow
docker exec -it postgres psql -U admin -d db_svc1 -c "SELECT * FROM records;"

Write-Host "`n=== 查看 db_svc2 的 records 表 ===" -ForegroundColor Yellow
docker exec -it postgres psql -U admin -d db_svc2 -c "SELECT * FROM records;"

Write-Host "`n=== 查看 db_svc3 的 records 表 ===" -ForegroundColor Yellow
docker exec -it postgres psql -U admin -d db_svc3 -c "SELECT * FROM records;"

Write-Host "`n=== 查看 db_svc4 的 records 表 ===" -ForegroundColor Yellow
docker exec -it postgres psql -U admin -d db_svc4 -c "SELECT * FROM records;"

