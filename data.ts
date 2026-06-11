import { Lead, NicheInfo, StepGuide } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    businessName: 'Apex Real Estate',
    ownerName: 'Sarah Jenkins',
    email: 'sarah@apexagents.com',
    phone: '+1 555-0199',
    website: 'https://apexagents.com',
    niche: 'Real Estate Developer',
    cityState: 'New York, NY',
    source: 'Google Maps (Manual)',
    status: 'Interested',
    lastContacted: '2026-06-08',
    nextFollowUp: '2026-06-12',
    notes: 'Very interested in lead generation ads with Facebook Pixel to capture premium buyers. Meeting booked through Naznio Strategy Lab.'
  },
  {
    id: 'lead-2',
    businessName: 'Downtown Dental Care',
    ownerName: 'Dr. Robert Chen',
    email: 'contact@downtowndental.com',
    phone: '+1 555-0143',
    website: 'https://downtowndentalclinic.example.com',
    niche: 'Healthcare / Dentist',
    cityState: 'Toronto, ON',
    source: 'Google Maps (Manual)',
    status: 'Sent',
    lastContacted: '2026-06-09',
    nextFollowUp: '2026-06-11',
    notes: 'Sent local SEO pitch. They have great reviews but are on Page 2 of local search results.'
  },
  {
    id: 'lead-3',
    businessName: 'Milestone Roofer Pro',
    ownerName: 'Marcus Brodie',
    email: 'marcus@milestoneroofers.net',
    phone: '+1 555-0182',
    website: 'https://milestoneroofers.net',
    niche: 'High-Ticket Local Services',
    cityState: 'London, UK',
    source: 'Google Search',
    status: 'Not Sent',
    lastContacted: '',
    nextFollowUp: '',
    notes: 'Roofer looking for lead generation and phone booking system. High possibility of closing.'
  },
  {
    id: 'lead-4',
    businessName: 'Vibe Med Spa & Skin',
    ownerName: 'Elena Rostova',
    email: 'elena@vibemedspa.example.com',
    phone: '+1 555-0168',
    website: 'https://vibemedspa.example.com',
    niche: 'Med Spa / Aesthetics',
    cityState: 'Austin, TX',
    source: 'Instagram Search',
    status: 'Follow-Up 1',
    lastContacted: '2026-06-05',
    nextFollowUp: '2026-06-09',
    notes: 'Need to follow up on the custom website landing page & booking funnel proof of concept.'
  }
];

export const NICHES_DATA: NicheInfo[] = [
  {
    category: 'High-Ticket Services',
    keywords: ['roofing contractor', 'med spa', 'dentist near me', 'solar energy company', 'pest control'],
    bestOfferAngle: 'Offer a pay-per-booked-lead model or standard Google Ads lead-gen pipeline to double their phone calls.',
    suggestions: [
      'Search Google Maps for businesses with 3.5 to 4.5 star reviews, or those currently running messy ads.',
      'Offer they pay only for qualified leads that actually show up for their appointment.'
    ]
  },
  {
    category: 'Real Estate Brokers',
    keywords: ['realtor', 'real estate broker', 'property development', 'home builder'],
    bestOfferAngle: 'Hyper-local Facebook buyer/seller lead campaigns and Instagram video ad setups.',
    suggestions: [
      'Target realtors with outstanding listings but poor digital promotion on Meta.',
      'Show they can capture warm, pre-qualified local home buyers in their zip code for under $20/lead.'
    ]
  },
  {
    category: 'E-commerce & Retail',
    keywords: ['boutique clothing', 'organic skincare brand', 'custom furniture manufacturer', 'coffee roaster'],
    bestOfferAngle: 'Offer a direct audit of their Shopify/WooCommerce store and a test Tik Tok/Instagram Ads strategy.',
    suggestions: [
      'Look for brands page-active on Instagram but not running Meta Ads (check Facebook Ad Library).',
      'Offer a 7-day free trial of ad optimization to show them instant conversion boost.'
    ]
  },
  {
    category: 'Premium B2B & Agencies',
    keywords: ['commercial cleaning', 'it support services', 'software consultancy', 'fitness franchises'],
    bestOfferAngle: 'Offer LinkedIn outreach pipelines and cold email funnel setups to close premium corporate contracts.',
    suggestions: [
      'Show them how Naznio Strategy Lab builds evergreen B2B appointment settings.',
      'Pitch a combined Google Maps SEO and cold email framework to capture local office clients.'
    ]
  }
];

export const WORKFLOW_STEPS: StepGuide[] = [
  {
    step: 1,
    action: 'Open Google Maps',
    actionBn: 'গুগল ম্যাপস ওপেন করুন',
    description: 'Go to google.com/maps in your browser. This is your primary source of high-quality verified local business data.',
    descriptionBn: 'আপনার ব্রাউজারে google.com/maps-এ যান। এটি হলো ভেরিফাইড স্থানীয় ব্যবসার উচ্চ মানের তথ্যের প্রধান সোর্স।',
    freeTip: 'Use a clean Incognito browser window so your search results are unbiased and localized.',
    freeTipBn: 'একটি ইনকগনিটো (Incognito) উইন্ডো ব্যবহার করুন যাতে সার্চ রেজাল্ট পক্ষপাতহীন ও সঠিক লোকাল ডাটা দেখায়।'
  },
  {
    step: 2,
    action: 'Search Keywords',
    actionBn: 'কি-ওয়ার্ড সার্চ করুন',
    description: 'Combine your niche and target state/city. For example: "realtor Toronto", "dentist Chicago", "fitness studio Austin".',
    descriptionBn: 'আপনার নির্বাচিত নিশ (niche) এবং শহরের নাম একসাথে সার্চ করুন। যেমন: "realtor Toronto", "dentist Chicago", "fitness studio Austin"।',
    freeTip: 'Scroll slowly down the list of locations so Google Maps loads more results. Map leads are evergreen and high-intent.',
    freeTipBn: 'ম্যাপের লিস্টটি ধীরে ধীরে স্ক্রোল করুন যাতে আরও বেশি রেজাল্ট লোড হয়। এই লিডগুলো রিয়েল এবং বর্তমানে সচল।'
  },
  {
    step: 3,
    action: 'Collect Leads Manually',
    actionBn: 'ম্যানুয়ালি লিড সংগ্রহ করুন',
    description: 'Open the business website, find their email or social links. Often, the email is on their Contact page, footer, or Facebook page.',
    descriptionBn: 'ব্যবসায়িক ওয়েবসাইটটি ভিজিট করুন এবং তাদের ইমেইল বা ফেসবুক লিংক খুঁজে বের করুন। সাধারণত ইমেইলগুলো কন্ট্যাক্ট পেজ, ফুটার বা ফেসবুক পেইজে পাওয়া যায়।',
    freeTip: 'Visit their Facebook Page block. Most local businesses list their actual direct emails in the Facebook "About" section for free inquiry!',
    freeTipBn: 'তাদের ফেসবুক পেইজের "About" অংশটি চেক করুন। বেশিরভাগ লোকাল ব্যাবসায়ীরা বিনামূল্যে যোগাযোগের জন্য সেখানে সরাসরি ইমেইল দিয়ে রাখেন!'
  },
  {
    step: 4,
    action: 'Input into Free CRM Tracker',
    actionBn: 'ফ্রি সিআরএম-এ ইনপুট করুন',
    description: 'Instead of buying paid scrapers, use our companion CRM tracker directly below. Add the Business Name, Website, Email, Phone, and Niche.',
    descriptionBn: 'পেইড স্ক্র্যাপিং সফটওয়্যার না কিনে আমাদের নিচে দেওয়া ফ্রি CRM-টি ব্যবহার করুন। ব্যবসার নাম, ওয়েবসাইট, ইমেইলে, ফোন এবং নিশ যুক্ত করুন।',
    freeTip: 'Set "Status" to "Not Sent" initially. Keeping your data structured here saves hours of work.',
    freeTipBn: 'শুরুতে "Status" হিসেবে "Not Sent" সিলেক্ট করে রাখুন। তথ্যগুলো গুছিয়ে রাখলে পরবর্তীতে কাজের গতি বৃদ্ধি পাবে।'
  },
  {
    step: 5,
    action: 'Clean & Filter The List',
    actionBn: 'ডাটা ক্লিন করুন',
    description: 'Avoid sending pitches to dead sites or massive giants. Remove listings that have poor websites, no real activity, or zero online potential.',
    descriptionBn: 'অচল বা অনেক বড় কোম্পানির ওয়েবসাইটে মেইল করে লাভ নেই। যাদের ওয়েবসাইট দুর্বল, সোশ্যাল এক্টিভিটি নেই কিন্তু পোটেনশিয়াল আছে তাদের টার্গেট করুন।',
    freeTip: 'Prioritize businesses with strong reviews (high-social proof) but poor/absent short-form video presence. They need you!',
    freeTipBn: 'যাদের গুগল রিভিউ অনেক ভালো (হাই ট্রাস্ট) কিন্তু ফেসবুকে/ইনস্টাগ্রামে কোন রিলস বা শর্ট ভিডিও পোস্ট করছে না, তাদের বেশি গুরুত্ব দিন।'
  },
  {
    step: 6,
    action: 'Prepare Clear Dynamic Email',
    actionBn: 'ইমেইল প্রস্তুত করুন',
    description: 'Use the customizable templates provided in our "Smart Email Writer" tab. Write a short, friendly message with an angle tailored to their niche.',
    descriptionBn: 'আমাদের "Smart Email Writer" ট্যাবটি ব্যবহার করে কাস্টমাইজড ইমেইল তৈরি করুন। তাদের নিশের জন্য উপযোগী, একদম সরাসরি এবং বন্ধুত্বপূর্ণ মেইল লিখুন।',
    freeTip: 'Keep it human. Never make it look mass-sent. Address them by name and name-drop their specific business.',
    freeTipBn: 'মেইলটি যেন রোবোটিক বা বাল্ক মেইলের মতো না লাগে। সবসময় ক্লায়েন্টের নাম এবং তার বিজনেসের নাম উল্লেখ করে লিখবেন।'
  },
  {
    step: 7,
    action: 'Send Outreach (Zero Cost)',
    actionBn: 'বিনামূল্যে মেইল পাঠান',
    description: 'Click "Gmail (Free Mailto)" or copy the email body. Send directly from your personal or professional free Gmail address.',
    descriptionBn: 'সরাসরি "Gmail" বাটনে ক্লিক করে বা ইমেইল স্ক্রিপ্টটি কপি করে আপনার ফ্রি জিমেইল একাউন্ট থেকে মেইলটি সেন্ড করুন।',
    freeTip: 'Warm up a gmail account by sending 10-15 standard personal emails first if the account is brand new.',
    freeTipBn: 'যদি আপনার জিমেইল অ্যাকাউন্টটি একদম নতুন হয়ে থাকে, তবে শুরুতে বন্ধুদের সাথে ১০-১৫টি স্বাভবিক ইমেইল আদান-প্রদান করে ওয়ার্ম-আপ করে নিন।'
  },
  {
    step: 8,
    action: 'Send Follow-Up 1',
    actionBn: 'প্রথম ফলো-আপ পাঠান',
    description: 'If they do not respond in 2-3 business days, send a simple gentle check-in to bump your email to the top of their inbox.',
    descriptionBn: 'যদি ২-৩ দিন পার হওয়ার পরেও তারা উত্তর না দেয়, তবে আমাদের প্রথম ফলো-আপ স্ক্রিপ্ট থেকে রিলেভেন্ট ও নম্র ভাবে একটি ফলো-আপ দিন।',
    freeTip: 'Over 65% of replies come on the first follow-up! Never skip this. Send a quick bump with examples of what they are missing.',
    freeTipBn: '৬৫%-এর বেশি রিপ্লাই আসে ১ম ফলো-আপ পাঠানোর পরে! তাই এই স্টেপটি একদম মিস করবেন না।'
  },
  {
    step: 9,
    action: 'Send Follow-Up 2',
    actionBn: 'দ্বিতীয় ফলো-আপ পাঠান',
    description: 'After another 3 days of silence, send a helpful final short note reminding them about the power of vertical video trust.',
    descriptionBn: 'আরও ৩ দিন পেরিয়ে যাওয়ার পর, শর্ট ভিডিওর সুবিধা স্মরণ করিয়ে দিয়ে শেষ বারের মতো একটি সুন্দর রি-ক্যাপ বা রিমাইন্ডার কুইক মেইল পাঠান।',
    freeTip: 'Keep Follow-Up 2 extremely brief (1-2 sentences maximum). Suggest a quick, risk-free Yes/No booking.',
    freeTipBn: 'দ্বিতীয় ফলো-আপ মেইলটি সর্বোচ্চ ১ বা ২ লাইনে রাখুন। তাদের একদম সিম্পল একটি Yes/No প্রশ্ন করুন।'
  },
  {
    step: 10,
    action: 'Track Replies & Close Deals',
    actionBn: 'রিপ্লাই ট্র্যাক ও ডিল ক্লোজ',
    description: 'When they reply, quickly mark them as "Interested" or "Booked Call" in the Lead Manager. Offer a quick 10-min Zoom call to show examples.',
    descriptionBn: 'ক্লায়েন্ট রিপ্লাই দিলে সাথে সাথেই আমাদের ড্যাশবোর্ডে স্ট্যাটাস "Interested" বা "Booked Call" আপডেট করুন এবং একটি ১০ মিনিটের জুম (Zoom) মিটিংয়ের অফার দিন।',
    freeTip: 'Do not pitch pricing immediately on email. Book a short Call, show value on a screen share, and secure a deposit.',
    freeTipBn: 'ইমেইলেই সরাসরি প্রাইস বা রেট বলবেন না। আগে একটি ছোট ফ্রেন্ডলি মিটিং বুক করুন, সেখানে আপনার কাজের ডেমো দেখিয়ে ক্লায়েন্ট কনভিন্স করুন।'
  }
];

export const EMAIL_TEMPLATES = [
  {
    id: 'pitch',
    name: 'Initial Cold Pitch (Lead Gen Audit)',
    subject: 'Quick strategy idea for {{Business Name}}',
    body: `Hi {{Name}},

I came across {{Business Name}} on Google Maps and noticed you already have excellent local service history and reviews!

However, it looks like you are missing out on high-intent inbound customer leads who search for you daily online. At Naznio Strategy Lab, we specialize in building predictable customer acquisition systems. We can set up a high-converting local map SEO and meta campaign to bring you 10-15 new pre-booked appointments this month on complete autopilots.

I put together a quick, free 2-minute video showing the exact strategy and where your competitors are currently taking your clients.

Would you be open to me sending that video over? No strings attached.

Best regards,
[Your Name]
Strategy Consultant, Naznio Strategy Lab`
  },
  {
    id: 'followup1',
    name: 'Follow-Up 1 (Gentle Bump)',
    subject: 'Quick check-in regarding {{Business Name}}',
    body: `Hi {{Name}},

Just checking if you had a moment to see my previous message. I know how busy it gets managing {{Business Name}}!

Just to recap: I have a custom 2-minute marketing breakdown ready for you on how we can double your local lead flow using the Naznio Strategy Lab framework.

Should I drop the link to the quick video here, or is there a better email address to send it to?

Best,
[Your Name]
Naznio Strategy Lab`
  },
  {
    id: 'followup2',
    name: 'Follow-Up 2 (Value Case Study)',
    subject: 'Quick final note for {{Business Name}}',
    body: `Hi {{Name}},

Quick final note. Your business already has perfect trust score locally, but without digital marketing strategy, that trust is sitting idle on the table.

We help brands turn that reputation into direct incoming bookings. 

If this isn't a priority for you right now, no worries! But if you'd like to see the free roadmap for {{Business Name}}, let me know and I'll send it over.

With thanks,
[Your Name]
Naznio Strategy Lab`
  }
];
