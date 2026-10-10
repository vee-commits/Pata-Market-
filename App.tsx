import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, PlusCircle, User, Heart, Home, Grid, Filter, ShieldCheck, 
  Smartphone, Award, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag, 
  Settings, LogOut, Check, X, RefreshCw, Phone, MessageSquare, ExternalLink,
  Lock, ArrowLeft, Eye, Trash2, Edit3, DollarSign, List, Info, FileText
} from 'lucide-react';

// Categories Database Seed
const CATEGORIES = [
  { id: 'fashion', name: 'Fashion & Clothing', icon: '👔', slug: 'fashion' },
  { id: 'electronics', name: 'Phones & Electronics', icon: '📱', slug: 'electronics' },
  { id: 'home', name: 'Home & Furniture', icon: '🛋️', slug: 'home' },
  { id: 'beauty', name: 'Beauty & Personal Care', icon: '💄', slug: 'beauty' },
  { id: 'food', name: 'Food & Groceries', icon: '🍎', slug: 'food' },
  { id: 'services', name: 'Business & Professional Services', icon: '💼', slug: 'services' },
  { id: 'construction', name: 'Construction & Hardware', icon: '🏗️', slug: 'construction' },
  { id: 'stationery', name: 'Stationery & Office Supplies', icon: '📦', slug: 'stationery' },
  { id: 'kids', name: 'Baby & Children Products', icon: '🧸', slug: 'kids' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', slug: 'automotive' },
  { id: 'agriculture', name: 'Agriculture', icon: '🌾', slug: 'agriculture' },
  { id: 'events', name: 'Events & Entertainment', icon: '🎉', slug: 'events' },
  { id: 'education', name: 'Education & Training', icon: '📚', slug: 'education' },
  { id: 'sports', name: 'Sports & Fitness', icon: '⚽', slug: 'sports' },
  { id: 'other', name: 'Other Products & Services', icon: '🛠️', slug: 'other' }
];

// Initial Listings Demo Data with Coordinates in Kenya
const INITIAL_LISTINGS = [
  {
    id: '1',
    seller_id: 's1',
    seller_name: 'Nairobi Tech Supplies',
    title: 'Samsung Galaxy A25 5G - Brand New Sealed',
    description: '128GB Storage, 6GB RAM, Dual SIM. Comes with 1 year warranty. Unopened box.',
    category_id: 'electronics',
    price: 24500,
    condition: 'New',
    image_urls: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80'],
    county: 'Nairobi',
    town: 'CBD',
    latitude: -1.286389,
    longitude: 36.817223,
    availability: 'In Stock',
    contact_phone: '0712345678',
    whatsapp_phone: '254712345678',
    created_at: '2026-10-01'
  },
  {
    id: '2',
    seller_id: 's2',
    seller_name: 'Mama Mboga Fresh Direct',
    title: 'Fresh Grade A Avocadoes (Export Quality - 50kg Bag)',
    description: 'Farm fresh Hass avocadoes harvested directly from Murang\'a. Wholesale price.',
    category_id: 'agriculture',
    price: 3200,
    condition: 'Fresh',
    image_urls: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80'],
    county: 'Kiambu',
    town: 'Thika',
    latitude: -1.03326,
    longitude: 37.06933,
    availability: 'In Stock',
    contact_phone: '0722001122',
    whatsapp_phone: '254722001122',
    created_at: '2026-10-05'
  },
  {
    id: '3',
    seller_id: 's3',
    seller_name: 'Vee Custom Tailors',
    title: 'Men\'s Tailored Executive Suit (3-Piece)',
    description: 'Custom fitted executive suit. High-quality wool blend fabric. Fits size 40-42.',
    category_id: 'fashion',
    price: 8500,
    condition: 'New',
    image_urls: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80'],
    county: 'Nairobi',
    town: 'Kawangware',
    latitude: -1.2833,
    longitude: 36.7500,
    availability: 'In Stock',
    contact_phone: '0799887766',
    whatsapp_phone: '254799887766',
    created_at: '2026-10-08'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'nearby' | 'favourites' | 'account' | 'seller_register' | 'seller_dashboard' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(25); // km
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  
  // Seller Registration Form State
  const [sellerForm, setSellerForm] = useState({
    businessName: '',
    description: '',
    category: 'electronics',
    contactPhone: '',
    whatsappPhone: '',
    county: 'Nairobi',
    town: 'CBD',
    transactionCode: ''
  });
  
  const [isSellerPaid, setIsSellerPaid] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  // Geolocation Handler
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setActiveTab('nearby');
        },
        (error) => {
          alert("Location access denied or unavailable. You can still search by County and Town.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Distance Calculator (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const toggleFavourite = (id: string) => {
    setFavourites(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.transactionCode || sellerForm.transactionCode.length < 8) {
      alert("Please enter a valid M-Pesa Transaction Code (e.g., QJK889212).");
      return;
    }
    
    // Add to pending payments queue
    const newPayment = {
      id: Date.now().toString(),
      sellerName: sellerForm.businessName,
      phone: sellerForm.contactPhone,
      code: sellerForm.transactionCode.toUpperCase(),
      amount: 200,
      date: new Date().toISOString()
    };

    setPendingPayments([...pendingPayments, newPayment]);
    setPaymentPending(true);
    alert("Payment Claim Submitted! An administrator will verify M-Pesa Till 8221168 records.");
  };

  const approvePayment = (id: string) => {
    setPendingPayments(pendingPayments.filter(p => p.id !== id));
    setIsSellerPaid(true);
    setUserRole('seller');
    setPaymentPending(false);
    alert("Seller approved! Business activated.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-emerald-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-amber-400">PATA MARKET</h1>
            <p className="text-xs text-emerald-100 italic">Pata Unachotafuta. Uza Unachonacho.</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setUserRole(userRole === 'admin' ? 'buyer' : 'admin')}
              className="text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-200 px-2.5 py-1 rounded border border-emerald-600"
            >
              {userRole === 'admin' ? 'Exit Admin' : 'Admin Mode'}
            </button>
            <button 
              onClick={() => setActiveTab('seller_register')}
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Item</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search products, services, towns in Kenya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-emerald-950 text-white placeholder-emerald-300 text-sm rounded-lg border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-3" />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4">
        {/* HOMEPAGE */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Geolocation Banner */}
            <div className="bg-emerald-800 text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-amber-300">Find Items Near You</h3>
                <p className="text-xs text-emerald-100 mt-0.5">Use GPS to see products in your town or county.</p>
              </div>
              <button 
                onClick={requestLocation}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Near Me</span>
              </button>
            </div>

            {/* Categories Horizontal Scroll */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Browse Categories</h2>
                <button onClick={() => setActiveTab('categories')} className="text-xs text-emerald-800 font-medium">View All</button>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.slice(0, 7).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setActiveTab('categories'); }}
                    className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-xl min-w-[85px] shadow-sm hover:border-emerald-600 transition"
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-[11px] font-medium text-gray-700 text-center line-clamp-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Listings Grid */}
            <div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Featured Kenya Listings</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listings
                  .filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.county.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="relative">
                        <img src={item.image_urls[0]} alt={item.title} className="w-full h-32 object-cover" />
                        <button 
                          onClick={() => toggleFavourite(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-gray-600 hover:text-red-500"
                        >
                          <Heart className={`w-4 h-4 ${favourites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <span className="absolute bottom-2 left-2 text-[10px] bg-emerald-900/80 text-white px-1.5 py-0.5 rounded backdrop-blur">
                          {item.county}, {item.town}
                        </span>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-xs text-gray-900 line-clamp-2">{item.title}</h3>
                          <p className="text-amber-600 font-bold text-sm mt-1">KSh {item.price.toLocaleString()}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <button 
                            onClick={() => setSelectedListing(item)}
                            className="w-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs py-1.5 font-semibold rounded text-center"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* NEARBY SEARCH */}
        {activeTab === 'nearby' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="font-bold text-gray-900 text-sm mb-2 flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Geographic Distance Search</span>
              </h2>
              <p className="text-xs text-gray-600 mb-3">
                {userLocation ? `Location detected: (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : 'Click below to grant location access.'}
              </p>

              {!userLocation ? (
                <button 
                  onClick={requestLocation}
                  className="w-full bg-emerald-800 text-white font-semibold text-xs py-2 rounded-lg"
                >
                  Enable GPS Location
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-gray-700">Radius:</label>
                  <select 
                    value={maxDistance} 
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="text-xs border border-gray-300 rounded p-1"
                  >
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km</option>
                    <option value={50}>Within 50 km</option>
                  </select>
                </div>
              )}
            </div>

            {/* Nearby Results */}
            <div className="space-y-3">
              {userLocation && listings.map((item) => {
                const dist = calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
                if (dist > maxDistance) return null;
                return (
                  <div key={item.id} className="bg-white p-3 border border-gray-200 rounded-xl flex space-x-3 items-center">
                    <img src={item.image_urls[0]} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs text-gray-900">{item.title}</h3>
                      <p className="text-amber-600 font-bold text-sm mt-0.5">KSh {item.price.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        📍 Approx. <span className="font-semibold text-emerald-800">{dist} km</span> away in {item.town}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SELLER REGISTRATION & M-PESA TILL 8221168 PAYMENT */}
        {activeTab === 'seller_register' && (
          <div className="max-w-md mx-auto bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-emerald-950">Become a Verified Seller</h2>
              <p className="text-xs text-gray-600">Sell products & services across Kenya on Pata Market.</p>
            </div>

            <form onSubmit={handleSellerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Business / Seller Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Vee Tech Accessories" 
                  value={sellerForm.businessName}
                  onChange={(e) => setSellerForm({...sellerForm, businessName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Contact Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="0712345678" 
                  value={sellerForm.contactPhone}
                  onChange={(e) => setSellerForm({...sellerForm, contactPhone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2 text-amber-900">
                <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>One-Time Registration Fee: KSh 200</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  To keep buyers safe from fraud, all sellers pay a one-time activation fee.
                </p>
                <ol className="list-decimal list-inside text-[11px] space-y-1 font-medium bg-amber-100/50 p-2 rounded">
                  <li>Open M-Pesa on your phone</li>
                  <li>Select <strong>Lipa Na M-Pesa</strong> &gt; <strong>Buy Goods & Services</strong></li>
                  <li>Enter Till Number: <strong className="text-emerald-900 font-bold">8221168</strong></li>
                  <li>Amount: <strong>KSh 200</strong></li>
                  <li>Enter code below:</li>
                </ol>

                <div className="pt-1">
                  <input 
                    type="text" 
                    required
                    placeholder="M-Pesa Code (e.g. QJK889212)" 
                    value={sellerForm.transactionCode}
                    onChange={(e) => setSellerForm({...sellerForm, transactionCode: e.target.value})}
                    className="w-full p-2 border border-amber-300 rounded-lg bg-white uppercase font-mono text-center font-bold text-emerald-950"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-lg transition"
              >
                Submit Payment Verification
              </button>
            </form>
          </div>
        )}

        {/* ADMIN MODERATION PANEL */}
        {userRole === 'admin' && activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="bg-emerald-950 text-white p-4 rounded-xl">
              <h2 className="font-bold text-amber-400 text-sm">Pata Market Administrator Suite</h2>
              <p className="text-xs text-emerald-200">Review M-Pesa Till 8221168 payments and moderate listings.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-xs uppercase tracking-wide text-gray-700 mb-2">Pending Till Payment Verification</h3>
              {pendingPayments.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No pending payment claims to review.</p>
              ) : (
                <div className="space-y-2">
                  {pendingPayments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                      <div>
                        <p className="font-bold text-xs text-gray-900">{p.sellerName} ({p.phone})</p>
                        <p className="text-[11px] font-mono text-emerald-800">Code: {p.code} | Amount: KSh {p.amount}</p>
                      </div>
                      <button 
                        onClick={() => approvePayment(p.id)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-1 rounded font-semibold"
                      >
                        Verify & Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">All Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setActiveTab('home'); }}
                  className="bg-white p-3 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-600"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-semibold text-gray-800">{cat.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{selectedListing.title}</h3>
              <button onClick={() => setSelectedListing(null)} className="p-1 rounded-full bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <img src={selectedListing.image_urls[0]} alt="" className="w-full h-48 object-cover rounded-xl" />

            <div>
              <p className="text-amber-600 font-extrabold text-lg">KSh {selectedListing.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Location: {selectedListing.town}, {selectedListing.county} County</p>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <p className="text-xs font-semibold text-gray-700">Description</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedListing.description}</p>
            </div>

            <div className="pt-2 flex space-x-2">
              <a 
                href={`tel:${selectedListing.contact_phone}`}
                className="flex-1 bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Seller</span>
              </a>
              {selectedListing.whatsapp_phone && (
                <a 
                  href={`https://wa.me/${selectedListing.whatsapp_phone}?text=Hi, I am interested in ${encodeURIComponent(selectedListing.title)} on Pata Market.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-0.5 ${activeTab === 'home' ? 'text-emerald-800 font-bold' : 'text-gray-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center space-y-0.5 ${activeTab === 'categories' ? 'text-emerald-800 font-bold' : 'text-gray-500'}`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px]">Categories</span>
          </button>

          <button 
            onClick={() => setActiveTab('nearby')}
            className={`flex flex-col items-center space-y-0.5 ${activeTab === 'nearby' ? 'text-emerald-800 font-bold' : 'text-gray-500'}`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px]">Nearby</span>
          </button>

          <button 
            onClick={() => setActiveTab('seller_register')}
            className={`flex flex-col items-center space-y-0.5 ${activeTab === 'seller_register' ? 'text-emerald-800 font-bold' : 'text-gray-500'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px]">Sell</span>
          </button>

          {userRole === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center space-y-0.5 ${activeTab === 'admin' ? 'text-emerald-800 font-bold' : 'text-gray-500'}`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px]">Admin</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
