import * as jose from 'jose';
import { getJwtSecret } from '../utils/jwt';

// Types for our data
export interface Client {
  clientId: string;
  name: string;
}

export interface Source {
  sourceId: string;
  name: string;
  abbr: string;
}

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
  private cache: {
    clients?: { data: Client[]; timestamp: number } | undefined;
    sources?: { data: Source[]; timestamp: number } | undefined;
    campaigns?: { data: Campaign[]; timestamp: number } | undefined;
    sourceTypes?: { data: SourceType[]; timestamp: number } | undefined;
    utmRecords?: { data: UTMRecord[]; timestamp: number } | undefined;
  } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.clientEmail = import.meta.env.VITE_GOOGLE_CLIENT_EMAIL;
  }

  private isCacheValid(cacheEntry: { timestamp: number } | undefined): boolean {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < this.CACHE_DURATION;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const now = Math.floor(Date.now() / 1000);
      console.log('Getting JWT secret...');
      const jwtSecret = await getJwtSecret();
      console.log('JWT secret obtained');

      console.log('Creating JWT...');
      const jwt = await new jose.SignJWT({
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

  private async createSheetIfNotExists(sheetName: string, headers: string[]): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      // First, try to get the sheet to check if it exists
      try {
        await this.fetchSheet(`${sheetName}!A1`);
        // If we get here, the sheet exists
        return;
      } catch (error) {
        // Sheet doesn't exist, create it
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: sheetName,
                    },
                  },
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to create sheet');
        }

        // Add headers to the new sheet
        const addHeadersResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [headers],
            }),
          }
        );

        if (!addHeadersResponse.ok) {
          throw new Error('Failed to add headers to sheet');
        }
      }
    } catch (error) {
      console.error(`Error creating sheet ${sheetName}:`, error);
      throw error;
    }
  }

  private async initializeSheets(): Promise<void> {
    try {
      await Promise.all([
        this.createSheetIfNotExists('Clients', ['Client ID', 'Name']),
        this.createSheetIfNotExists('Sources', ['Source ID', 'Name', 'Abbreviation']),
        this.createSheetIfNotExists('Campaigns', ['Campaign ID', 'Name', 'Client ID']),
        this.createSheetIfNotExists('SourceTypes', ['Source Type ID', 'Name', 'Abbreviation', 'Source']),
        this.createSheetIfNotExists('UTMRecords', ['UTM ID', 'URL', 'Client', 'Campaign', 'Source', 'Source Type', 'Identifier', 'UTM URL', 'Created At', 'Department']),
      ]);
    } catch (error) {
      console.error('Error initializing sheets:', error);
      throw error;
    }
  }

  async getClients(): Promise<Client[]> {
    try {
      if (this.isCacheValid(this.cache.clients)) {
        return this.cache.clients!.data;
      }

      await this.initializeSheets();
      const values = await this.fetchSheet('Clients!A2:B');
      const clients = values.map(([clientId, name]) => ({
        clientId,
        name,
      }));

      this.cache.clients = {
        data: clients,
        timestamp: Date.now()
      };

      return clients;
    } catch (error) {
      console.error('Error in getClients:', error);
      throw error;
    }
  }

  async getSources(): Promise<Source[]> {
    try {
      if (this.isCacheValid(this.cache.sources)) {
        return this.cache.sources!.data;
      }

      await this.initializeSheets();
      const values = await this.fetchSheet('Sources!A2:C');
      const sources = values.map(([sourceId, name, abbr]) => ({
        sourceId,
        name,
        abbr,
      }));

      this.cache.sources = {
        data: sources,
        timestamp: Date.now()
      };

      return sources;
    } catch (error) {
      console.error('Error in getSources:', error);
      throw error;
    }
  }

  async addClient(client: Omit<Client, 'clientId'>): Promise<Client> {
    try {
      const result = await this._addClient(client);
      this.cache.clients = undefined; // Clear cache
      return result;
    } catch (error) {
      console.error('Error in addClient:', error);
      throw error;
    }
  }

  async addSource(source: Omit<Source, 'sourceId'>): Promise<Source> {
    try {
      const result = await this._addSource(source);
      this.cache.sources = undefined; // Clear cache
      return result;
    } catch (error) {
      console.error('Error in addSource:', error);
      throw error;
    }
  }

  async addCampaign(campaign: Omit<Campaign, 'campaignId'>): Promise<Campaign> {
    try {
      const result = await this._addCampaign(campaign);
      this.cache.campaigns = undefined; // Clear cache
      return result;
    } catch (error) {
      console.error('Error in addCampaign:', error);
      throw error;
    }
  }

  async addSourceType(sourceType: Omit<SourceType, 'sourceTypeId'>): Promise<SourceType> {
    try {
      const result = await this._addSourceType(sourceType);
      this.cache.sourceTypes = undefined; // Clear cache
      return result;
    } catch (error) {
      console.error('Error in addSourceType:', error);
      throw error;
    }
  }

  async addUTMRecord(record: Omit<UTMRecord, 'utmId' | 'createdAt'>): Promise<UTMRecord> {
    try {
      const result = await this._addUTMRecord(record);
      this.cache.utmRecords = undefined; // Clear cache
      return result;
    } catch (error) {
      console.error('Error in addUTMRecord:', error);
      throw error;
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      if (this.isCacheValid(this.cache.campaigns)) {
        return this.cache.campaigns!.data;
      }

      const values = await this.fetchSheet('Campaigns!A2:C');
      const campaigns = values.map(([campaignId, name, clientId]) => ({
        campaignId,
        name,
        clientId,
      }));

      this.cache.campaigns = {
        data: campaigns,
        timestamp: Date.now()
      };

      return campaigns;
    } catch (error) {
      console.error('Error in getCampaigns:', error);
      throw error;
    }
  }

  async getSourceTypes(): Promise<SourceType[]> {
    try {
      if (this.isCacheValid(this.cache.sourceTypes)) {
        return this.cache.sourceTypes!.data;
      }

      const values = await this.fetchSheet('SourceTypes!A2:D');
      const sourceTypes = values.map(([sourceTypeId, name, abbr, source]) => ({
        sourceTypeId,
        name,
        abbr,
        source,
      }));

      this.cache.sourceTypes = {
        data: sourceTypes,
        timestamp: Date.now()
      };

      return sourceTypes;
    } catch (error) {
      console.error('Error in getSourceTypes:', error);
      throw error;
    }
  }

  async getUTMRecords(): Promise<UTMRecord[]> {
    try {
      if (this.isCacheValid(this.cache.utmRecords)) {
        return this.cache.utmRecords!.data;
      }

      const values = await this.fetchSheet('UTMRecords!A2:J');
      const utmRecords = values.map(([utmId, url, client, campaign, source, sourceType, identifier, utmUrl, createdAt, department]) => ({
        utmId,
        url,
        client,
        campaign,
        source,
        sourceType,
        identifier,
        utmUrl,
        createdAt,
        department: department as 'marketing' | 'sales' | 'social',
      }));

      this.cache.utmRecords = {
        data: utmRecords,
        timestamp: Date.now()
      };

      return utmRecords;
    } catch (error) {
      console.error('Error in getUTMRecords:', error);
      throw error;
    }
  }

  // Rename existing methods to _add* to avoid infinite recursion
  private async _addClient(client: Omit<Client, 'clientId'>): Promise<Client> {
    const token = await this.getAccessToken();
    const newClientId = `client-${Date.now()}`;
    const values = [[newClientId, client.name]];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Clients!A:B:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add client');
    }

    return {
      clientId: newClientId,
      name: client.name,
    };
  }

  private async _addSource(source: Omit<Source, 'sourceId'>): Promise<Source> {
    const token = await this.getAccessToken();
    const newSourceId = `source-${Date.now()}`;
    const values = [[newSourceId, source.name, source.abbr]];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sources!A:C:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add source');
    }

    return {
      sourceId: newSourceId,
      name: source.name,
      abbr: source.abbr,
    };
  }

  private async _addCampaign(campaign: Omit<Campaign, 'campaignId'>): Promise<Campaign> {
    const token = await this.getAccessToken();
    const newCampaignId = `campaign-${Date.now()}`;
    const values = [[newCampaignId, campaign.name, campaign.clientId]];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Campaigns!A:C:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add campaign');
    }

    return {
      campaignId: newCampaignId,
      name: campaign.name,
      clientId: campaign.clientId,
    };
  }

  private async _addSourceType(sourceType: Omit<SourceType, 'sourceTypeId'>): Promise<SourceType> {
    const token = await this.getAccessToken();
    const newSourceTypeId = `source-type-${Date.now()}`;
    const values = [[newSourceTypeId, sourceType.name, sourceType.abbr, sourceType.source]];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/SourceTypes!A:D:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add source type');
    }

    return {
      sourceTypeId: newSourceTypeId,
      name: sourceType.name,
      abbr: sourceType.abbr,
      source: sourceType.source,
    };
  }

  private async _addUTMRecord(record: Omit<UTMRecord, 'utmId' | 'createdAt'>): Promise<UTMRecord> {
    // First, check if a UTM record with the same URL and parameters already exists
    const existingRecords = await this.getUTMRecords();
    const isDuplicate = existingRecords.some(existing => 
      existing.url === record.url &&
      existing.client === record.client &&
      existing.campaign === record.campaign &&
      existing.source === record.source &&
      existing.sourceType === record.sourceType &&
      existing.identifier === record.identifier &&
      existing.department === record.department
    );

    if (isDuplicate) {
      throw new Error('UTM URL already exists');
    }

    const token = await this.getAccessToken();
    const newUTMId = `utm-${Date.now()}`;
    const now = new Date().toISOString();
    const values = [[
      newUTMId,
      record.url,
      record.client,
      record.campaign,
      record.source,
      record.sourceType,
      record.identifier,
      record.utmUrl,
      now,
      record.department,
    ]];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/UTMRecords!A:J:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add UTM record');
    }

    return {
      utmId: newUTMId,
      ...record,
      createdAt: now,
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();