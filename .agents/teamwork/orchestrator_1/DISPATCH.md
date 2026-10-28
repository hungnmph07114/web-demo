## 2026-10-28T07:45:20Z
Tiến hành review và audit toàn diện dự án hiện tại trong workspace, đánh giá kiến trúc, bảo mật, hiệu năng, chất lượng mã nguồn và cấu hình triển khai.

Integrity mode: development

## Requirements

### R1. Báo cáo Review và Audit toàn diện
Thực hiện đánh giá toàn diện dự án và lập báo cáo chi tiết dưới dạng tài liệu Markdown (`AUDIT_REPORT.md` hoặc tài liệu tương đương). Báo cáo phải bao gồm đánh giá về kiến trúc hệ thống, an toàn bảo mật, hiệu năng, chất lượng mã nguồn và cấu hình triển khai/DevOps.

### R2. Phân loại phát hiện và hướng dẫn khắc phục
Mỗi vấn đề hoặc rủi ro được phát hiện phải có mức độ nghiêm trọng rõ ràng (Critical, High, Medium, Low, Informational), mô tả chi tiết nguyên nhân, vị trí tệp mã nguồn liên quan và đề xuất giải pháp kỹ thuật cụ thể để khắc phục.

### R3. Đối chiếu và kiểm chứng tài nguyên hiện có
Sử dụng các bộ kiểm thử (test suite), script chạy kiểm tra và tài liệu kỹ thuật sẵn có trong repository để xác thực hiện trạng vận hành và tính toàn vẹn của hệ thống trong quá trình audit.

## Acceptance Criteria

### Tính đầy đủ của báo cáo Audit
- [ ] Báo cáo audit được hoàn thiện dưới dạng tài liệu Markdown bao gồm đầy đủ 5 trụ柱: Kiến trúc hệ thống, An toàn bảo mật, Hiệu năng, Chất lượng mã nguồn, và Cấu hình triển khai.
- [ ] Mỗi phát hiện (finding) trong báo cáo có đầy đủ: mức độ nghiêm trọng (Severity rating), đường dẫn tệp/vị trí mã nguồn liên quan, phân tích rủi ro và khuyến nghị khắc phục cụ thể.
- [ ] Báo cáo tổng hợp số lượng phát hiện theo từng mức độ nghiêm trọng và đưa ra đánh giá tổng quan về mức độ sẵn sàng của hệ thống.

### Kiểm chứng thực tế
- [ ] Các kịch bản kiểm tra hoặc script sẵn có trong repository (ví dụ test suites, linter, build script) được thực thi và kết quả được đối chiếu, ghi nhận trong báo cáo.
- [ ] Không có nhận định chủ quan thiếu căn cứ: các lỗ hổng hoặc vấn đề kiến trúc/hiệu năng đều có bằng chứng phân tích mã nguồn hoặc kết quả kiểm thử tương ứng.
