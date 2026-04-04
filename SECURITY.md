# Documentação de Segurança - Mitigação React2Shell (CVE-2025-55182)

## Resumo da Vulnerabilidade

A vulnerabilidade **React2Shell (CVE-2025-55182)** é uma falha crítica de execução remota de código (RCE) que afeta React Server Components e aplicações Next.js. Esta vulnerabilidade permite que atacantes não autenticados executem código arbitrário no servidor.

## Status da Mitigação

✅ **REACT2SHELL MITIGADO** - As seguintes medidas foram implementadas:

⚠️ **VULNERABILIDADES CONHECIDAS** - Existem 3 vulnerabilidades de alta severidade sem fix disponível (veja seção abaixo)

### 1. Atualização de Dependências
- **Next.js**: Atualizado de `15.3.4` para `^16.0.0` (versão corrigida)
- **React**: Atualizado de `^19.0.0` para `^19.2.1` (versão corrigida)
- **React DOM**: Atualizado de `^19.0.0` para `^19.2.1` (versão corrigida)
- **ESLint Config Next**: Atualizado para `^16.0.0`

### 2. Hardening do Container Docker
- ✅ Container executa como usuário não-root (`nextjs:nodejs`)
- ✅ Build otimizado com multi-stage (quando aplicável)
- ✅ Limpeza de dependências de desenvolvimento após build
- ✅ Variáveis de ambiente de produção configuradas

### 3. Headers de Segurança
Implementados no `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 4. Proteções no Middleware
- ✅ Validação de path traversal (`..`, `//`)
- ✅ Bloqueio de caracteres maliciosos em URLs
- ✅ Autenticação baseada em tokens
- ✅ Controle de acesso baseado em roles

## Vulnerabilidades Conhecidas Sem Fix Disponível

Após a atualização, ainda existem **3 vulnerabilidades de alta severidade** sem correção disponível:

### 1. pdfjs-dist (via @react-pdf-viewer/core)
- **Severidade**: Alta
- **CVE**: [GHSA-wgrm-67xf-hhpq](https://github.com/advisories/GHSA-wgrm-67xf-hhpq)
- **Descrição**: PDF.js vulnerável a execução arbitrária de JavaScript ao abrir PDFs maliciosos
- **Status**: Sem fix disponível no momento
- **Mitigações**:
  - ✅ Validar e sanitizar todos os PDFs antes de processar
  - ✅ Processar PDFs em ambiente isolado/sandbox quando possível
  - ✅ Limitar uploads de PDFs apenas para usuários autenticados
  - ✅ Monitorar uso de CPU/memória durante processamento de PDFs
  - ✅ Considerar alternativas como `react-pdf` (já presente no projeto) se possível

### 2. xlsx (SheetJS)
- **Severidade**: Alta (2 vulnerabilidades)
- **CVEs**: 
  - [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) - Prototype Pollution
  - [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) - Regular Expression Denial of Service (ReDoS)
- **Descrição**: 
  - Prototype Pollution permite modificação de propriedades de objetos JavaScript
  - ReDoS pode causar negação de serviço através de expressões regulares maliciosas
- **Status**: Sem fix disponível no momento
- **Mitigações**:
  - ✅ Validar e sanitizar todos os arquivos Excel antes de processar
  - ✅ Limitar tamanho dos arquivos Excel processados
  - ✅ Processar arquivos Excel apenas de fontes confiáveis
  - ✅ Implementar timeout para processamento de arquivos Excel
  - ✅ Considerar alternativas como `exceljs` ou processamento server-side isolado
  - ✅ Monitorar uso de recursos durante processamento

### Recomendações para Vulnerabilidades Sem Fix

1. **Validação Rigorosa de Entrada**:
   - Implementar validação de tipo e tamanho de arquivo
   - Usar bibliotecas de sanitização antes do processamento
   - Limitar tipos de arquivo aceitos

2. **Isolamento de Processamento**:
   - Processar arquivos em workers isolados
   - Usar containers separados para processamento de arquivos
   - Implementar timeouts e limites de recursos

3. **Monitoramento**:
   - Alertas para processamento anormal de arquivos
   - Logs detalhados de uploads e processamento
   - Monitoramento de uso de CPU/memória

4. **Acesso Restrito**:
   - Limitar uploads apenas para usuários autenticados
   - Implementar rate limiting por usuário
   - Revisar permissões de acesso regularmente

## Checklist de Verificação Pós-Atualização

### Antes do Deploy
- [x] Executar `npm install` para atualizar dependências ✅
- [x] Executar `npm audit` para verificar vulnerabilidades conhecidas ✅
- [ ] Testar build local: `npm run build`
- [ ] Verificar que não há erros de compilação
- [ ] Testar aplicação localmente: `npm run start`
- [ ] Revisar vulnerabilidades conhecidas (pdfjs-dist, xlsx) e implementar mitigações

### Após o Deploy
- [ ] Verificar logs do container para atividades suspeitas
- [ ] Monitorar processos em execução no servidor
- [ ] Verificar uso de CPU/memória (possível indicador de minerador)
- [ ] Revisar logs de acesso para requisições suspeitas
- [ ] Verificar integridade dos arquivos do container

### Monitoramento Contínuo
- [ ] Configurar alertas para processos não autorizados
- [ ] Monitorar tentativas de acesso não autenticadas
- [ ] Revisar logs regularmente
- [ ] Manter dependências atualizadas (`npm outdated`)
- [ ] Executar `npm audit` regularmente

## Comandos Úteis para Investigação

### Verificar processos em execução no container
```bash
docker exec prosolutti-robo ps aux
```

### Verificar processos de CPU intensivos
```bash
docker exec prosolutti-robo top
```

### Verificar logs do container
```bash
docker logs prosolutti-robo --tail 100
```

### Verificar arquivos modificados recentemente
```bash
docker exec prosolutti-robo find /app -type f -mtime -1
```

### Verificar conexões de rede ativas
```bash
docker exec prosolutti-robo netstat -tulpn
```

### Verificar processos suspeitos (mineradores comuns)
```bash
docker exec prosolutti-robo ps aux | grep -E "(xmrig|minerd|cpuminer|stratum)"
```

## Medidas Adicionais Recomendadas

### 1. WAF (Web Application Firewall)
- Configure um WAF na frente da aplicação (ex: Cloudflare, AWS WAF)
- Bloqueie padrões conhecidos de exploração do React2Shell

### 2. Rate Limiting
- Implemente rate limiting nas rotas de API
- Limite requisições por IP

### 3. Monitoramento e Alertas
- Configure alertas para:
  - Alto uso de CPU
  - Processos não autorizados
  - Tentativas de acesso não autenticadas
  - Modificações em arquivos do sistema

### 4. Rotação de Credenciais
- Rotacione todas as credenciais após um possível comprometimento
- Revise permissões de acesso

### 5. Backup e Recuperação
- Mantenha backups regulares
- Teste procedimentos de recuperação

## Referências

- [CVE-2025-55182](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-55182)
- [Next.js Security Advisory](https://nextjs.org/blog/CVE-2025-66478)
- [Microsoft Security Blog - React2Shell](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)
- [WeLiveSecurity - React2Shell](https://www.welivesecurity.com/pt/seguranca-digital/react2shell-falha-critica-no-react-e-no-nextjs-expoe-milhoes-de-aplicativos/)

## Contato

Em caso de dúvidas ou detecção de atividades suspeitas, entre em contato com a equipe de segurança.

## Resumo de Vulnerabilidades

| Vulnerabilidade | Severidade | Status | Fix Disponível |
|----------------|------------|--------|----------------|
| React2Shell (CVE-2025-55182) | Crítica | ✅ Mitigado | ✅ Sim (Next.js 16.x, React 19.2.1) |
| pdfjs-dist (GHSA-wgrm-67xf-hhpq) | Alta | ⚠️ Conhecida | ❌ Não |
| xlsx - Prototype Pollution | Alta | ⚠️ Conhecida | ❌ Não |
| xlsx - ReDoS | Alta | ⚠️ Conhecida | ❌ Não |

---
**Última atualização**: 26/12/2025
**Versão do documento**: 1.1

