#!/bin/bash
# 自动日记生成脚本
# 由 cron 每天调用

DIARY_DIR="/Users/yangrui/.openclaw/workspace/diary-website"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)

echo "=== 自动日记生成 ==="
echo "日期: $DATE"
echo "时间: $TIME"
echo ""

# 检查是否需要生成日记
# 可以添加逻辑：如果今天已经生成过，则跳过

# 方案1: 如果配置了 AI API 密钥，直接调用生成
if [ -f "$DIARY_DIR/.env" ]; then
    echo "检测到 API 配置，尝试自动生成..."
    source "$DIARY_DIR/.env"
    python3 "$DIARY_DIR/auto-diary.py"
fi

# 方案2: 发送通知给主 AI 会话，请求生成内容
echo ""
echo "发送生成请求..."
# 这里可以添加通知逻辑，例如：
# - 写入特定的通知文件
# - 发送消息到某个通道
# - 触发 webhook

echo "完成！"
echo ""
echo "提示: 如果需要手动生成日记，可以："
echo "1. 直接编辑 entries.json 文件"
echo "2. 使用日记管理脚本"
echo "3. 通过聊天界面请求生成"
