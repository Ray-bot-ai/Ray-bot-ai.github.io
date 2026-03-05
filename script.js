/**
 * 我的公开日记 - 主脚本
 * 从 JSON 文件加载日记内容并渲染
 */

// ===== 配置 =====
const CONFIG = {
    dataUrl: './entries.json',
    dateFormat: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    },
    timeFormat: {
        hour: '2-digit',
        minute: '2-digit'
    },
    cacheTimeout: 5 * 60 * 1000 // 5分钟缓存
};

// ===== 状态管理 =====
const State = {
    entries: [],
    lastFetch: null,
    isLoading: false
};

// ===== DOM 元素 =====
const elements = {
    diaryList: document.getElementById('diaryList'),
    yearSpan: document.getElementById('year')
};

// ===== 日期格式化工具 =====
const DateFormatter = {
    // 格式化为显示格式
    formatForDisplay(isoString) {
        const date = new Date(isoString);
        const dateStr = date.toLocaleDateString('zh-CN', CONFIG.dateFormat);
        const timeStr = date.toLocaleTimeString('zh-CN', CONFIG.timeFormat);
        return {
            full: `${dateStr} ${timeStr}`,
            date: dateStr,
            time: timeStr,
            weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' })
        };
    },

    // 获取相对时间描述
    getRelativeTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;
        return null;
    }
};

// ===== 数据加载 =====
const DataLoader = {
    // 从 JSON 文件加载日记
    async loadEntries() {
        // 检查缓存
        if (State.entries.length > 0 && State.lastFetch) {
            const now = Date.now();
            if (now - State.lastFetch < CONFIG.cacheTimeout) {
                console.log('使用缓存的日记数据');
                return State.entries;
            }
        }

        State.isLoading = true;
        this.renderLoading();

        try {
            // 添加时间戳防止缓存
            const url = `${CONFIG.dataUrl}?t=${Date.now()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const entries = await response.json();
            
            // 验证数据格式
            if (!Array.isArray(entries)) {
                throw new Error('Invalid data format: expected array');
            }
            
            // 按日期降序排序（最新的在前）
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // 更新状态
            State.entries = entries;
            State.lastFetch = Date.now();
            
            console.log(`成功加载 ${entries.length} 篇日记`);
            return entries;
            
        } catch (error) {
            console.error('加载日记失败:', error);
            this.renderError(error.message);
            return [];
        } finally {
            State.isLoading = false;
        }
    },

    // 渲染加载中状态
    renderLoading() {
        elements.diaryList.innerHTML = `
            <div class="loading">
                <span class="loading-spinner"></span>
                <p>正在加载日记...</p>
            </div>
        `;
    },

    // 渲染错误状态
    renderError(message) {
        elements.diaryList.innerHTML = `
            <div class="error">
                <p class="error-icon">⚠️</p>
                <p class="error-message">加载失败</p>
                <p class="error-detail">${message}</p>
                <button class="btn-retry" onclick="location.reload()">重新加载</button>
            </div>
        `;
    }
};

// ===== 日记渲染器 =====
const DiaryRenderer = {
    // 渲染所有日记
    render(entries) {
        if (entries.length === 0) {
            this.renderEmpty();
            return;
        }

        elements.diaryList.innerHTML = entries.map(entry => 
            this.renderEntry(entry)
        ).join('');
    },

    // 渲染单条日记
    renderEntry(entry) {
        const dateInfo = DateFormatter.formatForDisplay(entry.date);
        const relativeTime = DateFormatter.getRelativeTime(entry.date);
        
        return `
            <article class="diary-entry" data-id="${entry.id}">
                <header class="entry-header">
                    <div class="entry-date">
                        <span class="entry-date-main">${dateInfo.date}</span>
                        <span class="entry-date-time">${dateInfo.time} · ${relativeTime || dateInfo.weekday}</span>
                    </div>
                    <span class="entry-weekday">${dateInfo.weekday}</span>
                </header>
                <div class="entry-content">${this.escapeHtml(entry.content)}</div>
            </article>
        `;
    },

    // 渲染空状态
    renderEmpty() {
        elements.diaryList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p class="empty-state-text">还没有日记</p>
                <p class="empty-state-hint">在 entries.json 中添加你的第一篇日记吧</p>
            </div>
        `;
    },

    // HTML 转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ===== 初始化应用 =====
async function initApp() {
    // 设置年份
    elements.yearSpan.textContent = new Date().getFullYear();
    
    // 加载并渲染日记
    const entries = await DataLoader.loadEntries();
    DiaryRenderer.render(entries);
    
    console.log('📔 我的公开日记 - 已加载');
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);

// ===== 刷新功能（供开发使用）=====
window.refreshDiary = async function() {
    State.lastFetch = null;
    const entries = await DataLoader.loadEntries();
    DiaryRenderer.render(entries);
};
