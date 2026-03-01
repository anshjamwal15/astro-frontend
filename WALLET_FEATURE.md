# Wallet Feature Implementation

## Overview
A complete wallet screen has been implemented with balance display, add money functionality, and transaction history.

## Files Created/Modified

### New Files
1. `app/(tabs)/wallet.tsx` - Main wallet screen component
2. `services/WalletApiService.ts` - API service for wallet operations

### Modified Files
1. `app/(tabs)/_layout.tsx` - Added wallet screen to tabs (hidden from tab bar)
2. `app/(tabs)/home.tsx` - Added wallet icon button in header

## Features

### 1. Wallet Balance Display
- Shows current wallet balance in a gradient card
- Real-time balance updates after transactions
- Pull-to-refresh functionality

### 2. Add Money
- Modal interface for adding money
- Quick amount selection (₹100, ₹500, ₹1000, ₹2000, ₹5000)
- Custom amount input
- Payment method selection (UPI, Card, Net Banking)
- Loading state during transaction

### 3. Transaction History
- List of all wallet transactions
- Transaction details:
  - Transaction type (Credit/Debit)
  - Amount with color coding (green for credit, red for debit)
  - Status badge (Completed, Pending, Failed)
  - Date and time
  - Payment gateway reference
- Empty state when no transactions exist

### 4. Navigation
- Wallet icon in home screen header
- Tapping the wallet icon navigates to wallet screen
- Back button to return to previous screen

## API Integration

### Base URL
```
http://10.42.208.115:3000/api/wallet
```

### Transaction Types
- `CREDIT` - Money added to wallet
- `DEBIT` - Money deducted from wallet

### Transaction Status
- `PENDING` - Transaction is being processed
- `SUCCESS` - Transaction completed successfully
- `FAILED` - Transaction failed

### Endpoints Used

#### 1. Get Balance
```
GET /balance/{userId}
Response: {
  userId: string,
  balance: number,
  createdAt: string,
  updatedAt: string
}
```

#### 2. Get Transactions
```
POST /transactions
Authentication: JWT token in Authorization header OR userId in request body

Request (with JWT):
{}

Request (without JWT):
{
  userId: string
}

Response: {
  userId: string,
  transactions: [{
    id: string,
    walletId: string,
    transactionType: "CREDIT" | "DEBIT",
    amount: number,
    status: "PENDING" | "SUCCESS" | "FAILED",
    paymentGatewayReference: string,
    createdAt: string
  }]
}

Note: Transactions are returned in descending order by createdAt (newest first)
```

#### 3. Add Money
```
POST /add-money
Authentication: JWT token in Authorization header OR userId in request body

Request:
{
  userId?: string,  // Optional if JWT token is sent
  amount: number,
  method: string
}

Response: {
  userId: string,
  balance: number,
  createdAt: string,
  updatedAt: string
}
```

## Usage

### Accessing the Wallet
1. From home screen: Tap the wallet icon in the top-right header
2. Programmatically: `router.push('/(tabs)/wallet')`

### Adding Money
1. Tap "Add Money" button on wallet screen
2. Enter amount or select quick amount
3. Choose payment method
4. Tap "Add Money" to confirm
5. Balance updates automatically on success

### Viewing Transactions
- Transactions are automatically loaded when screen opens
- Pull down to refresh transaction list
- Each transaction shows full details including status

## UI/UX Features

- Gradient header matching app theme
- Color-coded transactions (green for credit, red for debit)
- Status badges with appropriate colors
- Loading states for all async operations
- Error handling with user-friendly alerts
- Responsive layout
- Pull-to-refresh support
- Empty state messaging

## Error Handling

- Network errors are caught and displayed to user
- Invalid input validation for add money
- User authentication check before operations
- Graceful fallbacks for missing data

## Future Enhancements

- Transaction filtering and search
- Export transaction history
- Payment gateway integration
- Wallet recharge offers
- Transaction receipts
- Spending analytics


## Authentication Fix (March 2026)

### Problem
The wallet transactions endpoint was failing because the frontend was not sending the JWT token in the Authorization header.

### Solution Implemented

#### Backend Changes
1. Made `userId` optional in `WalletAddMoneyRequest`
2. Updated wallet endpoints to support two authentication methods:
   - JWT token in Authorization header (recommended)
   - userId in request body (fallback)
3. Added detailed logging to help debug authentication issues

#### Frontend Changes (COMPLETED)
The frontend `WalletApiService` has been updated to:
1. Import `AsyncStorage` from `@react-native-async-storage/async-storage`
2. Add a private method `getJwtToken()` to retrieve the JWT token from storage (key: `jwt_token`)
3. Include the JWT token in the `Authorization: Bearer <token>` header for all wallet API calls
4. Make `userId` optional in method signatures (JWT is preferred)
5. Update method signatures:
   - `getTransactions(userId?: string)` - userId is now optional
   - `addMoney(amount: number, method: string, userId?: string)` - amount and method come first, userId is optional

#### Updated API Methods

```typescript
// Get transactions with JWT authentication
static async getTransactions(userId?: string): Promise<TransactionsResponse> {
  const jwtToken = await this.getJwtToken();
  // Sends Authorization: Bearer <token> header
  // userId in body is optional fallback
}

// Add money with JWT authentication
static async addMoney(amount: number, method: string, userId?: string): Promise<AddMoneyResponse> {
  const jwtToken = await this.getJwtToken();
  // Sends Authorization: Bearer <token> header
  // userId in body is optional fallback
}

// Get balance with JWT authentication
static async getBalance(userId: string): Promise<WalletBalance> {
  const jwtToken = await this.getJwtToken();
  // Sends Authorization: Bearer <token> header
}
```

### Testing

#### Test with curl (using JWT):
```bash
curl -X POST http://10.42.208.115:3000/api/wallet/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{}'
```

#### Test with curl (using userId fallback):
```bash
curl -X POST http://10.42.208.115:3000/api/wallet/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId": "ef66fcd4-b3a1-4332-a3cf-74cdf7d32713"}'
```

### Implementation Status
✅ Frontend updated to send JWT token in Authorization header
✅ All wallet API methods now include JWT authentication
✅ Backward compatibility maintained with userId fallback
✅ TypeScript types updated to reflect optional userId parameters
✅ No compilation errors
✅ Wallet screen updated to use new API signatures

## API Schema Updates (March 2026)

### Changes Made

1. **Transaction Type Enum**
   - `transactionType` is now an enum with values: `CREDIT` | `DEBIT`
   - Frontend updated to handle uppercase enum values
   - Removed support for legacy values like "deposit" and "withdrawal"

2. **Transaction Status Enum**
   - `status` values: `PENDING` | `SUCCESS` | `FAILED`
   - Changed from "completed" to "SUCCESS" in frontend logic
   - Color coding updated accordingly

3. **Response Schema Updates**
   - `WalletBalance` now includes `createdAt` and `updatedAt` timestamps
   - `AddMoneyResponse` now includes `createdAt` and `updatedAt` timestamps
   - Removed `walletId` from balance responses (only `userId` is returned)

4. **Transaction Ordering**
   - Transactions are now returned in descending order by `createdAt` (newest first)
   - Frontend also sorts transactions to ensure latest appears on top
   - Added client-side sorting as a safety measure

5. **Content-Type Headers**
   - Changed from `application/hal+json` to `application/json`
   - All API calls updated to use standard JSON content type

6. **Date Formatting Fixes**
   - Fixed "Invalid Date" issue by properly handling ISO 8601 format (`2026-03-01T04:44:39.582Z`)
   - Added validation and error handling for date parsing
   - Added 12-hour time format with AM/PM
   - Added debug logging to help identify date format issues

7. **Snake Case to Camel Case Transformation**
   - Backend returns fields in snake_case (`created_at`, `wallet_id`, `transaction_type`)
   - Frontend expects camelCase (`createdAt`, `walletId`, `transactionType`)
   - Added automatic transformation in WalletApiService for all API responses
   - Handles both naming conventions for backward compatibility

### Frontend Type Definitions

```typescript
export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface WalletBalance {
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  transactionType: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentGatewayReference: string;
  createdAt: string;
}

export interface AddMoneyResponse {
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}
```
