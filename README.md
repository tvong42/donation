# Project 14: Simple Donation Pool

## Mô tả
Simple Donation Pool là một smart contract quyên góp từ thiện đơn giản và minh bạch trên blockchain Stacks. Người dùng có thể donate STX vào pool, và admin có thể withdraw để thực hiện các hoạt động từ thiện.

## Tính năng chính
- **Donate STX**: Người dùng có thể donate bất kỳ số lượng STX nào
- **Transparent Tracking**: Theo dõi minh bạch tổng donations và danh sách donors
- **Admin Withdrawal**: Admin có thể withdraw để làm từ thiện
- **Donation History**: Lưu trữ lịch sử tất cả donations
- **Minimum Donation**: Đặt mức donate tối thiểu để tránh spam

## Cấu trúc dự án
```
project14_simple_donation/
├── contracts/
│   └── donation-pool.clar         # Main donation contract
├── tests/
│   └── donation-pool_test.ts      # Unit tests
├── scripts/
│   └── deploy.ts                  # Deployment script
├── Clarinet.toml                  # Clarinet configuration
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

## Cách sử dụng

### 1. Donate STX
```clarity
(contract-call? .donation-pool donate u1000000) ;; Donate 1 STX
```

### 2. Xem tổng donations
```clarity
(contract-call? .donation-pool get-total-donations)
```

### 3. Xem donation của user
```clarity
(contract-call? .donation-pool get-user-donation tx-sender)
```

### 4. Admin Functions
```clarity
;; Withdraw để làm từ thiện
(contract-call? .donation-pool withdraw u500000 'ST1RECIPIENT...)

;; Cập nhật minimum donation
(contract-call? .donation-pool set-min-donation u100000)
```

## Thông số kỹ thuật
- **Minimum Donation**: 0.1 STX (100,000 microSTX)
- **Maximum Donors**: 1000 donors được track
- **Withdrawal**: Chỉ admin có thể withdraw
- **Transparency**: Tất cả donations được lưu trữ on-chain

## Use Cases
1. **Charity Organizations**: Tổ chức từ thiện nhận donations
2. **Community Fundraising**: Cộng đồng quyên góp cho dự án
3. **Emergency Relief**: Quyên góp khẩn cấp cho thiên tai
4. **Open Source Funding**: Tài trợ cho các dự án mã nguồn mở

## Lợi ích
1. **Minh bạch**: Tất cả donations được ghi lại trên blockchain
2. **Đơn giản**: Interface dễ sử dụng, không phức tạp
3. **An toàn**: Chỉ admin mới có thể withdraw
4. **Hiệu quả**: Gas cost thấp, tối ưu performance
5. **Scalable**: Có thể mở rộng thêm nhiều tính năng

## Security Features
- Admin-only withdrawal để đảm bảo an toàn
- Minimum donation để tránh spam attacks
- Safe math để tránh overflow
- Input validation cho tất cả parameters

## Donation Flow
1. **Setup**: Admin deploy contract và set minimum donation
2. **Donate**: Users donate STX vào pool
3. **Track**: System tự động track donors và amounts
4. **Withdraw**: Admin withdraw để thực hiện từ thiện
5. **Transparency**: Tất cả thông tin public và minh bạch

## Deployment
1. Clone repository
2. Configure Clarinet settings với wallet mới
3. Deploy contract với `clarinet deploy`
4. Test các functions cơ bản

## Testing
```bash
clarinet check
clarinet console
npm test
```
