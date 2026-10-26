import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Server,
  Database,
  QrCode,
  Mail,
  Activity,
  ShieldCheck,
  Terminal,
  Globe,
  AlertCircle
} from 'lucide-react';

export default function AdminDocsTab({ onToast }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onToast) onToast(`Đã sao chép: ${label}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="admin-tab-pane">
      {/* 1. Quick Info Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 600 }}>Tên miền Hoạt động</span>
            <Globe size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            shopchychy.foo.ng
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <a
              href="https://shopchychy.foo.ng"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Mở website</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => copyToClipboard('https://shopchychy.foo.ng', 'domain', 'Tên miền chính')}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              title="Sao chép link"
            >
              {copiedKey === 'domain' ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 600 }}>Máy chủ Render.com</span>
            <Server size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            srv-dbe83css728c73bbh7g0
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <a
              href="https://dashboard.render.com/web/srv-dbe83css728c73bbh7g0"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Dashboard Render</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => copyToClipboard('rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE', 'apikey', 'Render API Key')}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              title="Sao chép Render API Key"
            >
              {copiedKey === 'apikey' ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
              <span style={{ marginLeft: '4px', fontSize: '0.72rem' }}>Copy API Key</span>
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 600 }}>Supabase Database</span>
            <Database size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            PostgreSQL (Pooler 6543)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <a
              href="https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Dashboard Supabase</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => copyToClipboard('postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', 'dburl', 'DATABASE_URL')}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              title="Sao chép DATABASE_URL"
            >
              {copiedKey === 'dburl' ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
              <span style={{ marginLeft: '4px', fontSize: '0.72rem' }}>Copy DB URL</span>
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 600 }}>Giữ Server 24/7 (Keep-Alive)</span>
            <Activity size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            GET /api/health
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <a
              href="https://shopchychy.foo.ng/api/health"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Test Ping</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => copyToClipboard('https://shopchychy.foo.ng/api/health', 'healthurl', 'URL Healthcheck')}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              title="Sao chép Health URL"
            >
              {copiedKey === 'healthurl' ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
              <span style={{ marginLeft: '4px', fontSize: '0.72rem' }}>Copy URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Detailed Setup Instructions Guide */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Step 1: Keep-Alive UptimeRobot */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              1
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Giữ Máy Chủ Render 24/7 Không Bị Ngủ Đông (Keep-Alive)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Khắc phục tình trạng gói Free của Render bị ngủ sau 15 phút không có người truy cập
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '44px' }}>
            <p style={{ marginBottom: '12px' }}>
              Render gói miễn phí sẽ tự động tắt máy chủ nếu không có lượt truy cập nào sau 15 phút. Bạn chỉ cần cài đặt công cụ giám sát miễn phí để gửi request định kỳ:
            </p>

            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                Đăng ký tài khoản miễn phí tại: <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>uptimerobot.com</a>.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Bấm <strong>+ Add New Monitor</strong> và chọn loại <strong>HTTP(s)</strong>.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Điền URL kiểm tra: <code style={{ background: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>https://shopchychy.foo.ng/api/health</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                Chọn tần suất kiểm tra (Monitoring Interval): <strong>5 minutes</strong> (mỗi 5 phút một lần).
              </li>
              <li>Bấm <strong>Create Monitor</strong> hoàn tất. Website của bạn sẽ luôn mở tức thì dưới 1 giây!</li>
            </ol>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Endpoint Healthcheck trả về JSON:</span>
                <code style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>https://shopchychy.foo.ng/api/health</code>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => copyToClipboard('https://shopchychy.foo.ng/api/health', 'health_block', 'URL Healthcheck')}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                {copiedKey === 'health_block' ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                <span style={{ marginLeft: '4px' }}>Sao chép</span>
              </button>
            </div>
          </div>
        </section>

        {/* Step 2: VietQR & Banking Webhooks */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(15, 118, 110, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              2
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Cấu hình Tài khoản Ngân hàng VietQR &amp; Webhook Tự động
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tự động gạch nợ đơn hàng và xác nhận thanh toán sau 2 giây khi khách chuyển khoản
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '44px' }}>
            <p style={{ marginBottom: '12px' }}>
              Khách hàng quét mã VietQR chuẩn NAPAS 24/7 trực tiếp trên hóa đơn. Để kết nối số tài khoản ngân hàng của chủ shop:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>1. Thiết lập trong tab "Thương hiệu &amp; Ngân hàng"</span>
                <span>Chuyển sang tab <strong>Thương hiệu &amp; Ngân hàng</strong> ở thanh bên trái, nhập Số tài khoản, Tên chủ tài khoản và chọn Ngân hàng nhận tiền.</span>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>2. Cài đặt Webhook (SePay / Casso)</span>
                <span>Đăng ký tại <a href="https://sepay.vn" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>sepay.vn</a> và dán URL Webhook bên dưới để hệ thống tự động gạch nợ.</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Địa chỉ Webhook Ngân hàng (SePay / Casso / MBBank):</span>
                <code style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>https://shopchychy.foo.ng/api/webhooks/vietqr</code>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => copyToClipboard('https://shopchychy.foo.ng/api/webhooks/vietqr', 'webhook_url', 'URL Webhook')}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                {copiedKey === 'webhook_url' ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                <span style={{ marginLeft: '4px' }}>Sao chép</span>
              </button>
            </div>
          </div>
        </section>

        {/* Step 3: Transactional Email Setup */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              3
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Cấu hình Email Giao dịch Thật (Gmail SMTP / SendGrid)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tự động gửi email xác nhận đặt hàng, biên lai thanh toán và mã vận đơn cho người mua
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '44px' }}>
            <p style={{ marginBottom: '12px' }}>
              Trong môi trường thử nghiệm, hệ thống tự động lưu trữ và cung cấp link xem trước Ethereal. Để gửi vào hòm thư thật của khách hàng qua Gmail:
            </p>

            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '6px' }}>Bật xác thực 2 bước (2-Step Verification) trên tài khoản Google của bạn.</li>
              <li style={{ marginBottom: '6px' }}>Vào mục <strong>Bảo mật &gt; Mật khẩu ứng dụng (App Passwords)</strong> và tạo một mật khẩu 16 chữ số mới.</li>
              <li style={{ marginBottom: '6px' }}>Vào Render Dashboard &gt; <strong>Environment</strong> của dịch vụ, thêm các biến:</li>
            </ol>

            <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-glass)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.7 }}>
              <div><strong style={{ color: 'var(--accent-cyan)' }}>SMTP_HOST</strong>=smtp.gmail.com</div>
              <div><strong style={{ color: 'var(--accent-cyan)' }}>SMTP_PORT</strong>=587</div>
              <div><strong style={{ color: 'var(--accent-cyan)' }}>SMTP_USER</strong>=email_cua_ban@gmail.com</div>
              <div><strong style={{ color: 'var(--accent-cyan)' }}>SMTP_PASS</strong>=xxxx xxxx xxxx xxxx <span style={{ color: 'var(--text-dim)' }}>(Mật khẩu ứng dụng 16 số)</span></div>
              <div><strong style={{ color: 'var(--accent-cyan)' }}>SMTP_FROM</strong>="ATELIER &amp; CO." &lt;email_cua_ban@gmail.com&gt;</div>
            </div>
          </div>
        </section>

        {/* Step 4: Render API & Manual Deployments */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(21, 128, 61, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              4
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Quy trình Triển khai Tự động &amp; Lệnh cURL Render API
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mỗi khi push code lên GitHub nhánh main, Render tự động cập nhật bản chạy mới
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '44px' }}>
            <p style={{ marginBottom: '12px' }}>
              Bạn có thể kích hoạt triển khai lại máy chủ từ xa bất cứ lúc nào qua Terminal bằng Render API Key:
            </p>

            <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                curl -X POST https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0/deploys -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" -H "Accept: application/json"
              </code>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => copyToClipboard('curl -X POST https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0/deploys -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" -H "Accept: application/json"', 'curl_deploy', 'Lệnh cURL Deploy')}
                style={{ fontSize: '0.75rem', padding: '6px 12px', flexShrink: 0, marginLeft: '12px' }}
              >
                {copiedKey === 'curl_deploy' ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                <span style={{ marginLeft: '4px' }}>Copy lệnh</span>
              </button>
            </div>
          </div>
        </section>

        {/* Step 5: Admin Password & Database Security */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(190, 18, 60, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              5
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bảo mật Tài khoản &amp; Sao lưu Dữ liệu
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Đổi mật khẩu khởi tạo và thiết lập sao lưu dữ liệu khách hàng
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '44px' }}>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Tài khoản Admin mặc định:</strong> <code style={{ color: 'var(--text-main)' }}>admin@techpulse.vn</code> / Mật khẩu: <code style={{ color: 'var(--text-main)' }}>admin123</code>. Vui lòng đổi mật khẩu trước khi khai trương.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Sao lưu định kỳ (Database Backups):</strong> Toàn bộ dữ liệu đơn hàng và khách hàng được lưu trữ an toàn trên Supabase Cloud với cơ chế snapshot tự động hàng ngày.
              </li>
              <li>
                <strong>Tài liệu chi tiết lưu trên máy:</strong> Mở file <code style={{ color: 'var(--accent-cyan)' }}>HUONG_DAN_TRIEN_KHAI_RENDER.md</code> trong thư mục làm việc để tra cứu thêm các mẫu triển khai Python/Docker hoặc xem logs hệ thống.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
