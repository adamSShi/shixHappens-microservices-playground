   #!/bin/bash
   set -e
   cd /opt/microservices/shixHappens-microservices-playground
   git pull origin main
   docker-compose -f docker-compose.dev.yml pull
   docker-compose -f docker-compose.dev.yml up -d --build
   docker image prune -f
