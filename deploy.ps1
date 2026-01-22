# Script de Deploy Automático - OQFOZ
# Execute este script após reiniciar o terminal para que o Git esteja no PATH

Write-Host "🚀 Iniciando deploy automático..." -ForegroundColor Green

# Verificar se Git está disponível
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Por favor, reinicie o terminal após instalar o Git." -ForegroundColor Red
    exit 1
}

# Verificar se estamos em um repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    
    # Verificar se há remote configurado
    $remoteUrl = "https://github.com/mateusdiasyt/oquefazeremfoz.git"
    
    git init
    git remote add origin $remoteUrl 2>$null
    if ($LASTEXITCODE -ne 0) {
        git remote set-url origin $remoteUrl
    }
    
    Write-Host "✅ Repositório inicializado" -ForegroundColor Green
}

# Adicionar todas as alterações
Write-Host "📝 Adicionando arquivos modificados..." -ForegroundColor Yellow
git add .

# Verificar se há alterações
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  Nenhuma alteração para commitar." -ForegroundColor Cyan
    exit 0
}

# Fazer commit
Write-Host "💾 Fazendo commit das alterações..." -ForegroundColor Yellow
$commitMessage = "Corrigir erro 500 ao seguir empresa - melhorias no tratamento de erros e validações"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer commit" -ForegroundColor Red
    exit 1
}

# Fazer push
Write-Host "📤 Enviando alterações para o GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    # Tentar com master se main não funcionar
    Write-Host "⚠️  Tentando com branch 'master'..." -ForegroundColor Yellow
    git push -u origin master
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 O Vercel fará o deploy automático em alguns instantes." -ForegroundColor Cyan
    Write-Host "📊 Acompanhe em: https://vercel.com" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro ao fazer push. Verifique suas credenciais do GitHub." -ForegroundColor Red
    exit 1
}
