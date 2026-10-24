// DOM Elements
const valServer = document.getElementById('valServer');
const valPlatform = document.getElementById('valPlatform');
const valDb = document.getElementById('valDb');
const valDbLatency = document.getElementById('valDbLatency');
const dbDot = document.getElementById('dbDot');
const valCount = document.getElementById('valCount');
const listCounter = document.getElementById('listCounter');
const notesContainer = document.getElementById('notesContainer');
const noteForm = document.getElementById('noteForm');
const btnSubmit = document.getElementById('btnSubmit');
const btnRefresh = document.getElementById('btnRefresh');
const toast = document.getElementById('toast');

// Show notification toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// 1. Fetch System & Database Status
async function checkStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    if (data.server === 'Online') {
      valServer.textContent = 'Hoạt động';
      valPlatform.textContent = `Uptime: ${data.system.uptimeSeconds}s • Node ${data.system.nodeVersion}`;
    }

    if (data.database.status === 'Connected') {
      valDb.textContent = 'Đã kết nối';
      valDbLatency.textContent = `Độ trễ: ${data.database.latencyMs} ms`;
      dbDot.className = 'indicator-dot online';
    } else {
      valDb.textContent = 'Lỗi kết nối';
      valDbLatency.textContent = data.database.status;
      dbDot.className = 'indicator-dot offline';
    }
  } catch (err) {
    valServer.textContent = 'Mất kết nối';
    valDb.textContent = 'Không có phản hồi';
    dbDot.className = 'indicator-dot offline';
  }
}

// 2. Fetch and Render Notes
async function loadNotes() {
  notesContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu từ PostgreSQL...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/notes');
    if (!res.ok) throw new Error('Không thể lấy danh sách ghi chú');
    const notes = await res.json();

    valCount.textContent = notes.length;
    listCounter.textContent = `${notes.length} ghi chú`;

    if (notes.length === 0) {
      notesContainer.innerHTML = `
        <div class="empty-state">
          <p>Chưa có ghi chú nào trong Database.</p>
          <p style="font-size: 12px; margin-top: 6px;">Hãy thêm ghi chú đầu tiên ở form bên cạnh!</p>
        </div>
      `;
      return;
    }

    notesContainer.innerHTML = notes.map(note => `
      <div class="note-item" data-id="${note.id}">
        <div class="note-header">
          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <button class="btn-delete" onclick="deleteNote(${note.id})" title="Xóa ghi chú">🗑️</button>
        </div>
        ${note.content ? `<p class="note-content">${escapeHtml(note.content)}</p>` : ''}
        <span class="note-date">🕒 ${new Date(note.created_at).toLocaleString('vi-VN')}</span>
      </div>
    `).join('');
  } catch (err) {
    notesContainer.innerHTML = `
      <div class="empty-state" style="color: #ef4444;">
        <p>⚠️ Lỗi tải dữ liệu: ${err.message}</p>
      </div>
    `;
  }
}

// 3. Add Note Submit Handler
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title) return;

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="btn-text">⏳ Đang lưu...</span>';

  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Lỗi khi lưu');
    }

    titleInput.value = '';
    contentInput.value = '';
    showToast('✅ Đã lưu ghi chú vào Supabase thành công!');
    await loadNotes();
    await checkStatus();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<span class="btn-text">💾 Lưu vào Database</span>';
  }
});

// 4. Delete Note Handler
async function deleteNote(id) {
  if (!confirm('Bạn có chắc muốn xóa ghi chú này khỏi Database?')) return;

  try {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa ghi chú');
    showToast('🗑️ Đã xóa ghi chú thành công!');
    await loadNotes();
    await checkStatus();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

// Escape HTML utility to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Refresh button listener
btnRefresh.addEventListener('click', () => {
  checkStatus();
  loadNotes();
  showToast('🔄 Đã làm mới dữ liệu!');
});

// Initial boot
checkStatus();
loadNotes();
// Periodically refresh status every 20s
setInterval(checkStatus, 20000);
