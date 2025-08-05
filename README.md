# Simple Donation Pool
# Contract Addresses: ST1SEKZVMKWB347X172WVCP32DBRFMXRV81XNX0W9.donation
## Description
Simple Donation Pool is a simple and transparent charity donation smart contract on the Stacks blockchain. Users can donate STX to the pool, and admins can withdraw to perform charity activities.

## Main Features
- **Donate STX**: Users can donate any amount of STX
- **Transparent Tracking**: Transparently track total donations and list of donors
- **Admin Withdrawal**: Admin can withdraw to do charity
- **Donation History**: Store history of all donations
- **Minimum Donation**: Set minimum donation amount to avoid spam

## Project Structure
```
simple_donation/
├── contracts/
│ └── donation-pool.clar # Main donation contract
├── tests/
│ └── donation-pool_test.ts # Unit tests
├── scripts/
│ └── deploy.ts # Deployment script
├── Clarinet.toml # Clarinet configuration. configuration
├── package.json # Dependencies
└── README.md # Documentation
```

## How to use

### 1. Donate STX
```clarity
(contract-call? .donation-pool donate u1000000) ;; Donate 1 STX
```

### 2. View total donations
```clarity
(contract-call? .donation-pool get-total-donations)
```

### 3. View user donations
```clarity
(contract-call? .donation-pool get-user-donation tx-sender)
```

### 4. Admin Functions
```clarity
;; Withdraw for charity
(contract-call? .donation-pool withdraw u500000 'ST1RECIPIENT...)

;; Update minimum donation
(contract-call? .donation-pool set-min-donation u100000)
```

## Specifications
- **Minimum Donation**: 0.1 STX (100,000 microSTX)
- **Maximum Donors**: 1000 donors tracked
- **Withdrawal**: Only admin can withdraw
- **Transparency**: All donations are stored on-chain

## Use Cases
1. **Charity Organizations**: Charities receiving donations
2. **Community Fundraising**: Community donating to projects
3. **Emergency Relief**: Emergency donations for natural disasters
4. **Open Source Funding**: Funding for open source projects

## Benefits
1. **Transparency**: All donations are recorded on the blockchain
2. **Simple**: Easy-to-use, uncomplicated interface
3. **Safe toan**: Only admin can withdraw
4. **Efficiency**: Low gas cost, optimized performance
5. **Scalable**: Can extend more features

## Security Features
- Admin-only withdrawal to ensure safety
- Minimum donation to avoid spam attacks
- Safe math to avoid overflow
- Input validation for all parameters

## Donation Flow
1. **Setup**: Admin deploy contract and set minimum donation
2. **Donate**: Users donate STX to pool
3. **Track**: System automatically tracks donors and amounts
4. **Withdraw**: Admin withdraw to make charity
5. **Transparency**: All information is public and transparent

## Deployment
1. Clone repository
2. Configure Clarinet settings with new wallet
3. Deploy contract with `clarinet deploy`
4. Test basic functions

## Testing
```bash
clarinet check
clarinet console
npm test
```
