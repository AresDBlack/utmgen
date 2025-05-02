import { SignJWT } from 'jose';
import { getJwtSecret } from '../utils/jwt';

// Types for our data
export interface Campaign {
  campaignId: string;
  name: string;
  clientId: string;
}

export interface SourceType {
  sourceTypeId: string;
  name: string;
  abbr: string;
  source: string;
}

export interface UTMRecord {
  utmId: string;
  url: string;
  client: string;
  campaign: string;
  source: string;
  sourceType: string;
  identifier: string;
  utmUrl: string;
  createdAt: string;
  department: 'marketing' | 'sales' | 'social';
}

class GoogleSheetsService {
  private readonly spreadsheetId: string;
  private readonly clientEmail: string;

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.clientEmail = import.meta.env.VITE_GOOGLE_CLIENT_EMAIL;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const now = Math.floor(Date.now() / 1000);
      console.log('Getting JWT secret...');
      const jwtSecret = await getJwtSecret();
      console.log('JWT secret obtained');

      console.log('Creating JWT...');
      const jwt = await new SignJWT({
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        iss: this.clientEmail,
        sub: this.clientEmail,
        iat: now,
        exp: now + 3600
      })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .sign(jwtSecret);
      console.log('JWT created');

      const params = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      });

      console.log('Requesting access token...');
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error getting access token:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to get access token: ${errorData.error_description || response.statusText}`);
      }

      const data = await response.json();
      if (!data.access_token) {
        console.error('No access token in response:', data);
        throw new Error('No access token in response');
      }

      return data.access_token;
    } catch (error) {
      console.error('Error in getAccessToken:', {
        error,
        clientEmail: this.clientEmail,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error('Failed to get access token');
    }
  }

  private async fetchSheet(range: string): Promise<any[][]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching sheet:', errorData);
        throw new Error(`Failed to fetch sheet: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      if (!data.values) {
        console.warn(`No data found in range: ${range}`);
        return [];
      }
      return data.values;
    } catch (error) {
      console.error('Error in fetchSheet:', error);
      throw error;
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const values = await this.fetchSheet('Campaigns!A2:C');
      return values.map(([campaignId, name, clientId]) => ({
        campaignId,
        name,
        clientId,
      }));
    } catch (error) {
      console.error('Error in getCampaigns:', error);
      throw error;
    }
  }

  async getSourceTypes(): Promise<SourceType[]> {
    try {
      const values = await this.fetchSheet('SourceTypes!A2:D');
      return values.map(([sourceTypeId, name, abbr, source]) => ({
        sourceTypeId,
        name,
        abbr,
        source,
      }));
    } catch (error) {
      console.error('Error in getSourceTypes:', error);
      throw error;
    }
  }

  async getUTMRecords(): Promise<UTMRecord[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/UTMRecords!A2:I`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching UTM records:', errorData);
        throw new Error(`Failed to fetch UTM records: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rows = data.values || [];
      return rows.map((row: string[], index: number) => ({
        utmId: `utm-${index + 1}`,
        url: row[0] || '',
        client: row[1] || '',
        campaign: row[2] || '',
        source: row[3] || '',
        sourceType: row[4] || '',
        identifier: row[5] || '',
        utmUrl: row[6] || '',
        createdAt: row[7] || new Date().toISOString(),
        department: (row[8] as 'marketing' | 'sales' | 'social') || 'marketing'
      }));
    } catch (error) {
      console.error('Error fetching UTM records:', error);
      throw error;
    }
  }

  async checkUTMUrlExists(utmUrl: string): Promise<boolean> {
    try {
      const records = await this.getUTMRecords();
      return records.some(record => record.utmUrl === utmUrl);
    } catch (error) {
      console.error('Error checking UTM URL:', error);
      throw error;
    }
  }

  async addUTMRecord(record: Omit<UTMRecord, 'utmId' | 'createdAt'> & { department: 'marketing' | 'sales' | 'social' }): Promise<void> {
    try {
      // Check if UTM URL already exists
      const exists = await this.checkUTMUrlExists(record.utmUrl);
      if (exists) {
        throw new Error('UTM URL already exists');
      }

      const token = await this.getAccessToken();
      const values = [
        [
          record.url,
          record.client,
          record.campaign,
          record.source,
          record.sourceType,
          record.identifier,
          record.utmUrl,
          new Date().toISOString(),
          record.department
        ]
      ];

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/UTMRecords!A2:I:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values,
            majorDimension: 'ROWS'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding UTM record:', errorData);
        throw new Error(`Failed to add UTM record: ${errorData.error?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding UTM record:', error);
      throw error;
    }
  }

  async addCampaign(campaign: Omit<Campaign, 'campaignId'>): Promise<Campaign> {
    try {
      const token = await this.getAccessToken();
      const campaignId = `C${Date.now()}`;
      const newCampaign = { ...campaign, campaignId };

      console.log('Adding campaign:', newCampaign);
      console.log('Request URL:', `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Campaigns!A2:C:append`);
      console.log('Request body:', {
        values: [[campaignId, campaign.name, campaign.clientId]],
        majorDimension: 'ROWS'
      });

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Campaigns!A2:C:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[campaignId, campaign.name, campaign.clientId]],
            majorDimension: 'ROWS'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding campaign:', {
          error: errorData,
          campaign: newCampaign,
          spreadsheetId: this.spreadsheetId,
        });
        throw new Error(`Failed to add campaign: ${errorData.error?.message || response.statusText}`);
      }

      return newCampaign;
    } catch (error) {
      console.error('Error in addCampaign:', error);
      throw error;
    }
  }

  async addSourceType(sourceType: Omit<SourceType, 'sourceTypeId'>): Promise<SourceType> {
    try {
      const token = await this.getAccessToken();
      const sourceTypeId = `ST${Date.now()}`;
      const newSourceType = { ...sourceType, sourceTypeId };

      console.log('Adding source type:', newSourceType);
      console.log('Request URL:', `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/SourceTypes!A2:D:append`);
      console.log('Request body:', {
        values: [[sourceTypeId, sourceType.name, sourceType.abbr, sourceType.source]],
        majorDimension: 'ROWS'
      });

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/SourceTypes!A2:D:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[sourceTypeId, sourceType.name, sourceType.abbr, sourceType.source]],
            majorDimension: 'ROWS'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding source type:', {
          error: errorData,
          sourceType: newSourceType,
          spreadsheetId: this.spreadsheetId,
        });
        throw new Error(`Failed to add source type: ${errorData.error?.message || response.statusText}`);
      }

      return newSourceType;
    } catch (error) {
      console.error('Error in addSourceType:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService(); 