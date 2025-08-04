import { StacksTestnet } from '@stacks/network';
import {
    AnchorMode,
    PostConditionMode,
    TransactionVersion,
    broadcastTransaction,
    callReadOnlyFunction,
    createStacksPrivateKey,
    cvToJSON,
    getAddressFromPrivateKey,
    makeContractCall,
    standardPrincipalCV,
    stringAsciiCV,
    uintCV
} from '@stacks/transactions';

// Configuration
const NETWORK = new StacksTestnet();
// Private key derived from mnemonic: "upon absurd stay unusual key input liar balcony identify label odor edit right sound champion defy bargain cannon space sugar unit country olive medal"
const PRIVATE_KEY = 'your-private-key-here'; // Replace with actual private key
const CONTRACT_ADDRESS = 'ST1SEKZVMKWB347X172WVCP32DBRFMXRV81XNX0W9'; // Contract deployer address
const CONTRACT_NAME = 'donation';

// Helper function to create and broadcast transaction
async function callContract(functionName: string, functionArgs: any[] = []) {
  try {
    const privateKey = createStacksPrivateKey(PRIVATE_KEY);
    
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: functionName,
      functionArgs: functionArgs,
      senderKey: privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
    if (broadcastResponse.error) {
      console.error(`❌ ${functionName} failed:`, broadcastResponse.error);
      return null;
    }

    console.log(`✅ ${functionName} successful!`);
    console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
    console.log(`🔗 View on explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);
    
    return broadcastResponse.txid;
  } catch (error) {
    console.error(`❌ Error calling ${functionName}:`, error);
    return null;
  }
}

// Helper function for read-only calls
async function readContract(functionName: string, functionArgs: any[] = []) {
  try {
    const senderAddress = getAddressFromPrivateKey(
      createStacksPrivateKey(PRIVATE_KEY).data,
      TransactionVersion.Testnet
    );

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: functionName,
      functionArgs: functionArgs,
      senderAddress: senderAddress,
      network: NETWORK,
    });

    return cvToJSON(result);
  } catch (error) {
    console.error(`❌ Error reading ${functionName}:`, error);
    return null;
  }
}

// Contract interaction functions

async function donate(amount: number) {
  console.log(`💰 Donating ${amount / 1000000} STX...`);
  return await callContract('donate', [uintCV(amount)]);
}

async function withdraw(amount: number, recipient: string, purpose: string) {
  console.log(`🏦 Withdrawing ${amount / 1000000} STX for: ${purpose}...`);
  return await callContract('withdraw', [
    uintCV(amount),
    standardPrincipalCV(recipient),
    stringAsciiCV(purpose)
  ]);
}

async function setMinDonation(amount: number) {
  console.log(`⚙️ Setting minimum donation to ${amount / 1000000} STX...`);
  return await callContract('set-min-donation', [uintCV(amount)]);
}

async function emergencyWithdraw(recipient: string) {
  console.log(`🚨 Emergency withdrawal to ${recipient}...`);
  return await callContract('emergency-withdraw', [standardPrincipalCV(recipient)]);
}

async function getPoolStats() {
  console.log('📊 Getting pool statistics...');
  const result = await readContract('get-pool-stats');
  console.log('Pool Stats:', JSON.stringify(result, null, 2));
  return result;
}

async function getUserDonation(userAddress: string) {
  console.log(`🔍 Getting donation for ${userAddress}...`);
  const result = await readContract('get-user-donation', [standardPrincipalCV(userAddress)]);
  console.log(`User Donation:`, result);
  return result;
}

async function getTotalDonations() {
  console.log('💰 Getting total donations...');
  const result = await readContract('get-total-donations');
  console.log('Total Donations:', result);
  return result;
}

async function getContractBalance() {
  console.log('💳 Getting contract balance...');
  const result = await readContract('get-contract-balance');
  console.log('Contract Balance:', result);
  return result;
}

async function getDonationHistory(index: number) {
  console.log(`📜 Getting donation history #${index}...`);
  const result = await readContract('get-donation-history', [uintCV(index)]);
  console.log(`Donation History #${index}:`, result);
  return result;
}

async function getWithdrawalHistory(index: number) {
  console.log(`📜 Getting withdrawal history #${index}...`);
  const result = await readContract('get-withdrawal-history', [uintCV(index)]);
  console.log(`Withdrawal History #${index}:`, result);
  return result;
}

// Demo flow
async function demoFlow() {
  console.log('🎮 Starting Simple Donation Pool Demo...\n');

  // 1. Get initial state
  await getPoolStats();
  await getContractBalance();

  // 2. Make a donation
  await donate(1000000); // 1 STX
  
  // Wait a bit for transaction to process
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Check updated stats
  await getPoolStats();
  
  // 4. Check user donation
  const userAddress = getAddressFromPrivateKey(
    createStacksPrivateKey(PRIVATE_KEY).data,
    TransactionVersion.Testnet
  );
  await getUserDonation(userAddress);

  // 5. Check donation history
  await getDonationHistory(0);

  console.log('\n🎉 Demo completed! Check the explorer links above for transaction details.');
  console.log('💡 Note: Only admin can withdraw funds for charity purposes.');
}

// Export functions for manual use
export {
    demoFlow, donate, emergencyWithdraw, getContractBalance,
    getDonationHistory, getPoolStats, getTotalDonations, getUserDonation, getWithdrawalHistory, setMinDonation, withdraw
};

// Run demo if this file is executed directly
if (require.main === module) {
  demoFlow();
}
