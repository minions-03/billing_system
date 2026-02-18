import Link from 'next/link';
import { Leaf, Sprout, FlaskConical, Bug, Phone, MapPin, Clock, ChevronRight, Star, Truck, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const marqueeItems = [
    '🌾 DAP खाद उपलब्ध — सीमित स्टॉक!',
    '🧪 UREA & MOP — सरकारी दर पर',
    '🌱 नई फसल के लिए प्रमाणित बीज आ गए',
    '🌻 सरसों बीज — हाई यील्ड वैरायटी उपलब्ध',
    '🛡️ कीटनाशक पर विशेष ऑफर — आज ही लें',
    '🚛 50 बैग से अधिक ऑर्डर पर FREE डिलीवरी',
    '📞 संपर्क करें: 9939408261',
  ];

  const products = [
    {
      icon: <FlaskConical className="w-7 h-7 text-white" />,
      bg: 'from-green-400 to-green-600',
      shadow: 'shadow-green-500/20',
      border: 'border-green-100',
      cardBg: 'from-green-50',
      tagBg: 'bg-green-100 text-green-700',
      title: '🧪 खाद (Fertilizers)',
      desc: 'DAP, Urea, MOP, NPK, SSP और अन्य सभी प्रकार की खाद उपलब्ध। सरकारी दर पर।',
      tags: ['DAP', 'Urea', 'MOP', 'NPK', 'SSP', 'ATS'],
    },
    {
      icon: <Sprout className="w-7 h-7 text-white" />,
      bg: 'from-amber-400 to-amber-600',
      shadow: 'shadow-amber-500/20',
      border: 'border-amber-100',
      cardBg: 'from-amber-50',
      tagBg: 'bg-amber-100 text-amber-700',
      title: '🌾 बीज (Seeds)',
      desc: 'प्रमाणित और उच्च उत्पादन वाले बीज — धान, गेहूं, मक्का, सरसों और सब्जियों के बीज।',
      tags: ['धान', 'गेहूं', 'मक्का', 'सरसों', 'सब्जी बीज'],
    },
    {
      icon: <Bug className="w-7 h-7 text-white" />,
      bg: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/20',
      border: 'border-blue-100',
      cardBg: 'from-blue-50',
      tagBg: 'bg-blue-100 text-blue-700',
      title: '🛡️ कीटनाशक (Pesticides)',
      desc: 'सभी प्रकार के कीटनाशक, फफूंदनाशक और खरपतवारनाशक। फसल सुरक्षा की पूरी रेंज।',
      tags: ['कीटनाशक', 'फफूंदनाशक', 'खरपतवारनाशक'],
    },
  ];

  const whyUs = [
    { emoji: '✅', title: 'प्रमाणित उत्पाद', desc: 'सरकार द्वारा मान्यता प्राप्त' },
    { emoji: '💰', title: 'उचित मूल्य', desc: 'MRP पर या उससे कम' },
    { emoji: '🤝', title: 'विश्वसनीय सेवा', desc: 'किसानों का भरोसा' },
    { emoji: '📞', title: '24/7 सहायता', desc: 'हमेशा आपके साथ' },
    { emoji: '🏆', title: '25+ वर्षों का अनुभव', desc: 'भरोसेमंद पहचान' },
  ];

  const testimonials = [
    { name: 'रामेश्वर प्रसाद', village: 'सोभ, गया', text: 'यहाँ से DAP और Urea लेते हैं, हमेशा सही दाम और अच्छी क्वालिटी मिलती है।', stars: 5 },
    { name: 'सुरेश कुमार', village: 'बोधगया', text: 'बीज बहुत अच्छे हैं, इस बार धान की फसल बहुत अच्छी हुई। धन्यवाद!', stars: 5 },
    { name: 'मोहन लाल', village: 'टेकारी', text: 'कीटनाशक सही समय पर मिल गया, फसल बच गई। बहुत अच्छी सेवा है।', stars: 5 },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Marquee Ad Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="inline-block px-8 text-sm font-medium">
              {item} <span className="text-green-300 mx-4">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-800 leading-tight">Magadh Krishi Kendra</h1>
              <p className="text-xs text-green-600 font-medium hidden sm:block">✦ Your Trusted Agricultural Partner ✦</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:9939408261" className="hidden sm:flex items-center gap-2 text-sm text-zinc-600 font-medium hover:text-green-600 transition-colors">
              <Phone className="w-4 h-4" /> 9939408261
            </a>
            <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
              Login <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-200 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-200 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-green-200">
              <Sprout className="w-4 h-4" /> किसानों की सेवा में सदैव तत्पर
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-zinc-900 tracking-tight leading-tight">
              मगध कृषि केंद्र
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-600 mt-3 tracking-wide">
              MAGADH KRISHI KENDRA
            </h3>
            <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              आपका विश्वसनीय कृषि साथी — उच्च गुणवत्ता वाले <strong className="text-green-700">खाद</strong>, <strong className="text-amber-600">बीज</strong>, और <strong className="text-blue-600">कीटनाशक</strong> एक ही छत के नीचे।
            </p>

            {/* Stats Strip */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { val: '500+', label: 'किसान परिवार' },
                { val: '25+', label: 'वर्षों का अनुभव' },
                { val: '100+', label: 'उत्पाद उपलब्ध' },
              ].map((s, i) => (
                <div key={i} className="bg-white/80 backdrop-blur rounded-2xl border border-green-100 p-4 shadow-sm">
                  <div className="text-2xl font-black text-green-600">{s.val}</div>
                  <div className="text-xs text-zinc-500 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
                व्यापार शुरू करें <ChevronRight className="w-5 h-5" />
              </Link>
              <a href="tel:9939408261" className="inline-flex items-center justify-center gap-2 bg-white text-zinc-700 px-8 py-4 rounded-xl font-bold text-lg border-2 border-zinc-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300">
                <Phone className="w-5 h-5 text-green-600" /> हमें कॉल करें
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900">हमारे उत्पाद</h2>
            <p className="mt-3 text-zinc-500 text-lg">सर्वोत्तम गुणवत्ता, उचित मूल्य — हर किसान के लिए</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <div key={i} className={`group relative bg-gradient-to-b ${p.cardBg} to-white rounded-2xl border ${p.border} p-7 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 bg-gradient-to-br ${p.bg} rounded-2xl flex items-center justify-center shadow-lg ${p.shadow} mb-5`}>
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{p.title}</h3>
                <p className="text-zinc-600 leading-relaxed mb-4 text-sm">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag, j) => (
                    <span key={j} className={`${p.tagBg} text-xs font-semibold px-3 py-1 rounded-full`}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900">हमें क्यों चुनें?</h2>
            <p className="mt-3 text-zinc-500 text-lg">हजारों किसानों का विश्वास</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300">
                <div className="text-3xl shrink-0">{item.emoji}</div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">{item.title}</h3>
                  <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900">किसानों की राय</h2>
            <p className="mt-3 text-zinc-500 text-lg">हमारे ग्राहक ही हमारी पहचान हैं</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gradient-to-b from-green-50 to-white rounded-2xl border border-green-100 p-7 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-700 leading-relaxed text-sm mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.village}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">आज ही संपर्क करें!</h2>
          <p className="text-green-100 text-lg mb-8">सर्वोत्तम कृषि उत्पाद, उचित मूल्य पर — हम आपकी सेवा के लिए तैयार हैं।</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:9939408261" className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-8 py-4 rounded-xl font-black text-lg hover:bg-green-50 transition-colors shadow-xl">
              <Phone className="w-5 h-5" /> 9939408261
            </a>
            <a href="https://maps.google.com" target="_blank" className="inline-flex items-center justify-center gap-2 bg-green-500/30 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-500/50 transition-colors">
              <MapPin className="w-5 h-5" /> दुकान का पता देखें
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black">Magadh Krishi Kendra</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                GST No. — 10BKAPP5036Q1Z2<br />
                आपका विश्वसनीय कृषि साथी<br />
                <span className="text-green-400 font-medium">किसान पहले, हमेशा।</span>
              </p>
              <div className="mt-4 flex gap-2">
                <span className="bg-green-900/50 text-green-400 text-xs px-3 py-1 rounded-full border border-green-800">✅ सरकार मान्यता प्राप्त</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">संपर्क करें</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Phone className="w-4 h-4 text-green-400 shrink-0" />
                  <a href="tel:9939408261" className="hover:text-green-400 transition-colors font-medium">9939408261</a>
                </div>
                <div className="flex items-start gap-3 text-zinc-400">
                  <MapPin className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                  <span>Near River Side, Sobh, Gaya, Bihar</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Clock className="w-4 h-4 text-green-400 shrink-0" />
                  <span>सोमवार - शनिवार, सुबह 8 बजे - शाम 7 बजे</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Truck className="w-4 h-4 text-green-400 shrink-0" />
                  <span>होम डिलीवरी उपलब्ध</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">त्वरित लिंक</h4>
              <div className="space-y-2">
                <Link href="/login" className="flex items-center gap-2 text-zinc-400 hover:text-green-400 transition-colors text-sm">
                  <ShieldCheck className="w-4 h-4" /> Admin Login
                </Link>
                <a href="tel:9939408261" className="flex items-center gap-2 text-zinc-400 hover:text-green-400 transition-colors text-sm">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
              <div className="mt-6 p-4 bg-green-900/30 rounded-xl border border-green-800">
                <p className="text-green-400 text-xs font-semibold mb-1">🌾 आज का ऑफर</p>
                <p className="text-white text-sm font-bold">DAP — 50 बैग पर ₹50/बैग छूट</p>
                <a href="tel:9939408261" className="mt-2 inline-flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                  <Phone className="w-3 h-3" /> अभी बुक करें
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} Magadh Krishi Kendra. All rights reserved. | किसानों के लिए, किसानों द्वारा।
          </div>
        </div>
      </footer>

    </div>
  );
}
