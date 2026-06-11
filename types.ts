export interface Lead {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  niche: string;
  cityState: string;
  source: string;
  status: 'Not Sent' | 'Sent' | 'Follow-Up 1' | 'Follow-Up 2' | 'Interested' | 'Booked Call' | 'Closed' | 'Not Interested' | 'No Email';
  lastContacted: string;
  nextFollowUp: string;
  notes: string;
  createdBy?: string;
}

export interface NicheInfo {
  category: string;
  keywords: string[];
  bestOfferAngle: string;
  suggestions: string[];
}

export interface Metric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export interface StepGuide {
  step: number;
  action: string;
  actionBn: string;
  description: string;
  descriptionBn: string;
  freeTip: string;
  freeTipBn: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Employee';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  businessName: string;
  leadId: string;
  type: 'create_lead' | 'email_sent' | 'followup_sent' | 'call_booked' | 'lead_closed';
  timestamp: string;
}
