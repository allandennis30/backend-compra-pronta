# 📦 Instalação do Node.js

Como você mencionou que não tem o Node.js instalado, aqui estão as instruções para instalá-lo:

## 🪟 Windows

### Opção 1: Download Oficial (Recomendado)

1. **Acesse o site oficial:**
   - Vá para: https://nodejs.org/
   - Baixe a versão **LTS** (Long Term Support)

2. **Execute o instalador:**
   - Execute o arquivo `.msi` baixado
   - Siga o assistente de instalação
   - ✅ Marque a opção "Add to PATH"
   - ✅ Marque a opção "Install additional tools for Node.js"

3. **Verificar instalação:**
   ```bash
   node --version
   npm --version
   ```

### Opção 2: Chocolatey

Se você tem o Chocolatey instalado:
```bash
choco install nodejs
```

### Opção 3: Winget

Se você tem o Winget (Windows 10/11):
```bash
winget install OpenJS.NodeJS
```

## 🚀 Após a Instalação

1. **Reinicie o terminal/PowerShell**

2. **Navegue até a pasta do backend:**
   ```bash
   cd i:\projetos\compra_pronta\backend
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Inicie o servidor:**
   ```bash
   # Desenvolvimento (com auto-reload)
   npm run dev
   
   # Ou produção
   npm start
   ```

## 🔧 Comandos Úteis

```bash
# Verificar versões
node --version
npm --version

# Instalar dependências
npm install

# Instalar dependência específica
npm install express

# Instalar dependência global
npm install -g nodemon

# Listar dependências instaladas
npm list

# Atualizar dependências
npm update

# Limpar cache do npm
npm cache clean --force
```

## 🎯 Versões Recomendadas

- **Node.js:** 18.x ou 20.x (LTS)
- **npm:** 9.x ou superior (vem com o Node.js)

## 🐛 Problemas Comuns

### Erro de permissão no Windows
```bash
# Execute o PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node/npm não reconhecido
- Reinicie o terminal
- Verifique se o Node.js foi adicionado ao PATH
- Reinstale o Node.js marcando "Add to PATH"

### Erro de certificado SSL
```bash
npm config set strict-ssl false
# OU
npm config set registry http://registry.npmjs.org/
```

## 📱 Testando o Backend

Após instalar e iniciar o servidor:

1. **Acesse:** http://localhost:3000/health
2. **Deve retornar:**
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T10:00:00.000Z",
     "uptime": 123
   }
   ```

3. **Teste o login:**
   - Use o arquivo `api-test.http` com a extensão REST Client do VS Code
   - Ou use Postman/Insomnia
   - Ou use curl:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"joao@vendedor.com","senha":"senha123"}'
   ```

## 🔗 Links Úteis

- [Node.js Official](https://nodejs.org/)
- [npm Documentation](https://docs.npmjs.com/)
- [Node.js Tutorial](https://nodejs.dev/learn)
- [Express.js Guide](https://expressjs.com/)

---

**💡 Dica:** Após a instalação, você pode usar o comando `npm run dev` para iniciar o servidor em modo de desenvolvimento com auto-reload usando nodemon.