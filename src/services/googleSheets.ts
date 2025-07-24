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
  sourceIdPrefix?: string;
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

export type UTMRecord = {
  utmId: string;
  url: string;
  client: string;
  campaign: string;
  source: string;
  sourceType: string;
  identifier: string;
  utmUrl: string;
  department: 'marketing' | 'sales' | 'social' | 'others' | 'affiliates';
  createdAt: string;
};

// --- Analytics Submission & Streaks ---

export interface AnalyticsSubmission {
  submissionId: string;
  department: string;
  dueDate: string;
  submittedAt: string;
  submittedBy: string;
  links: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt: string;
  approvedBy: string;
  rejectionReason?: string;
}

export interface DepartmentStreak {
  department: string;
  currentStreak: number;
  longestStreak: number;
  lastApprovedSubmissionDate: string;
}

// --- Client Analytics ---

export interface ClientAnalyticsRecord {
  name: string;
  email: string;
  phone: string;
  product: string;
  price: number;
  paid: number;
  date: string;
  type: string;
  nextPaymentDate: string;
  month: string;
  afterStripeFees: number;
  commissionPercentage: number;
  commission: number;
  campaign: string;
  medium: string;
  source: string;
  client: 'Danny' | 'Nadine' | 'Shaun';
}

export interface ClientAnalyticsSummary {
  totalRevenue: number;
  totalCommission: number;
  totalSales: number;
  uniqueCampaigns: number;
  uniqueSources: number;
  uniqueMediums: number;
  uniqueProducts: number;
}

export interface ClientAnalyticsBreakdown {
  utm_source: { [key: string]: { revenue: number; sales: number; commission: number } };
  utm_medium: { [key: string]: { revenue: number; sales: number; commission: number } };
  utm_campaign: { [key: string]: { revenue: number; sales: number; commission: number } };
  utm_content: { [key: string]: { revenue: number; sales: number; commission: number } };
  product: { [key: string]: { revenue: number; sales: number; commission: number } };
}

// Utility: Calculate due dates for a given year
export function getDueDates(year: number): string[] {
  const departments = [
    'Marketing',
    'Social Media',
    'Video Editing',
    'Lead Gen',
    'Graphic Design',
    'Sales',
  ];
  const dueDates: Set<string> = new Set();
  // Weekly: Every Monday
  let d = new Date(`${year}-01-01`);
  while (d.getFullYear() === year) {
    if (d.getDay() === 1) dueDates.add(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  // Monthly: 7th of each month (move to Monday if weekend)
  for (let m = 0; m < 12; m++) {
    let date = new Date(year, m, 7);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    dueDates.add(date.toISOString().slice(0, 10));
  }
  // Quarterly: 7 days after quarter ends (move to Monday if weekend)
  const quarters = [3, 6, 9, 12];
  for (let q of quarters) {
    let date = new Date(year, q, 7);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    dueDates.add(date.toISOString().slice(0, 10));
  }
  // Yearly: Jan 7 (move to Monday if weekend)
  let jan7 = new Date(year, 0, 7);
  if (jan7.getDay() === 6) jan7.setDate(jan7.getDate() + 2);
  if (jan7.getDay() === 0) jan7.setDate(jan7.getDate() + 1);
  dueDates.add(jan7.toISOString().slice(0, 10));
  return Array.from(dueDates).sort();
}

export async function getAnalyticsSubmissions(): Promise<AnalyticsSubmission[]> {
  // Fetch from AnalyticsSubmissions sheet
  const service = googleSheetsService;
  await service.createSheetIfNotExists('AnalyticsSubmissions', [
    'Submission ID', 'Department', 'Due Date', 'Submitted At', 'Submitted By', 'Links', 'Description', 'Status', 'Approved At', 'Approved By', 'Rejection Reason'
  ]);
  const values = await service.fetchSheet('AnalyticsSubmissions!A2:K');
  return values.map(([submissionId, department, dueDate, submittedAt, submittedBy, links, description, status, approvedAt, approvedBy, rejectionReason]) => ({
    submissionId,
    department,
    dueDate,
    submittedAt,
    submittedBy,
    links,
    description,
    status,
    approvedAt,
    approvedBy,
    rejectionReason,
  }));
}

export async function createAnalyticsSubmission(submission: Omit<AnalyticsSubmission, 'submissionId' | 'status' | 'approvedAt' | 'approvedBy' | 'rejectionReason'>): Promise<AnalyticsSubmission> {
  const service = googleSheetsService;
  await service.createSheetIfNotExists('AnalyticsSubmissions', [
    'Submission ID', 'Department', 'Due Date', 'Submitted At', 'Submitted By', 'Links', 'Description', 'Status', 'Approved At', 'Approved By', 'Rejection Reason'
  ]);
  const submissionId = `submission-${Date.now()}`;
  const values = [[
    submissionId,
    submission.department,
    submission.dueDate,
    submission.submittedAt,
    submission.submittedBy,
    submission.links,
    submission.description,
    'pending',
    '',
    '',
    '',
  ]];
  const token = await service.getAccessToken();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${service.spreadsheetId}/values/AnalyticsSubmissions!A:K:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!response.ok) throw new Error('Failed to add analytics submission');
  return {
    submissionId,
    ...submission,
    status: 'pending',
    approvedAt: '',
    approvedBy: '',
    rejectionReason: '',
  };
}

export async function approveAnalyticsSubmission(submissionId: string, approvedBy: string): Promise<void> {
  // Update status to 'approved', set approvedAt/by
  const service = googleSheetsService;
  const values = await service.fetchSheet('AnalyticsSubmissions!A2:K');
  const rowIndex = values.findIndex(row => row[0] === submissionId);
  if (rowIndex === -1) throw new Error('Submission not found');
  const rowNumber = rowIndex + 2;
  const now = new Date().toISOString();
  const updateRange = `AnalyticsSubmissions!H${rowNumber}:J${rowNumber}`;
  const token = await service.getAccessToken();
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${service.spreadsheetId}/values/${updateRange}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [['approved', now, approvedBy]] }),
    }
  );

  // Update department streaks
  const submission = values[rowIndex];
  if (!submission || !Array.isArray(submission)) {
    throw new Error('Invalid submission data');
  }
  const department = submission[1] ?? ''; // Department is in column B
  const dueDate = submission[2] ?? ''; // Due date is in column C
  
  // Get current streaks for this department
  const currentStreaks = await getDepartmentStreaks();
  const currentStreak = currentStreaks.find(s => s.department === department);
  
  // Calculate new streak
  let newCurrentStreak = 1;
  let newLongestStreak = 1;
  
  if (currentStreak) {
    // Check if this is a consecutive submission (within expected timeframe)
    const lastApprovedDate = currentStreak.lastApprovedSubmissionDate;
    if (lastApprovedDate) {
      const lastDate = new Date(lastApprovedDate);
      const currentDate = new Date(dueDate);
      const daysDiff = Math.abs(currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // If within 14 days, consider it consecutive
      if (daysDiff <= 14) {
        newCurrentStreak = currentStreak.currentStreak + 1;
      }
    }
    
    newLongestStreak = Math.max(currentStreak.longestStreak, newCurrentStreak);
  }
  
  // Update the streak
  await updateDepartmentStreaks(department, {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastApprovedSubmissionDate: dueDate,
  });
}

export async function rejectAnalyticsSubmission(submissionId: string, approvedBy: string, reason: string): Promise<void> {
  // Update status to 'rejected', set approvedAt/by, rejectionReason
  const service = googleSheetsService;
  const values = await service.fetchSheet('AnalyticsSubmissions!A2:K');
  const rowIndex = values.findIndex(row => row[0] === submissionId);
  if (rowIndex === -1) throw new Error('Submission not found');
  const rowNumber = rowIndex + 2;
  const now = new Date().toISOString();
  const updateRange = `AnalyticsSubmissions!H${rowNumber}:K${rowNumber}`;
  const token = await service.getAccessToken();
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${service.spreadsheetId}/values/${updateRange}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [['rejected', now, approvedBy, reason]] }),
    }
  );
}

export async function getDepartmentStreaks(): Promise<DepartmentStreak[]> {
  // Fetch from DepartmentStreaks sheet
  const service = googleSheetsService;
  await service.createSheetIfNotExists('DepartmentStreaks', [
    'Department', 'Current Streak', 'Longest Streak', 'Last Approved Submission Date'
  ]);
  const values = await service.fetchSheet('DepartmentStreaks!A2:D');
  return (values || []).map((row) => {
    if (!Array.isArray(row)) row = [];
    const department = row[0] ?? '';
    const currentStreak = row[1] ?? '0';
    const longestStreak = row[2] ?? '0';
    const lastApprovedSubmissionDate = row[3] ?? '';
    return {
      department,
      currentStreak: Number(currentStreak) || 0,
      longestStreak: Number(longestStreak) || 0,
      lastApprovedSubmissionDate,
    };
  });
}

export async function updateDepartmentStreaks(department: string, streak: Partial<DepartmentStreak>): Promise<void> {
  // Update streaks for department
  const service = googleSheetsService;
  await service.createSheetIfNotExists('DepartmentStreaks', [
    'Department', 'Current Streak', 'Longest Streak', 'Last Approved Submission Date'
  ]);
  const values = await service.fetchSheet('DepartmentStreaks!A2:D');
  const rowIndex = values.findIndex(row => row[0] === department);
  const rowNumber = rowIndex + 2;
  const token = await service.getAccessToken();
  if (rowIndex === -1) {
    // Insert new row
    const insertValues = [[
      department,
      streak.currentStreak ?? 0,
      streak.longestStreak ?? 0,
      streak.lastApprovedSubmissionDate ?? '',
    ]];
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${service.spreadsheetId}/values/DepartmentStreaks!A:D:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: insertValues }),
      }
    );
  } else {
    // Update existing row
    const updateRange = `DepartmentStreaks!B${rowNumber}:D${rowNumber}`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${service.spreadsheetId}/values/${updateRange}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [[
          streak.currentStreak ?? (values[rowIndex]?.[1] ?? 0),
          streak.longestStreak ?? (values[rowIndex]?.[2] ?? 0),
          streak.lastApprovedSubmissionDate ?? (values[rowIndex]?.[3] ?? ''),
        ]] }),
      }
    );
  }
}

class GoogleSheetsService {
  public readonly spreadsheetId: string;
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

  public async getAccessToken(): Promise<string> {
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

  public async fetchSheet(range: string): Promise<any[][]> {
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

  public async createSheetIfNotExists(sheetName: string, headers: string[]): Promise<void> {
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
    if (this.isCacheValid(this.cache.utmRecords)) {
      return this.cache.utmRecords!.data;
    }

    try {
      const data = await this.fetchSheet('UTMRecords!A:J');
      const records: UTMRecord[] = data.slice(1).map(row => ({
        utmId: row[0] || '',
        url: row[1] || '',
        client: row[2] || '',
        campaign: row[3] || '',
        source: row[4] || '',
        sourceType: row[5] || '',
        identifier: row[6] || '',
        utmUrl: row[7] || '',
        createdAt: row[8] || '',
        department: (row[9] as any) || 'marketing',
      }));

      this.cache.utmRecords = { data: records, timestamp: Date.now() };
      return records;
    } catch (error) {
      console.error('Error fetching UTM records:', error);
      return [];
    }
  }

  // --- Client Analytics Methods ---

  async getClientAnalytics(client?: 'Danny' | 'Nadine' | 'Shaun', startDate?: string, endDate?: string): Promise<ClientAnalyticsRecord[]> {
    const clients = client ? [client] : ['Danny', 'Nadine', 'Shaun'];
    const allRecords: ClientAnalyticsRecord[] = [];

    for (const clientName of clients) {
      try {
        const data = await this.fetchSheet(`${clientName}!A:P`);
        const records: ClientAnalyticsRecord[] = data.slice(1).map(row => ({
          name: row[0] || '',
          email: row[1] || '',
          phone: row[2] || '',
          product: row[3] || '',
          price: parseFloat(row[4] || '0') || 0,
          paid: parseFloat(row[5] || '0') || 0,
          date: row[6] || '',
          type: row[7] || '',
          nextPaymentDate: row[8] || '',
          month: row[9] || '',
          afterStripeFees: parseFloat((row[10] || '0').replace('$', '').replace(',', '')) || 0,
          commissionPercentage: parseFloat(row[11] || '0') || 0,
          commission: parseFloat((row[12] || '0').replace('$', '').replace(',', '')) || 0,
          campaign: row[13] || '',
          medium: row[14] || '',
          source: row[15] || 'Unknown',
          client: clientName as 'Danny' | 'Nadine' | 'Shaun',
        }));

        // Filter by date range if provided
        const filteredRecords = records.filter(record => {
          if (!startDate && !endDate) return true;
          
          const recordDate = new Date(record.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && recordDate < start) return false;
          if (end && recordDate > end) return false;
          
          return true;
        });

        allRecords.push(...filteredRecords);
      } catch (error) {
        console.error(`Error fetching ${clientName} analytics:`, error);
      }
    }

    return allRecords;
  }

  async getClientAnalyticsSummary(client?: 'Danny' | 'Nadine' | 'Shaun', startDate?: string, endDate?: string): Promise<ClientAnalyticsSummary> {
    const records = await this.getClientAnalytics(client, startDate, endDate);
    
    const totalRevenue = records.reduce((sum, record) => sum + record.afterStripeFees, 0);
    const totalCommission = records.reduce((sum, record) => sum + record.commission, 0);
    const totalSales = records.length;
    
    const uniqueCampaigns = new Set(records.map(r => r.campaign)).size;
    const uniqueSources = new Set(records.map(r => r.source)).size;
    const uniqueMediums = new Set(records.map(r => r.medium)).size;
    const uniqueProducts = new Set(records.map(r => r.product)).size;

    return {
      totalRevenue,
      totalCommission,
      totalSales,
      uniqueCampaigns,
      uniqueSources,
      uniqueMediums,
      uniqueProducts,
    };
  }

  async getClientAnalyticsBreakdown(client?: 'Danny' | 'Nadine' | 'Shaun', startDate?: string, endDate?: string): Promise<ClientAnalyticsBreakdown> {
    const records = await this.getClientAnalytics(client, startDate, endDate);
    
    const breakdown: ClientAnalyticsBreakdown = {
      utm_source: {},
      utm_medium: {},
      utm_campaign: {},
      utm_content: {},
      product: {},
    };

    records.forEach(record => {
      // Group by source
      const source = record.source || 'Unknown';
      if (!breakdown.utm_source[source]) {
        breakdown.utm_source[source] = { revenue: 0, sales: 0, commission: 0 };
      }
      breakdown.utm_source[source]!.revenue += record.afterStripeFees;
      breakdown.utm_source[source]!.sales += 1;
      breakdown.utm_source[source]!.commission += record.commission;

      // Group by medium
      const medium = record.medium || 'Unknown';
      if (!breakdown.utm_medium[medium]) {
        breakdown.utm_medium[medium] = { revenue: 0, sales: 0, commission: 0 };
      }
      breakdown.utm_medium[medium]!.revenue += record.afterStripeFees;
      breakdown.utm_medium[medium]!.sales += 1;
      breakdown.utm_medium[medium]!.commission += record.commission;

      // Group by campaign
      const campaign = record.campaign || 'Unknown';
      if (!breakdown.utm_campaign[campaign]) {
        breakdown.utm_campaign[campaign] = { revenue: 0, sales: 0, commission: 0 };
      }
      breakdown.utm_campaign[campaign]!.revenue += record.afterStripeFees;
      breakdown.utm_campaign[campaign]!.sales += 1;
      breakdown.utm_campaign[campaign]!.commission += record.commission;

      // Group by product
      const product = record.product || 'Unknown';
      if (!breakdown.product[product]) {
        breakdown.product[product] = { revenue: 0, sales: 0, commission: 0 };
      }
      breakdown.product[product]!.revenue += record.afterStripeFees;
      breakdown.product[product]!.sales += 1;
      breakdown.product[product]!.commission += record.commission;
    });

    return breakdown;
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
    const prefix = (source as any).sourceIdPrefix || 'source-';
    const newSourceId = `${prefix}${Date.now()}`;
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

// Export client analytics functions
export const getClientAnalytics = (client?: 'Danny' | 'Nadine' | 'Shaun', startDate?: string, endDate?: string) => 
  googleSheetsService.getClientAnalytics(client, startDate, endDate);

export const getClientAnalyticsSummary = (client?: 'Danny' | 'Nadine' | 'Shaun', startDate?: string, endDate?: string) => 
  googleSheetsService.getClientAnalyticsSummary(client, startDate, endDate);

export const getClientAnalyticsBreakdown = (client?: 'Danny' | 'Nadine' | 'Shaun', startDate?: string, endDate?: string) => 
  googleSheetsService.getClientAnalyticsBreakdown(client, startDate, endDate);