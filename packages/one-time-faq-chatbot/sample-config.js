/* SAMPLE CONTENT
 * Fictional business for proposals and first installs.
 * Replace businessName, accentColor, bookingUrl, and faqs before handoff.
 * Set samplePreview to false on the client's live site.
 * Answers may include {{businessName}}. The widget fills that in.
 *
 * bookingUrl can be:
 *   https://example.com/book
 *   /contact
 *   #book
 *   mailto:hello@example.com
 */
window.FAQ_CHAT = {
  businessName: "Cedar Lane Studio",
  accentColor: "#1d6a4f",
  bookingUrl: "https://example.com/book",
  bookingLabel: "Book a call",
  launcherLabel: "Ask a question",
  inputPlaceholder: "Ask about hours, services, or booking",
  samplePreview: false,
  autoOpen: false,
  greeting:
    "Hi, I'm the {{businessName}} assistant. I can help with hours, services, and how to book a call. I'm a scripted FAQ assistant, not a person.",
  nudge: "Ask about hours, services, or how to book a call.",
  fallback:
    "I'm not sure about that one. I can help with hours, services, booking, and what happens next. Use Book a call and someone from {{businessName}} will follow up.",
  quickReplies: [
    "What are your hours?",
    "What services do you offer?",
    "How do I book?",
    "What happens next?",
  ],
  faqs: [
    {
      q: "What are your hours?",
      keywords: [
        "hours",
        "hour",
        "open",
        "opening",
        "close",
        "closed",
        "closing",
        "saturday",
        "sunday",
        "monday",
        "tuesday",
        "weekday",
        "weekend",
        "what time",
      ],
      a: "{{businessName}} is open Tuesday to Friday, 10am to 5pm, and Saturday, 10am to 2pm. We are closed Sunday and Monday. Need a time outside those hours? Use Book a call and we will see what we can do.",
    },
    {
      q: "What services do you offer?",
      keywords: [
        "service",
        "services",
        "offer",
        "offers",
        "design consult",
        "consult",
        "room plan",
        "styling day",
        "styling",
        "what do you do",
        "what do you offer",
      ],
      a: "We help you plan a room you actually use. A design consult covers goals and a short walkthrough. A room plan is a written layout and a shopping list. A styling day is hands-on help in the room. Book a call if you are not sure which one to start with.",
    },
    {
      q: "How do I book or contact you?",
      keywords: [
        "book",
        "booking",
        "book a call",
        "contact",
        "email",
        "phone",
        "schedule",
        "appointment",
        "reach",
        "get in touch",
      ],
      a: "Use Book a call in this chat. It opens the booking link for {{businessName}}. Tell us a little about the room and the timing you have in mind. If that link is an email address, your email app opens a draft. Nothing is sent until you send it.",
    },
    {
      q: "What happens after I book?",
      keywords: [
        "next",
        "what happens",
        "what happens next",
        "after",
        "happens",
        "process",
        "expect",
        "confirm",
        "confirmation",
        "written",
      ],
      a: "We confirm the time by email. The call is short. We ask what you want changed, your timeline, and your budget range. Then we send a written next step. No work starts until you agree to that note.",
    },
    {
      q: "Where are you located?",
      keywords: ["where", "location", "address", "area", "visit", "local", "city", "studio", "in person"],
      a: "{{businessName}} meets local clients by appointment. The intro call is by phone or video. If an in-person visit is the right next step, we set that after the call.",
    },
    {
      q: "How much does it cost?",
      keywords: [
        "price",
        "pricing",
        "cost",
        "costs",
        "fee",
        "fees",
        "quote",
        "estimate",
        "rate",
        "rates",
        "expensive",
        "cheap",
        "how much",
      ],
      a: "I don't quote a final price in chat. The price depends on the room and the service. Book a call and we will send a written estimate after we understand the job.",
    },
    {
      q: "Are you a real person?",
      keywords: ["person", "human", "bot", "robot", "real", "assistant", "ai", "automated", "real person"],
      a: "I'm the {{businessName}} FAQ assistant. I answer from a short list of common questions. I'm not a person. For anything else, use Book a call and a person will follow up.",
    },
  ],
};
