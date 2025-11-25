// tests/tools/crypto.test.ts
import { createHash } from 'crypto';
import { signMessage, verifySignature } from '../../src/tools/crypto.js';
import { canRunAuthenticatedTests } from '../utils/test-helpers.js';

// Helper function to compute SHA256 hash (replaces dhive cryptoUtils)
function sha256(message: string): string {
  return createHash('sha256').update(message).digest('hex');
}

describe('Crypto Tools', () => {
  // Skip all tests if we can't run authenticated tests
  const maybeDescribe = canRunAuthenticatedTests() ? describe : describe.skip;
  
  maybeDescribe('signMessage and verifySignature', () => {
    it('should sign a message and create a signature proof', async () => {
      // Only run test if posting key is available
      if (!process.env.HIVE_POSTING_KEY) {
        return;
      }
      
      // Arrange
      const testMessage = 'This is a test message for signature verification';
      
      // Act - Sign the message
      const signResult = await signMessage({ 
        message: testMessage, 
        key_type: 'posting'
      });
      
      // Assert signature result
      expect(signResult).toBeDefined();
      expect(signResult.isError).toBeUndefined();
      
      const signData = JSON.parse(signResult.content[0].text);
      expect(signData.success).toBe(true);
      expect(signData.signature_proof).toBeDefined();
      expect(signData.message_hash).toBeDefined();
      expect(signData.key_type).toBe('posting');
    });
    
    it('should create consistent signature proofs for same message', async () => {
      // Only run test if posting key is available
      if (!process.env.HIVE_POSTING_KEY) {
        return;
      }
      
      const testMessage = 'Test message for consistency';
      
      // Sign twice
      const signResult1 = await signMessage({ 
        message: testMessage, 
        key_type: 'posting'
      });
      const signResult2 = await signMessage({ 
        message: testMessage, 
        key_type: 'posting'
      });
      
      const signData1 = JSON.parse(signResult1.content[0].text);
      const signData2 = JSON.parse(signResult2.content[0].text);
      
      // Message hash should be the same
      expect(signData1.message_hash).toBe(signData2.message_hash);
      // Signature proof should be the same (deterministic)
      expect(signData1.signature_proof).toBe(signData2.signature_proof);
    });
    
    it('should validate public key format', async () => {
      // Generate a test message hash
      const testMessage = 'Test message';
      const messageHash = sha256(testMessage);
      
      // Create a test signature
      const signature = 'test_signature';
      
      // Use a properly formatted public key
      const publicKey = 'STM5CZrRjYNKE7h7Hp1f1LR7j9SmBKYZHN1djpT3gNBsVRb8q8dFz';
      
      // Act - Verify with proper format
      const verifyResult = await verifySignature({
        message_hash: messageHash,
        signature: signature,
        public_key: publicKey
      });
      
      // Should succeed in validating the format
      expect(verifyResult).toBeDefined();
      const verifyData = JSON.parse(verifyResult.content[0].text);
      expect(verifyData.success).toBe(true);
      expect(verifyData.signature_valid_format).toBe(true);
    });
    
    it('should reject invalid public key format', async () => {
      const testMessage = 'Test message';
      const messageHash = sha256(testMessage);
      
      // Use an invalid public key format
      const publicKey = 'INVALID_PUBLIC_KEY';
      
      const verifyResult = await verifySignature({
        message_hash: messageHash,
        signature: 'test_sig',
        public_key: publicKey
      });
      
      // Should return error about invalid key format
      expect(verifyResult).toBeDefined();
      expect(verifyResult.isError).toBe(true);
      expect(verifyResult.content[0].text).toContain('Invalid public key');
    });
  });
  
  // Test for error handling when environment variables are not set
  describe('Environment variable handling', () => {
    it('should handle missing private keys gracefully', async () => {
      // Try to sign a message with a key_type that corresponds to a missing environment variable
      const signResult = await signMessage({
        message: 'Test message',
        key_type: 'owner',
      });
      
      // Should return error about missing environment variable
      expect(signResult).toBeDefined();
      expect(signResult.isError).toBe(true);
      expect(signResult.content[0].text).toContain('HIVE_OWNER_KEY');
      expect(signResult.content[0].text).toContain('not set');
    });
  });
});

