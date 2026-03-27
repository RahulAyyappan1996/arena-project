import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for ClearTrial EDC
export type UserRole = 'admin' | 'crc' | 'cra' | 'pi' | 'sponsor' | 'statistician';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  site_id?: string;
}

export interface Site {
  id: string;
  site_number: string;
  site_name: string;
  status: 'active' | 'inactive' | 'pending';
  country: string;
  pi_name: string;
  enrollment_target: number;
  enrollment_actual: number;
  open_queries: number;
  last_visit_date?: string;
}

export interface Subject {
  id: string;
  subject_number: string;
  site_id: string;
  enrollment_date: string;
  status: 'screening' | 'enrolled' | 'completed' | 'discontinued';
  initials: string;
  dob?: string;
  sex?: 'M' | 'F' | 'O';
}

export interface StudyEvent {
  id: string;
  subject_id: string;
  event_type: 'screening' | 'baseline' | 'visit' | 'adverse_event' | 'query' | 'approval';
  event_name: string;
  form_name?: string;
  completed_by: string;
  completed_at: string;
  status: 'completed' | 'pending_review' | 'queried' | 'approved';
  data_summary?: Record<string, any>;
  has_open_query: boolean;
  site_id: string;
}

export interface Query {
  id: string;
  event_id: string;
  field_name?: string;
  query_text: string;
  raised_by: string;
  raised_at: string;
  status: 'open' | 'resolved' | 'closed';
  responses?: QueryResponse[];
}

export interface QueryResponse {
  id: string;
  query_id: string;
  response_text: string;
  responded_by: string;
  responded_at: string;
}

// Seed data for UAT
export const seedData = {
  sites: [
    { site_number: '001', site_name: 'Mayo Clinic Rochester', country: 'USA', pi_name: 'Dr. Sarah Johnson', enrollment_target: 50 },
    { site_number: '002', site_name: 'Cleveland Clinic', country: 'USA', pi_name: 'Dr. Michael Chen', enrollment_target: 45 },
    { site_number: '003', site_name: 'Johns Hopkins', country: 'USA', pi_name: 'Dr. Emily Williams', enrollment_target: 40 },
    { site_number: '004', site_name: 'University Hospital Zurich', country: 'Switzerland', pi_name: 'Dr. Hans Mueller', enrollment_target: 35 },
    { site_number: '005', site_name: 'Tokyo Medical Center', country: 'Japan', pi_name: 'Dr. Yuki Tanaka', enrollment_target: 30 },
  ],
  subjects: [
    { subject_number: '101-001', initials: 'ABC', status: 'enrolled' },
    { subject_number: '101-002', initials: 'DEF', status: 'enrolled' },
    { subject_number: '101-003', initials: 'GHI', status: 'screening' },
    { subject_number: '101-004', initials: 'JKL', status: 'enrolled' },
    { subject_number: '101-005', initials: 'MNO', status: 'completed' },
    { subject_number: '102-001', initials: 'PQR', status: 'enrolled' },
    { subject_number: '102-002', initials: 'STU', status: 'enrolled' },
    { subject_number: '102-003', initials: 'VWX', status: 'discontinued' },
    { subject_number: '103-001', initials: 'YZA', status: 'enrolled' },
    { subject_number: '103-002', initials: 'BCD', status: 'screening' },
  ],
  eventTypes: [
    { type: 'screening', name: 'Screening Visit', form: 'Screening Form' },
    { type: 'baseline', name: 'Baseline Visit', form: 'Baseline Assessment' },
    { type: 'visit', name: 'Week 4 Visit', form: 'Visit Form' },
    { type: 'visit', name: 'Week 8 Visit', form: 'Visit Form' },
    { type: 'adverse_event', name: 'Adverse Event Reported', form: 'AE Form' },
  ]
};
