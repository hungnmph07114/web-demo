const { pool } = require('../../config/db');

class ShippingService {
  /**
   * Lấy toàn bộ thông tin vận đơn, đơn vị vận chuyển, bưu tá và lộ trình chi tiết
   */
  async getShipmentTracking(idOrDisplayId) {
    const isNum = !isNaN(idOrDisplayId);
    const client = await pool.connect();
    try {
      const { rows: orders } = await client.query(`
        SELECT 
          id,
          display_id,
          customer_name,
          customer_phone,
          shipping_address,
          total_amount,
          payment_status,
          fulfillment_status,
          shipping_carrier,
          tracking_code,
          driver_name,
          driver_phone,
          estimated_delivery_date,
          created_at
        FROM orders
        WHERE ${isNum ? 'id = $1 OR display_id = $2' : 'display_id = $1'}
      `, isNum ? [idOrDisplayId, String(idOrDisplayId)] : [idOrDisplayId]);

      if (orders.length === 0) {
        throw new Error('Không tìm thấy đơn hàng với mã tra cứu cung cấp');
      }

      const order = orders[0];

      // Lấy danh sách sự kiện lộ trình (checkpoints)
      const { rows: events } = await client.query(`
        SELECT id, status, hub_name, description, created_at
        FROM shipment_tracking_events
        WHERE order_id = $1
        ORDER BY created_at ASC
      `, [order.id]);

      // Metadata đơn vị vận chuyển
      const carrierMetadata = {
        GHN: {
          name: 'Giao Hàng Nhanh Express (GHN)',
          icon: '⚡',
          color: '#F97316',
          hotline: '1900 636677',
          website: 'https://ghn.vn'
        },
        GHTK: {
          name: 'Giao Hàng Tiết Kiệm (GHTK)',
          icon: '🛵',
          color: '#10B981',
          hotline: '1900 6092',
          website: 'https://giaohangtietkiem.vn'
        },
        VIETTEL_POST: {
          name: 'Viettel Post (VTP Logistics)',
          icon: '📮',
          color: '#EF4444',
          hotline: '1900 8095',
          website: 'https://viettelpost.vn'
        },
        HOA_TOC_2H: {
          name: 'TechPulse Now Hỏa Tốc (2 Giờ)',
          icon: '🚀',
          color: '#06B6D4',
          hotline: '1900 8888',
          website: 'https://techpulse.vn'
        }
      };

      const carrier = carrierMetadata[order.shipping_carrier] || carrierMetadata.GHN;

      return {
        order: {
          id: order.id,
          displayId: order.display_id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          shippingAddress: order.shipping_address,
          fulfillmentStatus: order.fulfillment_status,
          paymentStatus: order.payment_status
        },
        shipment: {
          carrierKey: order.shipping_carrier || 'GHN',
          carrierName: carrier.name,
          carrierIcon: carrier.icon,
          carrierColor: carrier.color,
          carrierHotline: carrier.hotline,
          trackingCode: order.tracking_code || `TP-SHIP-${order.id}`,
          driverName: order.driver_name || 'Bưu tá khu vực',
          driverPhone: order.driver_phone || '1900 636677',
          estimatedDeliveryDate: order.estimated_delivery_date,
          timeline: events
        }
      };
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật hãng vận chuyển & bưu tá cho đơn hàng
   */
  async updateCarrier(orderId, { carrier, trackingCode, driverName, driverPhone }) {
    const client = await pool.connect();
    try {
      const code = trackingCode || `${carrier || 'GHN'}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const { rows } = await client.query(`
        UPDATE orders
        SET 
          shipping_carrier = COALESCE($1, shipping_carrier),
          tracking_code = COALESCE($2, tracking_code),
          driver_name = COALESCE($3, driver_name),
          driver_phone = COALESCE($4, driver_phone),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [carrier, code, driverName, driverPhone, orderId]);

      if (rows.length === 0) throw new Error('Không tìm thấy đơn hàng');

      // Ghi nhận log
      await client.query(`
        INSERT INTO order_logs (order_id, action, note)
        VALUES ($1, 'UPDATE_CARRIER', $2)
      `, [orderId, `Cập nhật đơn vị vận chuyển: ${carrier || 'GHN'} (Mã vận đơn: ${code})`]);

      return rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Mô phỏng chuyển bước giao vận tiếp theo trên timeline (Dành cho demo & test)
   */
  async simulateNextStep(orderId) {
    const client = await pool.connect();
    try {
      const { rows: orders } = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (orders.length === 0) throw new Error('Không tìm thấy đơn hàng');
      const order = orders[0];

      // Lấy số lượng sự kiện hiện có
      const { rows: events } = await client.query(
        'SELECT * FROM shipment_tracking_events WHERE order_id = $1 ORDER BY created_at ASC',
        [orderId]
      );

      const stepIndex = events.length;
      let newEvent = null;
      let newFulfillment = order.fulfillment_status;

      if (stepIndex === 0) {
        newEvent = {
          status: 'picked_up',
          hub_name: 'Trung tâm xuất kho TechPulse Cầu Giấy',
          description: 'Kiện hàng công nghệ đã được xuất kho, dán tem niêm phong và bàn giao cho bưu tá lấy hàng.'
        };
        newFulfillment = 'packing';
      } else if (stepIndex === 1) {
        newEvent = {
          status: 'in_sorting_hub',
          hub_name: 'Trung tâm khai thác & phân loại tự động SOC 01',
          description: 'Kiện hàng đã qua băng chuyền quét mã vạch và đang trung chuyển liên tỉnh về bưu cục phát.'
        };
        newFulfillment = 'shipped';
      } else if (stepIndex === 2) {
        newEvent = {
          status: 'out_for_delivery',
          hub_name: 'Bưu cục phát đích (Phụ trách giao hàng)',
          description: `Bưu tá ${order.driver_name || 'Nguyễn Văn Hùng'} (SĐT: ${order.driver_phone || '0988.234.567'}) đang mang kiện hàng đi giao. Quý khách vui lòng để ý điện thoại.`
        };
        newFulfillment = 'shipped';
      } else {
        newEvent = {
          status: 'delivered',
          hub_name: 'Địa chỉ người nhận',
          description: '🎉 Giao hàng thành công! Khách hàng đã kiểm tra ngoại quan máy và ký nhận hoàn tất kiện hàng.'
        };
        newFulfillment = 'delivered';
      }

      // Insert event
      await client.query(`
        INSERT INTO shipment_tracking_events (order_id, status, hub_name, description, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `, [orderId, newEvent.status, newEvent.hub_name, newEvent.description]);

      // Cập nhật fulfillment_status nếu có thay đổi
      if (newFulfillment !== order.fulfillment_status) {
        await client.query(
          'UPDATE orders SET fulfillment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newFulfillment, orderId]
        );
        await client.query(`
          INSERT INTO order_logs (order_id, action, note)
          VALUES ($1, 'FULFILLMENT_CHANGE', $2)
        `, [orderId, `Trạng thái giao vận tự động cập nhật sang: ${newFulfillment}`]);
      }

      return {
        success: true,
        message: `Đã thêm mốc vận chuyển mới: ${newEvent.description}`,
        newEvent,
        newFulfillment
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new ShippingService();
