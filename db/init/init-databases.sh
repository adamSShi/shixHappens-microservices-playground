#!/bin/bash
set -e

# 使用 PGPASSWORD 環境變數來避免密碼提示
export PGPASSWORD="$POSTGRES_PASSWORD"

# 首先建立資料庫（使用 postgres 資料庫作為連接基礎）
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE db_svc1;
    CREATE DATABASE db_svc2;
    CREATE DATABASE db_svc3;
    CREATE DATABASE db_svc4;
EOSQL

# 為每個資料庫建立表格和插入資料
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "db_svc1" <<-EOSQL
    CREATE TABLE records (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
    );
    INSERT INTO records (name) VALUES ('svc1_data');
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "db_svc2" <<-EOSQL
    CREATE TABLE records (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
    );
    INSERT INTO records (name) VALUES ('svc2_data');
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "db_svc3" <<-EOSQL
    CREATE TABLE records (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
    );
    INSERT INTO records (name) VALUES ('svc3_data');
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "db_svc4" <<-EOSQL
    CREATE TABLE records (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
    );
    INSERT INTO records (name) VALUES ('svc4_data');
EOSQL

