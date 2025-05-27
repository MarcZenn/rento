import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const user_types = {
  slug: v.union(
    v.literal('renter'),
    v.literal('agent'),
    v.literal('admin'),
    v.literal('partner'),
    v.literal('advertiser')
  ),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const employment_statuses = {
  status: v.union(
    v.literal('student'),
    v.literal('unemployed'),
    v.literal('freelancer'),
    v.literal('part-time'),
    v.literal('salaried')
  ),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const users = {
  email: v.string(), // unique
  username: v.string(), // unique
  phone_number: v.optional(v.string()), // unique
  first_name: v.string(),
  surname: v.string(),
  language_preference: v.optional(v.id('languages')), // one to one
  user_type: v.optional(v.id('user_types')), // one to one
  is_foreign_resident: v.optional(v.boolean()),
  nationality: v.optional(v.id('countries')), // one to one
  has_guarantor: v.optional(v.boolean()),
  employment_status: v.optional(v.id('employment_statuses')),
  consecutive_years_employed: v.optional(v.int64()),
  rental_readiness_score: v.optional(v.int64()),
  preferred_wards: v.optional(v.id('wards')), // one to many
  saved_properties: v.optional(v.id('properties')), // one to many
  onboarding_completed: v.optional(v.boolean()),
  last_active: v.optional(v.string()), // ISO8601 format
  updated_at: v.optional(v.string()), // ISO8601 format
};
const user_translations = {
  user_id: v.id('users'), // one to many
  language: v.id('languages'), // one to many
  about: v.optional(v.string()),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const tags = {
  label: v.string(), // unique
  icon: v.optional(v.string()), // (Optional) Icon name or URL (e.g. "🐾", "🏷️", or "tag-key.svg")
  is_featured: v.boolean(),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const tags_translations = {
  tags_id: v.id('tags'),
  language: v.id('languages'),
  slug: v.string(), // Machine-readable ID (e.g. "pet-ok", "no-key-money")
  description: v.string(),
};

const countries = {
  country_code: v.string(),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const country_translations = {
  countries_id: v.id('countries'),
  language: v.id('langauages'),
  country_name: v.string(),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const prefectures = {
  name: v.string(),
  language: v.id('languages'),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const cities = {
  prefecture_id: v.id('prefectures'),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const cities_translations = {
  cities_id: v.id('cities'),
  language: v.id('languages'),
  name: v.string(),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const wards = {
  city_id: v.id('cities'),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const wards_translations = {
  wards_id: v.id('wards'),
  name: v.string(),
  language: v.id('languages'),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const floor_plans = {
  type: v.string(),
  description: v.string(),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const agencies = {
  account_owner: v.id('users'),
  contact_email: v.string(),
  phone_number: v.optional(v.string()),
  agency_name: v.string(), // unique
  ward_id: v.id('wards'),
  website_url: v.optional(v.string()),
  logo_url: v.optional(v.string()),
  bilingual_support: v.optional(v.boolean()),
  verified: v.optional(v.boolean()),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const agencies_translations = {
  agencies_id: v.id('agencies'),
  language: v.id('languages'),
  company_bio: v.optional(v.string()),
};

const agents = {
  user_id: v.id('users'),
  agency_id: v.id('agencies'),
  license_number: v.optional(v.string()),
  languages_spoken: v.optional(v.array(v.string())),
  updated_at: v.optional(v.string()), // ISO8601 format
};
const agents_translations = {
  agents_id: v.id('agents'),
  language: v.id('languages'),
  agent_name: v.string(),
  bio: v.optional(v.string()),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const properties = {
  name: v.string(),
  ward: v.id('wards'),
  postal_code: v.int64(),
  street_name: v.string(),
  rent_amount: v.float64(),
  key_money_amount: v.optional(v.float64()),
  deposit_amount: v.optional(v.float64()),
  maintenance_fee: v.optional(v.float64()),
  floor_plan: v.optional(v.id('floor_plans')),
  area_m2: v.optional(v.float64()),
  nearest_station_walk_min: v.optional(v.int64()),
  tags: v.array(v.id('tags')),
  furnished: v.optional(v.boolean()),
  guarantor_required: v.optional(v.boolean()),
  photos: v.array(v.string()),
  agency_id: v.id('agencies'),
  agent_id: v.id('agents'),
  is_verified: v.optional(v.boolean()),
  date_listed: v.optional(v.string()), // ISO8601 format
  updated_at: v.optional(v.string()), // ISO8601 format
  lat: v.optional(v.float64()),
  lng: v.optional(v.float64()),
};

const chat_statuses = {
  status: v.union(
    v.literal('active'),
    v.literal('stale'),
    v.literal('closed'),
    v.literal('expired'),
    v.literal('archived')
  ),
  updated_at: v.optional(v.string()), // ISO8601 format
};

const chats = {
  user_id: v.id('users'),
  agent_id: v.id('agents'),
  property_id: v.optional(v.id('properties')),
  status: v.id('chat_statuses'),
  last_message_at: v.optional(v.string()), // ISO8601 format
  last_seen_by_user: v.optional(v.string()), // ISO8601 format
  last_seen_by_agent: v.optional(v.string()), // ISO8601 format
  expires_at: v.optional(v.string()), // ISO8601 format - (optional, for full chat expiration)
  updated_at: v.optional(v.string()), // ISO8601 format
};

const messages = {
  chat_id: v.id('chats'),
  sender_id: v.union(v.id('users'), v.id('agents')),
  sender_type: v.id('user_types'),
  source_language: v.id('langauges'),
  target_language: v.id('languages'),
  original_text: v.string(), // Message in sender's language
  translated_text: v.string(), // Message in recipient's language
  read: v.boolean(), // Message read status
  is_expired: v.optional(v.boolean()), // Marked true before deletion
  expires_at: v.optional(v.string()), // ISO8601 format
  updated_at: v.optional(v.string()), // ISO8601 format
};

const languages = {
  language_code: v.string(),
  is_supported: v.boolean(),
  rtl: v.boolean(), // right-to-left language
  updated_at: v.optional(v.string()), // ISO8601 format
};
const language_translations = {
  languages_id: v.id('languages'),
  language_name: v.string(),
  updated_at: v.optional(v.string()), // ISO8601 format
};

// Convex does not currently support defining unique fields directly at the schema
// or database level in the same way as traditional SQL databases. To do this:
// - Define an index on the field you want to be unique.
// - Check for existing documents with the same value before inserting or updating a record.
defineSchema({
  languages: defineTable(languages).index('language_code_index', ['language_code']),
  language_translations: defineTable(language_translations).index('language_translation_index', [
    'languages_id',
    'language_name',
  ]),
  tags: defineTable(tags).index('label_unique_index', ['label']),
  tags_translations: defineTable(tags_translations).index('tag_translation_index', [
    'tags_id',
    'language',
  ]),
  user_types: defineTable(user_types),
  employment_statuses: defineTable(employment_statuses),
  users: defineTable(users)
    .index('email_unique_index', ['email'])
    .index('phone_number_unique_index', ['phone_number'])
    .index('username_unique_index', ['username']),
  user_translations: defineTable(user_translations).index('user_translation_index', [
    'user_id',
    'language',
  ]),
  countries: defineTable(countries).index('country_code_index', ['country_code']),
  country_translations: defineTable(country_translations).index('country_translation_index', [
    'countries_id',
    'language',
  ]),
  prefectures: defineTable(prefectures).index('prefecture_translation_index', ['name', 'language']),
  cities: defineTable(cities),
  cities_translations: defineTable(cities_translations).index('city_translation_index', [
    'cities_id',
    'language',
  ]),
  wards: defineTable(wards),
  wards_translations: defineTable(wards_translations).index('ward_translation_index', [
    'wards_id',
    'language',
  ]),
  agencies: defineTable(agencies)
    .index('contact_email_index', ['contact_email'])
    .index('phone_number_index', ['phone_number'])
    .index('website_url_index', ['website_url']),
  agencies_translations: defineTable(agencies_translations).index('agency_translation_index', [
    'agencies_id',
    'language',
  ]),
  agents: defineTable(agents).index('user_id', ['user_id']),
  agents_translations: defineTable(agents_translations).index('agent_translation_index', [
    'agents_id',
    'language',
  ]),
  properties: defineTable(properties).index('name_index', ['name']),
  chat_statuses: defineTable(chat_statuses),
  chats: defineTable(chats).index('agent_user_chat_index', ['agent_id', 'user_id']),
  messages: defineTable(messages),
  floor_plans: defineTable(floor_plans).index('type_unique_index', ['type']),
});
