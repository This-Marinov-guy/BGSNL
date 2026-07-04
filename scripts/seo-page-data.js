const SITE_URL = "https://www.bulgariansociety.nl";
const PAST_EVENTS_ARCHIVE_DATA = require("../src/util/defines/past-events-archive.json");

const PAST_EVENTS_ARCHIVE = PAST_EVENTS_ARCHIVE_DATA.events ?? [];
const PAST_EVENTS_ARCHIVE_STATS = PAST_EVENTS_ARCHIVE_DATA.stats ?? {
  totalEvents: PAST_EVENTS_ARCHIVE.length,
  totalRegions: new Set(PAST_EVENTS_ARCHIVE.map((event) => event.region)).size,
  totalRegistrations: PAST_EVENTS_ARCHIVE.reduce((sum, event) => sum + (event.registrationCount || 0), 0),
  years: [...new Set(PAST_EVENTS_ARCHIVE.map((event) => event.year).filter(Boolean))],
};

function archiveYearRange() {
  const years = PAST_EVENTS_ARCHIVE_STATS.years ?? [];
  if (years.length === 0) return "recent years";
  return `${Math.min(...years)}-${Math.max(...years)}`;
}

const AUTHORITY_SOURCES = [
  {
    name: "Radio Bulgaria",
    url: "https://bnrnews.bg/en/post/490264/bulgarian-students-in-the-netherlands-have-support-of-bulgarian-society-there",
    label: "Radio Bulgaria profile of Bulgarian Society Netherlands",
  },
  {
    name: "Bulgarian government ABA directory",
    url: "https://aba.government.bg/organizations/bulgarian-society-netherlands/1456",
    label: "Bulgarian government directory listing for Bulgarian Society Netherlands",
  },
];

const REGIONS = [
  { slug: "amsterdam", dataSlug: "amsterdam", name: "Amsterdam" },
  { slug: "breda", dataSlug: "breda_tilburg", name: "Breda and Tilburg" },
  { slug: "eindhoven", dataSlug: "eindhoven", name: "Eindhoven" },
  { slug: "groningen", dataSlug: "groningen", name: "Groningen" },
  { slug: "leiden_hague", dataSlug: "leiden_hague", name: "Leiden and The Hague" },
  { slug: "leeuwarden", dataSlug: "leeuwarden", name: "Leeuwarden" },
  { slug: "maastricht", dataSlug: "maastricht", name: "Maastricht" },
  { slug: "rotterdam", dataSlug: "rotterdam", name: "Rotterdam" },
];

const CITY_REGION_NAMES = REGIONS.map((region) => region.name).join(", ");

const ARCHIVE_COUNT_BY_REGION = PAST_EVENTS_ARCHIVE.reduce((counts, event) => {
  counts[event.region] = (counts[event.region] || 0) + 1;
  return counts;
}, {});

const CITY_REGION_PAST_EVENT_LINKS = REGIONS.map((region) => ({
  href: `/${region.slug}/events/past-events`,
  label: `Past Bulgarian Society ${region.name} events`,
}));

const CITY_REGION_FUTURE_EVENT_LINKS = REGIONS.map((region) => ({
  href: `/${region.slug}/events/future-events`,
  label: `Upcoming Bulgarian Society ${region.name} events`,
}));

const CITY_REGION_ARCHIVE_ANCHORS = REGIONS.map((region) => ({
  href: `/${region.slug}/events/past-events`,
  label: region.name,
  count: ARCHIVE_COUNT_BY_REGION[region.dataSlug] || 0,
}));

const SHARED_LINKS = [
  { href: "/about", label: "About Bulgarian Society Netherlands" },
  { href: "/join-the-society", label: "Join Bulgarian Society Netherlands" },
  { href: "/internships", label: "Internships for the BGSNL community" },
  { href: "/events/future-events", label: "Upcoming BGSNL events" },
  { href: "/articles", label: "BGSNL articles" },
];

function absoluteUrl(routePath) {
  return `${SITE_URL}${routePath === "/" ? "/" : routePath}`;
}

function page(config) {
  return {
    image: `${SITE_URL}/assets/images/splashscreens/welcome.png`,
    priority: "0.7",
    changefreq: "monthly",
    schemaType: "WebPage",
    keywords: [],
    body: [
      "This page belongs to the official Bulgarian Society Netherlands website for students, members, alumni, partners, and local city communities.",
      "It connects visitors with BGSNL city societies, events, membership, articles, internships, contact options, and community resources across the Netherlands.",
      "The page also links to related BGSNL destinations so people and crawlers can discover the wider Bulgarian student and young professional network.",
      "Use these routes to move between local city information, national society context, upcoming events, past event proof, and practical ways to join or contact the society.",
    ],
    faq: [],
    citations: [],
    internalLinks: SHARED_LINKS,
    includeOrganization: false,
    includeWebSite: false,
    archiveEvents: [],
    archiveStats: null,
    archiveCityLinks: [],
    ...config,
    url: absoluteUrl(config.path),
  };
}

const CORE_PAGES = [
  page({
    path: "/",
    title: "Bulgarian Society Netherlands | BGSNL",
    h1: "Bulgarian Society Netherlands",
    description:
      "Bulgarian Society Netherlands (BGSNL) connects Bulgarian students and young Bulgarians through Dutch city events, membership, internships, and support.",
    answer:
      "Bulgarian Society Netherlands (BGSNL) is a student-led community for Bulgarian students and young Bulgarians in the Netherlands. It helps people find events, friends, local city boards, internships, and practical support while keeping Bulgarian culture visible.",
    intent: "brand and community discovery",
    priority: "1.0",
    changefreq: "daily",
    schemaType: "WebPage",
    includeOrganization: true,
    includeWebSite: true,
    keywords: [
      "Bulgarian Society Netherlands",
      "BGSNL Netherlands",
      "Bulgarian students Netherlands",
      "Bulgarian community Netherlands",
    ],
    body: [
      "BGSNL serves as a home away from home for Bulgarians studying, working, or starting their life in the Netherlands.",
      "The society brings together local city boards, cultural events, career orientation, internships, and student support in one national network.",
      "Use the full name Bulgarian Society Netherlands together with BGSNL to avoid confusion with unrelated BSNL acronym results.",
    ],
    faq: [
      {
        question: "What does BGSNL stand for?",
        answer:
          "BGSNL stands for Bulgarian Society Netherlands, the national Bulgarian student and young community society in the Netherlands.",
      },
      {
        question: "Who is BGSNL for?",
        answer:
          "BGSNL is for Bulgarian students, alumni, young professionals, and friends of Bulgarian culture who want community, events, practical support, or career opportunities in the Netherlands.",
      },
    ],
    citations: AUTHORITY_SOURCES,
    internalLinks: [
      { href: "/about", label: "Learn what BGSNL does" },
      { href: "/join-the-society", label: "Become a BGSNL member" },
      { href: "/events/future-events", label: "Find Bulgarian Society events" },
      { href: "/internships", label: "Explore internships" },
      { href: "/amsterdam", label: "Bulgarian Society Amsterdam" },
      { href: "/groningen", label: "Bulgarian Society Groningen" },
      { href: "/rotterdam", label: "Bulgarian Society Rotterdam" },
    ],
  }),
  page({
    path: "/about",
    title: "About Bulgarian Society Netherlands | BGSNL",
    h1: "About Bulgarian Society Netherlands",
    description:
      "Learn how Bulgarian Society Netherlands supports Bulgarian students through city communities, newcomer help, cultural events, internships, and coordination.",
    answer:
      "Bulgarian Society Netherlands is a youth and student organization that helps Bulgarians in the Netherlands adapt, socialize, celebrate Bulgarian culture, and find academic, career, and community support across Dutch cities.",
    intent: "entity explanation and source-backed authority",
    priority: "0.9",
    schemaType: "AboutPage",
    includeOrganization: true,
    keywords: [
      "about BGSNL",
      "Bulgarian students Netherlands",
      "Bulgarian Society Netherlands mission",
      "Bulgarian community in the Netherlands",
    ],
    body: [
      "Radio Bulgaria describes BGSNL as a youth organization that supports Bulgarian students in the Netherlands with practical information, socialization, and cultural connection.",
      "The Bulgarian government ABA directory lists the society's goals as uniting Bulgarians, supporting adaptation, motivating students, preserving Bulgarian culture, and improving the image of Bulgarians abroad.",
      "BGSNL connects regional boards and national initiatives so students can find local events, contacts, and opportunities without starting from zero in a new city.",
    ],
    faq: [
      {
        question: "Which cities does Bulgarian Society Netherlands serve?",
        answer:
          "BGSNL has activity across Dutch student cities including Amsterdam, Rotterdam, Groningen, Leeuwarden, Maastricht, Eindhoven, Breda and Tilburg, and Leiden and The Hague.",
      },
      {
        question: "How does BGSNL help newcomers?",
        answer:
          "BGSNL helps newcomers by connecting them with local Bulgarian communities, events, practical student knowledge, social contacts, and opportunities shared through the society network.",
      },
      {
        question: "Is BGSNL only for students?",
        answer:
          "Students are the core audience, but alumni, young professionals, and people interested in Bulgarian culture can also connect through BGSNL activities.",
      },
    ],
    citations: AUTHORITY_SOURCES,
    internalLinks: [
      { href: "/", label: "Bulgarian Society Netherlands" },
      { href: "/join-the-society", label: "Join BGSNL" },
      { href: "/internships", label: "Internship opportunities" },
      { href: "/partners", label: "BGSNL partners" },
      { href: "/events/future-events", label: "Upcoming events" },
      { href: "/articles/from-bulgaria-to-the-netherlands", label: "Student story from Bulgaria to the Netherlands" },
    ],
  }),
  page({
    path: "/join-the-society",
    title: "Join Bulgarian Society Netherlands | BGSNL",
    h1: "Join Bulgarian Society Netherlands",
    description:
      "Become a Bulgarian Society Netherlands member to join student events, meet local city communities, access benefits, and stay connected in the Netherlands.",
    answer:
      "Become a member of Bulgarian Society Netherlands if you want a Bulgarian community in the Netherlands, event access, local city contacts, internship updates, and a practical network during your studies or early career.",
    intent: "membership conversion",
    priority: "0.9",
    keywords: [
      "join Bulgarian Society Netherlands",
      "BGSNL membership",
      "Bulgarian student society membership Netherlands",
    ],
    body: [
      "Membership is the clearest way to stay close to BGSNL events, city boards, member updates, and community opportunities.",
      "BGSNL is especially useful for students who want to meet Bulgarians in their city, learn from older students, and take part in cultural or career-focused events.",
      "Members can move between local and national activities as their studies, internships, and cities change.",
    ],
    faq: [
      {
        question: "Why become a BGSNL member?",
        answer:
          "Members get a closer connection to local events, Bulgarian student networks, internship updates, and opportunities to volunteer or join committees.",
      },
      {
        question: "Can I join if I am new to the Netherlands?",
        answer:
          "Yes. Newcomers are one of the most important audiences for BGSNL because the society helps people find contacts and practical context quickly.",
      },
    ],
    citations: AUTHORITY_SOURCES,
    internalLinks: [
      { href: "/signup", label: "Start BGSNL signup" },
      { href: "/about", label: "Read about BGSNL" },
      { href: "/events/future-events", label: "See upcoming events" },
      { href: "/internships", label: "See internships" },
      { href: "/welcome-to-alumni", label: "Alumni community" },
    ],
  }),
  page({
    path: "/internships",
    title: "Internships for Bulgarian Students in the Netherlands | BGSNL",
    h1: "Internships for the BGSNL community",
    description:
      "Find internship and career opportunities shared with the Bulgarian Society Netherlands community and connect with partners supporting Bulgarian students.",
    answer:
      "BGSNL shares internship and career opportunities for Bulgarian students and young professionals in the Netherlands through its community and partner network.",
    intent: "career and internship discovery",
    priority: "0.8",
    keywords: [
      "Bulgarian internships Netherlands",
      "BGSNL internships",
      "internships Bulgarian students Netherlands",
    ],
    body: [
      "The internship page is the main answer-ready destination for students looking for career opportunities through Bulgarian Society Netherlands.",
      "It should be linked from membership, partner, city, and article pages so career intent maps to one clear page.",
    ],
    faq: [
      {
        question: "Where can Bulgarian students find internships through BGSNL?",
        answer:
          "The BGSNL internships page collects opportunities and partner information relevant to the Bulgarian Society Netherlands community.",
      },
    ],
    internalLinks: [
      { href: "/join-the-society", label: "Join BGSNL for more opportunities" },
      { href: "/partners", label: "BGSNL partners" },
      { href: "/partners/pwc-bulgaria", label: "PwC Bulgaria partnership" },
      { href: "/about", label: "About the BGSNL network" },
    ],
  }),
  page({
    path: "/events/future-events",
    title: "Bulgarian Events in the Netherlands | BGSNL",
    h1: "Upcoming Bulgarian Society events",
    description:
      "See upcoming Bulgarian Society Netherlands events, cultural gatherings, workshops, parties, and community activities across Dutch student cities.",
    answer:
      "The BGSNL events page is the place to find upcoming Bulgarian Society Netherlands gatherings, including cultural events, workshops, networking activities, and city society meetups.",
    intent: "event discovery",
    priority: "0.9",
    changefreq: "daily",
    keywords: [
      "Bulgarian events Netherlands",
      "BGSNL events",
      "Bulgarian Society events",
    ],
    body: [
      "Events are one of the strongest ways BGSNL helps Bulgarians meet, socialize, and keep Bulgarian culture visible in the Netherlands.",
      "Regional event pages connect national event intent with local city communities.",
    ],
    faq: [
      {
        question: "What kinds of events does BGSNL organize?",
        answer:
          "BGSNL organizes cultural events, Bulgarian holiday celebrations, networking activities, workshops, parties, and local student gatherings.",
      },
    ],
    citations: AUTHORITY_SOURCES,
    internalLinks: [
      { href: "/about", label: "Why BGSNL organizes events" },
      { href: "/join-the-society", label: "Join the society" },
      { href: "/amsterdam/events/future-events", label: "Amsterdam events" },
      { href: "/groningen/events/future-events", label: "Groningen events" },
      { href: "/rotterdam/events/future-events", label: "Rotterdam events" },
    ],
  }),
  page({
    path: "/events/past-events",
    title: "Past Bulgarian Society Events | BGSNL",
    h1: "Past Bulgarian Society events",
    description:
      `Browse the BGSNL past events archive with ${PAST_EVENTS_ARCHIVE_STATS.totalEvents} public event summaries, city links, venues, dates, and event themes across the Netherlands.`,
    answer:
      `The BGSNL past events archive is a directory of ${PAST_EVENTS_ARCHIVE_STATS.totalEvents} archived public events in ${archiveYearRange()}, linking the full city network: ${CITY_REGION_NAMES}.`,
    intent: "event proof and trust",
    priority: "0.8",
    changefreq: "weekly",
    schemaType: "CollectionPage",
    includeOrganization: true,
    keywords: [
      "BGSNL past events",
      "Bulgarian Society Netherlands event archive",
      "Bulgarian events Netherlands",
      "Bulgarian student events Netherlands",
    ],
    body: [
      `This archive makes BGSNL event history answer-ready with event names, regions, dates, locations, categories, and concise context from ${PAST_EVENTS_ARCHIVE_STATS.totalEvents} sanitized event summaries.`,
      "It helps future members, partners, students, and answer engines understand the breadth of Bulgarian Society Netherlands activity beyond the upcoming-events calendar.",
      `The archive page exposes every BGSNL city society: ${CITY_REGION_NAMES}.`,
      "The directory intentionally keeps users on the past-events page instead of sending them to thin archived event-detail pages.",
      "The event summaries cover local and national gatherings such as cultural nights, dinners, sports, career sessions, networking, and social meetups.",
    ],
    faq: [
      {
        question: "What kinds of past events has BGSNL organized?",
        answer:
          "BGSNL has organized Bulgarian cultural gatherings, dinners, social drinks, sports activities, career sessions, networking events, parties, and local city meetups across the Netherlands.",
      },
      {
        question: "Where can I find upcoming Bulgarian Society Netherlands events?",
        answer:
          `Upcoming BGSNL events are listed on the future events page and on local city pages for ${CITY_REGION_NAMES}.`,
      },
    ],
    archiveEvents: PAST_EVENTS_ARCHIVE,
    archiveStats: PAST_EVENTS_ARCHIVE_STATS,
    archiveCityLinks: CITY_REGION_ARCHIVE_ANCHORS,
    internalLinks: [
      { href: "/events/future-events", label: "Upcoming BGSNL events" },
      { href: "/about", label: "About BGSNL" },
      { href: "/join-the-society", label: "Join future events" },
      ...CITY_REGION_PAST_EVENT_LINKS,
      ...CITY_REGION_FUTURE_EVENT_LINKS,
    ],
  }),
  page({
    path: "/articles",
    title: "BGSNL Articles for Bulgarian Students in the Netherlands",
    h1: "Bulgarian Society Netherlands articles",
    description:
      "Read BGSNL articles about Bulgarian student life, culture, education, and stories from Bulgaria to the Netherlands.",
    answer:
      "The BGSNL articles hub collects stories and practical context for Bulgarian students and young Bulgarians in the Netherlands.",
    intent: "article hub",
    priority: "0.9",
    changefreq: "weekly",
    schemaType: "CollectionPage",
    internalLinks: [
      { href: "/articles/from-bulgaria-to-the-netherlands", label: "From Bulgaria to the Netherlands" },
      { href: "/articles/toni-villa", label: "Toni Villa story" },
      { href: "/articles/acedemie-minerva", label: "Academie Minerva article" },
      { href: "/about", label: "About BGSNL" },
    ],
  }),
  page({
    path: "/articles/from-bulgaria-to-the-netherlands",
    title: "From Bulgaria to the Netherlands | BGSNL",
    h1: "From Bulgaria to the Netherlands",
    description:
      "A BGSNL article about Bulgarian student migration, community, and finding support after moving to the Netherlands.",
    answer:
      "This BGSNL article helps Bulgarian students understand the move from Bulgaria to the Netherlands and the value of finding a student community.",
    intent: "student story",
    priority: "0.7",
    changefreq: "yearly",
    schemaType: "Article",
  }),
  page({
    path: "/articles/toni-villa",
    title: "Toni Villa and Bulgarian Entrepreneurship | BGSNL",
    h1: "Toni Villa",
    description:
      "A BGSNL entrepreneurship story about Toni Villa and Bulgarian steps toward bigger goals.",
    answer:
      "This BGSNL article highlights Bulgarian entrepreneurship and community stories connected to the Netherlands.",
    intent: "article",
    priority: "0.7",
    changefreq: "yearly",
    schemaType: "Article",
  }),
  page({
    path: "/articles/acedemie-minerva",
    title: "Bulgarian Student Exhibitions in Groningen | BGSNL",
    h1: "Bulgarian student exhibitions in Groningen",
    description:
      "A BGSNL article about Bulgarian student exhibitions and creative life in Groningen.",
    answer:
      "This article connects Bulgarian students, culture, and creative study life in Groningen.",
    intent: "article",
    priority: "0.7",
    changefreq: "yearly",
    schemaType: "Article",
  }),
];

const SUPPORT_PAGES = [
  page({
    path: "/board-and-committee",
    title: "BGSNL Boards and Committees",
    h1: "Boards and committees",
    description:
      "Meet the Bulgarian Society Netherlands boards and committees that coordinate city communities, events, partnerships, and student support.",
    answer:
      "BGSNL boards and committees coordinate the society's local and national work for Bulgarian students in the Netherlands.",
    priority: "0.8",
  }),
  page({
    path: "/welcome-to-alumni",
    title: "BGSNL Alumni Community",
    h1: "BGSNL alumni",
    description:
      "Stay connected with Bulgarian Society Netherlands after graduation through the BGSNL alumni community.",
    answer:
      "The BGSNL alumni community helps former students stay connected to Bulgarian Society Netherlands and support newer generations.",
    priority: "0.8",
  }),
  page({
    path: "/hall-of-fame",
    title: "BGSNL Hall of Fame",
    h1: "Hall of fame",
    description:
      "Explore the Bulgarian Society Netherlands alumni tree and people who helped build the BGSNL community.",
    answer:
      "The BGSNL hall of fame highlights alumni and contributors to the Bulgarian Society Netherlands community.",
  }),
  page({
    path: "/developers",
    title: "BGSNL Developers",
    h1: "BGSNL developers",
    description:
      "Information about the developers and volunteers supporting the Bulgarian Society Netherlands website.",
    answer:
      "The BGSNL developers page credits the volunteers and builders behind the Bulgarian Society Netherlands website.",
    priority: "0.5",
  }),
  page({
    path: "/terms-and-legals",
    title: "BGSNL Terms and Policies",
    h1: "Terms and policies",
    description:
      "Read Bulgarian Society Netherlands terms, legal information, and community policies.",
    answer:
      "This page contains BGSNL terms, legal information, and policy details for the society website.",
    priority: "0.5",
    changefreq: "yearly",
  }),
  page({
    path: "/partners",
    title: "Bulgarian Society Netherlands Partners",
    h1: "BGSNL partners",
    description:
      "Meet the partners supporting Bulgarian Society Netherlands, its student community, internships, and events.",
    answer:
      "BGSNL partners help support events, career opportunities, internships, and community initiatives for Bulgarian students in the Netherlands.",
  }),
  page({
    path: "/partners/pwc-bulgaria",
    title: "PwC Bulgaria and BGSNL Partnership",
    h1: "PwC Bulgaria and BGSNL",
    description:
      "Explore the PwC Bulgaria partnership with Bulgarian Society Netherlands, including career pathways and internships for the BGSNL community.",
    answer:
      "PwC Bulgaria partners with BGSNL to connect Bulgarian students and young professionals with career pathways and internship opportunities.",
  }),
  page({
    path: "/other-event-details/pwc-career-pathways",
    title: "PwC Career Pathways Event | BGSNL",
    h1: "PwC career pathways",
    description:
      "A BGSNL and PwC Bulgaria career pathways event for students and young professionals exploring audit, finance, and accounting careers.",
    answer:
      "The PwC career pathways event helps BGSNL students and young professionals explore early career options with PwC Bulgaria.",
    priority: "0.8",
    changefreq: "weekly",
    schemaType: "Event",
  }),
];

function regionHome(region) {
  return page({
    path: `/${region.slug}`,
    title: `Bulgarian Society ${region.name} | BGSNL`,
    h1: `Bulgarian Society ${region.name}`,
    description:
      `Bulgarian Society ${region.name} connects Bulgarians in ${region.name} with local events, student support, culture, and the national BGSNL network.`,
    answer:
      `Bulgarian Society ${region.name} is the local BGSNL community for Bulgarians in ${region.name}, helping students and young people find events, contacts, and support close to their city.`,
    intent: "local city community",
    priority: "0.9",
    changefreq: "daily",
    keywords: [
      `Bulgarian Society ${region.name}`,
      `Bulgarians in ${region.name}`,
      `Bulgarian students ${region.name}`,
    ],
    body: [
      `The ${region.name} page maps local Bulgarian community intent to a clear BGSNL city destination.`,
      "Local pages should answer who the city society is for, where to find events, and how to connect with the wider national network.",
      `They should also connect local discovery to the ${region.name} past events archive so search engines and AI answer engines can see proof of activity in that city.`,
    ],
    faq: [
      {
        question: `Is there a Bulgarian Society in ${region.name}?`,
        answer:
          `Yes. Bulgarian Society ${region.name} is part of Bulgarian Society Netherlands and connects Bulgarians in and around ${region.name}.`,
      },
    ],
    citations: AUTHORITY_SOURCES,
    internalLinks: [
      { href: "/about", label: "About Bulgarian Society Netherlands" },
      { href: "/join-the-society", label: "Join BGSNL" },
      { href: `/${region.slug}/events/future-events`, label: `Upcoming events in ${region.name}` },
      { href: `/${region.slug}/events/past-events`, label: `Past events in ${region.name}` },
      { href: `/${region.slug}/contact`, label: `Contact Bulgarian Society ${region.name}` },
      { href: "/internships", label: "BGSNL internships" },
    ],
  });
}

function regionContact(region) {
  return page({
    path: `/${region.slug}/contact`,
    title: `Contact Bulgarian Society ${region.name} | BGSNL`,
    h1: `Contact Bulgarian Society ${region.name}`,
    description:
      `Contact the Bulgarian Society ${region.name} board and find local BGSNL channels for Bulgarian students and young Bulgarians in ${region.name}.`,
    answer:
      `Use this page to contact Bulgarian Society ${region.name} and connect with the local BGSNL community.`,
    priority: "0.8",
    internalLinks: [
      { href: `/${region.slug}`, label: `Bulgarian Society ${region.name}` },
      { href: `/${region.slug}/events/future-events`, label: `${region.name} events` },
      { href: `/${region.slug}/events/past-events`, label: `Past events in ${region.name}` },
      { href: "/join-the-society", label: "Join BGSNL" },
    ],
  });
}

function regionEvents(region, past = false) {
  return page({
    path: `/${region.slug}/events/${past ? "past-events" : "future-events"}`,
    title: `${past ? "Past" : "Upcoming"} Bulgarian Society ${region.name} Events | BGSNL`,
    h1: `${past ? "Past" : "Upcoming"} events in ${region.name}`,
    description:
      `${past ? "Browse past" : "Find upcoming"} Bulgarian Society ${region.name} events, meetups, cultural activities, and student gatherings.`,
    answer:
      `${past ? "Past" : "Upcoming"} Bulgarian Society ${region.name} events show how the local BGSNL community brings Bulgarians together in ${region.name}.`,
    priority: past ? "0.6" : "0.9",
    changefreq: past ? "weekly" : "daily",
    schemaType: "CollectionPage",
    internalLinks: [
      { href: `/${region.slug}`, label: `Bulgarian Society ${region.name}` },
      { href: "/events/future-events", label: "All BGSNL events" },
      { href: "/events/past-events", label: "BGSNL past events archive" },
      { href: "/join-the-society", label: "Join BGSNL" },
    ],
  });
}

const REGION_PAGES = REGIONS.flatMap((region) => [
  regionHome(region),
  regionContact(region),
  regionEvents(region, false),
  regionEvents(region, true),
]);

const SEO_PAGES = [...CORE_PAGES, ...SUPPORT_PAGES, ...REGION_PAGES];

const PRIORITY_QUERY_MAPPINGS = [
  {
    id: "brand-full-name",
    query: "Bulgarian Society Netherlands",
    intent: "brand",
    impact: 5,
    targetPath: "/",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: ["Bulgarian Society Netherlands (BGSNL)", "Quick answer"],
    requiredLinks: ["/join-the-society", "/events/future-events"],
    requiredJsonLdTypes: ["Organization", "WebSite", "WebPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    minInternalLinks: 5,
  },
  {
    id: "brand-acronym",
    query: "BGSNL Netherlands",
    intent: "brand-disambiguation",
    impact: 5,
    targetPath: "/",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: ["BGSNL stands for Bulgarian Society Netherlands", "Quick answer"],
    requiredJsonLdTypes: ["Organization", "FAQPage"],
    requiresAnswerFirst: true,
    minInternalLinks: 5,
  },
  {
    id: "bulgarian-students-netherlands",
    query: "Bulgarian students Netherlands",
    intent: "answer",
    impact: 5,
    targetPath: "/about",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: ["Quick answer", "Bulgarian students", "Radio Bulgaria"],
    requiredLinks: [
      "https://bnrnews.bg/en/post/490264/bulgarian-students-in-the-netherlands-have-support-of-bulgarian-society-there",
      "https://aba.government.bg/organizations/bulgarian-society-netherlands/1456",
      "/join-the-society",
    ],
    requiredJsonLdTypes: ["Organization", "AboutPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    requiresCitation: true,
    minInternalLinks: 5,
  },
  {
    id: "join-bgsnl",
    query: "join Bulgarian Society Netherlands",
    intent: "membership",
    impact: 4,
    targetPath: "/join-the-society",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: ["Become a member", "Quick answer"],
    requiredLinks: ["/signup", "/events/future-events", "/internships"],
    requiredJsonLdTypes: ["WebPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    minInternalLinks: 4,
  },
  {
    id: "bulgarian-events-netherlands",
    query: "Bulgarian events Netherlands",
    intent: "events",
    impact: 4,
    targetPath: "/events/future-events",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: ["Upcoming Bulgarian Society events", "Quick answer"],
    requiredLinks: ["/join-the-society", "/amsterdam/events/future-events"],
    requiredJsonLdTypes: ["WebPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    minInternalLinks: 4,
  },
  {
    id: "bgsnl-past-events",
    query: "BGSNL past events",
    intent: "event proof",
    impact: 4,
    targetPath: "/events/past-events",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: [
      "Quick answer",
      `${PAST_EVENTS_ARCHIVE_STATS.totalEvents} archived public events`,
      "Past Bulgarian Society events",
    ],
    requiredLinks: ["/events/future-events", "/join-the-society"],
    requiredJsonLdTypes: ["CollectionPage", "ItemList", "Event", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    minInternalLinks: 4,
  },
  {
    id: "bulgarian-internships-netherlands",
    query: "Bulgarian internships Netherlands",
    intent: "internships",
    impact: 3,
    targetPath: "/internships",
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: ["Internships for the BGSNL community", "Quick answer"],
    requiredLinks: ["/partners", "/partners/pwc-bulgaria", "/join-the-society"],
    requiredJsonLdTypes: ["WebPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    minInternalLinks: 4,
  },
  ...REGIONS.map((region) => ({
    id: `bulgarian-society-${region.slug}`,
    query: `Bulgarian Society ${region.name}`,
    intent: "local-city",
    impact: 4,
    targetPath: `/${region.slug}`,
    engines: ["google", "bing", "chatgpt", "perplexity", "gemini"],
    requiredPhrases: [`Bulgarian Society ${region.name}`, "Quick answer"],
    requiredLinks: [
      `/${region.slug}/events/future-events`,
      `/${region.slug}/events/past-events`,
      "/join-the-society",
    ],
    requiredJsonLdTypes: ["WebPage", "FAQPage", "BreadcrumbList"],
    requiresAnswerFirst: true,
    requiresCitation: true,
    minInternalLinks: 4,
  })),
];

function getSeoPageForPath(routePath) {
  const normalized = normalizePath(routePath);
  const match = SEO_PAGES.find((item) => item.path === normalized);
  if (!match) throw new Error(`No SEO page configured for ${routePath}`);
  return match;
}

function normalizePath(routePath) {
  if (!routePath || routePath === "/") return "/";
  return `/${routePath.replace(/^\/+|\/+$/g, "")}`;
}

module.exports = {
  AUTHORITY_SOURCES,
  PRIORITY_QUERY_MAPPINGS,
  REGIONS,
  SEO_PAGES,
  SHARED_LINKS,
  SITE_URL,
  SITEMAP_ROUTES: SEO_PAGES.map(({ path, priority, changefreq }) => ({
    path,
    priority,
    changefreq,
  })),
  getSeoPageForPath,
  normalizePath,
};
