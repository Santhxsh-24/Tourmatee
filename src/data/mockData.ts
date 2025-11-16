// Mock data simulating Denodo datasets
export interface PlaceData {
  PlaceName: string;
  Location: string;
  State: string;
  Category: 'tourist' | 'food' | 'emergency';
  Type: string;
  Rating: number;
  Reviews: number;
  Emotion: string;
  Latitude: number;
  Longitude: number;
  ImageURL: string;
  Score?: number;
  Color?: string;
  Explanation?: string;
  Details?: {
    BestPlaceInState?: string;
    SuggestedInvestment?: string;
    UserNeed?: string;
    OpeningHours?: string[];
  };
}

export const mockPlacesData: PlaceData[] = [
  // Tourist Spots
  {
    PlaceName: "Ooty Lake",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "tourist",
    Type: "Lake",
    Rating: 4.2,
    Reviews: 850,
    Emotion: "Romantic",
    Latitude: 11.4064,
    Longitude: 76.6932,
    ImageURL: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
    Details: {
      BestPlaceInState: "Hill Station Paradise",
      SuggestedInvestment: "₹5,000"
    }
  },
  {
    PlaceName: "Botanical Garden",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "tourist",
    Type: "Garden",
    Rating: 4.5,
    Reviews: 1200,
    Emotion: "Happy",
    Latitude: 11.4041,
    Longitude: 76.7066,
    ImageURL: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg",
    Details: {
      BestPlaceInState: "Nilgiri Gardens",
      SuggestedInvestment: "₹3,000"
    }
  },
  {
    PlaceName: "Doddabetta Peak",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "tourist",
    Type: "Mountain",
    Rating: 4.3,
    Reviews: 950,
    Emotion: "Energetic",
    Latitude: 11.3926,
    Longitude: 76.7337,
    ImageURL: "https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg",
    Details: {
      BestPlaceInState: "Highest Peak in Nilgiris",
      SuggestedInvestment: "₹4,000"
    }
  },
  {
    PlaceName: "Tea Museum",
    Location: "Munnar",
    State: "Kerala",
    Category: "tourist",
    Type: "Museum",
    Rating: 4.1,
    Reviews: 650,
    Emotion: "Tired",
    Latitude: 10.0889,
    Longitude: 77.0595,
    ImageURL: "https://images.pexels.com/photos/1793502/pexels-photo-1793502.jpeg",
    Details: {
      BestPlaceInState: "Tea Heritage Center",
      SuggestedInvestment: "₹2,500"
    }
  },
  {
    PlaceName: "Mattupetty Dam",
    Location: "Munnar",
    State: "Kerala",
    Category: "tourist",
    Type: "Dam",
    Rating: 4.0,
    Reviews: 450,
    Emotion: "Sad",
    Latitude: 10.1319,
    Longitude: 77.1172,
    ImageURL: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg",
    Details: {
      BestPlaceInState: "Scenic Dam View",
      SuggestedInvestment: "₹3,500"
    }
  },
  {
    PlaceName: "Marina Beach",
    Location: "Chennai",
    State: "Tamil Nadu",
    Category: "tourist",
    Type: "Beach",
    Rating: 3.8,
    Reviews: 2500,
    Emotion: "Energetic",
    Latitude: 13.0475,
    Longitude: 80.2824,
    ImageURL: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg",
    Details: {
      BestPlaceInState: "World's Second Longest Beach",
      SuggestedInvestment: "₹1,500"
    }
  },
  {
    PlaceName: "Kodai Lake",
    Location: "Kodaikanal",
    State: "Tamil Nadu",
    Category: "tourist",
    Type: "Lake",
    Rating: 4.4,
    Reviews: 1100,
    Emotion: "Romantic",
    Latitude: 10.2381,
    Longitude: 77.4892,
    ImageURL: "https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg",
    Details: {
      BestPlaceInState: "Princess of Hill Stations",
      SuggestedInvestment: "₹4,500"
    }
  },
  
  // Food Places
  {
    PlaceName: "Sunny Café",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "food",
    Type: "Cafe",
    Rating: 4.5,
    Reviews: 120,
    Emotion: "Energetic",
    Latitude: 11.4064,
    Longitude: 76.6932,
    ImageURL: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg",
    Details: {
      SuggestedInvestment: "₹2,00,000"
    }
  },
  {
    PlaceName: "Spice Corner",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "food",
    Type: "Restaurant",
    Rating: 4.3,
    Reviews: 200,
    Emotion: "Happy",
    Latitude: 11.4041,
    Longitude: 76.7066,
    ImageURL: "https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg",
    Details: {
      SuggestedInvestment: "₹3,50,000"
    }
  },
  {
    PlaceName: "Hilltop Snacks",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "food",
    Type: "Snacks",
    Rating: 4.0,
    Reviews: 80,
    Emotion: "Tired",
    Latitude: 11.3926,
    Longitude: 76.7337,
    ImageURL: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
    Details: {
      SuggestedInvestment: "₹1,50,000"
    }
  },
  {
    PlaceName: "Romantic Rooftop",
    Location: "Munnar",
    State: "Kerala",
    Category: "food",
    Type: "Fine Dining",
    Rating: 4.7,
    Reviews: 150,
    Emotion: "Romantic",
    Latitude: 10.0889,
    Longitude: 77.0595,
    ImageURL: "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg",
    Details: {
      SuggestedInvestment: "₹5,00,000"
    }
  },
  {
    PlaceName: "Comfort Food Zone",
    Location: "Chennai",
    State: "Tamil Nadu",
    Category: "food",
    Type: "Comfort Food",
    Rating: 4.2,
    Reviews: 300,
    Emotion: "Sad",
    Latitude: 13.0475,
    Longitude: 80.2824,
    ImageURL: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    Details: {
      SuggestedInvestment: "₹2,75,000"
    }
  },
  
  // Emergency Services
  {
    PlaceName: "Ooty Government Hospital",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "emergency",
    Type: "Hospital",
    Rating: 3.8,
    Reviews: 95,
    Emotion: "Critical Condition",
    Latitude: 11.4064,
    Longitude: 76.6932,
    ImageURL: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg",
    Details: {
      UserNeed: "24/7 Emergency Care"
    }
  },
  {
    PlaceName: "Tourist Helpline Center",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "emergency",
    Type: "Helpline",
    Rating: 4.1,
    Reviews: 50,
    Emotion: "Lost",
    Latitude: 11.4041,
    Longitude: 76.7066,
    ImageURL: "https://images.pexels.com/photos/7173019/pexels-photo-7173019.jpeg",
    Details: {
      UserNeed: "Tourist Guidance & Support"
    }
  },
  {
    PlaceName: "Ooty Police Station",
    Location: "Ooty",
    State: "Tamil Nadu",
    Category: "emergency",
    Type: "Police",
    Rating: 3.9,
    Reviews: 40,
    Emotion: "Safety Concern",
    Latitude: 11.3926,
    Longitude: 76.7337,
    ImageURL: "https://images.pexels.com/photos/8369684/pexels-photo-8369684.jpeg",
    Details: {
      UserNeed: "Law Enforcement & Safety"
    }
  },
  {
    PlaceName: "Crisis Counseling Center",
    Location: "Munnar",
    State: "Kerala",
    Category: "emergency",
    Type: "Counseling",
    Rating: 4.5,
    Reviews: 30,
    Emotion: "High Stress",
    Latitude: 10.0889,
    Longitude: 77.0595,
    ImageURL: "https://images.pexels.com/photos/8471082/pexels-photo-8471082.jpeg",
    Details: {
      UserNeed: "Mental Health Support"
    }
  },
  {
    PlaceName: "Companion Support Service",
    Location: "Chennai",
    State: "Tamil Nadu",
    Category: "emergency",
    Type: "Support",
    Rating: 4.3,
    Reviews: 60,
    Emotion: "Alone",
    Latitude: 13.0475,
    Longitude: 80.2824,
    ImageURL: "https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg",
    Details: {
      UserNeed: "Companionship & Emotional Support"
    }
  },
  {
    PlaceName: "Emergency Medical Center",
    Location: "Bengaluru",
    State: "Karnataka",
    Category: "emergency",
    Type: "Medical",
    Rating: 4.2,
    Reviews: 180,
    Emotion: "Medical Emergency",
    Latitude: 12.9716,
    Longitude: 77.5946,
    ImageURL: "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg",
    Details: {
      UserNeed: "Immediate Medical Attention"
    }
  }
];

export const places = [
  "Ooty", "Munnar", "Chennai", "Kodaikanal", "Coimbatore", 
  "Bengaluru", "Wayanad", "Yercaud", "Pondicherry"
];

export const categories = [
  { name: "Tourist Spot", icon: "🏰", value: "tourist" },
  { name: "Food", icon: "🍲", value: "food" },
  { name: "Emergency", icon: "🚑", value: "emergency" }
];

export const moods = {
  tourist: [
    { name: "Happy", emoji: "😊" },
    { name: "Sad", emoji: "😔" },
    { name: "Romantic", emoji: "💖" },
    { name: "Energetic", emoji: "⚡" },
    { name: "Tired", emoji: "😴" }
  ],
  food: [
    { name: "Happy", emoji: "😊" },
    { name: "Sad", emoji: "😔" },
    { name: "Romantic", emoji: "💖" },
    { name: "Energetic", emoji: "⚡" },
    { name: "Tired", emoji: "😴" }
  ],
  emergency: [
    { name: "Lost", emoji: "🧭" },
    { name: "Alone", emoji: "🕊️" },
    { name: "Critical Condition", emoji: "🚑" },
    { name: "High Stress", emoji: "😰" },
    { name: "Medical Emergency", emoji: "🏥" },
    { name: "Safety Concern", emoji: "👮" }
  ]
};