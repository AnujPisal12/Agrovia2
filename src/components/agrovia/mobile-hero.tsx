import { Sprout, Globe, Leaf } from 'lucide-react';

// Mobile-optimized hero for farmers on the go
const MobileAgroviaHero = () => (
  <div className="min-h-screen flex flex-col">
    {/* Compact header with quick actions */}
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">AgroVia</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-accent/10">
            <Globe className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            Login
          </button>
        </div>
      </div>
    </header>

    {/* Hero content */}
    <main className="flex-1 px-4 py-8">
      <div className="text-center mb-6">
        {/* Trust badge - mobile optimized */}
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Leaf className="w-4 h-4" />
          <span>5,000+ खेत भरोसा करते हैं</span>
        </div>
        
        {/* Headline - shorter for mobile */}
        <h1 className="text-4xl font-bold leading-tight mb-4">
          खेत से दुकान तक
          <br />
          <span className="text-primary">ताज़गी ट्रैक करें</span>
        </h1>
        
        {/* Subtitle - concise */}
        <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
          IoT सेंसर्स से फसल की गुणवत्ता जांचें और बेहतर दाम पाएं
        </p>
        
        {/* CTAs - stacked on mobile */}
        <div className="space-y-3">
          <button className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow">
            फ्री शुरू करें
          </button>
          <button className="w-full py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors">
            डेमो देखें
          </button>
        </div>
      </div>

      {/* Quick benefits - cards */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <BenefitCard icon="📈" value="+30%" label="ज्यादा कमाई" />
        <BenefitCard icon="🛡️" value="100%" label="सत्यापित" />
        <BenefitCard icon="⏱️" value="2 मिनट" label="सेटअप" />
        <BenefitCard icon="📱" value="आसान" label="उपयोग" />
      </div>
    </main>
  </div>
);

const BenefitCard = ({ icon, value, label }: {icon: string, value: string, label: string}) => (
  <div className="bg-card border rounded-lg p-4 text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-xl font-bold text-primary mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default MobileAgroviaHero;