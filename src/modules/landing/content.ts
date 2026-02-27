import {
  BarChart3,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  FileText,
  Languages,
  Lock,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Target,
} from "lucide-react";
import type {
  FeatureHighlight,
  FocusArea,
  FooterLink,
  HeroContent,
  HowItWorksStep,
  NavItem,
  PricingPlan,
  Testimonial,
  TrustSignal,
  UspItem,
} from "./types";
import { buildAuthUrl } from "@/modules/shared/routing/returnUrl";

const buildLandingAuthHref = (plan?: string) =>
  buildAuthUrl("/auth/register", { plan, from: "landing" });

export const navItems: NavItem[] = [
  { label: "अभ्यास क्षेत्रे", href: "#exams" },
  { label: "सेवा", href: "#features" },
  { label: "किंमत", href: "#pricing" },
  { label: "आमच्याबद्दल", href: "#about" },
];

export const heroContent: HeroContent = {
  badge: "धुरंधर सर करिअर पॉईंट अकॅडमी",
  headline:
    "स्पर्धा परीक्षेची नियोजनबद्ध तयारी, आता स्वच्छ आणि प्रभावी डिजिटल व्यासपीठावर",
  subheadline:
    "अद्ययावत पुस्तके, प्रश्नपत्रिका, करिअर गायडन्स आणि मुलाखत तयारी - सर्व काही एका ठिकाणी.",
  primaryCtaLabel: "आजच मोफत नोंदणी करा",
  primaryCtaHref: buildLandingAuthHref("free"),
  secondaryCtaLabel: "किंमत आणि योजना पहा",
  secondaryCtaHref: "#pricing",
  trustLine: "तुमच्या तयारीसाठी आमचा स्पष्ट फोकस",
  trustBullets: [
    "विषयानुसार अद्ययावत अभ्यास साहित्य",
    "प्रश्नपत्रिका सराव आणि मार्गदर्शित प्रगती",
  ],
};

export const focusAreas: FocusArea[] = [
  {
    id: "books",
    title: "सखोल अद्ययावत पुस्तके",
    description:
      "स्पर्धा क्षेत्रातील प्रमुख विषयांसाठी नवीन पॅटर्नशी जुळणारे अभ्यास साहित्य.",
    highlight: "प्रत्येक विषयासाठी संरचित कंटेंट",
    href: "#features",
    icon: BookOpen,
  },
  {
    id: "career-guidance",
    title: "करिअर गायडन्स",
    description:
      "पात्रतेनुसार नोकरीच्या संधी आणि योग्य तयारीबाबत स्पष्ट दिशा.",
    highlight: "योग्य पर्याय निवडण्यासाठी तज्ञ मार्गदर्शन",
    href: "/contact",
    icon: Briefcase,
  },
  {
    id: "spoken-english",
    title: "टॉपिक वाईज इंग्रजी संभाषण",
    description:
      "सफाईदार इंग्रजी बोलण्यासाठी हिंदी-मराठी-इंग्रजी संवाद सराव.",
    highlight: "दैनंदिन आणि मुलाखतीसाठी उपयोगी संभाषण",
    href: "#features",
    icon: Languages,
  },
  {
    id: "question-banks",
    title: "प्रश्नपत्रिका आणि सराव संच",
    description:
      "तयारीची पातळी तपासण्यासाठी विषयानुसार प्रश्नपत्रिका आणि टेस्ट संच.",
    highlight: "वेळेवर सराव आणि अचूक मूल्यमापन",
    href: "#features",
    icon: FileText,
  },
  {
    id: "interview-guidance",
    title: "मुलाखत मार्गदर्शन",
    description:
      "विविध मुलाखतींसाठी आत्मविश्वास वाढवणारे प्रश्न-उत्तर सराव मार्गदर्शन.",
    highlight: "प्रात्यक्षिक आणि परिणामकेंद्री तयारी",
    href: "/contact",
    icon: MessageSquare,
  },
];

export const uspItems: UspItem[] = [
  {
    title: "सिलेबस-केंद्रित नियोजन",
    description: "स्पष्ट विषयक्रम आणि अभ्यासक्रमाशी जोडलेली सखोल तयारी.",
    icon: Target,
  },
  {
    title: "सराव + मूल्यमापन",
    description: "टॉपिकनुसार प्रश्नपत्रिका, टेस्ट आणि त्वरित आढावा.",
    icon: ClipboardCheck,
  },
  {
    title: "प्रगतीचा मागोवा",
    description: "कमकुवत भाग ओळखून सुधारण्यासाठी कृतीयोग्य विश्लेषण.",
    icon: BarChart3,
  },
  {
    title: "सुरक्षित कंटेंट प्रवेश",
    description: "संरक्षित प्रवेश आणि नियंत्रणासह स्थिर शिक्षण अनुभव.",
    icon: ShieldCheck,
  },
  {
    title: "मोबाईल-फर्स्ट अनुभव",
    description: "विद्यार्थ्यांच्या दैनंदिन वापरासाठी वेगवान आणि सोपा इंटरफेस.",
    icon: Smartphone,
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: "01",
    title: "मोफत नोंदणी करा",
    description: "अकाउंट तयार करा आणि लगेच प्रारंभिक कंटेंटला प्रवेश मिळवा.",
  },
  {
    step: "02",
    title: "तुमचे लक्ष्य ठरवा",
    description:
      "तुमच्या परीक्षा आणि करिअर उद्दिष्टानुसार योग्य अभ्यास विभाग निवडा.",
  },
  {
    step: "03",
    title: "दैनिक सराव + पुनरावलोकन",
    description:
      "प्रश्नपत्रिका सोडवा, प्रगती तपासा आणि मुलाखत/संभाषण कौशल्य वाढवा.",
  },
];

export const featureHighlights: FeatureHighlight[] = [
  {
    title: "डिजिटल टेस्ट आणि प्रश्नपत्रिका",
    description:
      "रिअल परीक्षा पॅटर्नशी जुळणारे सराव संच आणि वेळेवर निकाल.",
    bullets: [
      "विषयानुसार टेस्ट आणि प्रश्नपत्रिका",
      "जलद निकाल आणि उत्तर पुनरावलोकन",
      "तयारीचे स्पष्ट प्रगती निर्देशक",
    ],
    tone: "navy",
  },
  {
    title: "इंग्रजी संभाषण मॉड्यूल",
    description:
      "टॉपिकवाइज मराठी-हिंदी-इंग्रजी संवादाने बोलण्यातील आत्मविश्वास वाढवा.",
    bullets: [
      "दैनंदिन वापरासाठी संवाद सराव",
      "मुलाखतीसाठी उपयुक्त वाक्यरचना",
      "नियमित प्रॅक्टिससाठी साधे मॉड्यूल्स",
    ],
    tone: "gold",
  },
  {
    title: "करिअर आणि मुलाखत मार्गदर्शन",
    description:
      "पात्रतेनुसार पर्याय निवडणे, तयारीचे नियोजन आणि उत्तर सादरीकरणात सुधारणा.",
    bullets: [
      "करिअर निवडीसाठी स्पष्ट दिशा",
      "मॉक मुलाखत दृष्टिकोन",
      "प्रॅक्टिकल टिप्स आणि फीडबॅक",
    ],
    tone: "crimson",
  },
];

export const pricingFallbackPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    interval: "मोफत",
    features: [
      "मर्यादित अभ्यास साहित्य",
      "प्रारंभिक प्रश्नपत्रिका सराव",
      "प्लॅटफॉर्मचा डेमो अनुभव",
    ],
    ctaLabel: "मोफत सुरू करा",
    ctaHref: buildLandingAuthHref("free"),
  },
  {
    id: "standard",
    name: "Standard",
    price: "₹999",
    interval: "प्रति महिना",
    features: [
      "विषयानुसार पूर्ण कंटेंट प्रवेश",
      "नियमित प्रश्नपत्रिका आणि टेस्ट",
      "करिअर मार्गदर्शन संसाधने",
      "प्रगती विश्लेषण",
    ],
    isPopular: true,
    ctaLabel: "स्टँडर्ड निवडा",
    ctaHref: buildLandingAuthHref("standard"),
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹1999",
    interval: "प्रति महिना",
    features: [
      "स्टँडर्डमधील सर्व सुविधा",
      "इंटरव्ह्यू तयारी मॉड्यूल",
      "इंग्रजी संभाषण प्रीमियम कंटेंट",
      "प्राथमिक सहाय्य",
    ],
    ctaLabel: "प्रीमियम निवडा",
    ctaHref: buildLandingAuthHref("premium"),
  },
];

export const trustSignals: TrustSignal[] = [
  {
    title: "सुरक्षित व्यवहार आणि प्रवेश",
    description: "वापरकर्त्यांचा डेटा आणि कंटेंट प्रवेश सुरक्षितरित्या हाताळला जातो.",
    icon: ShieldCheck,
  },
  {
    title: "विद्यार्थी-केंद्रित सपोर्ट",
    description: "तयारीच्या टप्प्यानुसार स्पष्ट आणि वेगवान मार्गदर्शन.",
    icon: Smartphone,
  },
  {
    title: "विश्वासार्ह डेटा पद्धती",
    description: "गोपनीयता जपत आवश्यकतेनुसारच डेटा वापर.",
    icon: Lock,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "प्रश्नपत्रिकांमुळे माझा सराव वेळेवर झाला आणि मुलाखत सत्रांनी उत्तर देण्याचा आत्मविश्वास वाढला.",
    name: "स्पर्धा परीक्षार्थी",
    subtitle: "पुणे",
  },
  {
    quote:
      "करिअर गायडन्स सेशनमुळे योग्य दिशा मिळाली. अभ्यासासाठी काय प्राधान्य द्यायचे ते स्पष्ट झाले.",
    name: "विद्यार्थी",
    subtitle: "नाशिक",
  },
];

export const footerNavLinks: FooterLink[] = [
  { label: "अभ्यास क्षेत्रे", href: "#exams" },
  { label: "सेवा", href: "#features" },
  { label: "किंमत", href: "#pricing" },
  { label: "संपर्क", href: "#contact" },
];

export const footerPolicyLinks: FooterLink[] = [
  { label: "गोपनीयता धोरण", href: "/privacy-policy" },
  { label: "अटी व शर्ती", href: "/terms" },
  { label: "परतावा धोरण", href: "/refund-policy" },
];
