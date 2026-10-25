import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, User, Bot, ShoppingBag, Eye, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Product, ColorVariant } from '../../types';
import { formatCurrency } from '../../utils/format';

interface AIStylistWidgetProps {
  products: Product[];
  currency: 'PKR' | 'USD';
  exchangeRate: number;
  onLaunchTryOn: (product: Product) => void;
  onAddToCart: (product: Product, color: ColorVariant) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
  faceShapeResult?: string;
  recommendedProducts?: Product[];
}

export const AIStylistWidget: React.FC<AIStylistWidgetProps> = ({
  products,
  currency,
  exchangeRate,
  onLaunchTryOn,
  onAddToCart
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'stylist',
      text: 'Greetings. I am your Gemini-powered NEXT VISION Optical Stylist. I can diagnose your exact face shape, recommend precision frames, or guide you through prescription lens coatings.',
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isQuizMode]);

  // Quiz Questions
  const QUIZ_QUESTIONS = [
    {
      question: "What is the widest part of your face?",
      options: [
        { label: "Cheekbones", value: "cheekbones" },
        { label: "Forehead", value: "forehead" },
        { label: "Jawline", value: "jaw" },
        { label: "Equal proportion throughout", value: "equal" }
      ]
    },
    {
      question: "How would you describe your jawline?",
      options: [
        { label: "Soft and rounded", value: "round_jaw" },
        { label: "Sharp, square, or chiseled", value: "sharp_jaw" },
        { label: "Pointed or narrow chin", value: "pointed_chin" },
        { label: "Gently tapered", value: "tapered_jaw" }
      ]
    },
    {
      question: "What is your primary eyewear purpose?",
      options: [
        { label: "Daily Prescription Glasses", value: "prescription" },
        { label: "Computer Screen Blue-Light Defense", value: "computer" },
        { label: "Luxury UV400 Sunglasses", value: "sunglasses" },
        { label: "High-Fashion Statement Look", value: "fashion" }
      ]
    }
  ];

  const handleAnswerQuiz = (val: string) => {
    const updated = { ...quizAnswers, [quizStep]: val };
    setQuizAnswers(updated);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate Face Shape Diagnosis
      let diagnosedShape = "Oval";
      const jaw = updated[1];
      const widest = updated[0];

      if (widest === "cheekbones" && jaw === "sharp_jaw") {
        diagnosedShape = "Diamond";
      } else if (widest === "jaw" || jaw === "sharp_jaw") {
        diagnosedShape = "Square";
      } else if (widest === "forehead" || jaw === "pointed_chin") {
        diagnosedShape = "Heart";
      } else if (jaw === "round_jaw") {
        diagnosedShape = "Round";
      } else {
        diagnosedShape = "Oval";
      }

      setIsQuizMode(false);
      setQuizStep(0);
      setQuizAnswers({});

      // Send automated diagnosed query to AI
      handleSendStylistMessage(`Diagnose my face shape: I answered ${widest} as widest part and ${jaw}. My shape is ${diagnosedShape}. Recommend matching frames.`, diagnosedShape);
    }
  };

  const handleSendStylistMessage = async (customMessage?: string, explicitFaceShape?: string) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          faceShape: explicitFaceShape || undefined,
          userHistory: messages.map(m => ({ role: m.sender, content: m.text }))
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'stylist',
        text: data.reply || 'Here are my optical recommendations tailored for you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        faceShapeResult: explicitFaceShape,
        recommendedProducts: data.recommendedProducts || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Stylist request error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'stylist',
          text: 'I am experiencing a momentary network delay. Based on classic optical proportions, geometric and oval frames remain our most versatile bestsellers.',
          timestamp: 'Just now',
          recommendedProducts: products.slice(0, 2)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Eyewear Stylist"
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-luxury-950 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-champagne-500/50 group"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-champagne-500 rounded-full animate-ping"></span>
        </div>
        <span className="font-semibold text-xs tracking-wide pr-1">AI Stylist</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[640px] h-[82vh] bg-white rounded-2xl shadow-2xl border border-luxury-200 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="bg-luxury-950 text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-champagne-500/20 border border-champagne-500 text-gold flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm tracking-wide">NEXT VISION AI Stylist</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">
                    Gemini 2.0
                  </span>
                </div>
                <p className="text-[10px] text-luxury-300">Face-shape diagnosis & lens concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => { setIsQuizMode(!isQuizMode); setQuizStep(0); }}
                className="p-1.5 text-luxury-300 hover:text-white hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 transition-colors"
                title="Face Shape Quiz"
              >
                <HelpCircle className="w-4 h-4 text-gold" />
                <span className="text-[11px]">Quiz</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-luxury-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-luxury-50">
            
            {/* Interactive Face Shape Quiz Card */}
            {isQuizMode && (
              <div className="bg-white p-4 rounded-xl shadow-md border border-champagne-300 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-luxury-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" /> Face Shape Diagnostic
                  </span>
                  <span className="text-[10px] text-luxury-500 font-mono">
                    Step {quizStep + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                </div>
                <p className="text-xs font-medium text-luxury-800 mb-3">
                  {QUIZ_QUESTIONS[quizStep].question}
                </p>
                <div className="space-y-1.5">
                  {QUIZ_QUESTIONS[quizStep].options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswerQuiz(opt.value)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs bg-luxury-50 hover:bg-champagne-50 hover:border-champagne-500 border border-luxury-200 transition-all font-medium text-luxury-900"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'stylist' && (
                  <div className="w-7 h-7 rounded-full bg-luxury-950 text-gold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-luxury-950 text-white rounded-br-none'
                    : 'bg-white text-luxury-900 border border-luxury-200 rounded-bl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  
                  {/* Recommended Product Cards inside Chat */}
                  {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-luxury-100 space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-500">
                        Curated Recommendations:
                      </p>
                      {m.recommendedProducts.map(prod => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-luxury-50 border border-luxury-200 hover:border-luxury-400 transition-colors"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-12 h-10 object-cover rounded shrink-0 bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-[11px] text-luxury-950 truncate">
                              {prod.title}
                            </h5>
                            <p className="text-[10px] text-luxury-500">
                              {formatCurrency(prod.salePrice || prod.basePrice, currency, exchangeRate)} • {prod.frameShape}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                onLaunchTryOn(prod);
                                setIsOpen(false);
                              }}
                              className="px-2 py-1 bg-luxury-950 text-white rounded text-[10px] font-semibold hover:bg-luxury-800 flex items-center gap-1"
                              title="Try On in AR"
                            >
                              <Eye className="w-3 h-3 text-gold" /> Try
                            </button>
                            <button
                              onClick={() => onAddToCart(prod, prod.colors[0])}
                              className="p-1 text-luxury-700 hover:text-luxury-950 bg-white rounded border border-luxury-200"
                              title="Add to Cart"
                            >
                              <ShoppingBag className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="block text-[9px] text-luxury-400 mt-1 text-right">
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-luxury-200 text-luxury-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-luxury-400 bg-white px-3 py-2 rounded-full w-fit shadow-sm border border-luxury-200">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
                <span>Gemini Stylist is curating frames...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-luxury-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSendStylistMessage("What glasses suit a Round face?")}
              className="px-2.5 py-1 rounded-full bg-luxury-100 hover:bg-luxury-200 text-luxury-700 shrink-0 whitespace-nowrap"
            >
              Round Face Styles
            </button>
            <button
              onClick={() => handleSendStylistMessage("Tell me about Blue-Cut lenses for computer screens")}
              className="px-2.5 py-1 rounded-full bg-luxury-100 hover:bg-luxury-200 text-luxury-700 shrink-0 whitespace-nowrap"
            >
              Blue-Cut Lenses
            </button>
            <button
              onClick={() => handleSendStylistMessage("How does shipping across Pakistan work?")}
              className="px-2.5 py-1 rounded-full bg-luxury-100 hover:bg-luxury-200 text-luxury-700 shrink-0 whitespace-nowrap"
            >
              Shipping & Warranty
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendStylistMessage(); }}
            className="p-3 bg-white border-t border-luxury-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about face shapes, lenses, or frames..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-luxury-50 border border-luxury-200 rounded-xl focus:outline-none focus:border-luxury-950 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-luxury-950 hover:bg-luxury-800 disabled:opacity-40 text-white rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5 text-gold" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
