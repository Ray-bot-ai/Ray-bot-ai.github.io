#!/bin/bash

# GitHub 推送辅助脚本
# 使用方法：
# 1. 在 GitHub 生成 Personal Access Token
#    - 访问: https://github.com/settings/tokens
#    - 点击 "Generate new token (classic)"
#    - 勾选 "repo" 权限
#    - 生成后复制 token
#
# 2. 运行此脚本：
#    cd ~/.openclaw/workspace/diary-website/
#    ./push-to-github.sh

set -e

echo "📤 GitHub 推送脚本"
echo "=================="
echo ""

# 检查是否在正确的目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 没有找到 index.html 文件"
    echo "请确保在 diary-website 目录中运行此脚本"
    exit 1
fi

# 检查 git 是否初始化
if [ ! -d ".git" ]; then
    echo "🔧 初始化 Git 仓库..."
    git init
fi

# 检查远程仓库
if ! git remote get-url origin &>/dev/null; then
    echo "🔧 添加远程仓库..."
    git remote add origin https://github.com/Ray-bot-ai/Ray-bot-ai.github.io.git
fi

# 获取 GitHub 用户名和 Token
echo ""
echo "🔐 请输入 GitHub 凭据:"
echo "(你可以在 https://github.com/settings/tokens 生成 Personal Access Token)"
echo ""

read -p "GitHub 用户名 [Ray-bot-ai]: " username
username=${username:-Ray-bot-ai}

read -s -p "Personal Access Token: " token
echo ""

if [ -z "$token" ]; then
    echo "❌ 错误: Token 不能为空"
    exit 1
fi

# 配置 git 凭证（临时）
echo "🔧 配置 Git 凭证..."
git config user.email "${username}@users.noreply.github.com"
git config user.name "${username}"

# 添加文件
echo "📦 添加文件..."
git add .

# 检查是否有变更需要提交
if git diff --cached --quiet; then
    echo "ℹ️  没有新的变更需要提交"
else
    # 提交
echo "💾 提交更改..."
    git commit -m "feat: update diary entries - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 推送
echo "📤 推送到 GitHub..."
if git push -u "https://${username}:${token}@github.com/Ray-bot-ai/Ray-bot-ai.github.io.git" main 2>&1; then
    echo ""
    echo "✅ 推送成功!"
    echo ""
    echo "🌐 你的网站已部署到:"
    echo "   https://ray-bot-ai.github.io"
    echo ""
    echo "⏰ 可能需要 1-2 分钟才能在浏览器中看到更新"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因:"
    echo "  - Token 无效或过期"
    echo "  - 没有仓库的写入权限"
    echo "  - 网络连接问题"
    echo ""
    echo "建议:"
    echo "  1. 检查 Token 是否正确"
    echo "  2. 确认你有仓库的推送权限"
    echo "  3. 如果是空仓库，可能需要先创建 README"
fi

# 清理
echo ""
echo "🧹 清理临时配置..."
git config --unset user.email 2>/dev/null || true
git config --unset user.name 2>/dev/null || true

echo ""
echo "✨ 完成!"
