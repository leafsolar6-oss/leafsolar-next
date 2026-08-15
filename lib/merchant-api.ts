import 'server-only';

import { importPKCS8, SignJWT } from 'jose';

const MERCHANT_SCOPE = 'https://www.googleapis.com/auth/content';
const MERCHANT_API = 'https://merchantapi.googleapis.com';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const MANUAL_ENTRY_TITLES = [
  'Home Appliances & Electronics',
  'Solar Package Starting Points',
  'Solar Panels, Inverters & Batteries',
] as const;

interface ServiceAccountCredentials {
  type: 'service_account';
  project_id: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
}

type JsonObject = Record<string, unknown>;

type MerchantAccount = JsonObject & {
  name?: string;
  accountName?: string;
};

type MerchantUser = JsonObject & {
  name?: string;
  state?: string;
  accessRights?: string[];
};

type DataSource = JsonObject & {
  name?: string;
  dataSourceId?: string;
  displayName?: string;
  input?: string;
  fileInput?: JsonObject;
  primaryProductDataSource?: JsonObject;
  supplementalProductDataSource?: JsonObject;
  localInventoryDataSource?: JsonObject;
  regionalInventoryDataSource?: JsonObject;
  promotionDataSource?: JsonObject;
  productReviewDataSource?: JsonObject;
  merchantReviewDataSource?: JsonObject;
};

type MerchantProduct = JsonObject & {
  name?: string;
  offerId?: string;
  dataSource?: string;
  productAttributes?: JsonObject;
  productStatus?: JsonObject;
};

type AccountIssue = JsonObject & {
  name?: string;
  title?: string;
  severity?: string;
  detail?: string;
  documentationUri?: string;
  impactedDestinations?: JsonObject[];
};

export type MerchantIssueGroup = {
  code: string;
  description: string;
  severity: string;
  attribute: string | null;
  reportingContexts: string[];
  affectedProducts: number;
  products: Array<{
    offerId: string;
    title: string;
    dataSource: string;
    countries: string[];
  }>;
};

export type MerchantAuditSummary = {
  version: 1;
  generatedAt: string;
  accountId: string;
  accountName: string;
  registration: {
    status: 'already_registered' | 'registered_now';
    developerContactConfigured: boolean;
    developerEmailSource: 'configured_variable' | 'verified_owner_admin' | 'not_configured';
  };
  businessInfo: null | {
    addressConfigured: boolean;
    regionCode: string | null;
    administrativeArea: string | null;
    locality: string | null;
    postalCode: string | null;
    addressLines: string[];
  };
  shippingSettings: null | {
    services: Array<{
      serviceName: string;
      active: boolean;
      deliveryCountries: string[];
      currencyCode: string | null;
      shipmentType: string | null;
      rateGroupCount: number;
      flatRates: Array<{ amountMicros: string; currencyCode: string | null }>;
    }>;
    warehouses: number;
  };
  totals: {
    processedProducts: number;
    reportingRows: number | null;
    configuredDataSources: number;
    sourceCountedProducts: number;
    productsWithoutKnownSource: number;
    accountIssues: number;
    productIssueGroups: number;
    productsWithIssues: number;
    productsWithDisapprovals: number;
    productsPending: number;
    productsApprovedSomewhere: number;
    destinationStatusRows: number;
  };
  reportingStatusCounts: Record<string, number>;
  dataSources: Array<{
    id: string;
    resourceName: string;
    displayName: string;
    input: string;
    type: string;
    productCount: number;
    countries: string[];
    destinations: Array<{ destination: string; state: string }>;
    fetch: null | {
      type: string;
      uri: string | null;
      frequency: string | null;
      timeZone: string | null;
    };
    latestUpload: null | {
      state: string;
      uploadedAt: string | null;
      itemsTotal: number | null;
      itemsCreated: number | null;
      itemsUpdated: number | null;
      issues: Array<{ title: string; severity: string; count: number | null }>;
    };
  }>;
  protectedFeed: {
    found: boolean;
    productCount: number;
    healthyExpectedCount: boolean;
    sourceId: string | null;
    fetchUriMatchesReplacement: boolean;
  };
  manualEntries: Array<{
    expectedTitle: string;
    actualTitle: string | null;
    found: boolean;
    offerId: string | null;
    dataSource: string | null;
    status: string;
    issues: Array<{ code: string; severity: string; description: string }>;
  }>;
  emptyProductSource4: {
    found: boolean;
    sourceId: string | null;
    productCount: number | null;
  };
  accountIssues: Array<{
    title: string;
    severity: string;
    detail: string;
    documentation: string | null;
  }>;
  productIssues: MerchantIssueGroup[];
  salesChannelReconciliation: {
    previouslyObservedUiTotal: 120;
    processedProductCount: number;
    reportingRowCount: number | null;
    differenceFromProcessedProducts: number;
    differenceFromReportingRows: number | null;
    resolved: boolean;
    note: string;
  };
  destructiveChanges: [];
  warnings: string[];
};

export class MerchantApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'MerchantApiError';
    this.status = status;
    this.code = code;
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

function escapeRawControlCharactersInJsonStrings(value: string) {
  let result = '';
  let inString = false;
  let escaped = false;
  for (const character of value) {
    if (inString && !escaped && character === '\n') { result += '\\n'; continue; }
    if (inString && !escaped && character === '\r') { result += '\\r'; continue; }
    if (inString && !escaped && character === '\t') { result += '\\t'; continue; }
    result += character;
    if (character === '"' && !escaped) inString = !inString;
    escaped = character === '\\' && !escaped;
    if (character !== '\\') escaped = false;
  }
  return result;
}

function extractJsonStringField(value: string, field: string) {
  const label = `"${field}"`;
  const labelPosition = value.indexOf(label);
  if (labelPosition < 0) return null;
  const colon = value.indexOf(':', labelPosition + label.length);
  if (colon < 0) return null;
  const openingQuote = value.indexOf('"', colon + 1);
  if (openingQuote < 0) return null;
  let escaped = false;
  for (let index = openingQuote + 1; index < value.length; index += 1) {
    const character = value[index];
    if (character === '"' && !escaped) {
      const encoded = value.slice(openingQuote + 1, index);
      try {
        return JSON.parse(`"${encoded.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"`) as string;
      } catch {
        return encoded.replace(/\\n/g, '\n');
      }
    }
    escaped = character === '\\' && !escaped;
    if (character !== '\\') escaped = false;
  }
  return null;
}

function parseServiceAccount(value: string) {
  const raw = value.trim();
  const candidates = new Set<string>([raw]);
  const assignment = raw.match(/^GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON\s*=\s*([\s\S]+)$/);
  if (assignment) candidates.add(assignment[1].trim());

  for (const candidate of [...candidates]) {
    if ((candidate.startsWith("'") && candidate.endsWith("'")) || (candidate.startsWith('"') && candidate.endsWith('"'))) {
      candidates.add(candidate.slice(1, -1).trim());
    }
    if (candidate.includes('\\"')) {
      candidates.add(candidate.replace(/\\"/g, '"'));
      try {
        const wrapped = candidate.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        const decoded = JSON.parse(`"${wrapped}"`);
        if (typeof decoded === 'string') candidates.add(decoded.trim());
      } catch { /* Not a wholly JSON-escaped object. */ }
    }
    if (candidate.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(candidate)) {
      try { candidates.add(Buffer.from(candidate.replace(/\s/g, ''), 'base64').toString('utf8').trim()); }
      catch { /* Not base64-encoded JSON. */ }
    }
  }

  for (const candidate of candidates) {
    for (const attempt of [candidate, escapeRawControlCharactersInJsonStrings(candidate)]) {
      try {
        let decoded: unknown = JSON.parse(attempt);
        if (typeof decoded === 'string') decoded = JSON.parse(decoded);
        if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
          const parsed = decoded as Partial<ServiceAccountCredentials>;
          if (typeof parsed.private_key === 'string') parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
          return parsed;
        }
      } catch { /* Try the next safe representation. */ }
    }
  }
  // Last-resort recovery for a commonly pasted service-account object whose private-key
  // line breaks made the overall JSON invalid. Fields are still read only by exact labels.
  for (const candidate of candidates) {
    const extracted: Partial<ServiceAccountCredentials> = {
      type: extractJsonStringField(candidate, 'type') as 'service_account' | null || undefined,
      project_id: extractJsonStringField(candidate, 'project_id') || undefined,
      private_key_id: extractJsonStringField(candidate, 'private_key_id') || undefined,
      private_key: extractJsonStringField(candidate, 'private_key')?.replace(/\\n/g, '\n') || undefined,
      client_email: extractJsonStringField(candidate, 'client_email') || undefined,
    };
    if (extracted.type && extracted.project_id && extracted.private_key && extracted.client_email) return extracted;
  }

  const format = raw === '[SENSITIVE]'
    ? 'masked-placeholder'
    : raw.startsWith('{')
      ? 'json-object-like'
      : raw.startsWith('GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON')
        ? 'dotenv-assignment-like'
        : raw.startsWith('"') || raw.startsWith("'")
          ? 'quoted-value-like'
          : /^[A-Za-z0-9+/=\s]+$/.test(raw)
            ? 'base64-or-plain-text-like'
            : 'unrecognized';
  const size = raw.length < 100 ? 'short' : raw.length < 1000 ? 'medium' : 'long';
  const expectedLabels = raw.includes('service_account') && raw.includes('client_email') && raw.includes('private_key');
  throw new Error(`GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON is not valid service-account JSON (format: ${format}; size: ${size}; expected field labels: ${expectedLabels ? 'present' : 'absent'}).`);
}

function credentials(): ServiceAccountCredentials {
  const value = process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON;
  if (!value) throw new Error('GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON is not configured.');
  const parsed = parseServiceAccount(value);
  if (
    parsed.type !== 'service_account'
    || !parsed.project_id
    || !parsed.client_email?.endsWith('.iam.gserviceaccount.com')
    || !parsed.private_key?.includes('BEGIN PRIVATE KEY')
  ) {
    throw new Error('The Merchant credential is not a complete Google service-account JSON key.');
  }
  return parsed as ServiceAccountCredentials;
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const serviceAccount = credentials();
  const issuedAt = Math.floor(Date.now() / 1000);
  const signingKey = await importPKCS8(serviceAccount.private_key, 'RS256');
  const assertion = await new SignJWT({ scope: MERCHANT_SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: serviceAccount.private_key_id })
    .setIssuer(serviceAccount.client_email)
    .setAudience(GOOGLE_TOKEN_URL)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + 3600)
    .sign(signingKey);

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });
  const body = await response.json() as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!response.ok || !body.access_token) {
    throw new MerchantApiError(response.status, body.error || 'TOKEN_ERROR', body.error_description || 'Google could not issue an access token.');
  }
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + Math.max(300, body.expires_in || 3600) * 1000,
  };
  return body.access_token;
}

async function authorizedGoogleRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
  const text = await response.text();
  let body: JsonObject = {};
  if (text) {
    try { body = JSON.parse(text) as JsonObject; }
    catch { body = { message: 'Google returned a non-JSON response.' }; }
  }
  if (!response.ok) {
    const error = body.error && typeof body.error === 'object' ? body.error as JsonObject : body;
    const message = typeof error.message === 'string' ? error.message : `Google API request failed with HTTP ${response.status}.`;
    const code = typeof error.status === 'string' ? error.status : `HTTP_${response.status}`;
    throw new MerchantApiError(response.status, code, message);
  }
  return body as T;
}

async function merchantRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return authorizedGoogleRequest<T>(`${MERCHANT_API}${path}`, init);
}

async function listPages<T>(path: string, field: string, pageSize: number) {
  const items: T[] = [];
  let pageToken: string | undefined;
  do {
    const query = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) query.set('pageToken', pageToken);
    const body = await merchantRequest<JsonObject>(`${path}?${query}`);
    const page = body[field];
    if (Array.isArray(page)) items.push(...page as T[]);
    pageToken = typeof body.nextPageToken === 'string' ? body.nextPageToken : undefined;
  } while (pageToken);
  return items;
}

async function reportRows(accountId: string) {
  const items: JsonObject[] = [];
  let pageToken: string | undefined;
  const query = [
    'SELECT id, offer_id, feed_label, title, aggregated_reporting_context_status, item_issues',
    'FROM product_view',
  ].join(' ');
  do {
    const body = await merchantRequest<JsonObject>(`/reports/v1/accounts/${accountId}/reports:search`, {
      method: 'POST',
      body: JSON.stringify({ query, pageSize: 1000, ...(pageToken ? { pageToken } : {}) }),
    });
    if (Array.isArray(body.results)) items.push(...body.results as JsonObject[]);
    pageToken = typeof body.nextPageToken === 'string' ? body.nextPageToken : undefined;
  } while (pageToken);
  return items;
}

function accountIdFromName(name: string | undefined) {
  return name?.match(/^accounts\/(\d+)$/)?.[1] || null;
}

function configuredAccountId() {
  const value = process.env.GOOGLE_MERCHANT_ACCOUNT_ID?.trim();
  if (!value) return null;
  if (!/^\d{6,20}$/.test(value)) throw new Error('GOOGLE_MERCHANT_ACCOUNT_ID must contain only the Merchant Center account number.');
  return value;
}

function isRegistrationRequired(error: unknown) {
  return error instanceof MerchantApiError && /not registered with the merchant account/i.test(error.message);
}

async function discoverAccount() {
  const configured = configuredAccountId();
  if (configured) {
    try {
      const account = await merchantRequest<MerchantAccount>(`/accounts/v1/accounts/${configured}`);
      return { accountId: configured, account };
    } catch (error) {
      if (isRegistrationRequired(error)) {
        return { accountId: configured, account: { name: `accounts/${configured}`, accountName: 'Merchant Center account' } as MerchantAccount };
      }
      throw error;
    }
  }

  const accounts = await listPages<MerchantAccount>('/accounts/v1/accounts', 'accounts', 100);
  if (accounts.length !== 1) {
    throw new Error(`The service account can access ${accounts.length} Merchant Center accounts. Set GOOGLE_MERCHANT_ACCOUNT_ID explicitly.`);
  }
  const accountId = accountIdFromName(accounts[0].name);
  if (!accountId) throw new Error('Google returned a Merchant account without a valid account resource name.');
  return { accountId, account: accounts[0] };
}

function userEmail(user: MerchantUser) {
  const match = user.name?.match(/\/users?\/(.+)$/);
  if (!match) return null;
  try { return decodeURIComponent(match[1]).toLowerCase(); }
  catch { return match[1].toLowerCase(); }
}

function isHumanEmail(value: string | undefined | null) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.endsWith('.iam.gserviceaccount.com'));
}

function selectDeveloperEmail(users: MerchantUser[]) {
  const configured = process.env.GOOGLE_MERCHANT_DEVELOPER_EMAIL?.trim().toLowerCase();
  if (configured) {
    if (!isHumanEmail(configured)) throw new Error('GOOGLE_MERCHANT_DEVELOPER_EMAIL must be a human Google Account email, not a service account.');
    return { email: configured, source: 'configured_variable' as const };
  }

  const verifiedAdmins = users.filter(user =>
    user.state === 'VERIFIED'
    && Array.isArray(user.accessRights)
    && user.accessRights.includes('ADMIN')
    && isHumanEmail(userEmail(user))
  );
  const ownerEmail = process.env.OTP_TO_EMAIL?.trim().toLowerCase();
  if (isHumanEmail(ownerEmail) && verifiedAdmins.some(user => userEmail(user) === ownerEmail)) {
    return { email: ownerEmail as string, source: 'verified_owner_admin' as const };
  }
  if (verifiedAdmins.length === 1) {
    return { email: userEmail(verifiedAdmins[0]) as string, source: 'verified_owner_admin' as const };
  }
  return { email: null, source: 'not_configured' as const };
}

async function ensureDeveloperRegistration(accountId: string, users: MerchantUser[]) {
  try {
    const registered = await merchantRequest<{ name?: string }>('/accounts/v1/accounts:getAccountForGcpRegistration');
    const registeredId = accountIdFromName(registered.name);
    if (registeredId && registeredId !== accountId) {
      throw new Error(`This Google Cloud project is already registered to Merchant account ${registeredId}, not the configured account.`);
    }
    if (registeredId === accountId) {
      const selected = selectDeveloperEmail(users);
      return {
        status: 'already_registered' as const,
        developerContactConfigured: Boolean(selected.email),
        developerEmailSource: selected.source,
      };
    }
  } catch (error) {
    if (!(error instanceof MerchantApiError && error.status === 404) && !isRegistrationRequired(error)) throw error;
  }

  const selected = selectDeveloperEmail(users);
  await merchantRequest(`/accounts/v1/accounts/${accountId}/developerRegistration:registerGcp`, {
    method: 'POST',
    body: JSON.stringify(selected.email ? { developerEmail: selected.email } : {}),
  });
  return {
    status: 'registered_now' as const,
    developerContactConfigured: Boolean(selected.email),
    developerEmailSource: selected.source,
  };
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

function asArray(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') as JsonObject[] : [];
}

function asStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numberOrNull(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dataSourceType(source: DataSource) {
  const types: Array<[keyof DataSource, string]> = [
    ['primaryProductDataSource', 'PRIMARY_PRODUCT'],
    ['supplementalProductDataSource', 'SUPPLEMENTAL_PRODUCT'],
    ['localInventoryDataSource', 'LOCAL_INVENTORY'],
    ['regionalInventoryDataSource', 'REGIONAL_INVENTORY'],
    ['promotionDataSource', 'PROMOTION'],
    ['productReviewDataSource', 'PRODUCT_REVIEW'],
    ['merchantReviewDataSource', 'MERCHANT_REVIEW'],
  ];
  return types.find(([field]) => source[field])?.[1] || 'UNKNOWN';
}

function sourceSettings(source: DataSource) {
  return asObject(source.primaryProductDataSource || source.supplementalProductDataSource || {});
}

function safeFetchUri(value: unknown) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

async function latestUpload(source: DataSource) {
  if (!source.name || !source.fileInput) return null;
  try {
    const upload = await merchantRequest<JsonObject>(`/datasources/v1/${source.name}/fileUploads/latest`);
    return {
      state: typeof upload.processingState === 'string' ? upload.processingState : 'UNKNOWN',
      uploadedAt: typeof upload.uploadTime === 'string' ? upload.uploadTime : null,
      itemsTotal: numberOrNull(upload.itemsTotal),
      itemsCreated: numberOrNull(upload.itemsCreated),
      itemsUpdated: numberOrNull(upload.itemsUpdated),
      issues: asArray(upload.issues).map(issue => ({
        title: typeof issue.title === 'string' ? issue.title : (typeof issue.code === 'string' ? issue.code : 'Unspecified upload issue'),
        severity: typeof issue.severity === 'string' ? issue.severity : 'UNKNOWN',
        count: numberOrNull(issue.count),
      })),
    };
  } catch (error) {
    if (error instanceof MerchantApiError && error.status === 404) return null;
    throw error;
  }
}

function productTitle(product: MerchantProduct) {
  const attributes = asObject(product.productAttributes);
  return typeof attributes.title === 'string' ? attributes.title : '';
}

function comparableTitle(value: string) {
  return value.trim().replace(/^[\s:;,.—–-]+/, '').trim().toLowerCase();
}

function productIssues(product: MerchantProduct) {
  const status = asObject(product.productStatus);
  return asArray(status.itemLevelIssues).map(issue => ({
    code: typeof issue.code === 'string' ? issue.code : 'unspecified_issue',
    severity: typeof issue.severity === 'string' ? issue.severity : 'UNKNOWN',
    description: typeof issue.description === 'string' ? issue.description : 'Unspecified product issue',
    attribute: typeof issue.attribute === 'string' ? issue.attribute : null,
    reportingContext: typeof issue.reportingContext === 'string' ? issue.reportingContext : 'UNSPECIFIED',
    countries: asStrings(issue.applicableCountries),
  }));
}

function destinationStatuses(product: MerchantProduct) {
  const status = asObject(product.productStatus);
  return asArray(status.destinationStatuses).map(destination => ({
    reportingContext: typeof destination.reportingContext === 'string' ? destination.reportingContext : 'UNSPECIFIED',
    approvedCountries: asStrings(destination.approvedCountries),
    pendingCountries: asStrings(destination.pendingCountries),
    disapprovedCountries: asStrings(destination.disapprovedCountries),
  }));
}

function displayProductStatus(product: MerchantProduct) {
  const issues = productIssues(product);
  const destinations = destinationStatuses(product);
  if (issues.some(issue => issue.severity === 'DISAPPROVED') || destinations.some(item => item.disapprovedCountries.length)) return 'Not approved';
  if (destinations.some(item => item.pendingCountries.length)) return 'Pending';
  if (issues.some(issue => issue.severity === 'DEMOTED')) return 'Limited';
  if (destinations.some(item => item.approvedCountries.length)) return 'Approved';
  return 'Unknown';
}

function buildIssueGroups(products: MerchantProduct[]): MerchantIssueGroup[] {
  const groups = new Map<string, MerchantIssueGroup>();
  for (const product of products) {
    for (const issue of productIssues(product)) {
      const key = [issue.code, issue.severity, issue.attribute || '', issue.description].join('|');
      const existing = groups.get(key) || {
        code: issue.code,
        description: issue.description,
        severity: issue.severity,
        attribute: issue.attribute,
        reportingContexts: [],
        affectedProducts: 0,
        products: [],
      };
      existing.affectedProducts += 1;
      if (!existing.reportingContexts.includes(issue.reportingContext)) existing.reportingContexts.push(issue.reportingContext);
      existing.products.push({
        offerId: product.offerId || '',
        title: productTitle(product),
        dataSource: product.dataSource || '',
        countries: issue.countries,
      });
      groups.set(key, existing);
    }
  }
  return [...groups.values()].sort((a, b) => {
    const order: Record<string, number> = { DISAPPROVED: 0, DEMOTED: 1, NOT_IMPACTED: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3) || b.affectedProducts - a.affectedProducts;
  });
}

function sanitizeAccountIssue(issue: AccountIssue) {
  return {
    title: issue.title || 'Unspecified account issue',
    severity: issue.severity || 'UNKNOWN',
    detail: issue.detail || '',
    documentation: issue.documentationUri || null,
  };
}

function summarizeBusinessInfo(value: JsonObject | null): MerchantAuditSummary['businessInfo'] {
  if (!value) return null;
  const address = asObject(value.address);
  const addressLines = asStrings(address.addressLines);
  const regionCode = typeof address.regionCode === 'string' ? address.regionCode : null;
  const administrativeArea = typeof address.administrativeArea === 'string' ? address.administrativeArea : null;
  const locality = typeof address.locality === 'string' ? address.locality : null;
  const postalCode = typeof address.postalCode === 'string' ? address.postalCode : null;
  return {
    addressConfigured: Boolean(regionCode && administrativeArea && locality && addressLines.some(line => line.trim().length > 0)),
    regionCode,
    administrativeArea,
    locality,
    postalCode,
    addressLines,
  };
}

function collectFlatRates(value: unknown, rates: Array<{ amountMicros: string; currencyCode: string | null }> = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectFlatRates(item, rates);
    return rates;
  }
  if (!value || typeof value !== 'object') return rates;
  for (const [key, nested] of Object.entries(value as JsonObject)) {
    if (key === 'flatRate') {
      const flatRate = asObject(nested);
      if (typeof flatRate.amountMicros === 'string' || typeof flatRate.amountMicros === 'number') {
        const rate = {
          amountMicros: String(flatRate.amountMicros),
          currencyCode: typeof flatRate.currencyCode === 'string' ? flatRate.currencyCode : null,
        };
        if (!rates.some(item => item.amountMicros === rate.amountMicros && item.currencyCode === rate.currencyCode)) rates.push(rate);
      }
    }
    collectFlatRates(nested, rates);
  }
  return rates;
}

function summarizeShippingSettings(value: JsonObject | null): MerchantAuditSummary['shippingSettings'] {
  if (!value) return null;
  return {
    services: asArray(value.services).map(service => ({
      serviceName: typeof service.serviceName === 'string' ? service.serviceName : 'Unnamed service',
      active: service.active === true,
      deliveryCountries: asStrings(service.deliveryCountries),
      currencyCode: typeof service.currencyCode === 'string' ? service.currencyCode : null,
      shipmentType: typeof service.shipmentType === 'string' ? service.shipmentType : null,
      rateGroupCount: asArray(service.rateGroups).length,
      flatRates: collectFlatRates(service.rateGroups),
    })),
    warehouses: asArray(value.warehouses).length,
  };
}

export function sanitizeMerchantError(error: unknown) {
  const raw = error instanceof Error ? error.message : 'Unknown Merchant integration error.';
  return raw
    .replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, '[private key hidden]')
    .replace(/eyJ[A-Za-z0-9._-]{40,}/g, '[token hidden]')
    .replace(/(help|support)\s*token\s*[:=]\s*[A-Za-z0-9._~+\/-]+/gi, '$1 token: [hidden]')
    .slice(0, 1200);
}

export async function runMerchantAudit(): Promise<MerchantAuditSummary> {
  const { accountId, account } = await discoverAccount();
  const preAuditWarnings: string[] = [];
  let users: MerchantUser[] = [];
  try {
    users = await listPages<MerchantUser>(`/accounts/v1/accounts/${accountId}/users`, 'users', 100);
  } catch (error) {
    if (!isRegistrationRequired(error)) throw error;
    preAuditWarnings.push('Merchant users could not be listed before initial project registration, so registration was submitted without inventing a developer-contact email.');
  }
  const registration = await ensureDeveloperRegistration(accountId, users);

  const [dataSources, products, accountIssues] = await Promise.all([
    listPages<DataSource>(`/datasources/v1/accounts/${accountId}/dataSources`, 'dataSources', 1000),
    listPages<MerchantProduct>(`/products/v1/accounts/${accountId}/products`, 'products', 1000),
    listPages<AccountIssue>(`/accounts/v1/accounts/${accountId}/issues`, 'accountIssues', 100),
  ]);

  let rows: JsonObject[] | null = null;
  const warnings: string[] = [...preAuditWarnings];
  const [businessInfoResult, shippingSettingsResult] = await Promise.allSettled([
    merchantRequest<JsonObject>(`/accounts/v1/accounts/${accountId}/businessInfo`),
    merchantRequest<JsonObject>(`/accounts/v1/accounts/${accountId}/shippingSettings`),
  ]);
  const businessInfo = businessInfoResult.status === 'fulfilled' ? businessInfoResult.value : null;
  const shippingSettings = shippingSettingsResult.status === 'fulfilled' ? shippingSettingsResult.value : null;
  if (businessInfoResult.status === 'rejected') warnings.push(`Business information could not be retrieved: ${sanitizeMerchantError(businessInfoResult.reason)}`);
  if (shippingSettingsResult.status === 'rejected') warnings.push(`Shipping settings could not be retrieved: ${sanitizeMerchantError(shippingSettingsResult.reason)}`);
  try {
    rows = await reportRows(accountId);
  } catch (error) {
    warnings.push(`Product reporting view could not be retrieved: ${sanitizeMerchantError(error)}`);
  }

  const sourceProductCounts = new Map<string, number>();
  for (const product of products) {
    if (product.dataSource) sourceProductCounts.set(product.dataSource, (sourceProductCounts.get(product.dataSource) || 0) + 1);
  }

  const uploads = await Promise.all(dataSources.map(source => latestUpload(source)));
  const summarizedSources = dataSources.map((source, index) => {
    const settings = sourceSettings(source);
    const fileInput = asObject(source.fileInput);
    const fetchSettings = asObject(fileInput.fetchSettings);
    return {
      id: source.dataSourceId || source.name?.split('/').pop() || '',
      resourceName: source.name || '',
      displayName: source.displayName || 'Unnamed source',
      input: source.input || 'UNKNOWN',
      type: dataSourceType(source),
      productCount: sourceProductCounts.get(source.name || '') || 0,
      countries: asStrings(settings.countries),
      destinations: asArray(settings.destinations).map(destination => ({
        destination: typeof destination.destination === 'string' ? destination.destination : 'UNSPECIFIED',
        state: typeof destination.state === 'string' ? destination.state : 'UNSPECIFIED',
      })),
      fetch: source.fileInput ? {
        type: typeof fileInput.fileInputType === 'string' ? fileInput.fileInputType : 'UNKNOWN',
        uri: safeFetchUri(fetchSettings.fetchUri),
        frequency: typeof fetchSettings.frequency === 'string' ? fetchSettings.frequency : null,
        timeZone: typeof fetchSettings.timeZone === 'string' ? fetchSettings.timeZone : null,
      } : null,
      latestUpload: uploads[index],
    };
  });

  const knownSources = new Set(dataSources.map(source => source.name).filter(Boolean));
  const productsWithoutKnownSource = products.filter(product => !product.dataSource || !knownSources.has(product.dataSource)).length;
  const sourceCountedProducts = summarizedSources.reduce((total, source) => total + source.productCount, 0);
  const issueGroups = buildIssueGroups(products);
  const productsWithIssues = products.filter(product => productIssues(product).length > 0).length;
  const productsWithDisapprovals = products.filter(product =>
    productIssues(product).some(issue => issue.severity === 'DISAPPROVED')
    || destinationStatuses(product).some(status => status.disapprovedCountries.length > 0)
  ).length;
  const productsPending = products.filter(product => destinationStatuses(product).some(status => status.pendingCountries.length > 0)).length;
  const productsApprovedSomewhere = products.filter(product => destinationStatuses(product).some(status => status.approvedCountries.length > 0)).length;
  const destinationStatusRows = products.reduce((total, product) => total + destinationStatuses(product).length, 0);

  const reportingStatusCounts: Record<string, number> = {};
  for (const row of rows || []) {
    const view = asObject(row.productView);
    const status = typeof view.aggregatedReportingContextStatus === 'string' ? view.aggregatedReportingContextStatus : 'UNSPECIFIED';
    reportingStatusCounts[status] = (reportingStatusCounts[status] || 0) + 1;
  }

  const protectedSource = summarizedSources.find(source =>
    source.displayName.toLowerCase() === 'leafsolar product feed'
    || source.fetch?.uri === 'https://leafsolar.ng/google-merchant-feed.xml'
  );
  const productSource4 = summarizedSources.find(source => source.displayName.toUpperCase() === 'PRODUCTS SOURCE 4');

  const manualEntries = MANUAL_ENTRY_TITLES.map(expectedTitle => {
    const product = products.find(item => comparableTitle(productTitle(item)) === comparableTitle(expectedTitle));
    return {
      expectedTitle,
      actualTitle: product ? productTitle(product) : null,
      found: Boolean(product),
      offerId: product?.offerId || null,
      dataSource: product?.dataSource || null,
      status: product ? displayProductStatus(product) : 'Absent',
      issues: product ? productIssues(product).map(issue => ({
        code: issue.code,
        severity: issue.severity,
        description: issue.description,
      })) : [],
    };
  });

  if (!registration.developerContactConfigured) {
    warnings.push('The Cloud project is registered, but no unambiguous human developer-contact email was available.');
  }
  if (!protectedSource) warnings.push('The protected Leafsolar product feed was not found by display name or replacement fetch URL.');
  if (protectedSource && protectedSource.productCount !== 114) warnings.push(`The protected feed currently owns ${protectedSource.productCount} processed products instead of the expected 114.`);

  const reportingCount = rows?.length ?? null;
  const reconciliationResolved = reportingCount !== null
    && products.length === reportingCount
    && products.length === sourceCountedProducts
    && productsWithoutKnownSource === 0;
  const reconciliationNote = reconciliationResolved
    ? `The current API inventory is internally reconciled at ${products.length}: processed products, product_view rows and source ownership counts agree, with no products outside known sources. The earlier UI total of 120 is not present as three additional current API resources and must not be treated as three deletable products.`
    : `Current API counts do not fully agree: ${products.length} processed products, ${reportingCount ?? 'unavailable'} reporting rows and ${sourceCountedProducts} source-owned products.`;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    accountId,
    accountName: typeof account.accountName === 'string' ? account.accountName : 'Merchant Center account',
    registration,
    businessInfo: summarizeBusinessInfo(businessInfo),
    shippingSettings: summarizeShippingSettings(shippingSettings),
    totals: {
      processedProducts: products.length,
      reportingRows: reportingCount,
      configuredDataSources: dataSources.length,
      sourceCountedProducts,
      productsWithoutKnownSource,
      accountIssues: accountIssues.length,
      productIssueGroups: issueGroups.length,
      productsWithIssues,
      productsWithDisapprovals,
      productsPending,
      productsApprovedSomewhere,
      destinationStatusRows,
    },
    reportingStatusCounts,
    dataSources: summarizedSources,
    protectedFeed: {
      found: Boolean(protectedSource),
      productCount: protectedSource?.productCount || 0,
      healthyExpectedCount: protectedSource?.productCount === 114,
      sourceId: protectedSource?.id || null,
      fetchUriMatchesReplacement: protectedSource?.fetch?.uri === 'https://leafsolar.ng/google-merchant-feed.xml',
    },
    manualEntries,
    emptyProductSource4: {
      found: Boolean(productSource4),
      sourceId: productSource4?.id || null,
      productCount: productSource4?.productCount ?? null,
    },
    accountIssues: accountIssues.map(sanitizeAccountIssue),
    productIssues: issueGroups,
    salesChannelReconciliation: {
      previouslyObservedUiTotal: 120,
      processedProductCount: products.length,
      reportingRowCount: reportingCount,
      differenceFromProcessedProducts: 120 - products.length,
      differenceFromReportingRows: reportingCount === null ? null : 120 - reportingCount,
      resolved: reconciliationResolved,
      note: reconciliationNote,
    },
    destructiveChanges: [],
    warnings,
  };
}
