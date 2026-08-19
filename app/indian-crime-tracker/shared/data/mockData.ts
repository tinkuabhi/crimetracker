import { IncidentRecord, SafetyTip } from '../types';

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  
 
];

export const SAFETY_TIPS_DATA: SafetyTip[] = [
  {
    id: "tip-road-01",
    category: "road",
    title: "Night Highway Driving & Heavy Vehicle Protocols",
    description: "National Highway (NH) corridors witness heavy commercial transit during 10 PM to 5 AM with high blind-spot risks.",
    actionPoints: [
      "Maintain a 4-second following distance behind multi-axle freight trucks on NH-44, NH-16, and NH-48.",
      "Never park on highway shoulder lanes without hazard blinkers and reflective safety triangles placed 50m behind.",
      "Wear ISI/ECE approved full-face helmets for two-wheelers; seatbelts are mandatory for all passengers including rear seats.",
      "In case of breakdown or collision, immediately move beyond the metal crash barrier onto the grass embankment."
    ],
    helplines: [
      { name: "All India Emergency Response", number: "112" },
      { name: "National Highway Authority (NHAI)", number: "1033" },
      { name: "Ambulance Services", number: "108" }
    ],
    importance: "critical",
    icon: "Car"
  },
  {
    id: "tip-public-02",
    category: "public",
    title: "Public Outings, Crowded Bazaars & ATM Security",
    description: "Guidance for crowded transit hubs, local markets, metro stations, and isolated transaction terminals.",
    actionPoints: [
      "Avoid isolated or unlit standalone ATM kiosks after 9 PM. Verify ATM card slots for skimmer overlays or micro-cameras.",
      "Beware of distraction theft tactics in crowded wholesale markets (spilling fluids, fake arguments, sudden bumping).",
      "When scanning UPI QR codes at merchant stores, remember: RECEIVING money NEVER requires entering your UPI PIN.",
      "Keep emergency contacts configured on your smartphone's triple-press power button SOS trigger."
    ],
    helplines: [
      { name: "Police Emergency", number: "100 / 112" },
      { name: "Women Helpline (National)", number: "1090 / 1091" },
      { name: "Railway Police (RPF Security)", number: "139" }
    ],
    importance: "essential",
    icon: "ShieldAlert"
  },
  {
    id: "tip-cyber-03",
    category: "cyber",
    title: "Cyber Fraud, OTP Scams & Digital Arrest Threats",
    description: "Protection protocols against cyber syndicates impersonating law enforcement, courier agents, or bank officials.",
    actionPoints: [
      "No genuine police, CBI, ED, or court official ever conducts 'Digital Arrest' via Skype, WhatsApp video, or Telegram.",
      "Never share OTPs, banking passwords, or install remote access apps (AnyDesk, TeamViewer, RustDesk) for KYC updates.",
      "If money has been lost, call 1930 immediately and preserve transaction IDs, account or UPI details, screenshots, and the time of the incident.",
      "Complete the report on the National Cybercrime Portal (cybercrime.gov.in) after calling 1930."
    ],
    helplines: [
      { name: "National Cyber Crime Helpline", number: "1930" },
      { name: "Cyber Crime Reporting Portal", number: "cybercrime.gov.in" },
      { name: "National Cybercrime Portal", number: "cybercrime.gov.in" }
    ],
    importance: "critical",
    icon: "ShieldCheck"
  },
  {
    id: "tip-home-04",
    category: "home",
    title: "Home Security & Extended Travel Verification",
    description: "Hardening residential security and establishing neighborhood vigilance during vacation periods.",
    actionPoints: [
      "Mandate formal police tenant and domestic staff verification with local police stations before hiring.",
      "Install Wi-Fi CCTV with motion alert push notifications and smart light timers during extended absence.",
      "Inform trusted neighbors or residential welfare associations (RWA) regarding out-of-station duration.",
      "Never post real-time airport check-ins or live vacation status publicly on social media until you have returned."
    ],
    helplines: [
      { name: "Citizen Emergency Response", number: "112" },
      { name: "Fire & Rescue Control", number: "101" },
      { name: "Child Protection (Childline)", number: "1098" }
    ],
    importance: "recommended",
    icon: "Flame"
  },
  {
    id: "tip-road-05",
    category: "road",
    title: "After a Road Crash: Protect the Scene, Then Get Help",
    description: "Simple first actions can reduce secondary crashes and help responders locate the incident quickly.",
    actionPoints: [
      "Call 112 for urgent police, fire, or medical help. State the highway, the nearest landmark, travel direction, and number of people injured.",
      "If it is safe, move yourself and able passengers away from moving traffic; do not stand in an active lane or near a fuel leak.",
      "Switch on hazard lights and warn approaching traffic only when it is safe to do so. Do not create a crowd around the vehicles.",
      "Do not move someone with suspected head, neck, or spinal injury unless there is an immediate danger such as fire or traffic."
    ],
    helplines: [
      { name: "Emergency response", number: "112" },
      { name: "Highway emergency", number: "1033" }
    ],
    importance: "critical",
    icon: "Car"
  },
  {
    id: "tip-cyber-06",
    category: "cyber",
    title: "Pause Before You Pay or Share",
    description: "Most account-takeover and payment scams rely on urgency, impersonation, or a request to install an app.",
    actionPoints: [
      "Do not install screen-sharing or remote-control apps because a caller asks you to complete KYC, receive a refund, or verify an account.",
      "Independently find a bank or merchant's official phone number; do not call the number in an unsolicited message or search advertisement.",
      "Never enter a UPI PIN to receive money. A PIN authorizes a payment from your account.",
      "Report suspicious links, numbers, and handles through the National Cybercrime Reporting Portal; report financial loss immediately on 1930."
    ],
    helplines: [
      { name: "Financial cyber fraud", number: "1930" },
      { name: "Online reporting", number: "cybercrime.gov.in" }
    ],
    importance: "critical",
    icon: "Laptop"
  },
  {
    id: "tip-public-07",
    category: "public",
    title: "If You Feel Unsafe in Public",
    description: "Create distance, move toward people and light, and share precise information with a trusted contact or emergency responder.",
    actionPoints: [
      "Move to a staffed, well-lit place such as a shop, station office, security desk, or hospital entrance; avoid confronting or following a person.",
      "Call 112 if there is an immediate threat to life or safety. It is India's single emergency number for police, fire, and medical emergencies.",
      "Share your live location and a short description of the situation with a trusted contact when it is safe to do so.",
      "Use a phone's emergency SOS/panic feature if available; do not rely on social-media posts as a substitute for contacting emergency services."
    ],
    helplines: [
      { name: "Emergency response", number: "112" },
      { name: "Child assistance", number: "1098" }
    ],
    importance: "essential",
    icon: "ShieldAlert"
  },
  {
    id: "tip-home-08",
    category: "home",
    title: "Fire and Gas-Leak First Response",
    description: "Act early, avoid ignition sources, and leave the building before trying to protect belongings.",
    actionPoints: [
      "If you smell gas, do not operate electrical switches, appliances, or open flames. Open doors and windows only if it is safe, then leave the area.",
      "For a fire, alert others, use stairs instead of lifts, and call 112 from a safe location. Do not re-enter until responders say it is safe.",
      "Keep escape routes, stairways, and electrical panels clear. Teach everyone at home a meeting point outside the building.",
      "Use a suitable extinguisher only for a small, contained fire when you have a clear exit behind you; otherwise evacuate."
    ],
    helplines: [
      { name: "Emergency response", number: "112" },
      { name: "Fire service", number: "101" }
    ],
    importance: "critical",
    icon: "Flame"
  }
];
