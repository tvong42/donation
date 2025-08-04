;; Simple Donation Pool Contract
;; A transparent and simple donation system for charity and community funding

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant MIN_DONATION_DEFAULT u100000) ;; 0.1 STX in microSTX
(define-constant MAX_DONORS u1000)

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INSUFFICIENT_AMOUNT (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_TRANSFER_FAILED (err u103))
(define-constant ERR_INVALID_RECIPIENT (err u104))
(define-constant ERR_ZERO_AMOUNT (err u105))

;; Data Variables
(define-data-var total-donations uint u0)
(define-data-var total-donors uint u0)
(define-data-var min-donation uint MIN_DONATION_DEFAULT)
(define-data-var total-withdrawn uint u0)

;; Data Maps
(define-map user-donations principal uint)
(define-map donation-history uint {donor: principal, amount: uint, timestamp: uint})
(define-map withdrawal-history uint {recipient: principal, amount: uint, timestamp: uint, purpose: (string-ascii 100)})
(define-map donor-list uint principal)

;; Read-only functions

;; Get total donations received
(define-read-only (get-total-donations)
  (var-get total-donations)
)

;; Get total amount withdrawn
(define-read-only (get-total-withdrawn)
  (var-get total-withdrawn)
)

;; Get current pool balance
(define-read-only (get-pool-balance)
  (- (var-get total-donations) (var-get total-withdrawn))
)

;; Get contract balance
(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender))
)

;; Get user's total donation
(define-read-only (get-user-donation (user principal))
  (default-to u0 (map-get? user-donations user))
)

;; Get total number of donors
(define-read-only (get-total-donors)
  (var-get total-donors)
)

;; Get minimum donation amount
(define-read-only (get-min-donation)
  (var-get min-donation)
)

;; Get donation history by index
(define-read-only (get-donation-history (index uint))
  (map-get? donation-history index)
)

;; Get withdrawal history by index
(define-read-only (get-withdrawal-history (index uint))
  (map-get? withdrawal-history index)
)

;; Get donor by index
(define-read-only (get-donor (index uint))
  (map-get? donor-list index)
)

;; Check if user has donated before
(define-read-only (has-donated (user principal))
  (> (get-user-donation user) u0)
)

;; Get pool statistics
(define-read-only (get-pool-stats)
  {
    total-donations: (var-get total-donations),
    total-withdrawn: (var-get total-withdrawn),
    current-balance: (get-pool-balance),
    total-donors: (var-get total-donors),
    min-donation: (var-get min-donation)
  }
)

;; Private functions

;; Add donor to list if first time donating
(define-private (add-donor-if-new (donor principal))
  (if (not (has-donated donor))
    (begin
      (map-set donor-list (var-get total-donors) donor)
      (var-set total-donors (+ (var-get total-donors) u1))
      true
    )
    true
  )
)

;; Public functions

;; Donate STX to the pool
(define-public (donate (amount uint))
  (let (
    (current-donation (get-user-donation tx-sender))
    (donation-index (var-get total-donations))
  )
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (>= amount (var-get min-donation)) ERR_INSUFFICIENT_AMOUNT)
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Add donor to list if first time
    (add-donor-if-new tx-sender)
    
    ;; Update user's total donation
    (map-set user-donations tx-sender (+ current-donation amount))
    
    ;; Record donation history
    (map-set donation-history donation-index {
      donor: tx-sender,
      amount: amount,
      timestamp: block-height
    })
    
    ;; Update total donations
    (var-set total-donations (+ (var-get total-donations) amount))
    
    (ok amount)
  )
)

;; Withdraw funds for charity (admin only)
(define-public (withdraw (amount uint) (recipient principal) (purpose (string-ascii 100)))
  (let (
    (current-balance (get-contract-balance))
    (withdrawal-index (var-get total-withdrawn))
  )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (<= amount current-balance) ERR_INSUFFICIENT_BALANCE)
    
    ;; Transfer STX from contract to recipient
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    
    ;; Record withdrawal history
    (map-set withdrawal-history withdrawal-index {
      recipient: recipient,
      amount: amount,
      timestamp: block-height,
      purpose: purpose
    })
    
    ;; Update total withdrawn
    (var-set total-withdrawn (+ (var-get total-withdrawn) amount))
    
    (ok amount)
  )
)

;; Set minimum donation amount (admin only)
(define-public (set-min-donation (new-min uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (> new-min u0) ERR_ZERO_AMOUNT)
    
    (var-set min-donation new-min)
    (ok new-min)
  )
)

;; Emergency withdraw all funds (admin only)
(define-public (emergency-withdraw (recipient principal))
  (let (
    (current-balance (get-contract-balance))
  )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (> current-balance u0) ERR_INSUFFICIENT_BALANCE)
    
    ;; Transfer all STX from contract to recipient
    (try! (as-contract (stx-transfer? current-balance tx-sender recipient)))
    
    ;; Record emergency withdrawal
    (map-set withdrawal-history (var-get total-withdrawn) {
      recipient: recipient,
      amount: current-balance,
      timestamp: block-height,
      purpose: "EMERGENCY_WITHDRAWAL"
    })
    
    ;; Update total withdrawn
    (var-set total-withdrawn (+ (var-get total-withdrawn) current-balance))
    
    (ok current-balance)
  )
)
