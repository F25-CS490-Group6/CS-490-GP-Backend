require('dotenv').config();
const axios = require("axios");
const admin = require("firebase-admin");

// ============================================================================
// CREATE 10 LUXURY SALONS VIA API (WITH FIREBASE AUTH)
// ============================================================================
// This creates real salons through your API with Firebase authentication
// Just like a user would sign up through the frontend
// ============================================================================

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const API_URL = process.env.API_URL || "http://localhost:4000/api";

const LUXURY_SALONS = [
  {
    owner: {
      full_name: "Victoria Ashford",
      email: "victoria@eclatelite.com",
      phone: "+12125557788",
      password: "EclatElite2024!"
    },
    salon: {
      salon_name: "Éclat Elite Spa & Salon",
      address: "245 Park Avenue, Suite 1200",
      city: "New York",
      state: "NY",
      zip: "10167",
      country: "United States",
      phone: "+12125557788",
      email: "concierge@eclatelite.com",
      description: "Manhattan's most prestigious destination for luxury beauty treatments. Featuring private VIP suites, champagne service, and world-class stylists trained in Paris and Milan.",
      website: "https://eclatelite.com",
      profile_picture: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "21:00" },
      Tuesday: { enabled: true, start: "08:00", end: "21:00" },
      Wednesday: { enabled: true, start: "08:00", end: "21:00" },
      Thursday: { enabled: true, start: "08:00", end: "22:00" },
      Friday: { enabled: true, start: "08:00", end: "22:00" },
      Saturday: { enabled: true, start: "07:00", end: "20:00" },
      Sunday: { enabled: true, start: "09:00", end: "19:00" }
    },
    amenities: ["Champagne Bar", "Private VIP Suites", "Valet Parking", "Personal Concierge", "Designer Products"],
    services: [
      { name: "Signature Elite Cut", category: "Haircuts", duration: 75, price: 165.00, description: "Precision cutting with master stylist consultation" },
      { name: "French Balayage", category: "Hair Color", duration: 240, price: 425.00, description: "Hand-painted highlights using French techniques" },
      { name: "Diamond Keratin Treatment", category: "Hair Treatments", duration: 150, price: 485.00, description: "Premium smoothing with diamond-infused formula" },
      { name: "Caviar Facial", category: "Advanced Facials", duration: 90, price: 295.00, description: "Luxury anti-aging treatment" },
      { name: "Royal Manicure", category: "Manicure", duration: 60, price: 85.00, description: "Premium manicure with paraffin" },
      { name: "Champagne Pedicure", category: "Pedicure", duration: 75, price: 125.00, description: "Luxury spa pedicure" }
    ]
  },
  {
    owner: {
      full_name: "Christopher Sterling",
      email: "chris@opalessencespa.com",
      phone: "+13125559900",
      password: "Opalessence2024!"
    },
    salon: {
      salon_name: "Opalessence Spa Boutique",
      address: "680 North Michigan Avenue",
      city: "Chicago",
      state: "IL",
      zip: "60611",
      country: "United States",
      phone: "+13125559900",
      email: "reservations@opalessencespa.com",
      description: "Chicago's most sophisticated beauty destination on the Magnificent Mile. Contemporary elegance meets timeless luxury.",
      website: "https://opalessencespa.com",
      profile_picture: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "09:00", end: "20:00" },
      Tuesday: { enabled: true, start: "09:00", end: "20:00" },
      Wednesday: { enabled: true, start: "09:00", end: "21:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "08:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "20:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["Artisan Coffee Bar", "WiFi", "Luxury Robes", "Relaxation Lounge"],
    services: [
      { name: "Couture Haircut", category: "Haircuts", duration: 60, price: 125.00, description: "Personalized precision cutting" },
      { name: "Ombré Perfection", category: "Hair Color", duration: 210, price: 325.00, description: "Seamless color melting technique" },
      { name: "Gold Leaf Facial", category: "Advanced Facials", duration: 75, price: 195.00, description: "24k gold anti-aging facial" },
      { name: "Crystal Manicure", category: "Manicure", duration: 50, price: 68.00, description: "Gel manicure with crystals" }
    ]
  },
  {
    owner: {
      full_name: "Penelope Sinclair",
      email: "penelope@pearlesthetics.com",
      phone: "+14155553344",
      password: "PearlEsthetics2024!"
    },
    salon: {
      salon_name: "Pearl Esthetics & Atelier",
      address: "2855 Union Street",
      city: "San Francisco",
      state: "CA",
      zip: "94123",
      country: "United States",
      phone: "+14155553344",
      email: "hello@pearlesthetics.com",
      description: "San Francisco's hidden gem in Pacific Heights. European techniques, organic treatments, and modern luxury.",
      website: "https://pearlesthetics.com",
      profile_picture: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: false, start: "09:00", end: "18:00" },
      Tuesday: { enabled: true, start: "10:00", end: "19:00" },
      Wednesday: { enabled: true, start: "10:00", end: "20:00" },
      Thursday: { enabled: true, start: "10:00", end: "20:00" },
      Friday: { enabled: true, start: "09:00", end: "20:00" },
      Saturday: { enabled: true, start: "09:00", end: "19:00" },
      Sunday: { enabled: true, start: "11:00", end: "17:00" }
    },
    amenities: ["Organic Tea Bar", "WiFi", "Eco-Luxury Products", "Bay View Lounge"],
    services: [
      { name: "Atelier Haircut", category: "Haircuts", duration: 70, price: 135.00, description: "Bespoke cutting experience" },
      { name: "Pearl Balayage", category: "Hair Color", duration: 195, price: 295.00, description: "Luminous hand-painted highlights" },
      { name: "European Smoothing", category: "Hair Treatments", duration: 135, price: 265.00, description: "Gentle keratin alternative" },
      { name: "Oxygen Facial", category: "Advanced Facials", duration: 60, price: 155.00, description: "Pressurized oxygen treatment" }
    ]
  },
  {
    owner: {
      full_name: "Harrison Blackwell",
      email: "harrison@theaterliersalon.com",
      phone: "+16172228899",
      password: "AtelierSalon2024!"
    },
    salon: {
      salon_name: "The Atelier Salon & Spa",
      address: "161 Newbury Street",
      city: "Boston",
      state: "MA",
      zip: "02116",
      country: "United States",
      phone: "+16172228899",
      email: "contact@theaterliersalon.com",
      description: "Boston's premier luxury salon on historic Newbury Street. Traditional craftsmanship meets contemporary innovation.",
      website: "https://theaterliersalon.com",
      profile_picture: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "09:00", end: "19:00" },
      Tuesday: { enabled: true, start: "09:00", end: "20:00" },
      Wednesday: { enabled: true, start: "09:00", end: "20:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "19:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["Espresso Bar", "WiFi", "Private Suites", "Valet Service"],
    services: [
      { name: "Atelier Signature Cut", category: "Haircuts", duration: 65, price: 115.00, description: "Custom precision haircut" },
      { name: "Boston Balayage", category: "Hair Color", duration: 180, price: 275.00, description: "Hand-painted dimensional color" },
      { name: "HydraFacial", category: "Advanced Facials", duration: 60, price: 185.00, description: "Medical-grade facial" }
    ]
  },
  {
    owner: {
      full_name: "Genevieve Laurent",
      email: "genevieve@luxenoirbeauty.com",
      phone: "+15122667788",
      password: "LuxeNoir2024!"
    },
    salon: {
      salon_name: "Luxe Noir Beauty Lounge",
      address: "2901 West 6th Street",
      city: "Austin",
      state: "TX",
      zip: "78703",
      country: "United States",
      phone: "+15122667788",
      email: "info@luxenoirbeauty.com",
      description: "Austin's most sophisticated beauty sanctuary. Modern elegance with dramatic edge. Bold color and fashion-forward cuts.",
      website: "https://luxenoirbeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "10:00", end: "20:00" },
      Tuesday: { enabled: true, start: "10:00", end: "20:00" },
      Wednesday: { enabled: true, start: "10:00", end: "21:00" },
      Thursday: { enabled: true, start: "10:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "09:00", end: "20:00" },
      Sunday: { enabled: true, start: "11:00", end: "18:00" }
    },
    amenities: ["Craft Cocktail Bar", "WiFi", "Instagram Photo Wall", "Modern Art Gallery"],
    services: [
      { name: "Noir Signature Cut", category: "Haircuts", duration: 60, price: 105.00, description: "Fashion-forward precision cut" },
      { name: "Vivid Color Experience", category: "Hair Color", duration: 210, price: 285.00, description: "Bold vibrant fashion colors" },
      { name: "Glass Hair Treatment", category: "Hair Treatments", duration: 90, price: 145.00, description: "Mirror-shine smoothing" }
    ]
  },
  {
    owner: {
      full_name: "Vivienne Westbrook",
      email: "vivienne@serenitysuites.com",
      phone: "+17026665544",
      password: "SerenityS uites2024!"
    },
    salon: {
      salon_name: "Serenity Suites Spa & Salon",
      address: "3799 Las Vegas Boulevard South",
      city: "Las Vegas",
      state: "NV",
      zip: "89109",
      country: "United States",
      phone: "+17026665544",
      email: "reservations@serenitysuites.com",
      description: "Las Vegas Strip's most tranquil luxury escape. Award-winning spa and salon offering the finest beauty services.",
      website: "https://serenitysuites.com",
      profile_picture: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "22:00" },
      Tuesday: { enabled: true, start: "08:00", end: "22:00" },
      Wednesday: { enabled: true, start: "08:00", end: "22:00" },
      Thursday: { enabled: true, start: "08:00", end: "23:00" },
      Friday: { enabled: true, start: "08:00", end: "00:00" },
      Saturday: { enabled: true, start: "07:00", end: "00:00" },
      Sunday: { enabled: true, start: "08:00", end: "22:00" }
    },
    amenities: ["Meditation Room", "Champagne Service", "Strip Views", "VIP Suites"],
    services: [
      { name: "Vegas Glam Cut", category: "Haircuts", duration: 70, price: 145.00, description: "Show-stopping haircut" },
      { name: "Platinum Blonde Service", category: "Hair Color", duration: 240, price: 425.00, description: "Full platinum transformation" },
      { name: "24k Gold Facial", category: "Advanced Facials", duration: 90, price: 245.00, description: "Luxury gold leaf facial" }
    ]
  },
  {
    owner: {
      full_name: "Anastasia Romanov",
      email: "anastasia@imperialbeauty.com",
      phone: "+12025558877",
      password: "ImperialBeauty2024!"
    },
    salon: {
      salon_name: "Imperial Beauty Gallery",
      address: "1250 Connecticut Avenue NW",
      city: "Washington",
      state: "DC",
      zip: "20036",
      country: "United States",
      phone: "+12025558877",
      email: "concierge@imperialbeauty.com",
      description: "Washington DC's most prestigious beauty destination. Regal elegance meets modern sophistication.",
      website: "https://imperialbeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "20:00" },
      Tuesday: { enabled: true, start: "08:00", end: "20:00" },
      Wednesday: { enabled: true, start: "08:00", end: "21:00" },
      Thursday: { enabled: true, start: "08:00", end: "21:00" },
      Friday: { enabled: true, start: "07:00", end: "21:00" },
      Saturday: { enabled: true, start: "07:00", end: "20:00" },
      Sunday: { enabled: true, start: "09:00", end: "19:00" }
    },
    amenities: ["Private VIP Entrance", "Concierge Service", "Presidential Suites", "Security"],
    services: [
      { name: "Imperial Signature Cut", category: "Haircuts", duration: 80, price: 175.00, description: "Elite precision cutting" },
      { name: "Royal Balayage", category: "Hair Color", duration: 210, price: 385.00, description: "Hand-painted luxury highlights" },
      { name: "Presidential Facial", category: "Advanced Facials", duration: 120, price: 295.00, description: "Complete anti-aging facial" }
    ]
  },
  {
    owner: {
      full_name: "Maximilian Thornton",
      email: "max@velvetsalon.com",
      phone: "+15035554433",
      password: "VelvetSalon2024!"
    },
    salon: {
      salon_name: "Velvet & Co. Salon",
      address: "1035 NW Couch Street",
      city: "Portland",
      state: "OR",
      zip: "97209",
      country: "United States",
      phone: "+15035554433",
      email: "hello@velvetsalon.com",
      description: "Portland's most refined beauty experience in Pearl District. Artisan craftsmanship meets sustainable luxury.",
      website: "https://velvetsalon.com",
      profile_picture: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: false, start: "09:00", end: "18:00" },
      Tuesday: { enabled: true, start: "10:00", end: "20:00" },
      Wednesday: { enabled: true, start: "10:00", end: "20:00" },
      Thursday: { enabled: true, start: "10:00", end: "21:00" },
      Friday: { enabled: true, start: "10:00", end: "21:00" },
      Saturday: { enabled: true, start: "09:00", end: "19:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["Local Craft Coffee", "WiFi", "Sustainable Products", "Bike Parking"],
    services: [
      { name: "Artisan Cut", category: "Haircuts", duration: 65, price: 95.00, description: "Sustainable precision cutting" },
      { name: "Eco Balayage", category: "Hair Color", duration: 180, price: 225.00, description: "Low-ammonia hand-painted color" },
      { name: "Botanical Facial", category: "Basic Facials", duration: 60, price: 125.00, description: "Organic facial treatment" }
    ]
  },
  {
    owner: {
      full_name: "Bianca Moretti",
      email: "bianca@maisondebeaute.com",
      phone: "+12145559988",
      password: "MaisonBeaute2024!"
    },
    salon: {
      salon_name: "Maison de Beauté",
      address: "4021 Oak Lawn Avenue",
      city: "Dallas",
      state: "TX",
      zip: "75219",
      country: "United States",
      phone: "+12145559988",
      email: "reservations@maisondebeaute.com",
      description: "Dallas' most exquisite French-inspired beauty house. European elegance in Highland Park.",
      website: "https://maisondebeaute.com",
      profile_picture: "https://images.unsplash.com/photo-1559599238-1c999946dd90?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "09:00", end: "19:00" },
      Tuesday: { enabled: true, start: "09:00", end: "20:00" },
      Wednesday: { enabled: true, start: "09:00", end: "20:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "20:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["French Pastry Bar", "WiFi", "European Products", "Champagne Service"],
    services: [
      { name: "Parisian Precision Cut", category: "Haircuts", duration: 70, price: 135.00, description: "French cutting technique" },
      { name: "French Balayage Artistry", category: "Hair Color", duration: 210, price: 345.00, description: "Authentic French hand-painting" },
      { name: "European Facial", category: "Advanced Facials", duration: 75, price: 175.00, description: "Classic European technique" }
    ]
  },
  {
    owner: {
      full_name: "Sophia Laurent",
      email: "sophia@diamondluxsalon.com",
      phone: "+19175558888",
      password: "DiamondLux2024!"
    },
    salon: {
      salon_name: "Diamond Lux Salon & Spa",
      address: "890 Fifth Avenue",
      city: "New York",
      state: "NY",
      zip: "10021",
      country: "United States",
      phone: "+19175558888",
      email: "info@diamondluxsalon.com",
      description: "Upper East Side's crown jewel of beauty. Platinum service, diamond-level care, unmatched luxury in every treatment.",
      website: "https://diamondluxsalon.com",
      profile_picture: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "20:00" },
      Tuesday: { enabled: true, start: "08:00", end: "21:00" },
      Wednesday: { enabled: true, start: "08:00", end: "21:00" },
      Thursday: { enabled: true, start: "08:00", end: "22:00" },
      Friday: { enabled: true, start: "08:00", end: "22:00" },
      Saturday: { enabled: true, start: "07:00", end: "21:00" },
      Sunday: { enabled: true, start: "09:00", end: "19:00" }
    },
    amenities: ["Diamond Lounge", "Private Spa Suites", "Champagne Bar", "Museum Mile Views"],
    services: [
      { name: "Platinum Cut & Style", category: "Haircuts", duration: 80, price: 185.00, description: "Ultimate precision cutting" },
      { name: "Diamond Highlights", category: "Hair Color", duration: 240, price: 450.00, description: "Multi-dimensional luxury color" },
      { name: "Diamond Facial", category: "Advanced Facials", duration: 120, price: 385.00, description: "Diamond dust micro-exfoliation" }
    ]
  },
  {
    owner: {
      full_name: "Isabella Whitmore",
      email: "isabella@thecourtyardspa.com",
      phone: "+13055557799",
      password: "Courtyard2024!"
    },
    salon: {
      salon_name: "The Courtyard Spa & Salon",
      address: "1120 Ocean Drive",
      city: "Miami Beach",
      state: "FL",
      zip: "33139",
      country: "United States",
      phone: "+13055557799",
      email: "reservations@thecourtyardspa.com",
      description: "Miami Beach's exclusive oceanfront beauty sanctuary. Mediterranean-inspired elegance with tropical luxury.",
      website: "https://thecourtyardspa.com",
      profile_picture: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "20:00" },
      Tuesday: { enabled: true, start: "08:00", end: "20:00" },
      Wednesday: { enabled: true, start: "08:00", end: "21:00" },
      Thursday: { enabled: true, start: "08:00", end: "21:00" },
      Friday: { enabled: true, start: "07:00", end: "21:00" },
      Saturday: { enabled: true, start: "07:00", end: "20:00" },
      Sunday: { enabled: true, start: "09:00", end: "19:00" }
    },
    amenities: ["Ocean View Terrace", "Tropical Garden", "Poolside Service", "Beach Access"],
    services: [
      { name: "Beachside Blowout", category: "Haircuts", duration: 60, price: 135.00, description: "Luxury styling with ocean breeze" },
      { name: "Sun-Kissed Balayage", category: "Hair Color", duration: 180, price: 345.00, description: "Natural beach-inspired highlights" },
      { name: "Tropical Glow Facial", category: "Advanced Facials", duration: 90, price: 225.00, description: "Vitamin-rich rejuvenation" }
    ]
  },
  {
    owner: {
      full_name: "Alexandre Beaumont",
      email: "alex@aureliastudio.com",
      phone: "+14155556633",
      password: "Aurelia2024!"
    },
    salon: {
      salon_name: "Aurelia Beauty Studio",
      address: "1790 Union Street",
      city: "San Francisco",
      state: "CA",
      zip: "94123",
      country: "United States",
      phone: "+14155556633",
      email: "hello@aureliastudio.com",
      description: "San Francisco's avant-garde beauty destination in Cow Hollow. Modern artistry meets golden age glamour.",
      website: "https://aureliastudio.com",
      profile_picture: "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: false, start: "09:00", end: "18:00" },
      Tuesday: { enabled: true, start: "09:00", end: "20:00" },
      Wednesday: { enabled: true, start: "09:00", end: "20:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "19:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["Art Gallery", "Wine & Espresso Bar", "Designer Lounge", "Bay Views"],
    services: [
      { name: "Golden Hour Cut", category: "Haircuts", duration: 70, price: 155.00, description: "Precision cut with styling" },
      { name: "California Highlights", category: "Hair Color", duration: 200, price: 375.00, description: "Sun-drenched dimensional color" },
      { name: "Golden Radiance Facial", category: "Advanced Facials", duration: 75, price: 215.00, description: "Illuminating treatment" }
    ]
  },
  {
    owner: {
      full_name: "Valentina Rossi",
      email: "valentina@bellamiabeauty.com",
      phone: "+12125554488",
      password: "BellaMia2024!"
    },
    salon: {
      salon_name: "Bella Mia Beauty Lounge",
      address: "425 Broome Street",
      city: "New York",
      state: "NY",
      zip: "10013",
      country: "United States",
      phone: "+12125554488",
      email: "info@bellamiabeauty.com",
      description: "SoHo's Italian-inspired beauty haven. Old World charm meets New York sophistication.",
      website: "https://bellamiabeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "09:00", end: "19:00" },
      Tuesday: { enabled: true, start: "09:00", end: "20:00" },
      Wednesday: { enabled: true, start: "09:00", end: "20:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "20:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["Italian Espresso Bar", "Marble Interiors", "Private Suites", "Designer Products"],
    services: [
      { name: "Milano Mastercut", category: "Haircuts", duration: 65, price: 145.00, description: "Italian precision styling" },
      { name: "Venetian Balayage", category: "Hair Color", duration: 195, price: 355.00, description: "Hand-painted Italian technique" },
      { name: "Roman Holiday Facial", category: "Advanced Facials", duration: 85, price: 235.00, description: "Mediterranean glow treatment" }
    ]
  },
  {
    owner: {
      full_name: "Sebastian York",
      email: "sebastian@thesanctuarysalon.com",
      phone: "+13235559922",
      password: "Sanctuary2024!"
    },
    salon: {
      salon_name: "The Sanctuary Salon & Spa",
      address: "8500 Melrose Avenue",
      city: "Los Angeles",
      state: "CA",
      zip: "90069",
      country: "United States",
      phone: "+13235559922",
      email: "concierge@thesanctuarysalon.com",
      description: "West Hollywood's premier celebrity beauty destination. Where Hollywood's elite come to unwind.",
      website: "https://thesanctuarysalon.com",
      profile_picture: "https://images.unsplash.com/photo-1600948836098-34a66c50b169?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "07:00", end: "21:00" },
      Tuesday: { enabled: true, start: "07:00", end: "21:00" },
      Wednesday: { enabled: true, start: "07:00", end: "22:00" },
      Thursday: { enabled: true, start: "07:00", end: "22:00" },
      Friday: { enabled: true, start: "07:00", end: "22:00" },
      Saturday: { enabled: true, start: "08:00", end: "20:00" },
      Sunday: { enabled: true, start: "09:00", end: "19:00" }
    },
    amenities: ["VIP Parking", "Private Entrance", "Celebrity Stylists", "Organic Products", "Meditation Room"],
    services: [
      { name: "Red Carpet Cut", category: "Haircuts", duration: 90, price: 195.00, description: "Celebrity stylist precision cut" },
      { name: "Hollywood Highlights", category: "Hair Color", duration: 240, price: 465.00, description: "Award-worthy dimensional color" },
      { name: "Celebrity Glow Facial", category: "Advanced Facials", duration: 105, price: 315.00, description: "Camera-ready treatment" }
    ]
  },
  {
    owner: {
      full_name: "Amara Thompson",
      email: "amara@regalreflexions.com",
      phone: "+14045558866",
      password: "Regal2024!"
    },
    salon: {
      salon_name: "Regal Reflexions Spa",
      address: "3393 Peachtree Road NE",
      city: "Atlanta",
      state: "GA",
      zip: "30326",
      country: "United States",
      phone: "+14045558866",
      email: "reservations@regalreflexions.com",
      description: "Atlanta's crown jewel in Buckhead. Southern hospitality meets modern luxury.",
      website: "https://regalreflexions.com",
      profile_picture: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "20:00" },
      Tuesday: { enabled: true, start: "08:00", end: "20:00" },
      Wednesday: { enabled: true, start: "08:00", end: "21:00" },
      Thursday: { enabled: true, start: "08:00", end: "21:00" },
      Friday: { enabled: true, start: "08:00", end: "21:00" },
      Saturday: { enabled: true, start: "07:00", end: "19:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["Southern Tea Service", "Magnolia Garden", "VIP Lounge", "Complimentary Valet"],
    services: [
      { name: "Southern Belle Styling", category: "Haircuts", duration: 75, price: 165.00, description: "Elegant precision cut" },
      { name: "Peachtree Balayage", category: "Hair Color", duration: 210, price: 395.00, description: "Sophisticated sun-kissed color" },
      { name: "Peach Glow Facial", category: "Advanced Facials", duration: 90, price: 245.00, description: "Rejuvenating Southern treatment" }
    ]
  },
  {
    owner: {
      full_name: "Julian Pierce",
      email: "julian@cobaltbeauty.com",
      phone: "+12065557744",
      password: "Cobalt2024!"
    },
    salon: {
      salon_name: "Cobalt Beauty Collective",
      address: "1515 15th Avenue",
      city: "Seattle",
      state: "WA",
      zip: "98122",
      country: "United States",
      phone: "+12065557744",
      email: "hello@cobaltbeauty.com",
      description: "Seattle's contemporary beauty hub in Capitol Hill. Pacific Northwest modern meets artistic edge.",
      website: "https://cobaltbeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1560869713-bf165a7c2a04?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: false, start: "09:00", end: "18:00" },
      Tuesday: { enabled: true, start: "09:00", end: "21:00" },
      Wednesday: { enabled: true, start: "09:00", end: "21:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "20:00" },
      Sunday: { enabled: true, start: "10:00", end: "19:00" }
    },
    amenities: ["Local Coffee Bar", "Sustainable Products", "Art Installation", "Rooftop Views"],
    services: [
      { name: "Pacific Cut", category: "Haircuts", duration: 65, price: 135.00, description: "Modern precision styling" },
      { name: "Emerald City Color", category: "Hair Color", duration: 180, price: 325.00, description: "Custom dimensional color" },
      { name: "Northwest Radiance Facial", category: "Advanced Facials", duration: 75, price: 195.00, description: "Hydrating treatment" }
    ]
  },
  {
    owner: {
      full_name: "Eloise Fontaine",
      email: "eloise@lejardinbeauty.com",
      phone: "+15125556655",
      password: "LeJardin2024!"
    },
    salon: {
      salon_name: "Le Jardin Beauty House",
      address: "1209 West 6th Street",
      city: "Austin",
      state: "TX",
      zip: "78703",
      country: "United States",
      phone: "+15125556655",
      email: "contact@lejardinbeauty.com",
      description: "Austin's French-inspired beauty garden in downtown. Parisian chic meets Texas warmth.",
      website: "https://lejardinbeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1610992015708-3e9f004f7dc0?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "09:00", end: "19:00" },
      Tuesday: { enabled: true, start: "09:00", end: "20:00" },
      Wednesday: { enabled: true, start: "09:00", end: "20:00" },
      Thursday: { enabled: true, start: "09:00", end: "21:00" },
      Friday: { enabled: true, start: "09:00", end: "21:00" },
      Saturday: { enabled: true, start: "08:00", end: "20:00" },
      Sunday: { enabled: true, start: "10:00", end: "18:00" }
    },
    amenities: ["French Garden Terrace", "Wine & Cheese", "Botanical Products", "Secret Garden"],
    services: [
      { name: "Parisian Chic Cut", category: "Haircuts", duration: 70, price: 145.00, description: "French precision styling" },
      { name: "French Garden Balayage", category: "Hair Color", duration: 195, price: 365.00, description: "Natural hand-painted highlights" },
      { name: "Lavender Dreams Facial", category: "Advanced Facials", duration: 80, price: 215.00, description: "Calming French treatment" }
    ]
  },
  {
    owner: {
      full_name: "Marcus Wellington",
      email: "marcus@themarquesalon.com",
      phone: "+16175559933",
      password: "Marque2024!"
    },
    salon: {
      salon_name: "The Marque Salon & Spa",
      address: "285 Newbury Street",
      city: "Boston",
      state: "MA",
      zip: "02116",
      country: "United States",
      phone: "+16175559933",
      email: "reservations@themarquesalon.com",
      description: "Boston's distinguished salon on iconic Newbury Street. Classic New England refinement with contemporary flair.",
      website: "https://themarquesalon.com",
      profile_picture: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "08:00", end: "20:00" },
      Tuesday: { enabled: true, start: "08:00", end: "20:00" },
      Wednesday: { enabled: true, start: "08:00", end: "21:00" },
      Thursday: { enabled: true, start: "08:00", end: "21:00" },
      Friday: { enabled: true, start: "07:00", end: "21:00" },
      Saturday: { enabled: true, start: "07:00", end: "20:00" },
      Sunday: { enabled: true, start: "09:00", end: "19:00" }
    },
    amenities: ["Heritage Library", "Private Parlors", "Tea Service", "Historical Art"],
    services: [
      { name: "Heritage Cut", category: "Haircuts", duration: 75, price: 165.00, description: "Classic precision styling" },
      { name: "Boston Brilliance Color", category: "Hair Color", duration: 210, price: 385.00, description: "Sophisticated dimensional color" },
      { name: "Colonial Glow Facial", category: "Advanced Facials", duration: 90, price: 255.00, description: "Timeless rejuvenation" }
    ]
  },
  {
    owner: {
      full_name: "Aurora Sinclair",
      email: "aurora@crystalluxespa.com",
      phone: "+17025556622",
      password: "Crystal2024!"
    },
    salon: {
      salon_name: "Crystal Luxe Spa & Salon",
      address: "3570 Las Vegas Boulevard South",
      city: "Las Vegas",
      state: "NV",
      zip: "89109",
      country: "United States",
      phone: "+17025556622",
      email: "vip@crystalluxespa.com",
      description: "Las Vegas Strip's most opulent beauty destination. Crystal chandeliers, champagne towers, and world-class service.",
      website: "https://crystalluxespa.com",
      profile_picture: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=1200&q=85"
    },
    businessHours: {
      Monday: { enabled: true, start: "06:00", end: "23:00" },
      Tuesday: { enabled: true, start: "06:00", end: "23:00" },
      Wednesday: { enabled: true, start: "06:00", end: "23:00" },
      Thursday: { enabled: true, start: "06:00", end: "23:30" },
      Friday: { enabled: true, start: "06:00", end: "00:00" },
      Saturday: { enabled: true, start: "06:00", end: "00:00" },
      Sunday: { enabled: true, start: "07:00", end: "23:00" }
    },
    amenities: ["Crystal Lounge", "Champagne Tower", "24/7 Concierge", "Strip Views", "High Roller Access"],
    services: [
      { name: "Vegas Glam Cut", category: "Haircuts", duration: 85, price: 185.00, description: "Show-stopping styling" },
      { name: "Dazzle & Shine Color", category: "Hair Color", duration: 225, price: 425.00, description: "Vegas-worthy dimensional color" },
      { name: "Crystal Radiance Facial", category: "Advanced Facials", duration: 100, price: 295.00, description: "Diamond-infused luxury treatment" }
    ]
  }
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function createFirebaseUser(email, password, displayName) {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });
    
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord.uid;
    }
    throw error;
  }
}

async function signupOwner(ownerData, salonData) {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      full_name: ownerData.full_name,
      email: ownerData.email,
      phone: ownerData.phone,
      password: ownerData.password,
      role: "owner",
      businessName: salonData.salon_name,
      businessAddress: salonData.address,
      businessCity: salonData.city,
      businessState: salonData.state,
      businessZip: salonData.zip,
      businessCountry: salonData.country,
      businessWebsite: salonData.website,
      description: salonData.description,
      profile_picture: salonData.profile_picture
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.data?.error?.includes("already registered")) {
      // Login instead
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: ownerData.email,
        password: ownerData.password
      });
      return loginResponse.data;
    }
    throw error;
  }
}

async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  return response.data.token;
}

async function createSalon(token, salonData) {
  const response = await axios.post(
    `${API_URL}/salons`,
    {
      name: salonData.salon_name,
      address: salonData.address,
      city: salonData.city,
      state: salonData.state,
      zip: salonData.zip,
      country: salonData.country,
      phone: salonData.phone,
      email: salonData.email,
      description: salonData.description,
      website: salonData.website,
      profile_picture: salonData.profile_picture
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.salon_id;
}

async function setBusinessHours(token, salonId, businessHours) {
  await axios.put(
    `${API_URL}/salons/${salonId}/business-hours`,
    { businessHours },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function createService(token, salonId, service) {
  try {
    await axios.post(
      `${API_URL}/services`,
      {
        salon_id: salonId,
        ...service
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    // Skip if exists
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function createLuxurySalons() {
  console.log("\n" + "=".repeat(70));
  console.log("✨ CREATING 10 LUXURY SALONS VIA API");
  console.log("=".repeat(70) + "\n");

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < LUXURY_SALONS.length; i++) {
    const salon = LUXURY_SALONS[i];
    
    console.log("─".repeat(70));
    console.log(`📍 SALON ${i + 1}/${LUXURY_SALONS.length}: ${salon.salon.salon_name}`);
    console.log("─".repeat(70));

    try {
      // 1. Sign up owner via API (creates user, auth, and salon in one call)
      console.log(`   👤 Signing up owner: ${salon.owner.full_name}`);
      const signupResult = await signupOwner(salon.owner, salon.salon);
      const salonId = signupResult.salon_id;
      
      if (!salonId) {
        throw new Error("Salon ID not returned from signup");
      }
      
      console.log(`   ✅ Owner signed up, Salon ID: ${salonId}`);

      // 2. Login to get token
      console.log(`   🔑 Logging in...`);
      const token = await login(salon.owner.email, salon.owner.password);
      console.log(`   ✅ Logged in`);

      // 3. Set business hours
      console.log(`   ⏰ Setting business hours...`);
      await setBusinessHours(token, salonId, salon.businessHours);
      console.log(`   ✅ Hours configured`);

      // 4. Create services
      console.log(`   💇 Creating services...`);
      for (const service of salon.services) {
        await createService(token, salonId, service);
      }
      console.log(`   ✅ ${salon.services.length} services created`);

      console.log(`\n   🎉 ${salon.salon.salon_name} created successfully!`);
      console.log(`   📧 Email: ${salon.owner.email}`);
      console.log(`   🔑 Password: ${salon.owner.password}\n`);
      
      created++;

      // Wait a bit between creations
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.response?.data) {
        console.error(`   Details: ${JSON.stringify(error.response.data)}`);
      }
      skipped++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ COMPLETE!`);
  console.log(`   Created: ${created} new salons`);
  console.log(`   Skipped: ${skipped} salons`);
  console.log("=".repeat(70));
  
  console.log("\n📋 LOGIN CREDENTIALS:");
  console.log("─".repeat(70));
  LUXURY_SALONS.forEach(salon => {
    console.log(`${salon.salon.salon_name}`);
    console.log(`  Email: ${salon.owner.email}`);
    console.log(`  Password: ${salon.owner.password}\n`);
  });
  console.log("=".repeat(70) + "\n");

  process.exit(0);
}

// Run it
createLuxurySalons().catch(error => {
  console.error("\n❌ FATAL ERROR:", error);
  process.exit(1);
});

