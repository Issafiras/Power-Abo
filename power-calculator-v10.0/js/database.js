// Database management for POWER Calculator v10.0

let PLANS = [];
let STREAMING_SERVICES = [];
let BRANDS = {};
let STREAMING_CATEGORIES = {};

export async function initDatabase() {
  try {
    console.log('🔄 Loading external databases...');
    
    // Load plans database
    const plansResponse = await fetch('./database/plans.json');
    if (!plansResponse.ok) throw new Error('Plans database not found');
    const plansData = await plansResponse.json();
    PLANS = plansData.plans;
    BRANDS = plansData.brands;
    console.log('✅ Plans database loaded:', PLANS.length, 'plans');

    // Load streaming database  
    const streamingResponse = await fetch('./database/streaming.json');
    if (!streamingResponse.ok) throw new Error('Streaming database not found');
    const streamingData = await streamingResponse.json();
    STREAMING_SERVICES = streamingData.services;
    STREAMING_CATEGORIES = streamingData.categories;
    console.log('✅ Streaming database loaded:', STREAMING_SERVICES.length, 'services');
    
  } catch (error) {
    console.error('❌ Error loading databases:', error);
    // Fallback to embedded data if external databases fail
    loadFallbackData();
  }
}

function loadFallbackData() {
  console.log('⚠️ Using fallback embedded data');
  
  // Fallback PLANS data
  PLANS = [
    // Telenor pakker
    {id:"ten-20", brand:"Telenor", name:"20 GB", dataGB:20, unlimited:false, price:149, earnings:700, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    {id:"ten-70", brand:"Telenor", name:"70 GB", dataGB:70, unlimited:false, price:199, earnings:900, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    {id:"ten-120", brand:"Telenor", name:"120 GB", dataGB:120, unlimited:false, price:239, earnings:1200, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    {id:"ten-unl", brand:"Telenor", name:"Fri data", dataGB:Infinity, unlimited:true, price:289, earnings:1300, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    
    // Telmore pakker
    {id:"tel-30", brand:"Telmore", name:"30 GB", dataGB:30, unlimited:false, price:129, earnings:400, features:["5G", "EU Roaming"], color:"#ff8b4a"},
    {id:"tel-70", brand:"Telmore", name:"70 GB", dataGB:70, unlimited:false, price:149, earnings:700, features:["5G", "EU Roaming"], color:"#ff8b4a", introPrice:74, introMonths:3},
    {id:"tel-60", brand:"Telmore", name:"60 GB", dataGB:60, unlimited:false, price:169, earnings:700, features:["5G", "EU Roaming"], color:"#ff8b4a"},
    {id:"tel-100", brand:"Telmore", name:"100 GB", dataGB:100, unlimited:false, price:219, earnings:700, features:["5G", "EU Roaming", "HBO Max"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-unl", brand:"Telmore", name:"Fri data", dataGB:Infinity, unlimited:true, price:229, earnings:700, features:["5G", "EU Roaming"], color:"#ff8b4a"},
    {id:"tel-play-100", brand:"Telmore", name:"100 GB + 2 tjenester", dataGB:100, unlimited:false, price:299, earnings:1000, features:["5G", "EU Roaming", "Streaming inkl."], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-play-3", brand:"Telmore", name:"Fri data + 3 tjenester", dataGB:Infinity, unlimited:true, price:399, earnings:1100, features:["5G", "EU Roaming", "Streaming (3 valgfrie)"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-play-4", brand:"Telmore", name:"Fri data + 4 tjenester", dataGB:Infinity, unlimited:true, price:449, earnings:1100, features:["5G", "EU Roaming", "Streaming (4 valgfrie)"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-play-5", brand:"Telmore", name:"Fri data + 5 tjenester", dataGB:Infinity, unlimited:true, price:499, earnings:1100, features:["5G", "EU Roaming", "Streaming (5 valgfrie)"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-premium", brand:"Telmore", name:"Premium", dataGB:Infinity, unlimited:true, price:559, earnings:1100, features:["5G", "EU Roaming (94 GB)", "8 Streaming tjenester", "Premium"], color:"#ff8b4a"},
    {id:"tel-ultimate", brand:"Telmore", name:"Ultimate", dataGB:Infinity, unlimited:true, price:599, earnings:1100, features:["5G", "EU Roaming (94 GB)", "9 Streaming tjenester", "Ultimate"], color:"#ff8b4a"},
    
    // CBB pakker
    {id:"cbb-60", brand:"CBB", name:"60 GB", dataGB:60, unlimited:false, price:109, earnings:300, features:["5G", "EU Roaming"], color:"#a78bfa"},
    {id:"cbb-200", brand:"CBB", name:"200 GB", dataGB:200, unlimited:false, price:129, earnings:500, features:["5G", "EU Roaming"], color:"#a78bfa"},
    {id:"cbb-500", brand:"CBB", name:"500 GB", dataGB:500, unlimited:false, price:149, earnings:800, features:["5G", "EU Roaming"], color:"#a78bfa"},
    {id:"cbb-100", brand:"CBB", name:"100 GB (World-data)", dataGB:100, unlimited:false, price:199, earnings:800, features:["5G", "EU Roaming"], color:"#a78bfa"}
  ];
  
  // Fallback STREAMING_SERVICES data
  STREAMING_SERVICES = [
    {id:"netflix", name:"Netflix", price:139, icon:"<div class='streaming-logo netflix'>N</div>", color:"#e50914"},
    {id:"viaplay", name:"Viaplay", price:149, icon:"<div class='streaming-logo viaplay'>viaplay</div>", color:"#00d4aa"},
    {id:"hbo", name:"HBO Max", price:119, icon:"<div class='streaming-logo hbo'>HBO<br>max</div>", color:"#673ab7"},
    {id:"tv2play", name:"TV2 Play", price:99, icon:"<div class='streaming-logo tv2play'>TV2<br>Play</div>", color:"#ff6b35"},
    {id:"saxo", name:"Saxo", price:79, icon:"<div class='streaming-logo saxo'>saxo</div>", color:"#c41e3a"},
    {id:"disney", name:"Disney+", price:129, icon:"<div class='streaming-logo disney'>Disney+</div>", color:"#0066cc"},
    {id:"skyshowtime", name:"SkyShowtime", price:89, icon:"<div class='streaming-logo skyshowtime'>skySHO</div>", color:"#6b46c1"},
    {id:"prime", name:"Prime Video", price:59, icon:"<div class='streaming-logo prime'>prime</div>", color:"#0f7ae5"},
    {id:"musik", name:"Musik tjeneste", price:109, icon:"<div class='streaming-logo musik'>🎵</div>", color:"#1e40af"}
  ];
  
  // Set brands
  BRANDS = {
    "Telenor": { name: "Telenor", color: "#38bdf8", logo: "T" },
    "Telmore": { name: "Telmore", color: "#ff8b4a", logo: "T" },
    "CBB": { name: "CBB", color: "#a78bfa", logo: "C" }
  };
}

// Getter functions
export function getPlans() {
  return PLANS;
}

export function getStreamingServices() {
  return STREAMING_SERVICES;
}

export function getBrands() {
  return BRANDS;
}

export function getStreamingCategories() {
  return STREAMING_CATEGORIES;
}
