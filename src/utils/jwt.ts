export async function getJwtSecret() {
  try {
    const privateKey = import.meta.env.VITE_GOOGLE_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Google private key not found in environment variables');
      throw new Error('Google private key not found in environment variables');
    }

    // Clean up the private key
    const cleanedKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .trim();

    console.log('Importing key...');
    // Convert the base64 string to a Uint8Array
    const binaryString = atob(cleanedKey);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const key = await crypto.subtle.importKey(
      'pkcs8',
      bytes,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    console.log('Key imported successfully');
    return key;
  } catch (error) {
    console.error('Error in getJwtSecret:', {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
} 