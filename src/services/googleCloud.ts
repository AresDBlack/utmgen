import { Logging } from '@google-cloud/logging';

const logging = new Logging({
  projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: import.meta.env.VITE_GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: import.meta.env.VITE_GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export const logToGoogleCloud = async (message: string, severity: 'INFO' | 'WARNING' | 'ERROR' = 'INFO') => {
  try {
    const log = logging.log('utm-generator-logs');
    const metadata = {
      resource: { type: 'global' },
      severity,
    };
    const entry = log.entry(metadata, message);
    await log.write(entry);
  } catch (error) {
    console.error('Error logging to Google Cloud:', error);
  }
}; 