   #!/bin/bash
   set -e
   cd /opt/microservices/shixHappens-microservices-playground
   git pull origin main
   docker-compose -f docker-compose.dev.yml pull
   docker-compose -f docker-compose.dev.yml up -d --build
   docker image prune -f
   ```
   記得在 EC2 上 `chmod +x`，這樣 Actions 只要 SSH 進去跑這支腳本就完成部署。

3. **在 GitHub 設定 Secrets / Variables**
   - `EC2_HOST`：EC2 公網 IP（每次 stop/start 會變，若想固定可申請 Elastic IP）。
   - `EC2_USER`：`ec2-user`
   - `EC2_KEY`：把你連線用的 `microserviceskey.pem` 內容貼上（以 Secret 儲存）。
   - 如果部署腳本需要其他參數，也可一起放進 Secrets。

---

### 建立 GitHub Actions Workflow

在專案新增 `.github/workflows/deploy.yml`，範例：

```yaml
name: Deploy to EC2

on:
  push:
    branches:
      - main   # 你想觸發部署的分支

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.EC2_KEY }}" > ~/.ssh/deploy_key.pem
          chmod 600 ~/.ssh/deploy_key.pem
          cat >>~/.ssh/config <<'EOF'
          Host ec2-deploy
            HostName ${{ secrets.EC2_HOST }}
            User ${{ secrets.EC2_USER }}
            IdentityFile ~/.ssh/deploy_key.pem
            StrictHostKeyChecking no
          EOF

      - name: Deploy via SSH
        run: |
          ssh ec2-deploy '
            cd /opt/microservices/shixHappens-microservices-playground &&
            git pull origin main &&
            docker-compose -f docker-compose.dev.yml up -d --build &&
            docker image prune -f
          '
```

> 若你採用前面提的 `deploy.sh`，就在 SSH 區塊改成 `bash /opt/.../scripts/deploy.sh`。

---

### 部署前測試

1. **手動驗證**：在 EC2 自己執行一次 `git pull`、`docker-compose up -d --build`，確認所有權限與指令都沒問題。
2. **Workflow 乾跑**：可以先把 workflow 的 `on:` 改成 `workflow_dispatch`，手動觸發一次看看是否成功，再開放 `push` 觸發。

---

### 收尾

- 如果之後要改走 HTTPS 或 ALB，可以在 deploy script 內額外處理。
- 記得每次重新啟動 EC2、IP 改變時，要更新 GitHub Secrets 中的 `EC2_HOST`。
- 建議再加一個 `docker-compose logs` 或健康檢查的步驟，方便偵測部署後是否順利。

準備好以上內容就能進入 CI/CD 了。如果需要我幫你寫部署腳本、設定 Secrets 或驗證 workflow，直接告訴我，我們一步一步完成。
