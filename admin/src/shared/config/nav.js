import {
  LayoutDashboard,
  Building2,
  List,
  Tags,
  Star,
  Briefcase,
  FileText,
  Info,
  Phone,
  ScrollText,
  Shield,
  HelpCircle,
  ChevronRight,
  Images,
  Sparkles,
  UserCheck,
  FileClock,
  MessageSquare,
  Award,
} from 'lucide-react'

export const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
]

export const builderNavGroup = {
  title: 'Builders',
  icon: Building2,
  items: [
    { title: 'Applications', href: '/builders/applications', icon: FileClock },
    { title: 'Builders', href: '/builders', icon: UserCheck },
    { title: 'Reviews', href: '/builders/reviews', icon: MessageSquare },
    { title: 'Featured', href: '/builders/featured', icon: Award },
  ],
}

export const propertyNavGroup = {
  title: 'Property',
  icon: Building2,
  items: [
    { title: 'All Properties', href: '/properties', icon: List },
    { title: 'Property Type', href: '/properties/types', icon: Tags },
    { title: 'Property Features', href: '/properties/features', icon: Sparkles },
  ],
}

export const contentNavGroup = {
  title: 'Content Management',
  icon: FileText,
  items: [
    { title: 'About Us', href: '/content/about-us', icon: Info },
    { title: 'Contact Info', href: '/content/contact-info', icon: Phone },
    { title: 'Terms and Conditions', href: '/content/terms', icon: ScrollText },
    { title: 'Privacy Policy', href: '/content/privacy', icon: Shield },
    { title: 'FAQs', href: '/content/faqs', icon: HelpCircle },
    { title: 'Careers', href: '/content/careers', icon: Briefcase },
    { title: 'Hero Banners', href: '/content/hero-banners', icon: Images },
  ],
}

export const routeTitles = {
  '/': 'Dashboard',
  '/builders/applications': 'Builder Applications',
  '/builders': 'Approved Builders',
  '/builders/reviews': 'Builder Reviews',
  '/builders/featured': 'Featured Builders',
  '/properties': 'All Properties',
  '/properties/types': 'Property Type',
  '/properties/features': 'Property Features',
  // '/enquiries': 'Enquiries',
  '/content/careers': 'Careers',
  '/content/about-us': 'About Us',
  '/content/contact-info': 'Contact Info',
  '/content/terms': 'Terms and Conditions',
  '/content/privacy': 'Privacy Policy',
  '/content/faqs': 'FAQs',
  '/content/hero-banners': 'Hero Banners',
  '/login': 'Sign in',
}

export { ChevronRight }
