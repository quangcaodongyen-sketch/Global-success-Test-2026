import { Grade, UnitInfo, ExamType, AdminInfo } from '../types';

export const GLOBAL_SUCCESS_UNITS: Record<Grade, UnitInfo[]> = {
  'Lớp 6': [
    {
      id: 'g6-u1',
      unitNumber: 1,
      title: 'Unit 1: My New School',
      topic: 'School life, subjects, school items & activities',
      grammar: ['Present Simple', 'Adverbs of Frequency'],
      vocabulary: ['school items', 'school subjects', 'play/do/have/study']
    },
    {
      id: 'g6-u2',
      unitNumber: 2,
      title: 'Unit 2: My House',
      topic: 'Types of house, rooms and furniture',
      grammar: ['Possessive case', 'Prepositions of place'],
      vocabulary: ['types of house', 'rooms', 'furniture items']
    },
    {
      id: 'g6-u3',
      unitNumber: 3,
      title: 'Unit 3: My Friends',
      topic: 'Body parts, appearance, personality traits',
      grammar: ['Present Continuous for present & future', 'Have got / Has got'],
      vocabulary: ['body parts', 'personality adjectives', 'clothing']
    },
    {
      id: 'g6-u4',
      unitNumber: 4,
      title: 'Unit 4: My Neighbourhood',
      topic: 'Places in neighbourhood, directions & comparison',
      grammar: ['Comparative adjectives'],
      vocabulary: ['places in town', 'direction phrases', 'city vs country']
    },
    {
      id: 'g6-u5',
      unitNumber: 5,
      title: 'Unit 5: Natural Wonders of Viet Nam',
      topic: 'Geography, landscapes and natural wonders',
      grammar: ['Superlative adjectives', 'Modal verb: Must / Mustn\'t'],
      vocabulary: ['natural wonders', 'travel items', 'geographical features']
    },
    {
      id: 'g6-u6',
      unitNumber: 6,
      title: 'Unit 6: Our Tet Holiday',
      topic: 'Tet traditions, preparations and wishes',
      grammar: ['Should / Shouldn\'t for advice', 'Some / Any for quantity'],
      vocabulary: ['Tet activities', 'decorations', 'traditional food']
    },
    {
      id: 'g6-u7',
      unitNumber: 7,
      title: 'Unit 7: Television',
      topic: 'TV programmes, channels and media habits',
      grammar: ['Wh-questions', 'Conjunctions: and, but, so, because, although'],
      vocabulary: ['TV show types', 'programmes', 'media adjectives']
    },
    {
      id: 'g6-u8',
      unitNumber: 8,
      title: 'Unit 8: Sports and Games',
      topic: 'Sports equipment, rules and famous athletes',
      grammar: ['Past Simple tense', 'Imperatives'],
      vocabulary: ['sports names', 'sports equipment', 'game verbs']
    },
    {
      id: 'g6-u9',
      unitNumber: 9,
      title: 'Unit 9: Cities of the World',
      topic: 'Famous landmarks, cities, weather and culture',
      grammar: ['Possessive Pronouns', 'Present Perfect (Ever/Never)'],
      vocabulary: ['city landmarks', 'weather adjectives', 'tourist spots']
    },
    {
      id: 'g6-u10',
      unitNumber: 10,
      title: 'Unit 10: Our Houses in the Future',
      topic: 'Future houses, smart appliances and energy',
      grammar: ['Future Simple (Will / Won\'t)', 'Might for possibility'],
      vocabulary: ['future appliances', 'house locations', 'smart tech']
    },
    {
      id: 'g6-u11',
      unitNumber: 11,
      title: 'Unit 11: Our Greener World',
      topic: 'Environment, 3Rs (Reduce, Reuse, Recycle) & green living',
      grammar: ['First Conditional (If + Present, Will)'],
      vocabulary: ['the 3Rs', 'environmental problems', 'recyclable materials']
    },
    {
      id: 'g6-u12',
      unitNumber: 12,
      title: 'Unit 12: Robots',
      topic: 'Robot types, abilities and future roles',
      grammar: ['Superlative adjectives with long adjectives', 'Could for past ability'],
      vocabulary: ['robot actions', 'abilities', 'daily tasks']
    }
  ],

  'Lớp 7': [
    {
      id: 'g7-u1',
      unitNumber: 1,
      title: 'Unit 1: Hobbies',
      topic: 'Free time activities, hobbies and benefits',
      grammar: ['Present Simple', 'Verbs of liking + V-ing'],
      vocabulary: ['hobbies', 'action verbs', 'benefit adjectives']
    },
    {
      id: 'g7-u2',
      unitNumber: 2,
      title: 'Unit 2: Healthy Living',
      topic: 'Health issues, healthy diet, exercise & lifestyle',
      grammar: ['Simple sentences', 'Imperatives with More / Less'],
      vocabulary: ['health problems', 'healthy habits', 'food groups']
    },
    {
      id: 'g7-u3',
      unitNumber: 3,
      title: 'Unit 3: Community Service',
      topic: 'Volunteer work, community projects and donations',
      grammar: ['Past Simple', 'Present Perfect with for / since'],
      vocabulary: ['volunteer activities', 'community helpers', 'donations']
    },
    {
      id: 'g7-u4',
      unitNumber: 4,
      title: 'Unit 4: Music and Arts',
      topic: 'Musical instruments, art forms, artists & concerts',
      grammar: ['Comparison: (not) as ... as, the same as, different from'],
      vocabulary: ['musical instruments', 'art genres', 'artist nouns']
    },
    {
      id: 'g7-u5',
      unitNumber: 5,
      title: 'Unit 5: Food and Drink',
      topic: 'Vietnamese traditional dishes, recipes & ingredients',
      grammar: ['Nouns: Countable / Uncountable', 'How much / How many, a lot of, some'],
      vocabulary: ['cooking verbs', 'ingredients', 'tastes & flavors']
    },
    {
      id: 'g7-u6',
      unitNumber: 6,
      title: 'Unit 6: A Visit to a School',
      topic: 'School facilities, history, outdoor activities',
      grammar: ['Prepositions of time & place', 'Passive voice (Present Simple)'],
      vocabulary: ['school facilities', 'learning spaces', 'historic schools']
    },
    {
      id: 'g7-u7',
      unitNumber: 7,
      title: 'Unit 7: Traffic',
      topic: 'Means of transport, road signs & safety regulations',
      grammar: ['It indicating distance', 'Used to for past habits'],
      vocabulary: ['traffic signs', 'vehicles', 'road safety rules']
    },
    {
      id: 'g7-u8',
      unitNumber: 8,
      title: 'Unit 8: Films',
      topic: 'Film genres, actors, reviews & feelings',
      grammar: ['Although / Even though / Despite / In spite of', 'Adjectives ending in -ed / -ing'],
      vocabulary: ['film types', 'movie terms', 'emotional adjectives']
    },
    {
      id: 'g7-u9',
      unitNumber: 9,
      title: 'Unit 9: Festivals around the World',
      topic: 'Cultural festivals, customs, food and celebrations',
      grammar: ['H-questions review', 'Adverbial clauses of time'],
      vocabulary: ['festival activities', 'cultural terms', 'celebration verbs']
    },
    {
      id: 'g7-u10',
      unitNumber: 10,
      title: 'Unit 10: Energy Sources',
      topic: 'Renewable & non-renewable energy sources',
      grammar: ['Present Continuous for future arrangements', 'Future Continuous'],
      vocabulary: ['solar/wind/hydro energy', 'fossil fuels', 'conservation']
    },
    {
      id: 'g7-u11',
      unitNumber: 11,
      title: 'Unit 11: Travelling in the Future',
      topic: 'Future transport, flying cars, hyperloops',
      grammar: ['Future Simple (will)', 'Possessive Pronouns'],
      vocabulary: ['future vehicles', 'travel technology', 'transport adjectives']
    },
    {
      id: 'g7-u12',
      unitNumber: 12,
      title: 'Unit 12: English-speaking Countries',
      topic: 'Geography, lifestyle & culture in US, UK, Australia, NZ',
      grammar: ['Articles: a / an / the / zero article'],
      vocabulary: ['landmarks', 'cultural symbols', 'nationalities']
    }
  ],

  'Lớp 8': [
    {
      id: 'g8-u1',
      unitNumber: 1,
      title: 'Unit 1: Leisure Time',
      topic: 'Leisure activities, DIY projects and teen trends',
      grammar: ['Verbs of liking / hating + V-ing / to-V'],
      vocabulary: ['leisure activities', 'DIY terms', 'socializing']
    },
    {
      id: 'g8-u2',
      unitNumber: 2,
      title: 'Unit 2: Life in the Countryside',
      topic: 'Rural life, harvesting, traditional games & scenery',
      grammar: ['Comparative adverbs (more quickly, faster...)'],
      vocabulary: ['countryside activities', 'rural landscapes', 'farm life']
    },
    {
      id: 'g8-u3',
      unitNumber: 3,
      title: 'Unit 3: Teenagers',
      topic: 'Teen stress, school clubs, social media & peer pressure',
      grammar: ['Simple & Compound sentences', 'Connectors: however, otherwise, therefore'],
      vocabulary: ['teen problems', 'school clubs', 'online communication']
    },
    {
      id: 'g8-u4',
      unitNumber: 4,
      title: 'Unit 4: Ethnic Groups of Viet Nam',
      topic: 'Ethnic minorities, costumes, stilt houses & customs',
      grammar: ['Countable vs Uncountable nouns review', 'Questions: How many / How much / Which / What'],
      vocabulary: ['ethnic costumes', 'stilt houses', 'traditional crafts']
    },
    {
      id: 'g8-u5',
      unitNumber: 5,
      title: 'Unit 5: Our Customs and Traditions',
      topic: 'Family traditions, etiquette, table manners & anniversaries',
      grammar: ['Zero & First Conditionals review', 'Modal verbs: Should / Must for obligation'],
      vocabulary: ['customs', 'etiquette', 'traditions', 'worship']
    },
    {
      id: 'g8-u6',
      unitNumber: 6,
      title: 'Unit 6: Lifestyles',
      topic: 'Traditional vs modern lifestyles, street food & habits',
      grammar: ['Future Simple vs Present Continuous for future'],
      vocabulary: ['daily habits', 'lifestyle adjectives', 'cultural changes']
    },
    {
      id: 'g8-u7',
      unitNumber: 7,
      title: 'Unit 7: Environmental Protection',
      topic: 'Pollution, habitats, endangered species & conservation',
      grammar: ['Complex sentences with Adverbial Clauses of cause/effect (since, as, because)'],
      vocabulary: ['types of pollution', 'ecosystems', 'endangered animals']
    },
    {
      id: 'g8-u8',
      unitNumber: 8,
      title: 'Unit 8: Shopping',
      topic: 'Shopping centers, open-air markets, online shopping & bargains',
      grammar: ['Present Simple for future timetables', 'Adverbs of frequency with Present Continuous'],
      vocabulary: ['shopping places', 'discount terms', 'customer phrases']
    },
    {
      id: 'g8-u9',
      unitNumber: 9,
      title: 'Unit 9: Natural Disasters',
      topic: 'Typhoons, floods, earthquakes, safety tips & emergency kits',
      grammar: ['Past Continuous tense', 'Past Continuous vs Past Simple with when/while'],
      vocabulary: ['natural disasters', 'disaster responses', 'emergency supplies']
    },
    {
      id: 'g8-u10',
      unitNumber: 10,
      title: 'Unit 10: Communication in the Future',
      topic: 'Telepathy, holograms, translation badges & video calls',
      grammar: ['Prepositions of time & place review', 'Possessive pronouns review'],
      vocabulary: ['communication tech', 'high-tech devices', 'body language']
    },
    {
      id: 'g8-u11',
      unitNumber: 11,
      title: 'Unit 11: Science and Technology',
      topic: 'Scientific discoveries, AI, space travel & modern inventions',
      grammar: ['Reported Speech (Statements)'],
      vocabulary: ['inventions', 'scientific terms', 'tech equipment']
    },
    {
      id: 'g8-u12',
      unitNumber: 12,
      title: 'Unit 12: Life on Other Planets',
      topic: 'Aliens, space stations, UFOs & life in space',
      grammar: ['Reported Speech (Questions)', 'Modal verbs: May / Might'],
      vocabulary: ['astronomy terms', 'planets', 'space gear']
    }
  ],

  'Lớp 9': [
    {
      id: 'g9-u1',
      unitNumber: 1,
      title: 'Unit 1: Local Community',
      topic: 'Artisans, local handicrafts, community services & helper roles',
      grammar: ['Complex sentences with Adverbial Clauses (concession, result, purpose)', 'Phrasal verbs'],
      vocabulary: ['handicrafts', 'community helpers', 'artisan verbs']
    },
    {
      id: 'g9-u2',
      unitNumber: 2,
      title: 'Unit 2: City Life',
      topic: 'Urban features, traffic jams, high cost of living & city attractions',
      grammar: ['Phrasal verbs (continue)', 'Comparison of adjectives & adverbs review'],
      vocabulary: ['urban adjectives', 'city facilities', 'living conditions']
    },
    {
      id: 'g9-u3',
      unitNumber: 3,
      title: 'Unit 3: Healthy Living for Teens',
      topic: 'Physical wellness, mental health, study-life balance & stress management',
      grammar: ['Modal verbs: Should, Ought to, Must, Have to', 'Question words before to-infinitive'],
      vocabulary: ['mental health', 'wellness habits', 'stress factors']
    },
    {
      id: 'g9-u4',
      unitNumber: 4,
      title: 'Unit 4: Remembering the Past',
      topic: 'Historic events, traditions, childhood memories & heritage sites',
      grammar: ['Past Continuous review', 'Used to / Didn\'t use to', 'Wish for the present'],
      vocabulary: ['historical terms', 'traditions', 'heritage artifacts']
    },
    {
      id: 'g9-u5',
      unitNumber: 5,
      title: 'Unit 5: Our Experiences',
      topic: 'Personal experiences, milestones, overcoming challenges',
      grammar: ['Present Perfect with yet, already, just, ever, never'],
      vocabulary: ['experience verbs', 'emotions', 'challenges']
    },
    {
      id: 'g9-u6',
      unitNumber: 6,
      title: 'Unit 6: Vietnamese Lifestyles Then and Now',
      topic: 'Comparing past & modern Vietnamese family life, transportation & education',
      grammar: ['Past Perfect tense', 'Structure: It is + adj + to-V'],
      vocabulary: ['past vs present lifestyle', 'family structures', 'living conditions']
    },
    {
      id: 'g9-u7',
      unitNumber: 7,
      title: 'Unit 7: Natural Wonders of the World',
      topic: 'Famous world natural wonders, conservation & eco-tourism',
      grammar: ['Passive voice with modal verbs', 'Impersonal passive (It is said that...)'],
      vocabulary: ['geological terms', 'tourism phrases', 'conservation']
    },
    {
      id: 'g9-u8',
      unitNumber: 8,
      title: 'Unit 8: Tourism',
      topic: 'Travel destinations, itineraries, package tours & tourist tips',
      grammar: ['Compound nouns', 'Relative clauses with Who, Which, That'],
      vocabulary: ['travel terms', 'accommodations', 'tourist spots']
    },
    {
      id: 'g9-u9',
      unitNumber: 9,
      title: 'Unit 9: World Englishes',
      topic: 'English varieties, accents, loan words & global communication',
      grammar: ['Relative clauses (Defining & Non-defining)'],
      vocabulary: ['language learning', 'dialects', 'global terms']
    },
    {
      id: 'g9-u10',
      unitNumber: 10,
      title: 'Unit 10: Planet Earth',
      topic: 'Geology, climate change, ecosystems & biodiversity',
      grammar: ['Non-defining relative clauses', 'Conditional sentences Type 2'],
      vocabulary: ['environmental science', 'climate terms', 'species']
    },
    {
      id: 'g9-u11',
      unitNumber: 11,
      title: 'Unit 11: Electronic Devices',
      topic: 'Smart devices, educational tech, pros and cons of gadget screen time',
      grammar: ['Reported Speech with Infinitive & Gerund'],
      vocabulary: ['gadget names', 'tech features', 'digital terms']
    },
    {
      id: 'g9-u12',
      unitNumber: 12,
      title: 'Unit 12: Careers in the Future',
      topic: 'Future jobs, career paths, skills needed & workplace changes',
      grammar: ['Clauses of condition: Unless / Provided that', 'Future Perfect'],
      vocabulary: ['job titles', 'workplace skills', 'career adjectives']
    }
  ]
};

export const DEFAULT_ADMIN_INFO: Record<Grade, AdminInfo> = {
  'Lớp 6': {
    schoolName: 'Trường THCS Đồng Yên',
    className: 'Lớp 6A1',
    academicYear: '2026-2027',
    teacherName: 'Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  },
  'Lớp 7': {
    schoolName: 'Trường THCS Đồng Yên',
    className: 'Lớp 7A1',
    academicYear: '2026-2027',
    teacherName: 'Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  },
  'Lớp 8': {
    schoolName: 'Trường THCS Đồng Yên',
    className: 'Lớp 8A1',
    academicYear: '2026-2027',
    teacherName: 'Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  },
  'Lớp 9': {
    schoolName: 'Trường THCS Đồng Yên',
    className: 'Lớp 9A1',
    academicYear: '2026-2027',
    teacherName: 'Đinh Văn Thành',
    durationMinutes: 60,
    examDate: new Date().toLocaleDateString('vi-VN')
  }
};

export const EXAM_TYPE_DURATION: Record<ExamType, number> = {
  'Kiểm tra 15 phút': 15,
  'Giữa kỳ 1': 60,
  'Cuối kỳ 1': 60,
  'Giữa kỳ 2': 60,
  'Cuối kỳ 2': 60
};
