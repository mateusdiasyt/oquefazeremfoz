# ============================================
# SCRIPT DE DEPLOY AUTOMÁTICO - OQFOZ
# ============================================
# 
# INSTRUÇÕES:
# 1. Feche este terminal
# 2. Abra um NOVO terminal (PowerShell ou CMD)
# 3. Navegue até a pasta do projeto
# 4. Execute: .\FAZER-DEPLOY.ps1
#
# OU simplesmente execute os comandos abaixo manualmente:
# ============================================

Write-Host "`n🚀 DEPLOY AUTOMÁTICO - OQFOZ" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Verificar Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git encontrado!" -ForegroundColor Green
    Write-Host "   $gitVersion`n" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ ERRO: Git não encontrado no PATH" -ForegroundColor Red
    Write-Host "`nPor favor:" -ForegroundColor Yellow
    Write-Host "1. Feche este terminal" -ForegroundColor Yellow
    Write-Host "2. Abra um NOVO terminal" -ForegroundColor Yellow
    Write-Host "3. Execute este script novamente`n" -ForegroundColor Yellow
    Write-Host "OU execute manualmente os comandos:`n" -ForegroundColor Cyan
    Write-Host "git add ." -ForegroundColor White
    Write-Host 'git commit -m "Corrigir erro 500 ao seguir empresa"' -ForegroundColor White
    Write-Host "git push origin main`n" -ForegroundColor White
    exit 1
}

# Verificar se é repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/mateusdiasyt/oquefazeremfoz.git 2>$null
    if ($LASTEXITCODE -ne 0) {
        git remote set-url origin https://github.com/mateusdiasyt/oquefazeremfoz.git
    }
    Write-Host "✅ Repositório inicializado`n" -ForegroundColor Green
}

# Adicionar arquivos
Write-Host "📝 Adicionando arquivos modificados..." -ForegroundColor Yellow
git add .

# Verificar status
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  Nenhuma alteração para commitar.`n" -ForegroundColor Cyan
    Write-Host "Tudo já está sincronizado! ✅`n" -ForegroundColor Green
    exit 0
}

Write-Host "Arquivos modificados:" -ForegroundColor Gray
git status --short
Write-Host ""

# Fazer commit
Write-Host "💾 Fazendo commit..." -ForegroundColor Yellow
$commitMessage = "Corrigir erro 500 ao seguir empresa - melhorias no tratamento de erros e validações"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Erro ao fazer commit`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit realizado com sucesso!`n" -ForegroundColor Green

# Fazer push
Write-Host "📤 Enviando para o GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Tentando com branch 'master'..." -ForegroundColor Yellow
    git push -u origin master
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ DEPLOY CONCLUÍDO COM SUCESSO!`n" -ForegroundColor Green
    Write-Host "🌐 O Vercel fará o deploy automático em alguns instantes." -ForegroundColor Cyan
    Write-Host "📊 Acompanhe em: https://vercel.com`n" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Erro ao fazer push" -ForegroundColor Red
    Write-Host "Verifique suas credenciais do GitHub.`n" -ForegroundColor Yellow
    exit 1
}
