import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Mail, Copy, ExternalLink, 
  CheckCircle2, Layers, Globe, Phone, MapPin, Sparkles, 
  Languages, BookOpen, TrendingUp, Check, X, Download, 
  PlusCircle, AlertCircle, FileText, ChevronRight, HelpCircle,
  Undo2, RefreshCw, Calendar, Send, Users, Lock, LogOut, Key, Shield, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, NicheInfo, StepGuide, User, ActivityLog } from './types';
import { INITIAL_LEADS, NICHES_DATA, WORKFLOW_STEPS, EMAIL_TEMPLATES } from './data';
import JSZip from 'jszip';

// Raw file string imports for clean source ZIP download (bypasses Vite runtime transpilation)
import packageJsonText from './package.json?raw';
import viteConfigText from './vite.config.ts?raw';
import tsconfigJsonText from './tsconfig.json?raw';
import indexHtmlText from './index.html?raw';
import gitignoreText from './.gitignore?raw';
import mainTsxText from './main.tsx?raw';
import appTsxText from './App.tsx?raw';
import dataTsText from './data.ts?raw';
import typesTsText from './types.ts?raw';
import indexCssText from './index.css?raw';
import viteEnvText from './vite-env.d.ts?raw';

export default function App() {
  // Lang state: 'en' or 'bn'
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  // Loading state (instant for local CRM now)
  const [loading, setLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Multiuser System States - Synchronized with LocalStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('outreach_users_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const defaultAdmin: User = { 
      id: 'u-1', 
      username: 'admin', 
      password: 'admin123', 
      role: 'Admin', 
      createdAt: new Date().toISOString().split('T')[0] 
    };
    localStorage.setItem('outreach_users_data', JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('outreach_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('outreach_activity_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // User tab form states
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Employee'>('Employee');

  // Selected user for stats filter
  const [statsUserFilter, setStatsUserFilter] = useState<string>('All');

  // Leads state initialized from LocalStorage or default sample
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('outreach_leads_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('outreach_leads_data', JSON.stringify(INITIAL_LEADS));
    return INITIAL_LEADS;
  });

  // Helper wrappers with localStorage persistence
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('outreach_users_data', JSON.stringify(newUsers));
  };

  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem('outreach_leads_data', JSON.stringify(newLeads));
  };

  const saveActivityLogs = (newLogs: ActivityLog[]) => {
    setActivityLogs(newLogs);
    localStorage.setItem('outreach_activity_logs', JSON.stringify(newLogs));
  };

  // Track finished guide steps (using checklist state in localStorage)
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('outreach_completed_steps');
    return saved ? JSON.parse(saved) : [1, 2];
  });

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'crm' | 'guide' | 'niches' | 'metrics' | 'team'>('crm');

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNiche, setFilterNiche] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Select a lead for the Interactive Pitch Writer
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('pitch');
  const [customYourName, setCustomYourName] = useState<string>(() => {
    return localStorage.getItem('outreach_your_name') || 'Burhan Kobir Joy';
  });

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Lead Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Map search variables helper
  const [mapSearchNiche, setMapSearchNiche] = useState('video production');
  const [mapSearchCity, setMapSearchCity] = useState('New York');

  // Form Fields State for Add/Edit Lead
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNiche, setFormNiche] = useState('High-Ticket Services');
  const [formCityState, setFormCityState] = useState('');
  const [formSource, setFormSource] = useState('Google Maps (Manual)');
  const [formStatus, setFormStatus] = useState<Lead['status']>('Not Sent');
  const [formNotes, setFormNotes] = useState('');

  // Set selected lead when leads list changes and selectedLeadId is empty
  useEffect(() => {
    if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  // Persist completed steps
  useEffect(() => {
    localStorage.setItem('outreach_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Persist Your Name preference
  useEffect(() => {
    localStorage.setItem('outreach_your_name', customYourName);
  }, [customYourName]);

  // Persist current logged-in user profile session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('outreach_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('outreach_current_user');
    }
  }, [currentUser]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type });
  };

  // Setup sample leads again if user requests a reset
  const resetToDefaultLeads = async () => {
    if (currentUser?.role !== 'Admin') {
      triggerToast(lang === 'en' ? 'Only Admins can reset the database!' : 'শুধুমাত্র অ্যাডমিনরা ডেমো রিসেট করতে পারবেন!', 'error');
      return;
    }
    if (window.confirm(lang === 'en' ? 'Are you sure you want to reset the database to default sample leads?' : 'আপনি কি নিশ্চিত যে ড্যাশবোর্ডটি ডেমো লিড দিয়ে রিসেট করতে চান?')) {
      saveLeads(INITIAL_LEADS);
      setSelectedLeadId(INITIAL_LEADS[0].id);
      triggerToast(lang === 'en' ? 'Database reset successfully!' : 'ড্যাশবোর্ড রিসেট সফল হয়েছে!', 'success');
    }
  };

  // Download all codebase files as a single ZIP file for manual GitHub uploads
  const downloadProjectZip = async () => {
    setIsZipping(true);
    triggerToast(lang === 'en' ? 'Preparing all clean source code files for download ZIP...' : 'ডাউনলোডের জন্য সব প্রজেক্ট ফাইল প্রস্তুত করা হচ্ছে...', 'info');
    try {
      const zip = new JSZip();
      
      const files = [
        { path: 'package.json', content: packageJsonText },
        { path: 'vite.config.ts', content: viteConfigText },
        { path: 'tsconfig.json', content: tsconfigJsonText },
        { path: 'index.html', content: indexHtmlText },
        { path: '.gitignore', content: gitignoreText },
        { path: 'src/main.tsx', content: mainTsxText },
        { path: 'src/App.tsx', content: appTsxText },
        { path: 'src/data.ts', content: dataTsText },
        { path: 'src/types.ts', content: typesTsText },
        { path: 'src/index.css', content: indexCssText },
        { path: 'src/vite-env.d.ts', content: viteEnvText }
      ];

      for (const item of files) {
        if (item.content) {
          zip.file(item.path, item.content);
        } else {
          console.warn(`Content for ${item.path} is empty`);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = 'lead-navigator-outreach-clean.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      triggerToast(lang === 'en' ? 'Downloaded project ZIP successfully!' : 'প্রজেক্ট জিপ ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(lang === 'en' ? 'Failed to generate ZIP file.' : 'জিপ ফাইল তৈরি করতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  // Toggle guide checklist step
  const toggleStepCompleted = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  // Create or Update Lead
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formBusinessName.trim()) {
      triggerToast(lang === 'en' ? 'Business name is required!' : 'ব্যবসার নাম দেওয়া বাধ্যতামূলক!', 'error');
      return;
    }

    const currentUsername = currentUser ? currentUser.username : 'admin';
    const leadData: Lead = {
      id: editingLead ? editingLead.id : `lead-${Date.now()}`,
      businessName: formBusinessName,
      ownerName: formOwnerName || 'Owner',
      email: formEmail,
      phone: formPhone,
      website: formWebsite,
      niche: formNiche,
      cityState: formCityState,
      source: formSource,
      status: formStatus,
      lastContacted: editingLead ? editingLead.lastContacted : (formStatus !== 'Not Sent' ? new Date().toISOString().split('T')[0] : ''),
      nextFollowUp: editingLead ? editingLead.nextFollowUp : '',
      notes: formNotes,
      createdBy: editingLead ? (editingLead.createdBy || 'admin') : currentUsername
    };

    let nextLeads = [...leads];
    let nextLogs = [...activityLogs];

    if (editingLead) {
      if (editingLead.status !== formStatus) {
        let logType: ActivityLog['type'] | null = null;
        if (formStatus === 'Sent') logType = 'email_sent';
        else if (formStatus === 'Follow-Up 1' || formStatus === 'Follow-Up 2') logType = 'followup_sent';
        else if (formStatus === 'Booked Call') logType = 'call_booked';
        else if (formStatus === 'Closed') logType = 'lead_closed';

        if (logType) {
          const newLog: ActivityLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            username: currentUsername,
            businessName: formBusinessName,
            leadId: editingLead.id,
            type: logType,
            timestamp: new Date().toISOString()
          };
          nextLogs = [newLog, ...nextLogs];
        }
      }
      nextLeads = nextLeads.map(l => l.id === leadData.id ? leadData : l);
      saveLeads(nextLeads);
      saveActivityLogs(nextLogs);
      triggerToast(lang === 'en' ? 'Lead updated successfully!' : 'লিডের তথ্য সফলভাবে আপডেট হয়েছে!', 'success');
    } else {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        username: currentUsername,
        businessName: formBusinessName,
        leadId: leadData.id,
        type: 'create_lead',
        timestamp: new Date().toISOString()
      };
      nextLogs = [newLog, ...nextLogs];

      let logType: ActivityLog['type'] | null = null;
      if (formStatus === 'Sent') logType = 'email_sent';
      else if (formStatus === 'Follow-Up 1' || formStatus === 'Follow-Up 2') logType = 'followup_sent';
      else if (formStatus === 'Booked Call') logType = 'call_booked';
      else if (formStatus === 'Closed') logType = 'lead_closed';

      if (logType) {
        const instantStatusLog = {
          id: `log-${Date.now() + 1}-${Math.random().toString(36).substr(2, 4)}`,
          username: currentUsername,
          businessName: formBusinessName,
          leadId: leadData.id,
          type: logType,
          timestamp: new Date().toISOString()
        };
        nextLogs = [instantStatusLog, ...nextLogs];
      }

      nextLeads = [leadData, ...nextLeads];
      saveLeads(nextLeads);
      saveActivityLogs(nextLogs);
      setSelectedLeadId(leadData.id);
      triggerToast(lang === 'en' ? 'New lead added successfully!' : 'নতুন লিড সফলভাবে যুক্ত হয়েছে!', 'success');
    }

    setIsModalOpen(false);
    setEditingLead(null);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingLead(null);
    setFormBusinessName('');
    setFormOwnerName('');
    setFormEmail('');
    setFormPhone('');
    setFormWebsite('');
    setFormNiche('High-Ticket Services');
    setFormCityState('');
    setFormSource('Google Maps (Manual)');
    setFormStatus('Not Sent');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormBusinessName(lead.businessName);
    setFormOwnerName(lead.ownerName);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormWebsite(lead.website);
    setFormNiche(lead.niche);
    setFormCityState(lead.cityState);
    setFormSource(lead.source);
    setFormStatus(lead.status);
    setFormNotes(lead.notes);
    setIsModalOpen(true);
  };

  // Delete Lead
  const handleDeleteLead = (id: string) => {
    if (currentUser?.role !== 'Admin') {
      triggerToast(lang === 'en' ? 'Only Admins can delete leads!' : 'শুধুমাত্র অ্যাডমিনরা লিড ডিলিট করতে পারবেন!', 'error');
      return;
    }
    if (window.confirm(lang === 'en' ? 'Confirm deleting this lead?' : 'এই লিডটি কি টেবিল থেকে ডিলিট করতে চান?')) {
      const nextLeads = leads.filter(l => l.id !== id);
      saveLeads(nextLeads);
      triggerToast(lang === 'en' ? 'Lead removed.' : 'লিড ডিলিট করা হয়েছে।', 'info');
    }
  };

  // Update Status directly from the table row
  const updateLeadStatus = async (id: string, newStatus: Lead['status']) => {
    const currentUsername = currentUser ? currentUser.username : 'admin';
    const targetLead = leads.find(l => l.id === id);
    if (!targetLead) return;

    let logType: ActivityLog['type'] | null = null;
    if (newStatus === 'Sent') logType = 'email_sent';
    else if (newStatus === 'Follow-Up 1' || newStatus === 'Follow-Up 2') logType = 'followup_sent';
    else if (newStatus === 'Booked Call') logType = 'call_booked';
    else if (newStatus === 'Closed') logType = 'lead_closed';

    let nextLogs = [...activityLogs];
    if (logType) {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        username: currentUsername,
        businessName: targetLead.businessName,
        leadId: id,
        type: logType,
        timestamp: new Date().toISOString()
      };
      nextLogs = [newLog, ...nextLogs];
      saveActivityLogs(nextLogs);
    }

    const today = new Date().toISOString().split('T')[0];
    // estimate next follow up in 3 days if sent or follow-up
    let nextF = targetLead.nextFollowUp;
    if (newStatus === 'Sent' || newStatus === 'Follow-Up 1') {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      nextF = d.toISOString().split('T')[0];
    }

    const updatedLead: Lead = {
      ...targetLead,
      status: newStatus,
      lastContacted: newStatus !== 'Not Sent' ? today : targetLead.lastContacted,
      nextFollowUp: nextF
    };

    const nextLeads = leads.map(l => l.id === id ? updatedLead : l);
    saveLeads(nextLeads);
    triggerToast(lang === 'en' ? 'Status updated.' : 'স্ট্যাটাস আপডেট করা হয়েছে।', 'success');
  };

  // Export Leads to CSV
  const exportLeadsToCSV = () => {
    const headers = ['Business Name', 'Owner Name', 'Email', 'Phone', 'Website', 'Niche', 'City/State', 'Source', 'Status', 'Last Contacted', 'Next Follow Up', 'Notes'];
    const rows = leads.map(l => [
      `"${l.businessName.replace(/"/g, '""')}"`,
      `"${l.ownerName.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.website}"`,
      `"${l.niche}"`,
      `"${l.cityState.replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${l.lastContacted}"`,
      `"${l.nextFollowUp}"`,
      `"${l.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach_leads_database_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    triggerToast(lang === 'en' ? 'CSV Exported successfully!' : 'CSV এক্সপোর্ট সম্পন্ন হয়েছে!', 'success');
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchSearch = 
      l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cityState.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchNiche = filterNiche === 'All' || l.niche === filterNiche;
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;

    return matchSearch && matchNiche && matchStatus;
  });

  // Calculate high-level metrics
  const totalLeadsCount = leads.length;
  const emailsSentCount = leads.filter(l => ['Sent', 'Follow-Up 1', 'Follow-Up 2', 'Interested', 'Booked Call', 'Closed'].includes(l.status)).length;
  const followUpsSentCount = leads.filter(l => ['Follow-Up 1', 'Follow-Up 2'].includes(l.status)).length;
  const positiveRepliesCount = leads.filter(l => l.status === 'Interested').length;
  const callsBookedCount = leads.filter(l => l.status === 'Booked Call').length;
  const clientsClosedCount = leads.filter(l => l.status === 'Closed').length;

  const getDynamicStats = (username: string) => {
    const userLeads = leads.filter(l => username === 'All' || (l.createdBy || 'admin') === username);
    const leadsCollected = userLeads.length;

    const emailSent = username === 'All' 
      ? leads.filter(l => ['Sent', 'Follow-Up 1', 'Follow-Up 2', 'Interested', 'Booked Call', 'Closed'].includes(l.status)).length
      : activityLogs.filter(log => log.username === username && log.type === 'email_sent').length;

    const followUpsSent = username === 'All' 
      ? leads.filter(l => ['Follow-Up 1', 'Follow-Up 2'].includes(l.status)).length
      : activityLogs.filter(log => log.username === username && log.type === 'followup_sent').length;

    const callsBooked = username === 'All' 
      ? leads.filter(l => l.status === 'Booked Call').length
      : activityLogs.filter(log => log.username === username && log.type === 'call_booked').length;

    const clientsClosed = username === 'All' 
      ? leads.filter(l => l.status === 'Closed').length
      : activityLogs.filter(log => log.username === username && log.type === 'lead_closed').length;

    return {
      leadsCollected,
      emailSent,
      followUpsSent,
      callsBooked,
      clientsClosed
    };
  };

  const activeSelectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Helper to get case study based on the active selected lead's niche
  const getNicheCaseStudy = (niche: string) => {
    const n = (niche || '').toLowerCase();
    if (n.includes('roof') || n.includes('contractor') || n.includes('solar') || n.includes('pest') || n.includes('clean') || n.includes('plumb') || n.includes('construction') || n.includes('hvac') || n.includes('landscap') || n.includes('ticket')) {
      return 'we helped a local home-service business owner named David double their booked appointments and increase sales by 41% within 5 weeks';
    } else if (n.includes('realtor') || n.includes('real estate') || n.includes('property') || n.includes('broker') || n.includes('builder') || n.includes('apartment') || n.includes('developer')) {
      return 'we helped a real estate developer named Sarah generate 32 pre-qualified property buyers within 5 weeks, closing 3 direct deals';
    } else if (n.includes('dentist') || n.includes('dental') || n.includes('healthcare') || n.includes('med spa') || n.includes('aesthetics') || n.includes('spa') || n.includes('clinic') || n.includes('doctor') || n.includes('chiropractor') || n.includes('skin')) {
      return 'we helped a medical clinic named Elite Care add 44 new high-ticket patient bookings within 5 weeks';
    } else if (n.includes('boutique') || n.includes('clothing') || n.includes('skincare') || n.includes('furniture') || n.includes('coffe') || n.includes('cosmetics') || n.includes('retail') || n.includes('store') || n.includes('commerc') || n.includes('shopify')) {
      return 'we helped an e-commerce brand owner named John increase their revenue by 48% within just 5 weeks';
    } else {
      return 'we helped a local business owner named Marcus boost their revenue by 35% within just 5 weeks';
    }
  };

  // Compile selected email template
  const getCompiledEmail = () => {
    if (!activeSelectedLead) {
      return { 
        subject: lang === 'en' ? 'Select a lead to preview' : 'প্রিভিউ দেখতে একটি লিড নির্বাচন করুন', 
        body: lang === 'en' ? 'Please add or select a lead first!' : 'অনুগ্রহ করে প্রথমে একটি লিড যুক্ত বা সিলেক্ট করুন!' 
      };
    }

    const businessName = activeSelectedLead.businessName;
    const rawOwner = (activeSelectedLead.ownerName || '').trim();
    const ownerName = rawOwner ? rawOwner : (lang === 'en' ? 'Owner' : 'মালিক');
    const website = activeSelectedLead.website ? activeSelectedLead.website.trim() : '';
    const nicheName = activeSelectedLead.niche || 'Local Business';

    let subject = '';
    let body = '';

    if (selectedTemplateId === 'meta_ads') {
      subject = `Meta ads for ${businessName}`;
      body = `Hi ${ownerName},

I came across ${businessName} on Google Maps. You have a great brand, but you're leaving money on the table by not running active Meta ads to capture hot prospects scrolling on Instagram.

Recently, ${getNicheCaseStudy(nicheName)}. We can launch dynamic Facebook and Instagram campaigns to bring you 10-15 booked appointments next week.

Would you be open to a quick, free 2-minute video showing how this works for ${businessName}?

Best regards,
${customYourName}
Strategy Consultant, Naznio Strategy Lab`;
    } 
    else if (selectedTemplateId === 'google_ads') {
      subject = `Google Search for ${businessName}`;
      const webSentence = website 
        ? `I came across ${businessName}'s website on Google Maps. You have fantastic online reviews, but you're missing out on local search traffic because your business doesn't appear at the top of Google Search.`
        : `I came across ${businessName} on Google Maps. You have fantastic online reviews, but you are likely missing out on local search traffic by not showing up at the top of Google Search where active local competitors are listed.`;

      body = `Hi ${ownerName},

${webSentence}

Recently, ${getNicheCaseStudy(nicheName)}. We build premium Google campaigns that capture buyers right when they search for your services.

Would you be open to a quick 2-minute video showing where competitors are outrunning ${businessName}?

Best regards,
${customYourName}
Strategy Consultant, Naznio Strategy Lab`;
    } 
    else if (selectedTemplateId === 'mix_ads') {
      subject = `Unified ad strategy for ${businessName}`;
      body = `Hi ${ownerName},

I came across ${businessName} on Google Maps. Your business has great local trust, but lacks a unified advertising strategy to capture search intent and retarget prospects on social media.

Recently, ${getNicheCaseStudy(nicheName)}. Our combined Google Search and Meta Ads systems ensure you capture high-intent buyers and turn them into direct bookings.

Would you be open to reviewing a free 2-minute roadmap on how this unified campaign would grow ${businessName}?

Best regards,
${customYourName}
Strategy Consultant, Naznio Strategy Lab`;
    } 
    else {
      const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];
      subject = template.subject
        .replace(/{{Business Name}}/g, businessName)
        .replace(/{{Name}}/g, ownerName);
      
      body = template.body
        .replace(/{{Business Name}}/g, businessName)
        .replace(/{{Name}}/g, ownerName)
        .replace(/\[Your Name\]/g, customYourName);
    }

    return { subject, body };
  };

  const { subject: compiledSubject, body: compiledBody } = getCompiledEmail();

  // Copy email content helper
  const copyEmailToClipboard = () => {
    const textToCopy = `Subject: ${compiledSubject}\n\n${compiledBody}`;
    navigator.clipboard.writeText(textToCopy);
    triggerToast(lang === 'en' ? 'Copied with Subject to clipboard!' : 'ইমেইলটি কপি হয়ে গেছে!', 'success');
  };

  // Direct mailto composer link
  const getMailtoLink = () => {
    if (!activeSelectedLead) return '#';
    const emailTo = activeSelectedLead.email || '';
    return `mailto:${emailTo}?subject=${encodeURIComponent(compiledSubject)}&body=${encodeURIComponent(compiledBody)}`;
  };

  // Search directly via Google Maps link
  const openGoogleMapsSearch = (nicheWord: string) => {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(nicheWord + ' ' + mapSearchCity)}`;
    window.open(searchUrl, '_blank');
    triggerToast(lang === 'en' ? `Opening maps search for ${nicheWord} in ${mapSearchCity}` : `${mapSearchCity}-এ ${nicheWord} এর জন্য গুগল ম্যাপস ওপেন হচ্ছে!`, 'info');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-layout-container">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-1">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-2">
              <Layers className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              Naznio CRM Workspace
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Naznio Strategy Lab • Outreach CRM Platform' : 'নাজনিও স্ট্র্যাটেজি ল্যাব • আউটরিচ সিআরএম প্ল্যাটফর্ম'}
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-3 py-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            setLoginError('');
            
            const trimmedUsername = loginUsername.trim().toLowerCase();
            const trimmedPassword = loginPassword.trim();

            if (!trimmedUsername || !trimmedPassword) {
              setLoginError(lang === 'en' ? 'Please fill in both fields.' : 'উভয় ঘর পূরণ করুন।');
              return;
            }

            // Find match in our synced team registry
            const found = users.find(u => u.username.toLowerCase() === trimmedUsername);
            
            let isLoginSuccessful = false;
            let matchedUser = null;

            if (found) {
              const matchesStored = found.password === loginPassword || found.password.trim() === trimmedPassword;
              if (matchesStored) {
                isLoginSuccessful = true;
                matchedUser = found;
              }
            }

            // Bulletproof Super Admin fallback to guarantee you're never locked out
            if (!isLoginSuccessful && trimmedUsername === 'admin' && (trimmedPassword === 'admin123' || loginPassword === 'admin123')) {
              isLoginSuccessful = true;
              matchedUser = found || {
                id: 'u-1',
                username: 'admin',
                password: 'admin123',
                role: 'Admin',
                createdAt: new Date().toISOString().split('T')[0]
              };
            }

            if (isLoginSuccessful && matchedUser) {
              setCurrentUser(matchedUser);
              triggerToast(lang === 'en' ? `Welcome back, ${matchedUser.username}!` : `স্বাগতম, ${matchedUser.username}!`, 'success');
              setLoginUsername('');
              setLoginPassword('');
            } else {
              setLoginError(lang === 'en' ? 'Incorrect username or password.' : 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।');
            }
          }} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 font-mono uppercase block mb-1.5">{lang === 'en' ? 'Username' : 'ইউজারনেম'}</label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g., admin"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition pl-3"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono uppercase block mb-1.5">{lang === 'en' ? 'Password' : 'পাসওয়ার্ড'}</label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition pl-3"
                />
              </div>
            </div>

            <button
               type="submit"
               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg text-sm transition mt-2 cursor-pointer shadow-md shadow-emerald-950/30 text-center"
            >
              {lang === 'en' ? 'Access Workspace' : 'লগইন করুন'}
            </button>
          </form>



          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'বাংলা সংস্করণ দেখতে ক্লিক করুন' : 'Click for English Version'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-container">
      {/* Dynamic Toast Counterpart */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow" id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                  {lang === 'en' ? '100% Free Method' : '১০০% ফ্রি মেথড'}
                </span>
                <span className="text-slate-400 text-xs font-mono">Credit: Burhan Kobir Joy</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                <Layers className="text-emerald-400 w-8 h-8" />
                {lang === 'en' ? 'Agency Outreach & Client CRM' : 'এজেন্সি ক্লায়েন্ট আউটরিচ ও ফ্রি CRM'}
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-2xl">
                {lang === 'en' 
                  ? 'Manual high-intent Google Maps leads, customized email outreach, follow-ups, and client closing system dashboard.' 
                  : 'গুগল ম্যাপস থেকে ক্লায়েন্ট খুঁজে বের করা, কাস্টমাইজড কোল্ড ইমেইল, সময়মতো ফলো-আপ এবং ডিল ক্লোজ করার সম্পূর্ণ ফ্লো ড্যাশবোর্ড।'}
              </p>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
              {/* Active Profile Info */}
              {currentUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-slate-300 font-medium">@{currentUser.username}</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded border border-emerald-500/20 font-semibold uppercase">
                    {currentUser.role}
                  </span>
                </div>
              )}

              {/* Language Switcher */}
              <button 
                id="btn-lang-toggle"
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <Languages className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'en' ? 'বাংলা সংস্করণ' : 'English Version'}</span>
              </button>

              <button 
                id="btn-reset-db"
                onClick={resetToDefaultLeads}
                title={lang === 'en' ? 'Reset database to demo data' : 'ডেমো ডাটা রিসেট করুন'}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* ZIP Download Code Button */}
              <button 
                id="btn-download-zip"
                onClick={downloadProjectZip}
                disabled={isZipping}
                title={lang === 'en' ? 'Download clean source code ZIP' : 'সব সোর্স কোড ডাউনলোড করুন (ZIP)'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/30 text-xs font-semibold tracking-wide transition cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 text-amber-400 ${isZipping ? 'animate-bounce' : ''}`} />
                <span>{lang === 'en' ? (isZipping ? 'Zipping...' : 'Download Code ZIP') : (isZipping ? 'জিপ হচ্ছে...' : 'সব কোড ডাউনলোড করুন')}</span>
              </button>

              {/* Log Out button */}
              {currentUser && (
                <button 
                  id="btn-logout"
                  onClick={() => {
                    if (window.confirm(lang === 'en' ? 'Are you sure you want to log out?' : 'আপনি কি লগআউট করতে চান?')) {
                      setCurrentUser(null);
                      setActiveTab('crm');
                      triggerToast(lang === 'en' ? 'Logged out successfully.' : 'সফলভাবে লগআউট করা হয়েছে।', 'info');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 rounded-lg border border-rose-900/50 text-xs font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{lang === 'en' ? 'Log Out' : 'লগআউট'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Horizontal Mini Targets */}
        <div className="bg-slate-950/80 border-t border-slate-800/60 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-4 sm:gap-6 justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-medium text-slate-300">
                {lang === 'en' ? 'Daily Targets:' : 'দৈনিক টার্গেটস:'}
              </span>
              <span className="flex items-center gap-1">
                <Check className="text-emerald-400 w-3.5 h-3.5" />
                {lang === 'en' ? '30 to 50 Lead Search' : '৩০-৫০টি লিড সার্চ'}
              </span>
              <span className="flex items-center gap-1">
                <Check className="text-emerald-400 w-3.5 h-3.5" />
                {lang === 'en' ? '15+ Personalized Emails' : '১৫+ পারসোনালাইজড মেইল'}
              </span>
              <span className="flex items-center gap-1">
                <Check className="text-emerald-400 w-3.5 h-3.5" />
                {lang === 'en' ? '2-3 Follow-ups per Lead' : 'প্রতি লিডে ২-৩টি ফলো-আপ'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER OR BENGALI COMPREHENSIVE STARTER NOTE */}
      <section className="bg-slate-800 text-slate-100 border-b border-emerald-950 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">
                {lang === 'en' 
                  ? '💡 Pro-Tip for completely FREE Lead Generation:' 
                  : '💡 সম্পূর্ণ ফ্রিতে কাস্টমার বা লিড খুঁজে বের করার সেরা ট্রিকস:'}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Paid tools like "Google Lead Sniper" just automate scraping, but they COST money. For 100% free lead generation: search keywords on Google Maps, click through to their website or Facebook page. Look at their Facebook / Instagram pages for an e-mail address, phone number or directly send a direct messenger pitch. Store those contacts in this planner, use our "Smart Email Writer" instantly, and send them directly via your free Gmail!'
                  : 'পেইড টুলস আমাদের শুধু সময় বাঁচায়, কিন্তু ফ্রিতে করতে চাইলে আমরা ম্যাপস থেকে ম্যানুয়ালি তথ্য নেব। গুগল ম্যাপে সার্চ করে তাদের কন্ট্যাক্ট পেজ চেক করুন, অথবা তাদের ফেসবুক পেজে যান। ফেসবুক পেজের "About" সেকশনে বিজনেসের রিয়েল ইমেইল ও হোয়াটস্যাপ নাম্বার ১০০% ফ্রিতে পাওয়া যায়। সংগৃহীত কন্ট্যাক্টগুলো সোজা এই ড্যাশবোর্ডে যোগ করুন এবং ওয়ান-ক্লিক ইমেইল জেনারেটর ব্যবহার করে ফ্রিতে মেইল পাঠিয়ে দিন!'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6" id="main-content">
        
        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px" id="tabs-navigation">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition flex items-center gap-2 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'crm'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            {lang === 'en' ? 'Client CRM & Email Writer' : 'ক্লায়েন্ট CRM ও ইমেইল রাইটার'}
            <span className="ml-1 bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded-full font-mono">{leads.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition flex items-center gap-2 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {lang === 'en' ? '10-Step Free Guide' : '১০-স্টেপ ফ্রি গাইডলাইন'}
            <span className="ml-1 bg-emerald-100 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-mono font-semibold">
              {completedSteps.length}/10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('niches')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition flex items-center gap-2 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'niches'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            {lang === 'en' ? 'Keyword Bank & Maps' : 'নিশ ও ম্যাপস কি-ওয়ার্ডস'}
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition flex items-center gap-2 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'metrics'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {lang === 'en' ? 'Rules & Daily Tracker' : 'আজকের ট্র্যাক ও রুলস'}
          </button>

          {currentUser && currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2.5 font-medium text-sm rounded-t-lg transition flex items-center gap-2 border-b-2 shrink-0 cursor-pointer ${
                activeTab === 'team'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              {lang === 'en' ? 'Team Setup & Roles' : 'টিম সেটাপ ও মেম্বারস'}
              <span className="ml-1 bg-emerald-100 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-mono font-semibold">
                {users.length}
              </span>
            </button>
          )}
        </div>

        {/* CONTENT PANELS BASED ON TAB */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6" id="tab-panels-vault">
          
          {/* TAB 1: CLIENT CRM & EMAIL GENERATOR */}
          {activeTab === 'crm' && (
            <div className="flex flex-col gap-6" id="panel-crm">
              
              {/* UPPER SECTION: SEARCH, REFRESH, EXPORT */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex flex-wrap gap-2 items-center">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <input
                      type="text"
                      id="crm-search-input"
                      placeholder={lang === 'en' ? 'Search by business name, city, email...' : 'ব্যবসার নাম, শহর, বা মেইল দিয়ে খুজুন...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Niche Filter */}
                  <div className="shrink-0">
                    <select
                      id="crm-filter-niche"
                      value={filterNiche}
                      onChange={(e) => setFilterNiche(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    >
                      <option value="All">{lang === 'en' ? 'All Niches' : 'সব নিশ'}</option>
                      <option value="High-Ticket Services">{lang === 'en' ? 'High-Ticket Services' : 'হাই-টিকিট লোকাল সার্ভিস'}</option>
                      <option value="Real Estate Brokers">{lang === 'en' ? 'Real Estate Brokers' : 'রিয়েল এস্টেট ব্রোকারস'}</option>
                      <option value="E-commerce & Retail">{lang === 'en' ? 'E-commerce & Retail' : 'ই-কমার্স ও রিটেইল ব্রান্ড'}</option>
                      <option value="Premium B2B & Agencies">{lang === 'en' ? 'Premium B2B & Agencies' : 'বিটুবি ও আইটি সার্ভিস'}</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="shrink-0">
                    <select
                      id="crm-filter-status"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-medium"
                    >
                      <option value="All">{lang === 'en' ? 'All Statuses' : 'সব স্ট্যাটাস'}</option>
                      <option value="Not Sent">{lang === 'en' ? 'Not Sent' : 'মেইল পাঠানো হয়নি'}</option>
                      <option value="Sent">{lang === 'en' ? 'Sent (Pitch)' : 'মেইল পাঠানো হয়েছে'}</option>
                      <option value="Follow-Up 1">{lang === 'en' ? 'Follow-Up 1' : 'ফলো-আপ ১ প্রেরিত'}</option>
                      <option value="Follow-Up 2">{lang === 'en' ? 'Follow-Up 2' : 'ফলো-আপ ২ প্রেরিত'}</option>
                      <option value="Interested">{lang === 'en' ? 'Interested' : 'রিপ্লাই বা আগ্রহী'}</option>
                      <option value="Booked Call">{lang === 'en' ? 'Booked Call' : 'মিটিং বুকড'}</option>
                      <option value="Closed">{lang === 'en' ? 'Client Closed 💰' : 'ক্লায়েন্ট ক্লোজড 💰'}</option>
                      <option value="Not Interested">{lang === 'en' ? 'Not Interested' : 'মিটিং ডিক্লাইনড'}</option>
                      <option value="No Email">{lang === 'en' ? 'No Email Found' : 'ইমেইল পাওয়া যায়নি'}</option>
                    </select>
                  </div>
                </div>

                {/* Left side Call-to-actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-add-lead-modal"
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Add Lead' : 'নতুন লিড যোগ করুন'}</span>
                  </button>

                  <button
                    id="btn-export-csv"
                    onClick={exportLeadsToCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition shrink-0 cursor-pointer"
                    title={lang === 'en' ? 'Export current table to Excel/CSV' : 'টেবিলটি এক্সেল হিসেবে ডাউনলোড করুন'}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{lang === 'en' ? 'CSV Export' : 'এক্সেল এক্সপোর্ট'}</span>
                  </button>
                </div>
              </div>

              {/* GRID CONTAINER FOR CRM LIST & EMAIL WRITER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="crm-grid-workspace">
                
                {/* LEFT 7 SECONDS: THE LEADS TABLE */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden">
                    <div className="p-3 bg-slate-100/85 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      <span>{lang === 'en' ? 'Leads Database List' : 'লিড ডাটাবেস তালিকা'}</span>
                      <span className="normal-case font-normal bg-white border px-1.5 py-0.5 rounded text-slate-600 text-[11px]">
                        {lang === 'en' ? `Showing ${filteredLeads.length} of ${leads.length}` : `মোট ${leads.length} টির মধ্যে ${filteredLeads.length} টি মেলানো গেছে`}
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-[500px]">
                      {filteredLeads.length === 0 ? (
                        <div className="p-8 text-center" id="no-leads-state">
                          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm font-medium">
                            {lang === 'en' ? 'No leads found matching current filters.' : 'এই ফিল্টারে কোনো লিড খুঁজে পাওয়া যায়নি।'}
                          </p>
                          <button 
                            onClick={() => { setSearchTerm(''); setFilterNiche('All'); setFilterStatus('All'); }}
                            className="mt-2 text-xs text-emerald-600 hover:underline font-semibold"
                          >
                            {lang === 'en' ? 'Clear Filters' : 'ফিল্টার সাফ করুন'}
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium">
                              <th className="p-3 w-8">{/* Actions/Select */}</th>
                              <th className="p-3">{lang === 'en' ? 'Business' : 'ব্যবসার নাম'}</th>
                              <th className="p-3">{lang === 'en' ? 'Contact' : 'যোগাযোগকারী'}</th>
                              <th className="p-3">{lang === 'en' ? 'Niche' : 'ক্যাটাগরি'}</th>
                              <th className="p-3">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                              <th className="p-3 text-right">{lang === 'en' ? 'Actions' : 'অ্যাকশন'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map((lead) => {
                              const isSelected = selectedLeadId === lead.id;
                              return (
                                <tr 
                                  key={lead.id}
                                  id={`lead-row-${lead.id}`}
                                  className={`hover:bg-slate-100/60 transition cursor-pointer ${
                                    isSelected ? 'bg-emerald-50/40 border-l-2 border-emerald-500 font-semibold' : ''
                                  }`}
                                  onClick={() => setSelectedLeadId(lead.id)}
                                >
                                  <td className="p-3 text-center">
                                    <input
                                      type="radio"
                                      id={`radio-lead-${lead.id}`}
                                      checked={isSelected}
                                      onChange={() => setSelectedLeadId(lead.id)}
                                      className="accent-emerald-600"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <div className="font-semibold text-slate-900 truncate max-w-[140px]">{lead.businessName}</div>
                                    <div className="text-slate-400 text-[10px] flex items-center gap-0.5 truncate max-w-[140px]">
                                      <MapPin className="w-3 h-3" /> {lead.cityState || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="text-slate-700 truncate max-w-[120px]">{lead.ownerName || 'Unknown'}</div>
                                    {lead.email ? (
                                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{lead.email}</div>
                                    ) : (
                                      <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded">No Email</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <span className="px-1.5 py-0.5 bg-slate-200/75 text-slate-700 rounded text-[10px] whitespace-nowrap">
                                      {lead.niche}
                                    </span>
                                  </td>
                                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                    <select
                                      id={`select-status-${lead.id}`}
                                      value={lead.status}
                                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                                      className={`text-[10px] font-semibold border-0 rounded px-1.5 py-1 focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                                        lead.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                                        lead.status === 'Interested' ? 'bg-blue-100 text-blue-800' :
                                        lead.status === 'Booked Call' ? 'bg-indigo-100 text-indigo-800' :
                                        lead.status === 'Sent' ? 'bg-yellow-100 text-yellow-800' :
                                        lead.status === 'Follow-Up 1' || lead.status === 'Follow-Up 2' ? 'bg-orange-100 text-orange-850' :
                                        lead.status === 'Not Sent' ? 'bg-slate-200 text-slate-700' :
                                        'bg-slate-100 text-slate-400'
                                      }`}
                                    >
                                      <option value="Not Sent">{lang === 'en' ? 'Not Sent' : 'মেইল পাঠানো হয়নি'}</option>
                                      <option value="Sent">{lang === 'en' ? 'Pitch Sent' : 'পিচ পাঠানো হয়েছে'}</option>
                                      <option value="Follow-Up 1">{lang === 'en' ? 'Follow-Up 1' : '১ম ফলো-আপ'}</option>
                                      <option value="Follow-Up 2">{lang === 'en' ? 'Follow-Up 2' : '২য় ফলো-আপ'}</option>
                                      <option value="Interested">{lang === 'en' ? 'Interested' : 'ক্লায়েন্ট ইন্টারেস্টেড'}</option>
                                      <option value="Booked Call">{lang === 'en' ? 'Booked Call' : 'মিটিং বুক হয়েছে'}</option>
                                      <option value="Closed">{lang === 'en' ? '🏆 Closed Deal' : '🏆 ডিল ক্লোজ!'}</option>
                                      <option value="Not Interested">{lang === 'en' ? 'Not Interested' : 'আগ্রহী নয়'}</option>
                                      <option value="No Email">{lang === 'en' ? 'No Email Found' : 'ইমেইল নেই'}</option>
                                    </select>
                                  </td>
                                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => openEditModal(lead)}
                                        className="p-1 hover:bg-slate-200 text-slate-600 rounded"
                                        title={lang === 'en' ? 'Edit Lead' : 'তথ্য পরিবর্তন'}
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteLead(lead.id)}
                                        className="p-1 hover:bg-red-50 text-red-600 rounded"
                                        title={lang === 'en' ? 'Delete Lead' : 'ডিলিট'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* MINI FORM TO SPEED DIAL A LEAD DIRECTLY */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1">
                      <PlusCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                      {lang === 'en' ? 'Quick Add Business Spot' : 'এক ক্লিকে নতুন কুইক বিজনেসের তথ্য যোগ করুন'}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input 
                        type="text" 
                        placeholder={lang === 'en' ? 'Business Name' : 'ব্যবসার নাম'}
                        id="quick-business-name"
                        className="bg-white border rounded p-1.5 text-xs text-slate-700" 
                      />
                      <input 
                        type="text" 
                        placeholder={lang === 'en' ? 'Owner Name' : 'মালিকের নাম'}
                        id="quick-owner-name"
                        className="bg-white border rounded p-1.5 text-xs text-slate-700" 
                      />
                      <input 
                        type="email" 
                        placeholder={lang === 'en' ? 'Business Email' : 'ইমেইল এড্রেস'}
                        id="quick-email"
                        className="bg-white border rounded p-1.5 text-xs text-slate-700" 
                      />
                      <button
                        onClick={() => {
                          const bus = (document.getElementById('quick-business-name') as HTMLInputElement)?.value;
                          const own = (document.getElementById('quick-owner-name') as HTMLInputElement)?.value;
                          const mlg = (document.getElementById('quick-email') as HTMLInputElement)?.value;
                          
                          if (!bus) {
                            triggerToast(lang === 'en' ? 'Business name is required' : 'ব্যবসার নাম দেওয়া জরুরি', 'error');
                            return;
                          }
                          const newL: Lead = {
                            id: `lead-${Date.now()}`,
                            businessName: bus,
                            ownerName: own || 'Owner',
                            email: mlg,
                            phone: '',
                            website: '',
                            niche: 'High-Ticket Services',
                            cityState: '',
                            source: 'Google Maps (Manual)',
                            status: 'Not Sent',
                            lastContacted: '',
                            nextFollowUp: '',
                            notes: 'Direct added'
                          };
                          const nextLeads = [newL, ...leads];
                          saveLeads(nextLeads);
                          setSelectedLeadId(newL.id);
                          triggerToast(lang === 'en' ? 'Quick-added lead!' : 'কুইক-অ্যাড সম্পন্ন হয়েছে!', 'success');
                          
                          // Reset mini fields
                          (document.getElementById('quick-business-name') as HTMLInputElement).value = '';
                          (document.getElementById('quick-owner-name') as HTMLInputElement).value = '';
                          (document.getElementById('quick-email') as HTMLInputElement).value = '';
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded text-center cursor-pointer flex justify-center items-center"
                      >
                        {lang === 'en' ? 'Add' : 'যুক্ত করুন'}
                      </button>
                    </div>
                  </div>

                  {/* QUICK GUIDE CHECKSHEET REMINDER */}
                  <div className="bg-slate-100/60 rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      {lang === 'en' 
                        ? '💡 If they do not list their email on their website, go to their Facebook page and look at the "About" box or their Instagram bio. You will find their primary email 90% of the time absolutely free!'
                        : '💡 ওয়েবসাইটটিতে ইমেইল না পেলে সোজা লিড-টির অফিসিয়াল ফেসবুক পেইজে চলে যান। ফেসবুক পেইজে বিজনেসের রিয়েল কন্ট্যাক্ট ইমেইল এবং হোয়াটস্যাপ নাম্বার পাওয়ার সম্ভাবনা অনেক বেশি! এটি সম্পূর্ণ ফ্রি ট্রিকস।'}
                    </p>
                  </div>
                </div>

                {/* RIGHT 5 SECONDS: COMPANION SMART EMAIL COMPOSE WINDOW */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-xs">
                    
                    {/* COMPOSE BOX HEADER */}
                    <div className="bg-slate-900 px-4 py-3 text-white flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <span className="text-xs font-medium font-mono ml-2 text-slate-350">
                          {lang === 'en' ? 'Interactive Email Composer' : 'ইন্টারেক্টিভ ইমেইল রাইটার'}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        SMTP: FREE GMAIL
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border-b border-slate-250 flex flex-col gap-3">
                      
                      {/* Sender customizer */}
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-600 block shrink-0">
                          {lang === 'en' ? 'Your Name (Sender):' : 'আপনার নাম (প্রেরক):'}
                        </label>
                        <input
                          type="text"
                          id="crm-sender-name"
                          value={customYourName}
                          onChange={(e) => setCustomYourName(e.target.value)}
                          placeholder="Your Name"
                          className="bg-white border rounded px-2 py-1 text-xs text-slate-700 w-36 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* SELECTED RECEIVER HEADER */}
                      <div className="bg-white rounded-lg border border-slate-200 p-2 text-xs text-slate-650 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{lang === 'en' ? 'Active Target:' : 'টার্গেট ক্লায়েন্ট:'}</span>
                          <span className="font-semibold text-emerald-700 font-mono bg-emerald-50 px-1 rounded truncate max-w-[120px]">
                            {activeSelectedLead ? activeSelectedLead.businessName : 'None'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Email:</span>
                          <span className="font-medium text-slate-900 select-all truncate max-w-[180px]">
                            {activeSelectedLead?.email || 'No email found'}
                          </span>
                        </div>
                      </div>

                      {/* TEMPLATE PICKER */}
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {lang === 'en' ? 'Sequence Blueprints:' : 'সিকোয়েন্স ব্লুপ্রিন্ট সমূহ:'}
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {EMAIL_TEMPLATES.map((tpl) => {
                              const isTplSelected = selectedTemplateId === tpl.id;
                              return (
                                <button
                                  key={tpl.id}
                                  id={`btn-tpl-${tpl.id}`}
                                  onClick={() => setSelectedTemplateId(tpl.id)}
                                  className={`text-[10px] sm:text-xs py-1.5 px-1 rounded transition text-center font-medium border cursor-pointer ${
                                    isTplSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                                      : 'bg-white hover:bg-slate-100 text-slate-650 border-slate-250'
                                  }`}
                                >
                                  {tpl.id === 'pitch' ? (lang === 'en' ? 'Cold Pitch' : '১. মেইন পিচ') :
                                   tpl.id === 'followup1' ? (lang === 'en' ? 'FollowUp 1' : '২. ফলোআপ ১') :
                                   (lang === 'en' ? 'FollowUp 2' : '৩. ফলোআপ ২')}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {lang === 'en' ? 'Custom Pitch Options (75-100 Words):' : 'কাস্টম পিচ অপশন সমূহ (৭৫-১০০ শব্দ):'}
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'meta_ads', labelEn: 'Meta Ads', labelBn: 'মেটা অ্যাডস' },
                              { id: 'google_ads', labelEn: 'Google Ads', labelBn: 'গুগল অ্যাডস' },
                              { id: 'mix_ads', labelEn: 'Meta + Google', labelBn: 'মিক্সড অ্যাডস' }
                            ].map((opt) => {
                              const isTplSelected = selectedTemplateId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  id={`btn-opt-${opt.id}`}
                                  onClick={() => setSelectedTemplateId(opt.id)}
                                  className={`text-[10px] sm:text-xs py-1.5 px-0.5 rounded transition text-center font-medium border cursor-pointer ${
                                    isTplSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                                      : 'bg-white hover:bg-slate-100 text-slate-650 border-slate-250'
                                  }`}
                                >
                                  {lang === 'en' ? opt.labelEn : opt.labelBn}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COMPILED PREVIEW WINDOW */}
                    <div className="p-4 flex-1 bg-white flex flex-col gap-3 min-h-[300px]">
                      
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 select-text font-serif text-xs md:text-sm text-slate-800 flex-1 whitespace-pre-wrap leading-relaxed relative">
                        <div className="font-sans font-semibold text-xs border-b pb-1.5 mb-1.5 text-slate-600">
                          <span className="text-slate-400 font-normal">Subject:</span> {compiledSubject}
                        </div>
                        <div id="compiled-email-body">
                          {compiledBody}
                        </div>
                      </div>

                      {/* ACTION CONTROLS */}
                      <div className="grid grid-cols-2 gap-2">
                        
                        {/* Copy Option */}
                        <button
                          onClick={copyEmailToClipboard}
                          id="btn-copy-email"
                          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-xs font-semibold border border-slate-250 transition cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{lang === 'en' ? 'Copy Script' : 'মেইল স্ক্রিপ্ট কপি'}</span>
                        </button>

                        {/* Open Email Client Option */}
                        {activeSelectedLead?.email ? (
                          <a
                            href={getMailtoLink()}
                            onClick={() => {
                              // Auto update status if client wants
                              updateLeadStatus(
                                activeSelectedLead.id, 
                                ['pitch', 'meta_ads', 'google_ads', 'mix_ads'].includes(selectedTemplateId)
                                  ? 'Sent' 
                                  : selectedTemplateId === 'followup1' 
                                    ? 'Follow-Up 1' 
                                    : 'Follow-Up 2'
                              );
                            }}
                            id="btn-mailto-send"
                            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-xs transition text-center cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            <span>{lang === 'en' ? 'Send via Gmail' : 'জিমেইলে পাঠান (ফ্রি)'}</span>
                          </a>
                        ) : (
                          <div
                            className="flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 py-2.5 rounded-lg text-xs font-semibold cursor-not-allowed border"
                            title={lang === 'en' ? 'Add email address first' : 'যোগাযোগকারী ইমেইল নেই'}
                          >
                            <Mail className="w-4 h-4" />
                            <span>{lang === 'en' ? 'No Email Entered' : 'ইমেইল অ্যাড্রেস নেই'}</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Footer Guide Inside Composer */}
                    <div className="px-4 py-2 bg-slate-50 border-t text-[10px] text-slate-400 text-center">
                      {lang === 'en'
                        ? 'Clicking "Send" launches your local email with fields filled. Completely direct & free.'
                        : 'বাটনে চাপলে এটি আপনার ডিভাইসের জিমেইলে অটো ফিলআপ করবে। কোনো ইন্টিগ্রেশন ছাড়াই ১০০% ফ্রি।'}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: 10-STEP FREE BLUEPRINT GUIDE */}
          {activeTab === 'guide' && (
            <div className="flex flex-col gap-6" id="panel-guide">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <BookOpen className="text-emerald-600 w-5 h-5" />
                    {lang === 'en' ? 'Manual Free Outreach Workflow Blueprint' : 'ম্যানুয়াল ফ্রি কাস্টমার আউটরিচ ওয়ার্কফ্লো ব্লুপ্রিন্ট'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'en' 
                      ? 'Follow this step-by-step checklist to start your free client attraction campaign without paying single dollars.' 
                      : 'যেকোনো টাকা খরচ না করে সম্পুর্ণ ফ্রিতে ম্যাপস ও জিমেইল দিয়ে কাস্টমার পাওয়ার সম্পূর্ণ গাইডলাইন এবং কাজের চেকলিস্ট।'}
                  </p>
                </div>
                {/* Reset checklist */}
                <button
                  id="btn-clear-checklist"
                  onClick={() => setCompletedSteps([])}
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs border rounded hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'en' ? 'Clear Checklist' : 'চেকলিস্ট মুছুন'}
                </button>
              </div>

              {/* TIMELINE OF 10 STEPS */}
              <div className="flex flex-col gap-4" id="workflow-steps-timeline">
                {WORKFLOW_STEPS.map((stepUnit) => {
                  const isDone = completedSteps.includes(stepUnit.step);
                  return (
                    <div 
                      key={stepUnit.step}
                      id={`workflow-step-${stepUnit.step}`}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start gap-4 ${
                        isDone 
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' 
                          : 'bg-white border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      {/* Checkbox circle indicator */}
                      <button
                        onClick={() => toggleStepCompleted(stepUnit.step)}
                        id={`btn-checklist-step-${stepUnit.step}`}
                        className={`text-slate-100 flex items-center justify-center shrink-0 w-8 h-8 rounded-full border-2 transition cursor-pointer font-bold ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-slate-300 hover:border-emerald-500 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-5 h-5" /> : stepUnit.step}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-950'}`}>
                            {lang === 'en' ? stepUnit.action : stepUnit.actionBn}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-150 rounded font-mono text-slate-500">
                            {lang === 'en' ? `Step ${stepUnit.step}` : `ধাপ ${stepUnit.step}`}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-650 leading-relaxed">
                          {lang === 'en' ? stepUnit.description : stepUnit.descriptionBn}
                        </p>

                        {/* PRO TIPS FOR FREE - EXPLAINING MANUALLY SECURING FREE EMAILS */}
                        <div className="mt-2.5 p-2 px-3 bg-slate-100/80 rounded-lg border border-slate-200 text-xs flex items-start gap-1.5">
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 rounded px-1 shrink-0 uppercase mt-0.5">
                            {lang === 'en' ? 'FREE TIP' : 'ফ্রি টিপস / ট্রিক'}
                          </span>
                          <span className="text-slate-600">
                            {lang === 'en' ? stepUnit.freeTip : stepUnit.freeTipBn}
                          </span>
                        </div>
                      </div>

                      {/* Interactive utility based on step */}
                      <div className="sm:self-center shrink-0">
                        {stepUnit.step === 1 && (
                          <button
                            onClick={() => setActiveTab('niches')}
                            className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1 transition"
                          >
                            <span>{lang === 'en' ? 'Search Now' : 'সার্চ করুন'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {stepUnit.step === 4 && (
                          <button
                            onClick={() => setActiveTab('crm')}
                            className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1 transition"
                          >
                            <span>{lang === 'en' ? 'Go to CRM' : 'সিআরএম-এ যান'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {stepUnit.step === 6 && (
                          <button
                            onClick={() => setActiveTab('crm')}
                            className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1 transition"
                          >
                            <span>{lang === 'en' ? 'Open Writer' : 'রাইটার ওপেন'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: KEYWORD BANK & DEMO DIRECT MAPS SEARCH */}
          {activeTab === 'niches' && (
            <div className="flex flex-col gap-6" id="panel-niches">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                  <Search className="text-emerald-600 w-5 h-5" />
                  {lang === 'en' ? 'High-Converting Niche & Keyword Bank' : 'বেস্ট নিশ ও গুগল ম্যাপস কি-ওয়ার্ড ব্যাংক'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'en' 
                    ? 'Start with one niche in one city. This prevents wasting energy on random business outreach.' 
                    : 'যেকোনো একটি নিশ এবং শহর টার্গেট শুরুতেই করুন। এতে আপনার কাজের ফোকাস সঠিকভাবে থাকবে।'}
                </p>
              </div>

              {/* DYNAMIC MAP SEARCH AREA */}
              <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4" />
                    {lang === 'en' ? 'Quick Google Maps Launcher (Free)' : 'গুগল ম্যাপস কুইক লঞ্চার (১০০% ফ্রি)'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Select a Keyword and enter a Target City. Click search to open Google Maps prefilled. Zero software fees needed!'
                      : 'নিচের কি-ওয়ার্ড সিলেক্ট করুন এবং টার্গেট শহরের নাম লিখুন। বাটনে ক্লিক করলেই গুগল ম্যাপস প্রাক-ডিজাইন আকারে প্রিপেড ওপেন হয়ে যাবে!'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{lang === 'en' ? 'Niche Keyword' : 'নিশ কি-ওয়ার্ড'}</label>
                      <select
                        id="launcher-keyword"
                        value={mapSearchNiche}
                        onChange={(e) => setMapSearchNiche(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="video production">Video production</option>
                        <option value="videographer">Videographer</option>
                        <option value="realtor">Realtor</option>
                        <option value="dental clinic">Dental clinic</option>
                        <option value="roofing company">Roofing company</option>
                        <option value="cleaning company">Cleaning company</option>
                        <option value="marketing agency">Marketing agency</option>
                        <option value="podcast studio">Podcast studio</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{lang === 'en' ? 'Target City/State' : 'টার্গেট শহর/দেশ'}</label>
                      <input
                        type="text"
                        id="launcher-city"
                        value={mapSearchCity}
                        onChange={(e) => setMapSearchCity(e.target.value)}
                        placeholder="e.g., Texas, London, Toronto"
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end md:self-center">
                  <button
                    onClick={() => openGoogleMapsSearch(mapSearchNiche)}
                    id="btn-launch-maps-search"
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-lg text-xs tracking-wider transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Search Maps Now' : 'ম্যাপে ফ্রি সার্চ'}</span>
                  </button>
                </div>
              </div>

              {/* NICHES CARD DECK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="niches-bento-deck">
                {NICHES_DATA.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3 hover:shadow-xs transition"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        {item.category === 'High-Ticket Services' ? (lang === 'en' ? 'High-Ticket Local Services' : 'হাই-টিকিট লোকাল সার্ভিস') :
                         item.category === 'Real Estate Brokers' ? (lang === 'en' ? 'Real Estate Brokers' : 'রিয়েল এস্টেট এজেন্ট ও ব্রোকার') :
                         item.category === 'E-commerce & Retail' ? (lang === 'en' ? 'E-commerce Brands' : 'ই-কমার্স ও রিটেইল ব্র্যান্ড') :
                         (lang === 'en' ? 'Premium B2B & Agencies' : 'প্রিমিয়াম বিটুবি ও সার্ভিস')}
                      </h4>
                      <span className="text-[10px] bg-slate-200 font-medium px-2 rounded-full text-slate-600 uppercase font-mono">
                        {lang === 'en' ? 'High Intent' : 'বেস্ট নিশ'}
                      </span>
                    </div>

                    {/* Keywords bank */}
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                        {lang === 'en' ? 'Copyable Keywords:' : 'সার্চ করার কি-ওয়ার্ডসমূহ (ক্লিক করুন):'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.map((kw, kIdx) => (
                          <button
                            key={kIdx}
                            onClick={() => {
                              setMapSearchNiche(kw);
                              triggerToast(lang === 'en' ? `Selected "${kw}". Set your target city above and search!` : `"${kw}" সিলেক্ট করা হয়েছে। উপরে শহর লিখে সার্চ দিন!`, 'info');
                            }}
                            className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border text-[10px] px-2 py-1 rounded cursor-pointer transition font-mono"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Offer angle */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-xs">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        {lang === 'en' ? 'Best Pitch Angle Offer:' : 'সেরা অফার অ্যাঙ্গেল:'}
                      </span>
                      <span className="text-slate-600 line-clamp-3">
                        {item.bestOfferAngle}
                      </span>
                    </div>

                    {/* Extraction suggestion list */}
                    <div className="text-[11px] text-slate-500 flex flex-col gap-1">
                      {item.suggestions.map((sug, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-1">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: METRICS TRACKER & GUIDELINES */}
          {activeTab === 'metrics' && (() => {
            const activeStats = getDynamicStats(statsUserFilter);
            return (
              <div className="flex flex-col gap-6" id="panel-metrics">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600 w-5 h-5" />
                    {lang === 'en' ? 'Outreach Progress Analytics' : 'আউটরিচ প্রগ্রেস অ্যানালিটিক্স'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'en' 
                      ? 'Track outreach volumes by specific user profiles dynamically.' 
                      : 'আপনার এজেন্সির টিম মেম্বারদের দৈনিক কাজের ও আউটরিচ ভলিউম ট্র্যাক ও তদারকি করুন।'}
                  </p>
                </div>

                {/* MEMBER STATS SELECTOR DROPDOWN */}
                <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Users className="w-4 h-4" />
                      {lang === 'en' ? 'Team Performance Tracking' : 'টিম পারফরম্যান্স ট্র্যাকিং'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {lang === 'en' 
                        ? 'Select an Admin or Employee member below to inspect their individual outreach metrics.' 
                        : 'নির্দিষ্ট মেম্বার সিলেক্ট করে তাদের সংগৃহীত লিড, ইমেইল সেন্ড, ফলো-আপ এবং বুকড মিটিং ট্র্যাক করুন।'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <select
                      value={statsUserFilter}
                      onChange={(e) => setStatsUserFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs rounded-lg py-2 px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold transition text-white cursor-pointer"
                    >
                      <option value="All">{lang === 'en' ? 'All Team Members' : 'সব মেম্বার একসাথে'}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.username}>
                          @{u.username} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STATISTICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="metrics-numeric-grid">
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      {lang === 'en' ? 'Leads Collected / Assigned' : 'সংগৃহীত লিড সংখ্যা'}
                    </span>
                    <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{activeStats.leadsCollected}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {lang === 'en' ? 'Total leads added by user' : 'এই ইউজারের যুক্ত করা মোট লিড'}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      {lang === 'en' ? 'Pitches / Emails Sent' : 'মেইল পাঠানো হয়েছে'}
                    </span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{activeStats.emailSent}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {lang === 'en' ? 'Initial pitch emails sent' : 'মোট পিচ মেইল পাঠানো হয়েছে'}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      {lang === 'en' ? 'Followups Sent' : 'প্রেরিত ফলো-আপ সংখ্যা'}
                    </span>
                    <div className="text-2xl font-bold text-cyan-600 mt-1 font-mono">{activeStats.followUpsSent}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {lang === 'en' ? 'Polite followups sent' : 'ফলো-আপ মেইল পাঠানো হয়েছে'}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-405 uppercase font-bold tracking-wider block">
                      {lang === 'en' ? 'Booked Calls & Closed' : 'মিটিং বুকড ও ক্লোজড'}
                    </span>
                    <div className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
                      {activeStats.callsBooked + activeStats.clientsClosed}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {lang === 'en' ? `${activeStats.clientsClosed} Closed Clients! 💰` : `${activeStats.clientsClosed} টি ডিল সফল ক্লোজড! 💰`}
                    </div>
                  </div>

                </div>

                {/* TEAM ACTION LOGS FEED */}
                <div className="bg-slate-50 rounded-xl border p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="text-sm font-semibold text-slate-900 block">
                      {lang === 'en' ? 'Team Realtime Activity Logs' : 'টিম রিয়েলটাইম অ্যাক্টিভিটি লগ্স'}
                    </h3>
                    {currentUser && currentUser.role === 'Admin' && (
                      <button 
                        onClick={() => {
                          if (window.confirm(lang === 'en' ? 'Reset outreach transaction logs?' : 'আপনি কি ট্র্যাক লগ মুছে ফেলতে চান?')) {
                            saveActivityLogs([]);
                            triggerToast(lang === 'en' ? 'Cleared tracker logs.' : 'অ্যাক্টিভিটি লগ ধুয়ে পরিষ্কার করা হয়েছে।', 'info');
                          }
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-mono cursor-pointer"
                      >
                        {lang === 'en' ? 'Clear Logs' : 'লগ মুছুন'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1 text-xs">
                    {activityLogs.length === 0 ? (
                      <div className="text-slate-400 py-6 text-center italic">
                        {lang === 'en' ? 'No recent activities recorded yet. Complete outreach actions above!' : 'এখনো কোনো অ্যাক্টিভিটি রেকর্ড হয়নি। কাজে নেমে পড়ুন!'}
                      </div>
                    ) : (() => {
                      const filteredLogs = activityLogs.filter(log => statsUserFilter === 'All' || log.username === statsUserFilter);
                      if (filteredLogs.length === 0) {
                        return (
                          <div className="text-slate-400 py-6 text-center italic">
                            {lang === 'en' ? 'No activities for this user.' : 'এই ইউজারের জন্য কোনো অ্যাক্টিভিটি রেকর্ড নেই।'}
                          </div>
                        );
                      }
                      return filteredLogs.slice(0, 100).map((log) => {
                        const date = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={log.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-100 shadow-3xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                                @{log.username}
                              </span>
                              <span className="text-slate-600">
                                {log.type === 'create_lead' && (lang === 'en' ? `created lead for "${log.businessName}"` : `"${log.businessName}" এর লিড ডাটাবেসে যোগ করেছে`)}
                                {log.type === 'email_sent' && (lang === 'en' ? `sent pitch email to "${log.businessName}"` : `"${log.businessName}" কে কোল্ড পিচ মেইল পাঠিয়েছে`)}
                                {log.type === 'followup_sent' && (lang === 'en' ? `sent follow-up email to "${log.businessName}"` : `"${log.businessName}" কে ফলোআপ মেইল করেছে`)}
                                {log.type === 'call_booked' && (lang === 'en' ? `booked outreach call with "${log.businessName}" 📅` : `"${log.businessName}" থেকে মিটিং কল বুক করেছে 📅`)}
                                {log.type === 'lead_closed' && (lang === 'en' ? `closed paying client deal for "${log.businessName}" 🏆💰` : `"${log.businessName}" এর ডিল ক্লোজ করেছে 🏆💰`)}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {date}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              {/* COMPLIANCE & RULES SECTION */}
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 flex flex-col gap-1.5">
                  <span className="font-bold uppercase text-amber-900">
                    {lang === 'en' ? 'Cold Email Compliance Rules:' : 'কোল্ড ইমেইল কন্ট্যাক্ট করার সময় কি কি করা যাবে না:'}
                  </span>
                  <p className="leading-relaxed">
                    {lang === 'en' 
                      ? '1. Do not use automated bulk email systems on new personal Gmail accounts. They will mark your email as spam. Send manually (15-20 pitches per day max). \n2. Never sound desperate. Keep your templates polite and structured like a genuine inquiry. \n3. Only contact businesses that have clear active websites or listings. Avoid deceased sites.'
                      : '১. নতুন জিমেইল অ্যাকাউন্ট তৈরি করে একসাথে ১০০০ মেইল বাল্ক পাঠাবেন না। মেইল স্প্যামে চলে যাবে। ম্যানুয়ালি দিনে সর্বোচ্চ ১৫ থেকে ২০টি করে মেইল করুন। \n২. কখনো অপ্রাসঙ্গিক বা আকুল মিনতি কোরে মেইল লিখবেন না। প্রোফেশনাল হোন। \n৩. মেইলে ডিরেক্ট প্রাইসিং বা টাকা দাবি কোরে অফার ছুড়বেন না। আগে বলবেন "ফ্রি টিপস বা ডেমো" দেখতে চান কিনা।'}
                  </p>
                </div>
              </div>

              {/* VISUAL CHART OF LEADS BY STATUS */}
              <div className="bg-slate-50 rounded-xl border p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 block">
                  {lang === 'en' ? 'Live Lead Funnel State Map' : 'লাইভ রিয়েলটাইম লিড ফানেল ডিস্ট্রিবিউশন'}
                </h3>
                
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'Not Sent', label: lang === 'en' ? 'Not Sent Leads' : 'লিস্টেড মেইল পাঠানো হয়নি', color: 'bg-slate-400' },
                    { key: 'Sent', label: lang === 'en' ? 'Main Pitch Sent' : 'পিচ মেইল পাঠানো হয়েছে', color: 'bg-yellow-500' },
                    { key: 'Follow-Up 1', label: lang === 'en' ? 'Follow-Up 1 Sent' : '১ম ফলো-আপ পাঠানো হয়েছে', color: 'bg-orange-500' },
                    { key: 'Interested', label: lang === 'en' ? 'Interested (Hot Leads)' : 'রিপ্লাই ও কন্ট্যাক্ট আগ্রহী', color: 'bg-blue-500' },
                    { key: 'Booked Call', label: lang === 'en' ? 'Booked Calls / Meetings' : 'মিটিং কনফার্ম হয়েছে', color: 'bg-indigo-500' },
                    { key: 'Closed', label: lang === 'en' ? 'Closed Paying Deal 💰' : 'ডিল কনফার্ম ও পেমেন্ট বা ক্লোজ 💰', color: 'bg-emerald-550 bg-emerald-600' }
                  ].map((cat) => {
                    const count = leads.filter(l => l.status === cat.key).length;
                    const percent = leads.length > 0 ? (count / leads.length) * 100 : 0;
                    return (
                      <div key={cat.key} className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="w-40 shrink-0 font-medium truncate">{cat.label}</span>
                        <div className="flex-1 bg-slate-200 h-2 py-0 rounded-full overflow-hidden">
                          <div className={`${cat.color} h-full rounded-full`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-10 text-right font-semibold text-slate-900 font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )})()}

          {/* TAB 5: ADMIN TEAM MANAGEMENT & ROLE SETTINGS */}
          {activeTab === 'team' && (
            <div className="flex flex-col gap-6" id="panel-team animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                  <Users className="text-emerald-600 w-5 h-5" />
                  {lang === 'en' ? 'Team Registry & Role Settings' : 'টিম মেম্বার রেজিস্ট্রি ও রোল সেটিংস'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'en' 
                    ? 'Create employee work profiles, set passwords, and manage database update rights.' 
                    : 'প্রতিটি মেম্বারের জন্য ইউজারনেম ও পাসওয়ার্ড রেজিস্টার করুন এবং সিস্টেমে অ্যাডমিন বা কাজের অধিকার নির্ধারণ করুন।'}
                </p>
              </div>

              {currentUser?.role !== 'Admin' ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{lang === 'en' ? 'Access Denied. Admins Only.' : 'প্রবেশাধিকার নেই। শুধুমাত্র অ্যাডমিনরা এখানে পরিবর্তন করতে পারবেন।'}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Create New User Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4 self-start">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-4.5 h-4.5 text-emerald-600" />
                      {lang === 'en' ? 'Register New Member' : 'মেম্বার রেজিস্টার করুন'}
                    </h3>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newUsername.trim() || !newPassword.trim()) {
                        triggerToast(lang === 'en' ? 'Please fill all inputs.' : 'সব ইনফরমেশন সঠিকভাবে পূরণ করুন।', 'error');
                        return;
                      }
                      
                      const sanitized = newUsername.trim().toLowerCase();
                      if (users.some(u => u.username.toLowerCase() === sanitized)) {
                        triggerToast(lang === 'en' ? 'This username is already taken!' : 'এই ইউজারনেম অলরেডি রেজিস্টার করা আছে!', 'error');
                        return;
                      }

                      const newUser: User = {
                        id: `user-${Date.now()}`,
                        username: sanitized,
                        password: newPassword,
                        role: newUserRole,
                        createdAt: new Date().toISOString().split('T')[0]
                      };

                      const nextUsers = [...users, newUser];
                      saveUsers(nextUsers);
                      setNewUsername('');
                      setNewPassword('');
                      setNewUserRole('Employee');
                      triggerToast(lang === 'en' ? `User @${sanitized} registered successfully!` : `@${sanitized} মেম্বার হিসেবে যুক্ত হয়েছে!`, 'success');
                    }} className="flex flex-col gap-3 text-xs text-slate-700">
                      <div>
                        <label className="font-semibold block mb-1">{lang === 'en' ? 'Username' : 'ইউজারনেম'}</label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="e.g. burhan"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold block mb-1">{lang === 'en' ? 'Temporary Password' : 'পাসওয়ার্ড সেট করুন'}</label>
                        <input
                          type="text"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="e.g. employeePass"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold block mb-1">{lang === 'en' ? 'System Role Permission' : 'কাজের রোল (নির্দিষ্ট পারমিশন)'}</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Employee">{lang === 'en' ? 'Employee (Outreach, view niches)' : 'এমপ্লয়ি (শুধু আউটরিচ ও লিড অ্যাড)'}</option>
                          <option value="Admin">{lang === 'en' ? 'Admin (Full dashboard edit controls)' : 'অ্যাডমিন (ড্যাশবোর্ডের সব এডিট অধিকার)'}</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 rounded-lg transition mt-2 cursor-pointer shadow text-center"
                      >
                        {lang === 'en' ? 'Save Team Member' : 'মেম্বার সেইভ করুন'}
                      </button>
                    </form>
                  </div>

                  {/* Users Registry List Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                       <Shield className="w-4.5 h-4.5 text-emerald-600" />
                       {lang === 'en' ? 'Active Members Database' : 'চলতি মেম্বারদের ইউজার ও পাসওয়ার্ড খাতা'}
                    </h3>

                    <div className="overflow-x-auto text-xs text-slate-700 font-sans">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 text-left font-semibold">{lang === 'en' ? 'User Details' : 'ইউজার লগইন আইডি'}</th>
                            <th className="p-3 text-left font-semibold">{lang === 'en' ? 'Passcode' : 'পাসওয়ার্ড কোড'}</th>
                            <th className="p-3 text-left font-semibold">{lang === 'en' ? 'Role Type' : 'সিস্টেম রোল'}</th>
                            <th className="p-3 text-left font-semibold">{lang === 'en' ? 'Leads Collected' : 'সংগৃহীত লিড্স'}</th>
                            <th className="p-3 text-center font-semibold">{lang === 'en' ? 'Manage Settings' : 'অপশন'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.map((u) => {
                            const gathered = leads.filter(l => (l.createdBy || 'admin') === u.username).length;
                            return (
                              <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                <td className="p-3 align-middle">
                                  <div className="font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                                    <span>@{u.username}</span>
                                    {currentUser?.username === u.username && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 py-px rounded font-sans font-bold">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-slate-500 align-middle">{u.password}</td>
                                <td className="p-3 align-middle">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    u.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-100'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-3 font-mono font-medium text-slate-900 align-middle">{gathered} leads</td>
                                <td className="p-3 text-center align-middle">
                                  {u.username === 'admin' ? (
                                    <span className="text-[10px] text-slate-400 italic">{lang === 'en' ? 'Primary Admin' : 'প্রধান অ্যাডমিন'}</span>
                                  ) : u.username === currentUser?.username ? (
                                    <span className="text-[10px] text-slate-400 italic">{lang === 'en' ? 'Logged In' : 'লগইন আছেন'}</span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(lang === 'en' ? `Are you sure you want to dismiss @${u.username}?` : `@${u.username} কে টিম থেকে ডিলিট করতে চান?`)) {
                                          const nextUsers = users.filter((user) => user.id !== u.id);
                                          saveUsers(nextUsers);
                                          triggerToast(lang === 'en' ? `Removed @${u.username}.` : `@${u.username} কে টিম থেকে ডিলিট করা হয়েছে।`, 'info');
                                        }
                                      }}
                                      className="text-rose-600 hover:text-white bg-transparent hover:bg-rose-500 border border-slate-200 hover:border-transparent px-2.5 py-1 text-[10px] rounded font-semibold transition cursor-pointer"
                                    >
                                      {lang === 'en' ? 'Dismiss Member' : 'টিম থেকে বাদ দিন'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-auto flex flex-col items-center justify-center text-center gap-2" id="main-footer">
        <p>
          {lang === 'en' 
            ? '🚀 Agency Client Outreach Tracking & Planning Dashboard | Designed to be 100% Free'
            : '🚀 এজেন্সি ক্লায়েন্ট আউটরিচ ট্র্যাকিং ও প্ল্যানিং ড্যাশবোর্ড | সম্পুর্ণ ফ্রিতে কাস্টমার নিয়ে আসার ফর্মুলা'}
        </p>
        <p className="text-slate-500 font-mono">
          Made in Google AI Studio • Credit to Burhan Kobir Joy • Naznio Strategy Lab
        </p>
      </footer>

      {/* MODAL FOR ADD/EDIT LEAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                {editingLead 
                  ? (lang === 'en' ? '✏️ Edit Lead Information' : '✏️ লিডের তথ্য পরিবর্তন করুন') 
                  : (lang === 'en' ? '➕ Add New Lead' : '➕ নতুন বিজনেসের তথ্য যোগ করুন')}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="p-4 flex flex-col gap-3 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Business Name */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Business / Company Name *' : 'ব্যবসায়িক প্রতিষ্ঠানের নাম *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Real Estate"
                    value={formBusinessName}
                    onChange={(e) => setFormBusinessName(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Owner / Contact Person' : 'মালিক বা পরিচিত কন্ট্যাক্ট ব্যক্তি'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Email Address' : 'ইমেইল এড্রেস'}
                  </label>
                  <input
                    type="email"
                    placeholder="name@business.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Phone Number' : 'ফোন বা হোয়াটস্যাপ নাম্বার'}
                  </label>
                  <input
                    type="text"
                    placeholder="+1 555-0012"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Website */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Website Address' : 'ওয়েবসাইট এড্রেস (লিংক)'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Niche Category */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Niche Area' : 'ক্যাটাগরি বা নিশ'}
                  </label>
                  <select
                    value={formNiche}
                    onChange={(e) => setFormNiche(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="High-Ticket Services">High-Ticket Services</option>
                    <option value="Real Estate Brokers">Real Estate Brokers</option>
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                    <option value="Premium B2B & Agencies">Premium B2B & Agencies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City State */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'City, State/Country' : 'শহর এবং দেশ'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. London, UK"
                    value={formCityState}
                    onChange={(e) => setFormCityState(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Lead Source */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Lead Source' : 'লিড কোন সোর্স থেকে নেওয়া'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google Maps, Facebook Search"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Status Selection */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {lang === 'en' ? 'Lead Status' : 'লিডের বর্তমান অবস্থা (Status)'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Lead['status'])}
                    className="w-full bg-slate-50 border rounded p-2 text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Not Sent">{lang === 'en' ? 'Not Sent (New List)' : 'মেইল পাঠানো হয়নি'}</option>
                    <option value="Sent">{lang === 'en' ? 'Cold Pitch Sent' : 'মেইন পিচ মেইল পাঠানো হয়েছে'}</option>
                    <option value="Follow-Up 1">{lang === 'en' ? 'Follow-Up 1 Sent' : '১ম ফলো-আপ পাঠানো হয়েছে'}</option>
                    <option value="Follow-Up 2">{lang === 'en' ? 'Follow-Up 2 Sent' : '২য় ফলো-আপ পাঠানো হয়েছে'}</option>
                    <option value="Interested">{lang === 'en' ? 'Interested (Replied)' : 'আগ্রহী এবং কথা চলছে'}</option>
                    <option value="Booked Call">{lang === 'en' ? 'Booked Meeting Call' : 'মিটিং কল শিডিউল্ড'}</option>
                    <option value="Closed">{lang === 'en' ? 'Closed Paying Deal 🏆' : 'ডিল কনফার্ম ও পেমেন্ট (ক্লোজড) 🏆'}</option>
                    <option value="Not Interested">{lang === 'en' ? 'Not Interested' : 'আগ্রহী নয়'}</option>
                    <option value="No Email">{lang === 'en' ? 'No Email Found' : 'ইমেইল এড্রেস মেলেনি'}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {lang === 'en' ? 'Short Notes / Remarks' : 'ছোট নোট (ব্যক্তিগত রিমার্কস)'}
                </label>
                <textarea
                  placeholder="..."
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  id="btn-close-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-slate-100 text-slate-600 transition h-10 font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  id="btn-submit-form"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition h-10 font-bold cursor-pointer shadow-sm"
                >
                  {editingLead ? (lang === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ করুন') : (lang === 'en' ? 'Add Lead Database' : 'ডাটাবেজে যুক্ত করুন')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
