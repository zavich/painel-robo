#!/bin/bash

# Script de Verificação de Segurança - React2Shell Mitigation
# Este script ajuda a verificar se o container foi comprometido

CONTAINER_NAME="prosolutti-robo"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Verificação de Segurança - Container Next.js"
echo "=========================================="
echo ""

# Verificar se o container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ Container $CONTAINER_NAME não está rodando${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container está rodando${NC}"
echo ""

# 1. Verificar processos em execução
echo "1. Processos em execução:"
echo "----------------------------------------"
docker exec $CONTAINER_NAME ps aux | head -20
echo ""

# 2. Verificar processos suspeitos (mineradores)
echo "2. Verificando processos suspeitos (mineradores):"
echo "----------------------------------------"
SUSPICIOUS=$(docker exec $CONTAINER_NAME ps aux | grep -E "(xmrig|minerd|cpuminer|stratum|mining)" || true)
if [ -z "$SUSPICIOUS" ]; then
    echo -e "${GREEN}✅ Nenhum processo suspeito encontrado${NC}"
else
    echo -e "${RED}❌ PROCESSOS SUSPEITOS ENCONTRADOS:${NC}"
    echo "$SUSPICIOUS"
fi
echo ""

# 3. Verificar uso de CPU
echo "3. Uso de CPU (top 5 processos):"
echo "----------------------------------------"
docker exec $CONTAINER_NAME sh -c "ps aux --sort=-%cpu | head -6"
echo ""

# 4. Verificar conexões de rede
echo "4. Conexões de rede ativas:"
echo "----------------------------------------"
docker exec $CONTAINER_NAME sh -c "netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null || echo 'Comando netstat/ss não disponível'"
echo ""

# 5. Verificar arquivos modificados nas últimas 24 horas
echo "5. Arquivos modificados nas últimas 24 horas:"
echo "----------------------------------------"
docker exec $CONTAINER_NAME find /app -type f -mtime -1 2>/dev/null | head -20
echo ""

# 6. Verificar arquivos executáveis suspeitos
echo "6. Verificando arquivos executáveis suspeitos:"
echo "----------------------------------------"
SUSPICIOUS_FILES=$(docker exec $CONTAINER_NAME find /app -type f -executable -name "*miner*" -o -name "*xmrig*" -o -name "*stratum*" 2>/dev/null || true)
if [ -z "$SUSPICIOUS_FILES" ]; then
    echo -e "${GREEN}✅ Nenhum arquivo executável suspeito encontrado${NC}"
else
    echo -e "${RED}❌ ARQUIVOS SUSPEITOS ENCONTRADOS:${NC}"
    echo "$SUSPICIOUS_FILES"
fi
echo ""

# 7. Verificar usuário que está executando o processo
echo "7. Usuário executando o processo Next.js:"
echo "----------------------------------------"
docker exec $CONTAINER_NAME ps aux | grep -E "(next|node)" | grep -v grep
echo ""

# 8. Verificar variáveis de ambiente sensíveis
echo "8. Verificando variáveis de ambiente (primeiras 10):"
echo "----------------------------------------"
docker exec $CONTAINER_NAME env | head -10
echo ""

# 9. Verificar logs recentes
echo "9. Últimas 20 linhas dos logs:"
echo "----------------------------------------"
docker logs $CONTAINER_NAME --tail 20
echo ""

# 10. Verificar versão do Next.js
echo "10. Versão do Next.js instalada:"
echo "----------------------------------------"
docker exec $CONTAINER_NAME sh -c "cd /app && npm list next 2>/dev/null | grep next || echo 'Não encontrado'"
echo ""

echo "=========================================="
echo "Verificação concluída"
echo "=========================================="
echo ""
echo "⚠️  Se você encontrou processos ou arquivos suspeitos:"
echo "   1. Pare o container imediatamente"
echo "   2. Revise os logs detalhadamente"
echo "   3. Rotacione todas as credenciais"
echo "   4. Reconstrua o container a partir de uma imagem limpa"
echo "   5. Revise o SECURITY.md para mais informações"
echo ""

