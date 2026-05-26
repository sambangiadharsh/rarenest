import {
  LayoutDashboard,
  Building2,
  List,
  Tags,
  Mail,
  Star,
  Briefcase,
  FileText,
  Info,
  Phone,
  ScrollText,
  Shield,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'

export const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Enquiries',
    href: '/enquiries',
    icon: Mail,
  },
  {
    title: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
]

export const propertyNavGroup = {
  title: 'Property',
  icon: Building2,
  items: [
    { title: 'All Properties', href: '/properties', icon: List },
    { title: 'Property Type', href: '/properties/types', icon: Tags },
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
  ],
}

export const routeTitles = {
  '/': 'Dashboard',
  '/properties': 'All Properties',
  '/properties/types': 'Property Type',
  '/enquiries': 'Enquiries',
  '/reviews': 'Reviews',
  '/content/careers': 'Careers',
  '/content/about-us': 'About Us',
  '/content/contact-info': 'Contact Info',
  '/content/terms': 'Terms and Conditions',
  '/content/privacy': 'Privacy Policy',
  '/content/faqs': 'FAQs',
  '/login': 'Sign in',
}

export { ChevronRight }
