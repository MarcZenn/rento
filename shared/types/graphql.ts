import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '@server/graphql/middleware/auth';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  JSON: { input: any; output: any };
};

export type GQL_AppiAuditEvent = {
  __typename?: 'APPIAuditEvent';
  complianceStatus: Scalars['String']['output'];
  dataAccessed?: Maybe<Scalars['String']['output']>;
  eventDetails?: Maybe<Scalars['JSON']['output']>;
  eventId: Scalars['String']['output'];
  eventTimestamp: Scalars['DateTime']['output'];
  eventType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type GQL_AuditLogSearchResult = {
  __typename?: 'AuditLogSearchResult';
  events: Array<GQL_AppiAuditEvent>;
  hasMore: Scalars['Boolean']['output'];
  page: Scalars['Int']['output'];
  perPage: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type GQL_ComplianceMetrics = {
  __typename?: 'ComplianceMetrics';
  activeIncidents: Scalars['Int']['output'];
  auditEventsThisMonth: Scalars['Int']['output'];
  auditEventsThisWeek: Scalars['Int']['output'];
  auditEventsToday: Scalars['Int']['output'];
  avgResponseTime?: Maybe<Scalars['Float']['output']>;
  complianceScore: Scalars['Float']['output'];
  consentCompliant: Scalars['Int']['output'];
  consentPending: Scalars['Int']['output'];
  dataResidencyStatus: Scalars['String']['output'];
  dataResidencyViolations: Scalars['Int']['output'];
  lastIncident?: Maybe<GQL_IncidentSummary>;
  totalIncidents: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type GQL_ComplianceReport = {
  __typename?: 'ComplianceReport';
  complianceStatus: Scalars['String']['output'];
  dataResidency: GQL_DataResidencyMetrics;
  generatedAt: Scalars['DateTime']['output'];
  metrics: GQL_ComplianceMetrics;
  recentIncidents: Array<GQL_IncidentSummary>;
  recommendations?: Maybe<Array<Scalars['String']['output']>>;
  reportId: Scalars['String']['output'];
  timeRange: Scalars['String']['output'];
  topAuditEvents: Array<GQL_AppiAuditEvent>;
};

export type GQL_ConsentHistory = {
  __typename?: 'ConsentHistory';
  changeType: Scalars['String']['output'];
  changedAt: Scalars['DateTime']['output'];
  consentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  newValue?: Maybe<Scalars['JSON']['output']>;
  previousValue?: Maybe<Scalars['JSON']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type GQL_ConsentValidationResult = {
  __typename?: 'ConsentValidationResult';
  consentStatus?: Maybe<GQL_UserConsent>;
  isValid: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
};

export type GQL_Country = {
  __typename?: 'Country';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type GQL_CreateProfileInput = {
  about?: InputMaybe<Scalars['String']['input']>;
  consecutiveYearsEmployed?: InputMaybe<Scalars['Int']['input']>;
  employmentStatusId?: InputMaybe<Scalars['ID']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  hasGuarantor?: InputMaybe<Scalars['Boolean']['input']>;
  isForeignResident?: InputMaybe<Scalars['Boolean']['input']>;
  nationalityId?: InputMaybe<Scalars['ID']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
  userTypeId?: InputMaybe<Scalars['ID']['input']>;
};

export type GQL_CreateUserInput = {
  cognitoId?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  username: Scalars['String']['input'];
};

export type GQL_DataDeletionRequest = {
  __typename?: 'DataDeletionRequest';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  requestedAt: Scalars['DateTime']['output'];
  scheduledDeletionDate: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type GQL_DataResidencyMetrics = {
  __typename?: 'DataResidencyMetrics';
  japanRecords: Scalars['Int']['output'];
  lastCheckTimestamp: Scalars['DateTime']['output'];
  storageLocations: Array<GQL_StorageLocation>;
  totalRecords: Scalars['Int']['output'];
  violations: Scalars['Int']['output'];
};

export type GQL_EmploymentStatus = {
  __typename?: 'EmploymentStatus';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type GQL_IncidentDetail = {
  __typename?: 'IncidentDetail';
  affectedUsersCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  dataTypesAffected?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  incidentDescription: Scalars['String']['output'];
  incidentId: Scalars['String']['output'];
  incidentTimestamp: Scalars['DateTime']['output'];
  incidentType: Scalars['String']['output'];
  regulatoryNotificationSent: Scalars['Boolean']['output'];
  regulatoryNotificationTimestamp?: Maybe<Scalars['DateTime']['output']>;
  remediationActions?: Maybe<Array<Scalars['String']['output']>>;
  resolvedTimestamp?: Maybe<Scalars['DateTime']['output']>;
  severity: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GQL_IncidentSummary = {
  __typename?: 'IncidentSummary';
  affectedUsersCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  incidentId: Scalars['String']['output'];
  incidentType: Scalars['String']['output'];
  severity: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
};

export type GQL_IncidentTrackingResult = {
  __typename?: 'IncidentTrackingResult';
  criticalCount: Scalars['Int']['output'];
  incidents: Array<GQL_IncidentDetail>;
  openCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type GQL_Mutation = {
  __typename?: 'Mutation';
  createProfile: GQL_Profile;
  createUser: GQL_User;
  deleteUser: GQL_MutationResponse;
  logAuditEvent: GQL_AppiAuditEvent;
  processDataDeletionRequest: GQL_DataDeletionRequest;
  recordUserConsent: GQL_UserConsent;
  updatePrivacyPolicyVersion: GQL_MutationResponse;
  updateProfile: GQL_Profile;
  updateUser: GQL_User;
  updateUserConsent: GQL_UserConsent;
  updateUserIsVerified: GQL_User;
  withdrawConsent: GQL_MutationResponse;
};

export type GQL_MutationCreateProfileArgs = {
  input: GQL_CreateProfileInput;
};

export type GQL_MutationCreateUserArgs = {
  input: GQL_CreateUserInput;
};

export type GQL_MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type GQL_MutationLogAuditEventArgs = {
  complianceStatus: Scalars['String']['input'];
  dataAccessed?: InputMaybe<Scalars['String']['input']>;
  eventDetails?: InputMaybe<Scalars['JSON']['input']>;
  eventType: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GQL_MutationProcessDataDeletionRequestArgs = {
  deletionScope: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type GQL_MutationRecordUserConsentArgs = {
  input: GQL_RecordConsentInput;
};

export type GQL_MutationUpdatePrivacyPolicyVersionArgs = {
  effectiveDate: Scalars['DateTime']['input'];
  version: Scalars['String']['input'];
};

export type GQL_MutationUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: GQL_UpdateProfileInput;
};

export type GQL_MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: GQL_UpdateUserInput;
};

export type GQL_MutationUpdateUserConsentArgs = {
  input: GQL_UpdateConsentInput;
  userId: Scalars['ID']['input'];
};

export type GQL_MutationUpdateUserIsVerifiedArgs = {
  cognitoId: Scalars['String']['input'];
};

export type GQL_MutationWithdrawConsentArgs = {
  userId: Scalars['ID']['input'];
};

export type GQL_MutationResponse = {
  __typename?: 'MutationResponse';
  data?: Maybe<Scalars['JSON']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type GQL_Profile = {
  __typename?: 'Profile';
  about?: Maybe<Scalars['String']['output']>;
  consecutiveYearsEmployed?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  employmentStatus?: Maybe<GQL_EmploymentStatus>;
  firstName?: Maybe<Scalars['String']['output']>;
  hasGuarantor?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  isForeignResident?: Maybe<Scalars['Boolean']['output']>;
  lastActive?: Maybe<Scalars['DateTime']['output']>;
  nationality?: Maybe<GQL_Country>;
  onboardingCompleted?: Maybe<Scalars['Boolean']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  rentalReadinessScore?: Maybe<Scalars['Int']['output']>;
  savedProperties?: Maybe<Array<Scalars['ID']['output']>>;
  surname?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<GQL_User>;
  userId: Scalars['ID']['output'];
  userType?: Maybe<GQL_UserType>;
};

export type GQL_Query = {
  __typename?: 'Query';
  currentUser?: Maybe<GQL_User>;
  generateComplianceReport: GQL_ComplianceReport;
  generateConsentAuditTrail: Scalars['JSON']['output'];
  getAllUsers: Array<GQL_User>;
  getAuditEvents: Array<GQL_AppiAuditEvent>;
  getComplianceMetrics: GQL_ComplianceMetrics;
  getConsentHistory: Array<GQL_ConsentHistory>;
  getDataResidencyMetrics: GQL_DataResidencyMetrics;
  getIncidentTracking: GQL_IncidentTrackingResult;
  getProfile?: Maybe<GQL_Profile>;
  getUser?: Maybe<GQL_User>;
  getUserByCognitoId?: Maybe<GQL_User>;
  getUserConsent?: Maybe<GQL_UserConsent>;
  getUserProfile?: Maybe<GQL_Profile>;
  getUserTypes: Array<GQL_UserType>;
  searchAuditLogs: GQL_AuditLogSearchResult;
  validateUserConsent: GQL_ConsentValidationResult;
};

export type GQL_QueryGenerateComplianceReportArgs = {
  timeRange: Scalars['String']['input'];
};

export type GQL_QueryGenerateConsentAuditTrailArgs = {
  userId: Scalars['ID']['input'];
};

export type GQL_QueryGetAuditEventsArgs = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  eventType?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GQL_QueryGetComplianceMetricsArgs = {
  timeRange: Scalars['String']['input'];
};

export type GQL_QueryGetConsentHistoryArgs = {
  userId: Scalars['ID']['input'];
};

export type GQL_QueryGetIncidentTrackingArgs = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  severity?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type GQL_QueryGetProfileArgs = {
  id: Scalars['ID']['input'];
};

export type GQL_QueryGetUserArgs = {
  id: Scalars['ID']['input'];
};

export type GQL_QueryGetUserByCognitoIdArgs = {
  cognitoId: Scalars['String']['input'];
};

export type GQL_QueryGetUserConsentArgs = {
  userId: Scalars['ID']['input'];
};

export type GQL_QueryGetUserProfileArgs = {
  userId: Scalars['ID']['input'];
};

export type GQL_QuerySearchAuditLogsArgs = {
  complianceStatus?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['DateTime']['input'];
  eventType?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
  startDate: Scalars['DateTime']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GQL_QueryValidateUserConsentArgs = {
  consentType: Scalars['String']['input'];
  operation: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type GQL_RecordConsentInput = {
  analyticsConsent: Scalars['Boolean']['input'];
  communicationConsent: Scalars['Boolean']['input'];
  consentIpAddress: Scalars['String']['input'];
  consentMethod: Scalars['String']['input'];
  consentUserAgent?: InputMaybe<Scalars['String']['input']>;
  consentVersion: Scalars['String']['input'];
  legalBasis: Scalars['String']['input'];
  locationDataConsent: Scalars['Boolean']['input'];
  marketingConsent?: InputMaybe<Scalars['Boolean']['input']>;
  policyVersionAccepted: Scalars['String']['input'];
  profileDataConsent: Scalars['Boolean']['input'];
  userId: Scalars['ID']['input'];
};

export type GQL_StorageLocation = {
  __typename?: 'StorageLocation';
  encryptionStatus: Scalars['String']['output'];
  location: Scalars['String']['output'];
  recordCount: Scalars['Int']['output'];
};

export type GQL_UpdateConsentInput = {
  analyticsConsent?: InputMaybe<Scalars['Boolean']['input']>;
  communicationConsent?: InputMaybe<Scalars['Boolean']['input']>;
  locationDataConsent?: InputMaybe<Scalars['Boolean']['input']>;
  marketingConsent?: InputMaybe<Scalars['Boolean']['input']>;
  profileDataConsent?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQL_UpdateProfileInput = {
  about?: InputMaybe<Scalars['String']['input']>;
  consecutiveYearsEmployed?: InputMaybe<Scalars['Int']['input']>;
  employmentStatusId?: InputMaybe<Scalars['ID']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  hasGuarantor?: InputMaybe<Scalars['Boolean']['input']>;
  isForeignResident?: InputMaybe<Scalars['Boolean']['input']>;
  nationalityId?: InputMaybe<Scalars['ID']['input']>;
  onboardingCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
  userTypeId?: InputMaybe<Scalars['ID']['input']>;
};

export type GQL_UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type GQL_User = {
  __typename?: 'User';
  cognitoId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isVerified: Scalars['Boolean']['output'];
  profile?: Maybe<GQL_Profile>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type GQL_UserConsent = {
  __typename?: 'UserConsent';
  analyticsConsent: Scalars['Boolean']['output'];
  communicationConsent: Scalars['Boolean']['output'];
  consentIpAddress: Scalars['String']['output'];
  consentMethod: Scalars['String']['output'];
  consentTimestamp: Scalars['DateTime']['output'];
  consentUserAgent?: Maybe<Scalars['String']['output']>;
  consentVersion: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastUpdated: Scalars['DateTime']['output'];
  legalBasis: Scalars['String']['output'];
  locationDataConsent: Scalars['Boolean']['output'];
  marketingConsent?: Maybe<Scalars['Boolean']['output']>;
  policyVersionAccepted: Scalars['String']['output'];
  profileDataConsent: Scalars['Boolean']['output'];
  user?: Maybe<GQL_User>;
  userId: Scalars['ID']['output'];
  withdrawalTimestamp?: Maybe<Scalars['DateTime']['output']>;
};

export type GQL_UserType = {
  __typename?: 'UserType';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<
  TTypes,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<
  T = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type GQL_ResolversTypes = {
  APPIAuditEvent: ResolverTypeWrapper<GQL_AppiAuditEvent>;
  AuditLogSearchResult: ResolverTypeWrapper<GQL_AuditLogSearchResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ComplianceMetrics: ResolverTypeWrapper<GQL_ComplianceMetrics>;
  ComplianceReport: ResolverTypeWrapper<GQL_ComplianceReport>;
  ConsentHistory: ResolverTypeWrapper<GQL_ConsentHistory>;
  ConsentValidationResult: ResolverTypeWrapper<GQL_ConsentValidationResult>;
  Country: ResolverTypeWrapper<GQL_Country>;
  CreateProfileInput: GQL_CreateProfileInput;
  CreateUserInput: GQL_CreateUserInput;
  DataDeletionRequest: ResolverTypeWrapper<GQL_DataDeletionRequest>;
  DataResidencyMetrics: ResolverTypeWrapper<GQL_DataResidencyMetrics>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  EmploymentStatus: ResolverTypeWrapper<GQL_EmploymentStatus>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IncidentDetail: ResolverTypeWrapper<GQL_IncidentDetail>;
  IncidentSummary: ResolverTypeWrapper<GQL_IncidentSummary>;
  IncidentTrackingResult: ResolverTypeWrapper<GQL_IncidentTrackingResult>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  MutationResponse: ResolverTypeWrapper<GQL_MutationResponse>;
  Profile: ResolverTypeWrapper<GQL_Profile>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RecordConsentInput: GQL_RecordConsentInput;
  StorageLocation: ResolverTypeWrapper<GQL_StorageLocation>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateConsentInput: GQL_UpdateConsentInput;
  UpdateProfileInput: GQL_UpdateProfileInput;
  UpdateUserInput: GQL_UpdateUserInput;
  User: ResolverTypeWrapper<GQL_User>;
  UserConsent: ResolverTypeWrapper<GQL_UserConsent>;
  UserType: ResolverTypeWrapper<GQL_UserType>;
};

/** Mapping between all available schema types and the resolvers parents */
export type GQL_ResolversParentTypes = {
  APPIAuditEvent: GQL_AppiAuditEvent;
  AuditLogSearchResult: GQL_AuditLogSearchResult;
  Boolean: Scalars['Boolean']['output'];
  ComplianceMetrics: GQL_ComplianceMetrics;
  ComplianceReport: GQL_ComplianceReport;
  ConsentHistory: GQL_ConsentHistory;
  ConsentValidationResult: GQL_ConsentValidationResult;
  Country: GQL_Country;
  CreateProfileInput: GQL_CreateProfileInput;
  CreateUserInput: GQL_CreateUserInput;
  DataDeletionRequest: GQL_DataDeletionRequest;
  DataResidencyMetrics: GQL_DataResidencyMetrics;
  DateTime: Scalars['DateTime']['output'];
  EmploymentStatus: GQL_EmploymentStatus;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  IncidentDetail: GQL_IncidentDetail;
  IncidentSummary: GQL_IncidentSummary;
  IncidentTrackingResult: GQL_IncidentTrackingResult;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: Record<PropertyKey, never>;
  MutationResponse: GQL_MutationResponse;
  Profile: GQL_Profile;
  Query: Record<PropertyKey, never>;
  RecordConsentInput: GQL_RecordConsentInput;
  StorageLocation: GQL_StorageLocation;
  String: Scalars['String']['output'];
  UpdateConsentInput: GQL_UpdateConsentInput;
  UpdateProfileInput: GQL_UpdateProfileInput;
  UpdateUserInput: GQL_UpdateUserInput;
  User: GQL_User;
  UserConsent: GQL_UserConsent;
  UserType: GQL_UserType;
};

export type GQL_AppiAuditEventResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['APPIAuditEvent'] = GQL_ResolversParentTypes['APPIAuditEvent'],
> = {
  complianceStatus?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  dataAccessed?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  eventDetails?: Resolver<Maybe<GQL_ResolversTypes['JSON']>, ParentType, ContextType>;
  eventId?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  eventTimestamp?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  eventType?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  ipAddress?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  userAgent?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<GQL_ResolversTypes['ID']>, ParentType, ContextType>;
};

export type GQL_AuditLogSearchResultResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['AuditLogSearchResult'] = GQL_ResolversParentTypes['AuditLogSearchResult'],
> = {
  events?: Resolver<Array<GQL_ResolversTypes['APPIAuditEvent']>, ParentType, ContextType>;
  hasMore?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  page?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  perPage?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  totalCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
};

export type GQL_ComplianceMetricsResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['ComplianceMetrics'] = GQL_ResolversParentTypes['ComplianceMetrics'],
> = {
  activeIncidents?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  auditEventsThisMonth?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  auditEventsThisWeek?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  auditEventsToday?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  avgResponseTime?: Resolver<Maybe<GQL_ResolversTypes['Float']>, ParentType, ContextType>;
  complianceScore?: Resolver<GQL_ResolversTypes['Float'], ParentType, ContextType>;
  consentCompliant?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  consentPending?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  dataResidencyStatus?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  dataResidencyViolations?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  lastIncident?: Resolver<Maybe<GQL_ResolversTypes['IncidentSummary']>, ParentType, ContextType>;
  totalIncidents?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  totalUsers?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
};

export type GQL_ComplianceReportResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['ComplianceReport'] = GQL_ResolversParentTypes['ComplianceReport'],
> = {
  complianceStatus?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  dataResidency?: Resolver<GQL_ResolversTypes['DataResidencyMetrics'], ParentType, ContextType>;
  generatedAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  metrics?: Resolver<GQL_ResolversTypes['ComplianceMetrics'], ParentType, ContextType>;
  recentIncidents?: Resolver<Array<GQL_ResolversTypes['IncidentSummary']>, ParentType, ContextType>;
  recommendations?: Resolver<Maybe<Array<GQL_ResolversTypes['String']>>, ParentType, ContextType>;
  reportId?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  timeRange?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  topAuditEvents?: Resolver<Array<GQL_ResolversTypes['APPIAuditEvent']>, ParentType, ContextType>;
};

export type GQL_ConsentHistoryResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['ConsentHistory'] = GQL_ResolversParentTypes['ConsentHistory'],
> = {
  changeType?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  changedAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  consentId?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  ipAddress?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  newValue?: Resolver<Maybe<GQL_ResolversTypes['JSON']>, ParentType, ContextType>;
  previousValue?: Resolver<Maybe<GQL_ResolversTypes['JSON']>, ParentType, ContextType>;
  userAgent?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
};

export type GQL_ConsentValidationResultResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['ConsentValidationResult'] = GQL_ResolversParentTypes['ConsentValidationResult'],
> = {
  consentStatus?: Resolver<Maybe<GQL_ResolversTypes['UserConsent']>, ParentType, ContextType>;
  isValid?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  reason?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
};

export type GQL_CountryResolvers<
  ContextType = Context,
  ParentType extends GQL_ResolversParentTypes['Country'] = GQL_ResolversParentTypes['Country'],
> = {
  code?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
};

export type GQL_DataDeletionRequestResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['DataDeletionRequest'] = GQL_ResolversParentTypes['DataDeletionRequest'],
> = {
  completedAt?: Resolver<Maybe<GQL_ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  requestedAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  scheduledDeletionDate?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
};

export type GQL_DataResidencyMetricsResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['DataResidencyMetrics'] = GQL_ResolversParentTypes['DataResidencyMetrics'],
> = {
  japanRecords?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  lastCheckTimestamp?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  storageLocations?: Resolver<
    Array<GQL_ResolversTypes['StorageLocation']>,
    ParentType,
    ContextType
  >;
  totalRecords?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  violations?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
};

export interface GQL_DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<GQL_ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type GQL_EmploymentStatusResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['EmploymentStatus'] = GQL_ResolversParentTypes['EmploymentStatus'],
> = {
  description?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
};

export type GQL_IncidentDetailResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['IncidentDetail'] = GQL_ResolversParentTypes['IncidentDetail'],
> = {
  affectedUsersCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  dataTypesAffected?: Resolver<Maybe<Array<GQL_ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  incidentDescription?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  incidentId?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  incidentTimestamp?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  incidentType?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  regulatoryNotificationSent?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  regulatoryNotificationTimestamp?: Resolver<
    Maybe<GQL_ResolversTypes['DateTime']>,
    ParentType,
    ContextType
  >;
  remediationActions?: Resolver<
    Maybe<Array<GQL_ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  resolvedTimestamp?: Resolver<Maybe<GQL_ResolversTypes['DateTime']>, ParentType, ContextType>;
  severity?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type GQL_IncidentSummaryResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['IncidentSummary'] = GQL_ResolversParentTypes['IncidentSummary'],
> = {
  affectedUsersCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  incidentId?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  incidentType?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  severity?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type GQL_IncidentTrackingResultResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['IncidentTrackingResult'] = GQL_ResolversParentTypes['IncidentTrackingResult'],
> = {
  criticalCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  incidents?: Resolver<Array<GQL_ResolversTypes['IncidentDetail']>, ParentType, ContextType>;
  openCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
  totalCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
};

export interface GQL_JsonScalarConfig
  extends GraphQLScalarTypeConfig<GQL_ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type GQL_MutationResolvers<
  ContextType = Context,
  ParentType extends GQL_ResolversParentTypes['Mutation'] = GQL_ResolversParentTypes['Mutation'],
> = {
  createProfile?: Resolver<
    GQL_ResolversTypes['Profile'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationCreateProfileArgs, 'input'>
  >;
  createUser?: Resolver<
    GQL_ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationCreateUserArgs, 'input'>
  >;
  deleteUser?: Resolver<
    GQL_ResolversTypes['MutationResponse'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationDeleteUserArgs, 'id'>
  >;
  logAuditEvent?: Resolver<
    GQL_ResolversTypes['APPIAuditEvent'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationLogAuditEventArgs, 'complianceStatus' | 'eventType'>
  >;
  processDataDeletionRequest?: Resolver<
    GQL_ResolversTypes['DataDeletionRequest'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationProcessDataDeletionRequestArgs, 'deletionScope' | 'userId'>
  >;
  recordUserConsent?: Resolver<
    GQL_ResolversTypes['UserConsent'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationRecordUserConsentArgs, 'input'>
  >;
  updatePrivacyPolicyVersion?: Resolver<
    GQL_ResolversTypes['MutationResponse'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationUpdatePrivacyPolicyVersionArgs, 'effectiveDate' | 'version'>
  >;
  updateProfile?: Resolver<
    GQL_ResolversTypes['Profile'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationUpdateProfileArgs, 'id' | 'input'>
  >;
  updateUser?: Resolver<
    GQL_ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationUpdateUserArgs, 'id' | 'input'>
  >;
  updateUserConsent?: Resolver<
    GQL_ResolversTypes['UserConsent'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationUpdateUserConsentArgs, 'input' | 'userId'>
  >;
  updateUserIsVerified?: Resolver<
    GQL_ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationUpdateUserIsVerifiedArgs, 'cognitoId'>
  >;
  withdrawConsent?: Resolver<
    GQL_ResolversTypes['MutationResponse'],
    ParentType,
    ContextType,
    RequireFields<GQL_MutationWithdrawConsentArgs, 'userId'>
  >;
};

export type GQL_MutationResponseResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['MutationResponse'] = GQL_ResolversParentTypes['MutationResponse'],
> = {
  data?: Resolver<Maybe<GQL_ResolversTypes['JSON']>, ParentType, ContextType>;
  message?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type GQL_ProfileResolvers<
  ContextType = Context,
  ParentType extends GQL_ResolversParentTypes['Profile'] = GQL_ResolversParentTypes['Profile'],
> = {
  about?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  consecutiveYearsEmployed?: Resolver<Maybe<GQL_ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  employmentStatus?: Resolver<
    Maybe<GQL_ResolversTypes['EmploymentStatus']>,
    ParentType,
    ContextType
  >;
  firstName?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  hasGuarantor?: Resolver<Maybe<GQL_ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  isForeignResident?: Resolver<Maybe<GQL_ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastActive?: Resolver<Maybe<GQL_ResolversTypes['DateTime']>, ParentType, ContextType>;
  nationality?: Resolver<Maybe<GQL_ResolversTypes['Country']>, ParentType, ContextType>;
  onboardingCompleted?: Resolver<Maybe<GQL_ResolversTypes['Boolean']>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  rentalReadinessScore?: Resolver<Maybe<GQL_ResolversTypes['Int']>, ParentType, ContextType>;
  savedProperties?: Resolver<Maybe<Array<GQL_ResolversTypes['ID']>>, ParentType, ContextType>;
  surname?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GQL_ResolversTypes['DateTime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GQL_ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  userType?: Resolver<Maybe<GQL_ResolversTypes['UserType']>, ParentType, ContextType>;
};

export type GQL_QueryResolvers<
  ContextType = Context,
  ParentType extends GQL_ResolversParentTypes['Query'] = GQL_ResolversParentTypes['Query'],
> = {
  currentUser?: Resolver<Maybe<GQL_ResolversTypes['User']>, ParentType, ContextType>;
  generateComplianceReport?: Resolver<
    GQL_ResolversTypes['ComplianceReport'],
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGenerateComplianceReportArgs, 'timeRange'>
  >;
  generateConsentAuditTrail?: Resolver<
    GQL_ResolversTypes['JSON'],
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGenerateConsentAuditTrailArgs, 'userId'>
  >;
  getAllUsers?: Resolver<Array<GQL_ResolversTypes['User']>, ParentType, ContextType>;
  getAuditEvents?: Resolver<
    Array<GQL_ResolversTypes['APPIAuditEvent']>,
    ParentType,
    ContextType,
    Partial<GQL_QueryGetAuditEventsArgs>
  >;
  getComplianceMetrics?: Resolver<
    GQL_ResolversTypes['ComplianceMetrics'],
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetComplianceMetricsArgs, 'timeRange'>
  >;
  getConsentHistory?: Resolver<
    Array<GQL_ResolversTypes['ConsentHistory']>,
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetConsentHistoryArgs, 'userId'>
  >;
  getDataResidencyMetrics?: Resolver<
    GQL_ResolversTypes['DataResidencyMetrics'],
    ParentType,
    ContextType
  >;
  getIncidentTracking?: Resolver<
    GQL_ResolversTypes['IncidentTrackingResult'],
    ParentType,
    ContextType,
    Partial<GQL_QueryGetIncidentTrackingArgs>
  >;
  getProfile?: Resolver<
    Maybe<GQL_ResolversTypes['Profile']>,
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetProfileArgs, 'id'>
  >;
  getUser?: Resolver<
    Maybe<GQL_ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetUserArgs, 'id'>
  >;
  getUserByCognitoId?: Resolver<
    Maybe<GQL_ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetUserByCognitoIdArgs, 'cognitoId'>
  >;
  getUserConsent?: Resolver<
    Maybe<GQL_ResolversTypes['UserConsent']>,
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetUserConsentArgs, 'userId'>
  >;
  getUserProfile?: Resolver<
    Maybe<GQL_ResolversTypes['Profile']>,
    ParentType,
    ContextType,
    RequireFields<GQL_QueryGetUserProfileArgs, 'userId'>
  >;
  getUserTypes?: Resolver<Array<GQL_ResolversTypes['UserType']>, ParentType, ContextType>;
  searchAuditLogs?: Resolver<
    GQL_ResolversTypes['AuditLogSearchResult'],
    ParentType,
    ContextType,
    RequireFields<GQL_QuerySearchAuditLogsArgs, 'endDate' | 'startDate'>
  >;
  validateUserConsent?: Resolver<
    GQL_ResolversTypes['ConsentValidationResult'],
    ParentType,
    ContextType,
    RequireFields<GQL_QueryValidateUserConsentArgs, 'consentType' | 'operation' | 'userId'>
  >;
};

export type GQL_StorageLocationResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['StorageLocation'] = GQL_ResolversParentTypes['StorageLocation'],
> = {
  encryptionStatus?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  recordCount?: Resolver<GQL_ResolversTypes['Int'], ParentType, ContextType>;
};

export type GQL_UserResolvers<
  ContextType = Context,
  ParentType extends GQL_ResolversParentTypes['User'] = GQL_ResolversParentTypes['User'],
> = {
  cognitoId?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  isVerified?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  profile?: Resolver<Maybe<GQL_ResolversTypes['Profile']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GQL_ResolversTypes['DateTime']>, ParentType, ContextType>;
  username?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
};

export type GQL_UserConsentResolvers<
  ContextType = Context,
  ParentType extends
    GQL_ResolversParentTypes['UserConsent'] = GQL_ResolversParentTypes['UserConsent'],
> = {
  analyticsConsent?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  communicationConsent?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  consentIpAddress?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  consentMethod?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  consentTimestamp?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  consentUserAgent?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  consentVersion?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdated?: Resolver<GQL_ResolversTypes['DateTime'], ParentType, ContextType>;
  legalBasis?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  locationDataConsent?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  marketingConsent?: Resolver<Maybe<GQL_ResolversTypes['Boolean']>, ParentType, ContextType>;
  policyVersionAccepted?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
  profileDataConsent?: Resolver<GQL_ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<GQL_ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  withdrawalTimestamp?: Resolver<Maybe<GQL_ResolversTypes['DateTime']>, ParentType, ContextType>;
};

export type GQL_UserTypeResolvers<
  ContextType = Context,
  ParentType extends GQL_ResolversParentTypes['UserType'] = GQL_ResolversParentTypes['UserType'],
> = {
  description?: Resolver<Maybe<GQL_ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQL_ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GQL_ResolversTypes['String'], ParentType, ContextType>;
};

export type GQL_Resolvers<ContextType = Context> = {
  APPIAuditEvent?: GQL_AppiAuditEventResolvers<ContextType>;
  AuditLogSearchResult?: GQL_AuditLogSearchResultResolvers<ContextType>;
  ComplianceMetrics?: GQL_ComplianceMetricsResolvers<ContextType>;
  ComplianceReport?: GQL_ComplianceReportResolvers<ContextType>;
  ConsentHistory?: GQL_ConsentHistoryResolvers<ContextType>;
  ConsentValidationResult?: GQL_ConsentValidationResultResolvers<ContextType>;
  Country?: GQL_CountryResolvers<ContextType>;
  DataDeletionRequest?: GQL_DataDeletionRequestResolvers<ContextType>;
  DataResidencyMetrics?: GQL_DataResidencyMetricsResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  EmploymentStatus?: GQL_EmploymentStatusResolvers<ContextType>;
  IncidentDetail?: GQL_IncidentDetailResolvers<ContextType>;
  IncidentSummary?: GQL_IncidentSummaryResolvers<ContextType>;
  IncidentTrackingResult?: GQL_IncidentTrackingResultResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: GQL_MutationResolvers<ContextType>;
  MutationResponse?: GQL_MutationResponseResolvers<ContextType>;
  Profile?: GQL_ProfileResolvers<ContextType>;
  Query?: GQL_QueryResolvers<ContextType>;
  StorageLocation?: GQL_StorageLocationResolvers<ContextType>;
  User?: GQL_UserResolvers<ContextType>;
  UserConsent?: GQL_UserConsentResolvers<ContextType>;
  UserType?: GQL_UserTypeResolvers<ContextType>;
};
