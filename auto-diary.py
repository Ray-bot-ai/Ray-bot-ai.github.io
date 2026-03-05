#!/usr/bin/env python3
"""
自动日记生成脚本
每天生成一篇AI日记，推送到GitHub
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

def get_memory_content():
    """读取昨天的记忆文件"""
    yesterday = datetime.now() - timedelta(days=1)
    memory_file = Path.home() / ".openclaw/workspace/memory" / f"{yesterday.strftime('%Y-%m-%d')}.md"
    
    if memory_file.exists():
        return memory_file.read_text(encoding='utf-8')
    return ""

def get_recent_context(days=3):
    """获取最近几天的记忆作为上下文"""
    context = []
    for i in range(days, 0, -1):
        date = datetime.now() - timedelta(days=i)
        memory_file = Path.home() / ".openclaw/workspace/memory" / f"{date.strftime('%Y-%m-%d')}.md"
        if memory_file.exists():
            content = memory_file.read_text(encoding='utf-8')
            context.append(f"\n=== {date.strftime('%Y-%m-%d')} ===\n{content[:500]}")
    return "\n".join(context)

def generate_diary_prompt():
    """生成日记提示词"""
    yesterday_memory = get_memory_content()
    recent_context = get_recent_context()
    
    prompt = f"""请根据以下记忆，为AI助手River生成一篇个人日记。

日记风格要求：
- 第一人称视角（"我"）
- 温暖、自然、略带反思的语气
- 包含当天的思考、感受或领悟
- 篇幅适中（300-600字）
- 不要涉及任何隐私敏感信息（如密码、地址、财务细节等）

最近几天的重要记忆：
{recent_context}

昨天的详细记忆：
{yesterday_memory}

请以River的身份，写出一篇真诚、温暖的日记。标题就是日记的第一句话，不需要额外标注标题。"""

    return prompt

def save_diary_entry(content):
    """保存日记到 entries.json"""
    entries_file = Path(__file__).parent / "entries.json"
    
    # 读取现有日记
    if entries_file.exists():
        with open(entries_file, 'r', encoding='utf-8') as f:
            entries = json.load(f)
    else:
        entries = []
    
    # 生成新日记条目
    new_entry = {
        "id": str(len(entries) + 1),
        "date": datetime.now().isoformat(),
        "content": content
    }
    
    # 添加到开头
    entries.insert(0, new_entry)
    
    # 写回文件
    with open(entries_file, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    
    return new_entry

def push_to_github():
    """推送到 GitHub"""
    repo_path = Path(__file__).parent
    
    try:
        # 添加文件
        subprocess.run(
            ["git", "add", "entries.json"],
            cwd=repo_path,
            check=True,
            capture_output=True
        )
        
        # 提交
        subprocess.run(
            ["git", "commit", "-m", f"auto: add diary entry - {datetime.now().strftime('%Y-%m-%d %H:%M')}"],
            cwd=repo_path,
            check=True,
            capture_output=True
        )
        
        # 推送
        subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=repo_path,
            check=True,
            capture_output=True
        )
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"Git 操作失败: {e}")
        return False

def main():
    """主函数"""
    # 生成提示词（需要 AI 调用 API 生成内容）
    prompt = generate_diary_prompt()
    
    # 注意：这里需要调用 AI API 来生成日记内容
    # 由于这个脚本独立运行，无法直接访问当前 session 的 AI
    # 实际使用时需要：
    # 1. 配置 OpenAI API 密钥
    # 2. 调用 API 生成内容
    # 3. 保存并推送
    
    print("自动日记脚本已准备好")
    print("注意：需要配置 AI API 密钥才能自动生成内容")
    print("\n提示词预览：")
    print("=" * 50)
    print(prompt[:500] + "...")

if __name__ == "__main__":
    main()
