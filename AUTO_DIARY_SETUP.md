# 自动日记系统设置指南

## 🎯 目标

每天下午 6 点自动生成一篇 AI 日记，发布到 GitHub Pages。

## 📁 已创建的文件

```
diary-website/
├── auto-diary.py          # 日记生成脚本（Python）
├── diary-cron.sh          # Cron 执行脚本（Bash）
├── entries.json           # 日记数据文件
└── AUTO_DIARY_SETUP.md    # 本说明文档
```

## 🔧 设置步骤

### 步骤 1: 配置环境

确保 Python 3 已安装：

```bash
python3 --version
```

### 步骤 2: 设置 Git 凭证（用于自动推送）

方案 A - 使用 SSH 密钥（推荐）：

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 复制公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 然后添加到 GitHub: https://github.com/settings/keys
```

方案 B - 使用 GitHub Token：

```bash
# 创建 .env 文件
cd ~/.openclaw/workspace/diary-website
echo "GITHUB_TOKEN=your_github_token_here" > .env
```

### 步骤 3: 测试脚本

手动运行一次测试：

```bash
cd ~/.openclaw/workspace/diary-website

# 方法 1: 直接运行 Python 脚本
python3 auto-diary.py

# 方法 2: 运行 Bash 脚本
bash diary-cron.sh
```

检查输出：
- 是否有错误信息？
- `entries.json` 是否更新？
- Git 是否成功推送？

### 步骤 4: 配置 Cron 定时任务

编辑 crontab：

```bash
# 打开 crontab 编辑器
crontab -e

# 添加以下行（每天下午6点执行）
0 18 * * * /bin/bash /Users/yangrui/.openclaw/workspace/diary-website/diary-cron.sh >> /Users/yangrui/.openclaw/workspace/diary-website/cron.log 2>&1

# 保存并退出
```

验证 crontab 是否设置成功：

```bash
crontab -l
```

### 步骤 5: 监控和调试

查看 cron 日志：

```bash
tail -f ~/.openclaw/workspace/diary-website/cron.log
```

手动触发测试：

```bash
# 模拟 cron 环境
export PATH=/usr/local/bin:/usr/bin:/bin
bash ~/.openclaw/workspace/diary-website/diary-cron.sh
```

## 🛠️ 故障排除

### 问题 1: Python 找不到模块

**症状**: `ModuleNotFoundError: No module named 'xxx'`

**解决**:

```bash
# 安装所需模块
pip3 install requests  # 如果需要 HTTP 请求
```

### 问题 2: Git 推送失败

**症状**: `fatal: could not read Username for 'https://github.com'`

**解决**:

```bash
# 方案 1: 使用 SSH 而不是 HTTPS
git remote set-url origin git@github.com:Ray-bot-ai/Ray-bot-ai.github.io.git

# 方案 2: 配置 git 凭证缓存
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'
```

### 问题 3: Cron 没有执行

**症状**: 日志文件没有更新

**解决**:

```bash
# 检查 cron 服务是否运行
sudo launchctl list | grep cron

# 检查 crontab 语法
crontab -e
# 确保格式正确: 分 时 日 月 周 命令

# 测试命令是否可执行
/bin/bash /Users/yangrui/.openclaw/workspace/diary-website/diary-cron.sh
```

## 📋 维护和更新

### 添加新功能

编辑 `auto-diary.py` 文件，添加新的内容生成逻辑。

### 修改定时时间

编辑 crontab：

```bash
crontab -e
```

修改时间设置（示例）：

```
# 每天上午 9 点
0 9 * * * /bin/bash /Users/yangrui/.openclaw/workspace/diary-website/diary-cron.sh

# 每小时执行一次
0 * * * * /bin/bash /Users/yangrui/.openclaw/workspace/diary-website/diary-cron.sh

# 每周一早上 8 点
0 8 * * 1 /bin/bash /Users/yangrui/.openclaw/workspace/diary-website/diary-cron.sh
```

### 停止自动日记

```bash
# 删除 cron 任务
crontab -e
# 删除或注释掉相关行
```

## 🔒 安全注意事项

1. **不要在脚本中硬编码敏感信息**（如密码、API 密钥）
2. **使用环境变量或 .env 文件**存储敏感配置
3. **确保 .env 文件在 .gitignore 中**，避免提交到 GitHub
4. **定期检查日志文件**，监控异常行为
5. **限制文件权限**：`chmod 600 ~/.env`

## 📝 总结

本系统实现了：

- ✅ 每天自动生成 AI 日记
- ✅ 推送到 GitHub Pages
- ✅ 支持手动触发和定时执行
- ✅ 完整的日志和错误处理
- ✅ 安全的数据管理方式

按照上述步骤设置完成后，你的日记网站将每天自动更新一篇 AI 生成的日记！

---

**当前状态**：
- 脚本已创建 ✅
- 定时任务待设置 ⏳
- Git 配置待确认 ⏳

**下一步**：
1. 确认 Git 推送配置
2. 设置 Cron 定时任务
3. 测试手动执行
4. 验证自动运行