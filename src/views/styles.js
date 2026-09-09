export const dashboardStyles = `
:root {
  --bg-body: #f1f5f9;
  --bg-main: #f8fafc;
  --bg-sidebar: #ffffff;
  --bg-topbar: #ffffff;
  --bg-card: #ffffff;
  --bg-input: #f8fafc;
  --bg-drawer: #ffffff;
  --bg-dialog: #ffffff;
  --border-color: #e2e8f0;
  --border-input: #cbd5e1;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --text-title: #0f172a;
  --text-label: #334155;
  --code-color: #0284c7;
  --hover-bg: #f1f5f9;
  --shadow-card: rgba(0, 0, 0, 0.06);
  --shadow-modal: rgba(0, 0, 0, 0.15);
  --toast-bg: #ffffff;
  --toast-text: #0f172a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-body);
  color: var(--text-main);
  height: 100vh;
  overflow: hidden;
  display: flex;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* 左侧侧边栏导航 */
.sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 100;
}
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.sidebar-backdrop.active {
  display: block;
  opacity: 1;
  visibility: visible;
}
.sidebar-close-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}
.mobile-menu-btn {
  display: none;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
.mobile-menu-btn span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text-title);
  border-radius: 2px;
}
.sidebar-header {
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}
.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #0284c7;
}
.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-item:hover {
  background: var(--hover-bg);
  color: var(--text-title);
}
.nav-item.active {
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}
.nav-icon {
  font-size: 17px;
}
.nav-section-title {
  padding: 8px 12px 2px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}
.nav-section-divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 4px;
}
.nav-badge-pill {
  font-size: 10px;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}
.badge-success-pill {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #059669 !important;
}
.badge-danger-pill {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #dc2626 !important;
}
.nav-item.active .badge-success-pill,
.nav-item.active .badge-danger-pill {
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}
.quick-add-bar {
  display: flex;
  align-items: center;
  margin: 14px 0 16px 0;
  gap: 10px;
}
.quick-add-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}
.quick-add-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 2;
  user-select: none;
}
.quick-add-wrap .form-input {
  padding-left: 36px !important;
  height: 38px;
}
.batch-editor-panel {
  background: var(--bg-main, #f8fafc);
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 8px;
  padding: 14px;
  margin: 12px 0 16px 0;
  animation: fadeIn 0.2s ease;
}
.nav-badge-tag {
  font-size: 10px;
  background: var(--card-bg, #f1f5f9);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  line-height: 1;
}
.badge-global-tip {
  font-size: 11px;
  background: rgba(2, 132, 199, 0.1);
  border: 1px solid rgba(2, 132, 199, 0.25);
  color: #0284c7;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: var(--hover-bg);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: var(--border-color);
  color: var(--text-title);
}

/* 右侧主工作区 */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-main);
  transition: background-color 0.25s ease;
}
.topbar {
  height: 64px;
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-topbar);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.topbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-title);
}
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}
.badge-session {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  border: 1px solid rgba(2, 132, 199, 0.25);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  cursor: default;
  transition: all 0.2s;
}
.badge-session:hover {
  background: rgba(2, 132, 199, 0.18);
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #10b989;
  border-radius: 50%;
  box-shadow: 0 0 6px #10b989;
}



.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.tab-content {
  display: none;
  width: 100%;
  max-width: 100%;
}
.tab-content.active {
  display: block;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 卡片规范 */
.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px var(--shadow-card);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.ip-management-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.ip-management-grid .section-card {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}
.ip-management-grid .section-card .form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ip-management-grid .section-card .form-textarea {
  flex: 1;
}
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}
.config-grid .section-card {
  margin-bottom: 0;
}
@media (max-width: 860px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
}
.section-header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.section-footer-actions {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}
.section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.5;
}
code {
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  background: var(--hover-bg);
  color: var(--code-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-color);
}

/* 表单与输入框 */
.form-label {
  font-size: 13px;
  color: var(--text-label);
  margin-bottom: 8px;
  display: block;
  font-weight: 500;
}
.form-input,
input[type="text"]:not(.copy-input):not(.filter-input):not(.table-checkbox),
input[type="password"],
input[type="number"] {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.25s ease;
  box-sizing: border-box;
}
.form-input:focus,
input[type="text"]:not(.copy-input):not(.filter-input):not(.table-checkbox):focus,
input[type="password"]:focus,
input[type="number"]:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
  background: var(--bg-card);
}
.form-input::placeholder,
input::placeholder {
  color: var(--text-muted);
  font-size: 13px;
}
.form-input:disabled,
input:disabled {
  background: var(--hover-bg);
  cursor: not-allowed;
  opacity: 0.7;
}
.form-textarea {
  width: 100%;
  min-height: 120px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--code-color);
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  outline: none;
  resize: vertical;
  line-height: 1.6;
  margin-bottom: 12px;
  transition: background-color 0.25s ease, border-color 0.2s;
}
.form-textarea:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
}
.copy-box {
  display: flex;
  gap: 10px;
}
.copy-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--code-color);
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  outline: none;
  transition: background-color 0.25s ease, border-color 0.2s;
}
.copy-input:focus { border-color: #0284c7; }

/* 按钮规范 */
.btn-action {
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  height: 38px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-action:hover { background: #0369a1; }
.btn-success { background: #059669; }
.btn-success:hover { background: #047857; }
.btn-danger {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}
.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}
.btn-secondary { background: var(--hover-bg); color: var(--text-main); border: 1px solid var(--border-color); }
.btn-secondary:hover { background: var(--border-color); }
.btn-purple { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.btn-purple:hover { background: #ede9fe; color: #6d28d9; border-color: #c4b5fd; }

/* 数据表格规范 */
.table-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}
.table-container::-webkit-scrollbar {
  height: 6px;
}
.table-container::-webkit-scrollbar-track {
  background: var(--bg-input);
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb {
  background: var(--border-input);
  border-radius: 4px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}
.data-table th {
  background: var(--bg-input);
  color: var(--text-muted);
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  vertical-align: middle;
}
.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  white-space: nowrap;
  min-width: max-content;
}
.node-count-badge {
  background: var(--hover-bg);
  color: var(--code-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid var(--border-color);
  display: inline-block;
  white-space: nowrap;
}
.badge-limit {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}
.badge-unlimited {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}
.badge-success {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}
.badge-danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}
.badge-warning {
  background: #fffbeb;
  color: #d97706;
  border-color: #fde68a;
}

/* 批量操作工具栏 */
.batch-toolbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 14px;
  animation: fadeIn 0.2s ease;
}
.batch-toolbar.active {
  display: flex;
}
.batch-toolbar-info {
  font-size: 13px;
  font-weight: 600;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.batch-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox-cell {
  width: 42px;
  text-align: center;
  padding: 12px 8px !important;
}
.table-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #0284c7;
  vertical-align: middle;
}

/* 日志多条件筛选工具栏 */
.logs-filter-toolbar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.logs-filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.filter-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 220px;
  flex: 1;
  max-width: 320px;
}
.filter-icon {
  position: absolute;
  left: 10px;
  font-size: 13px;
  color: var(--text-muted);
  pointer-events: none;
}
.filter-input {
  width: 100%;
  height: 34px;
  padding: 0 28px 0 30px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-title);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.filter-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
  background: var(--bg-card);
}
.filter-clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}
.filter-clear-btn:hover {
  color: var(--text-title);
}
.filter-select {
  height: 34px;
  padding: 0 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-title);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.filter-select:focus {
  border-color: #0284c7;
}
.filter-reset-btn {
  height: 34px;
  font-size: 12px;
  padding: 0 12px;
}
.logs-filter-summary {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
@media (max-width: 768px) {
  .logs-filter-group {
    width: 100%;
  }
  .filter-input-wrap {
    max-width: 100%;
    min-width: 100%;
  }
  .filter-select {
    flex: 1;
    min-width: 130px;
  }
  .logs-filter-summary {
    width: 100%;
    text-align: right;
  }
}

/* 统一分页控制器样式 */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-input);
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-muted);
  gap: 12px;
  flex-wrap: wrap;
}
.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pagination-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 34px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.pagination-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #0284c7;
  color: #0284c7;
}
.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}
.pagination-btn.active {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35);
}
.pagination-select {
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  color: var(--text-main);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  height: 32px;
  outline: none;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pagination-select:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
}

/* 抽屉式侧拉弹窗样式 (从右边推拉滑出) */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  display: flex;
  justify-content: flex-end;
}
.drawer-overlay.active {
  opacity: 1;
  visibility: visible;
}
.drawer-content {
  background: var(--bg-drawer);
  border-left: 1px solid var(--border-color);
  width: 50%;
  min-width: 480px;
  max-width: 90vw;
  height: 100vh;
  box-shadow: -10px 0 30px var(--shadow-modal);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .drawer-content {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }
}
.drawer-overlay.active .drawer-content {
  transform: translateX(0);
}
.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-title);
}
.drawer-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}
.drawer-close:hover { color: var(--text-title); }
.drawer-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--bg-sidebar);
}
.form-field {
  margin-bottom: 20px;
}
.form-field label {
  display: block;
  font-size: 13px;
  color: var(--text-label);
  margin-bottom: 8px;
  font-weight: 500;
}
.form-field input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background-color 0.25s ease;
}
.form-field input:focus { border-color: #0284c7; }

/* 全局自定义 Toast 消息提示 */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  min-width: 280px;
  max-width: 420px;
  background: var(--toast-bg);
  border: 1px solid var(--border-color);
  color: var(--toast-text);
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.3s ease;
}
.toast-item.toast-success {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}
.toast-item.toast-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}
.toast-item.toast-info {
  background: #f0f9ff;
  color: #075985;
  border-color: #bae6fd;
}
@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes fadeOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
}

/* 全局自定义确认/删除/警告对话框 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
.dialog-overlay.active {
  opacity: 1;
  visibility: visible;
}
.dialog-box {
  background: var(--bg-dialog);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  width: 100%;
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 20px 40px var(--shadow-modal);
  transform: scale(0.92);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
}
.dialog-overlay.active .dialog-box {
  transform: scale(1);
}
.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.dialog-icon {
  font-size: 24px;
  line-height: 1;
}
.dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-title);
}
.dialog-message {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 22px;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.dialog-box-large {
  max-width: 680px;
}
.test-result-box {
  width: 100%;
  min-height: 220px;
  max-height: 380px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--code-color);
  font-family: "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
}

/* ========================================================= */
/* 📱 响应式断点适配：平板 & 手机端优化 (Pad & Mobile)      */
/* ========================================================= */
@media (max-width: 1080px) {
  .ip-management-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 900px) {
  body {
    position: relative;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 260px;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
    transform: translateX(-100%);
  }
  .sidebar.active {
    transform: translateX(0);
  }
  .sidebar-close-btn {
    display: block;
  }
  .mobile-menu-btn {
    display: inline-flex;
  }
  .topbar {
    padding: 0 14px;
  }
  .topbar-title {
    font-size: 15px;
  }
  .content-area {
    padding: 14px;
  }
  .section-card {
    padding: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  input[type="text"],
  input[type="password"],
  input[type="number"],
  textarea,
  select {
    font-size: 16px !important;
  }
}

@media (max-width: 640px) {
  .topbar {
    height: 56px;
  }
  .badge-status span:last-child {
    display: none;
  }
  .badge-status {
    padding: 4px 6px;
  }
  .copy-box {
    flex-direction: column;
    gap: 8px;
  }
  .copy-box .btn-action {
    width: 100%;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .section-header .btn-action {
    width: 100%;
  }
  .section-header-actions,
  .section-footer-actions {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
  .section-header-actions .btn-action,
  .section-footer-actions .btn-action {
    width: 100%;
  }

  /* 📱 移动端表格深度转换为原生 App 卡片流视图 (Card View) */
  .table-container {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
  }
  .data-table {
    display: block !important;
    width: 100% !important;
  }
  .data-table thead {
    display: none !important; /* 手机端隐藏表格表头 */
  }
  .data-table tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }
  
  /* 空数据卡片状态 */
  .data-table tbody tr:has(td[colspan]) {
    display: block !important;
    background: var(--bg-card);
    border: 1px dashed var(--border-color);
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
  }
  .data-table tbody tr td[colspan] {
    display: block !important;
    padding: 0 !important;
    border: none !important;
    text-align: center !important;
  }

  /* 📦 普通订阅 & ⚡ CF优选订阅 手机端卡片规范 */
  .data-table tbody tr.plain-table-row,
  .data-table tbody tr.cf-table-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 14px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
    position: relative !important;
  }
  .data-table tbody tr.plain-table-row td,
  .data-table tbody tr.cf-table-row td {
    display: flex !important;
    width: 100% !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
  }
  /* 卡片第1行：复选框 (第1列) 与 订阅名称 (第4列) 水平对齐 */
  .data-table tbody tr.plain-table-row td:nth-child(1),
  .data-table tbody tr.cf-table-row td:nth-child(1) {
    order: 1 !important;
    width: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    margin-right: 8px !important;
  }
  .data-table tbody tr.plain-table-row td:nth-child(4),
  .data-table tbody tr.cf-table-row td:nth-child(4) {
    order: 1 !important;
    flex: 1 !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    color: var(--text-title) !important;
    display: flex !important;
    align-items: center !important;
  }
  /* 卡片第2行：访问限制徽章 (第3列) */
  .data-table tbody tr.plain-table-row td:nth-child(3),
  .data-table tbody tr.cf-table-row td:nth-child(3) {
    order: 2 !important;
  }
  /* 卡片第3行：直连订阅链接输入框与复制 (第2列) */
  .data-table tbody tr.plain-table-row td:nth-child(2),
  .data-table tbody tr.cf-table-row td:nth-child(2) {
    order: 3 !important;
    width: 100% !important;
  }
  .data-table .copy-box {
    display: flex !important;
    flex-direction: row !important;
    gap: 6px !important;
    width: 100% !important;
  }
  .data-table .copy-box .copy-input {
    flex: 1 !important;
    font-size: 12px !important;
    padding: 6px 10px !important;
    height: 34px !important;
    background: var(--bg-input) !important;
  }
  .data-table .copy-box .btn-action {
    width: auto !important;
    height: 34px !important;
    font-size: 12px !important;
    padding: 0 12px !important;
    flex-shrink: 0 !important;
  }
  /* 卡片第4行：操作栏 (第5列) */
  .data-table tbody tr.plain-table-row td:nth-child(5),
  .data-table tbody tr.cf-table-row td:nth-child(5) {
    order: 4 !important;
    width: 100% !important;
    border-top: 1px solid var(--border-color) !important;
    padding-top: 10px !important;
    margin-top: 2px !important;
  }
  .data-table tbody tr.plain-table-row .table-actions,
  .data-table tbody tr.cf-table-row .table-actions {
    width: 100% !important;
    display: flex !important;
    gap: 8px !important;
    justify-content: flex-end !important;
  }
  .data-table tbody tr.plain-table-row .table-actions .btn-action,
  .data-table tbody tr.cf-table-row .table-actions .btn-action {
    flex: 1 !important;
    height: 34px !important;
    font-size: 12px !important;
    padding: 0 10px !important;
    justify-content: center !important;
  }

  /* 📊 访问日志 手机端卡片规范 */
  .data-table tbody tr.logs-table-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 14px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  }
  .data-table tbody tr.logs-table-row td {
    display: flex !important;
    width: 100% !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
  }
  /* 第一行：勾选框(第1列)、时间(第2列)与状态(第4列) */
  .data-table tbody tr.logs-table-row td:nth-child(1) {
    order: 1 !important;
    width: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    margin-right: 6px !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(2) {
    order: 1 !important;
    flex: 1 !important;
    font-size: 12px !important;
    color: var(--text-muted) !important;
    align-items: center !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(4) {
    order: 1 !important;
    width: auto !important;
    display: flex !important;
    align-items: center !important;
  }
  /* 第二行：IP 与 地理位置 (第3列) */
  .data-table tbody tr.logs-table-row td:nth-child(3) {
    order: 2 !important;
  }
  /* 第三行：请求路径与类型 (第5列) */
  .data-table tbody tr.logs-table-row td:nth-child(5) {
    order: 3 !important;
    background: var(--bg-input) !important;
    padding: 8px 10px !important;
    border-radius: 6px !important;
  }
  /* 第四行：User-Agent (第6列) */
  .data-table tbody tr.logs-table-row td:nth-child(6) {
    order: 4 !important;
    font-size: 11px !important;
    color: var(--text-muted) !important;
    word-break: break-all !important;
    white-space: normal !important;
  }
  /* 第五行：快捷操作按钮组 (第7列) */
  .data-table tbody tr.logs-table-row td:nth-child(7) {
    order: 5 !important;
    width: 100% !important;
    border-top: 1px solid var(--border-color) !important;
    padding-top: 10px !important;
    margin-top: 2px !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(7) > div {
    width: 100% !important;
    display: flex !important;
    gap: 8px !important;
  }
  .data-table tbody tr.logs-table-row td:nth-child(7) .btn-action {
    flex: 1 !important;
    height: 34px !important;
    font-size: 12px !important;
    justify-content: center !important;
  }

  /* 📱 移动端分页器紧凑自适应排版 */
  .table-pagination {
    padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    margin-top: 12px;
  }
  .pagination-info {
    width: 100%;
    justify-content: space-between;
    font-size: 12px;
  }
  .pagination-select {
    font-size: 12px;
    padding: 4px 8px;
    height: 32px;
  }
  .pagination-controls {
    width: 100%;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .pagination-btn {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
    padding: 0 8px;
  }

  .drawer-header {
    padding: 16px 18px;
  }
  .drawer-body {
    padding: 16px 18px;
  }
  .drawer-footer {
    padding: 14px 18px;
    flex-wrap: wrap;
  }
  .drawer-footer .btn-action {
    flex: 1;
    min-width: 100px;
  }
  .toast-container {
    left: 16px;
    right: 16px;
    top: 16px;
  }
  .toast-item {
    min-width: unset;
    max-width: 100%;
  }
  .dialog-box {
    padding: 18px;
  }
}
`;
