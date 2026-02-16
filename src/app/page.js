import Link from 'next/link';
import { Leaf, Sprout, FlaskConical, Bug, Phone, MapPin, Clock, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-800 leading-tight">Magadh Krishi Kendra</h1>
              <p className="text-xs text-zinc-500 hidden sm:block">Your Trusted Agricultural Partner</p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
          >
            Login
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sprout className="w-4 h-4" />
              Serving Farmers Since Years
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-zinc-900 tracking-tight leading-tight">
              मगध कृषि केंद्र
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              MAGADH KRISHI KENDRA
            </h3>
            <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              आपका विश्वसनीय कृषि साथी — उच्च गुणवत्ता वाले <strong>खाद</strong>, <strong>बीज</strong>, और <strong>कीटनाशक</strong> एक ही छत के नीचे। हम किसानों की सेवा में सदैव तत्पर हैं।
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                व्यापार शुरू करें
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:9939408261"
                className="inline-flex items-center justify-center gap-2 bg-white text-zinc-700 px-8 py-3.5 rounded-xl font-bold text-lg border-2 border-zinc-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                हमें कॉल करें
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">हमारे उत्पाद</h2>
            <p className="mt-3 text-zinc-500 text-lg">सर्वोत्तम गुणवत्ता, उचित मूल्य</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Fertilizers */}
            <div className="group relative bg-gradient-to-b from-green-50 to-white rounded-2xl border border-green-100 p-8 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 mb-6">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">🧪 खाद (Fertilizers)</h3>
              <p className="text-zinc-600 leading-relaxed mb-4">
                DAP, Urea, MOP, NPK, SSP और अन्य सभी प्रकार की खाद उपलब्ध। सरकारी दर पर।
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">DAP</span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Urea</span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">MOP</span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">NPK</span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">SSP</span>
              </div>
            </div>

            {/* Seeds */}
            <div className="group relative bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-100 p-8 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">🌾 बीज (Seeds)</h3>
              <p className="text-zinc-600 leading-relaxed mb-4">
                प्रमाणित और उच्च उत्पादन वाले बीज — धान, गेहूं, मक्का, सरसों और सब्जियों के बीज।
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">धान</span>
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">गेहूं</span>
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">मक्का</span>
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">सरसों</span>
              </div>
            </div>

            {/* Pesticides */}
            <div className="group relative bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100 p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
                <Bug className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">🛡️ कीटनाशक (Pesticides)</h3>
              <p className="text-zinc-600 leading-relaxed mb-4">
                सभी प्रकार के कीटनाशक, फफूंदनाशक और खरपतवारनाशक। फसल सुरक्षा की पूरी रेंज।
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">कीटनाशक</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">फफूंदनाशक</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">खरपतवारनाशक</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">हमें क्यों चुनें?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '✅', title: 'प्रमाणित उत्पाद', desc: 'सरकार द्वारा मान्यता प्राप्त' },
              { emoji: '💰', title: 'उचित मूल्य', desc: 'MRP पर या उससे कम' },
              { emoji: '🚛', title: 'समय पर डिलीवरी', desc: 'खेत तक पहुँचाएं' },
              { emoji: '🤝', title: 'विश्वसनीय सेवा', desc: 'किसानों का भरोसा' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-zinc-900 mb-1">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer className="bg-zinc-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Magadh Krishi Kendra</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                GST No. - 10BKAPP5036Q1Z2<br />
                आपका विश्वसनीय कृषि साथी
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">संपर्क करें</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Phone className="w-4 h-4 text-green-400" />
                  <a href="tel:9939408261" className="hover:text-green-400 transition-colors">9939408261</a>
                </div>
                <div className="flex items-start gap-3 text-zinc-400">
                  <MapPin className="w-4 h-4 text-green-400 mt-1" />
                  <span>Near River Side, Sobh</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span>सोमवार - शनिवार, सुबह 8 बजे - शाम 7 बजे</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">त्वरित लिंक</h4>
              <div className="space-y-2">
                <Link href="/login" className="block text-zinc-400 hover:text-green-400 transition-colors text-sm">
                  🔑 Admin Login
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Magadh Krishi Kendra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
