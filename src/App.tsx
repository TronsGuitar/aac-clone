import React, { useState, useRef, useEffect } from 'react';
import { Home, Share, Delete, Trash2, Volume2 } from 'lucide-react';

export default function App() {
  const [sentence, setSentence] = useState([]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const sentenceEndRef = useRef(null);
  const reqRef = useRef(null);
  const startTimeRef = useRef(null);
  const utteranceRef = useRef(null); // Prevents garbage collection of the utterance

  const DWELL_TIME = 800; // 0.8 seconds to trigger the button

  // 1. Audio Unblocker & Voice Loader
  useEffect(() => {
    // Load voices so they are ready
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      
      // Some browsers require speech to be triggered by a direct 
      // user interaction first before it can be used inside a timer/async function.
      const unlockAudio = () => {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
        document.removeEventListener('pointerdown', unlockAudio);
      };
      
      document.addEventListener('pointerdown', unlockAudio);
      return () => document.removeEventListener('pointerdown', unlockAudio);
    }
  }, []);

  // 2. Auto-scroll sentence bar
  useEffect(() => {
    if (sentenceEndRef.current) {
      sentenceEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sentence]);

  // 3. Robust Speak Function
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;

    // Only cancel if it's currently speaking to avoid mobile browser bugs
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower
    utterance.volume = 1;

    // Try to grab a default English voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const enVoice = voices.find(v => v.lang.startsWith('en') && v.default) || 
                      voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    // Save to ref so it doesn't get garbage collected mid-speech
    utteranceRef.current = utterance; 
    window.speechSynthesis.speak(utterance);
  };

  // 4. Word Click Handler
  const handleWordClick = (item) => {
    speak(item.word);
    setSentence(prev => [...prev, item]);
  };

  const handleSpeakSentence = () => {
    if (sentence.length > 0) {
      const fullText = sentence.map((s) => s.word).join(' ');
      speak(fullText);
    }
  };

  const handleDelete = () => setSentence(sentence.slice(0, -1));
  const handleClear = () => setSentence([]);

  // 5. Dwell Timer Logic
  const startTimer = (index, item, e) => {
    // Ignore non-primary mouse clicks (like right-click)
    if (e && e.button !== 0 && e.pointerType === 'mouse') return;
    
    cancelTimer(); // Reset any existing timers
    
    setActiveIdx(index);
    setProgress(0);
    startTimeRef.current = performance.now();

    const animate = (time) => {
      if (!startTimeRef.current) return; 
      
      const elapsed = time - startTimeRef.current;
      const newProgress = Math.min((elapsed / DWELL_TIME) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= DWELL_TIME) {
        // Timer completed!
        handleWordClick(item);
        cancelTimer();
      } else {
        reqRef.current = requestAnimationFrame(animate);
      }
    };
    reqRef.current = requestAnimationFrame(animate);
  };

  const cancelTimer = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    startTimeRef.current = null;
    setActiveIdx(null);
    setProgress(0);
  };

  // 60-Word Core Vocabulary Grid
  const aacData = [
    // Column 1 - Pronouns (Orange)
    { word: 'I', icon: '👤', bg: 'bg-[#facba5]' },
    { word: 'you', icon: '👉', bg: 'bg-[#facba5]' },
    { word: 'it', icon: '📦', bg: 'bg-[#facba5]' },
    { word: 'this', icon: '👇', bg: 'bg-[#facba5]' },
    { word: 'that', icon: '👉📦', bg: 'bg-[#facba5]' },
    { word: 'we', icon: '👥', bg: 'bg-[#facba5]' },
    
    // Column 2 - Verbs 1 (Pink)
    { word: 'is', icon: '➖', bg: 'bg-[#f7b2cb]' },
    { word: 'do', icon: '✅', bg: 'bg-[#f7b2cb]' },
    { word: 'have', icon: '🤲', bg: 'bg-[#f7b2cb]' },
    { word: 'can', icon: '👍', bg: 'bg-[#f7b2cb]' },
    { word: 'see', icon: '👁️', bg: 'bg-[#f7b2cb]' },
    { word: 'will', icon: '➡️', bg: 'bg-[#f7b2cb]' },

    // Column 3 - Verbs 2 (Pink)
    { word: 'go', icon: '🏃', bg: 'bg-[#f7b2cb]' },
    { word: 'want', icon: '🙏', bg: 'bg-[#f7b2cb]' },
    { word: 'like', icon: '❤️', bg: 'bg-[#f7b2cb]' },
    { word: 'get', icon: '✊', bg: 'bg-[#f7b2cb]' },
    { word: 'help', icon: '🤝', bg: 'bg-[#f7b2cb]' },
    { word: 'stop', icon: '🛑', bg: 'bg-[#f7b2cb]' },

    // Column 4 - Prepositions (Green)
    { word: 'to', icon: '🎯', bg: 'bg-[#c2f2ce]' },
    { word: 'in', icon: '📥', bg: 'bg-[#c2f2ce]' },
    { word: 'on', icon: '🔛', bg: 'bg-[#c2f2ce]' },
    { word: 'for', icon: '🎁', bg: 'bg-[#c2f2ce]' },
    { word: 'up', icon: '⬆️', bg: 'bg-[#c2f2ce]' },
    { word: 'with', icon: '🔗', bg: 'bg-[#c2f2ce]' },

    // Column 5 - Modifiers (Blue)
    { word: 'not', icon: '❌', bg: 'bg-[#bde2f4]' },
    { word: 'more', icon: '➕', bg: 'bg-[#bde2f4]' },
    { word: 'good', icon: '👍', bg: 'bg-[#bde2f4]' },
    { word: 'now', icon: '⏱️', bg: 'bg-[#bde2f4]' },
    { word: 'different', icon: '🔀', bg: 'bg-[#bde2f4]' },
    { word: 'finished', icon: '🏁', bg: 'bg-[#bde2f4]' },

    // Column 6 - Questions (Purple)
    { word: 'what', icon: '❓', bg: 'bg-[#dfc7f5]' },
    { word: 'how', icon: '🤷', bg: 'bg-[#dfc7f5]' },
    { word: 'when', icon: '🕒', bg: 'bg-[#dfc7f5]' },
    { word: 'where', icon: '🗺️', bg: 'bg-[#dfc7f5]' },
    { word: 'who', icon: '👤', bg: 'bg-[#dfc7f5]' },
    { word: 'why', icon: '🤔', bg: 'bg-[#dfc7f5]' },

    // Column 7 - Social (Purple)
    { word: 'yes', icon: '✅', bg: 'bg-[#dfc7f5]' },
    { word: 'no', icon: '🚫', bg: 'bg-[#dfc7f5]' },
    { word: 'please', icon: '🥺', bg: 'bg-[#dfc7f5]' },
    { word: 'thanks', icon: '🙌', bg: 'bg-[#dfc7f5]' },
    { word: 'hi', icon: '👋', bg: 'bg-[#dfc7f5]' },
    { word: 'bye', icon: '👋', bg: 'bg-[#dfc7f5]' },

    // Column 8 - Nouns 1 (Yellow)
    { word: 'People', icon: '👨‍👩‍👧‍👦', bg: 'bg-[#fdf0a6]' },
    { word: 'Time', icon: '⌚', bg: 'bg-[#fdf0a6]' },
    { word: 'Food', icon: '🍎', bg: 'bg-[#fdf0a6]' },
    { word: 'Places', icon: '🏠', bg: 'bg-[#fdf0a6]' },
    { word: 'Things', icon: '🧸', bg: 'bg-[#fdf0a6]' },
    { word: 'Body', icon: '🦵', bg: 'bg-[#fdf0a6]' },

    // Column 9 - Nouns 2 (Yellow)
    { word: 'Color', icon: '🎨', bg: 'bg-[#fdf0a6]' },
    { word: 'Number', icon: '🔢', bg: 'bg-[#fdf0a6]' },
    { word: 'Shape', icon: '🔺', bg: 'bg-[#fdf0a6]' },
    { word: 'Animal', icon: '🐶', bg: 'bg-[#fdf0a6]' },
    { word: 'Vehicle', icon: '🚗', bg: 'bg-[#fdf0a6]' },
    { word: 'Clothes', icon: '👕', bg: 'bg-[#fdf0a6]' },

    // Column 10 - Adjectives (Blue)
    { word: 'Big', icon: '🐘', bg: 'bg-[#bde2f4]' },
    { word: 'Small', icon: '🐁', bg: 'bg-[#bde2f4]' },
    { word: 'Hot', icon: '🔥', bg: 'bg-[#bde2f4]' },
    { word: 'Cold', icon: '❄️', bg: 'bg-[#bde2f4]' },
    { word: 'Happy', icon: '😊', bg: 'bg-[#bde2f4]' },
    { word: 'Sad', icon: '😢', bg: 'bg-[#bde2f4]' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8efe6] font-sans selection:bg-transparent overflow-hidden">
      
      {/* Top Navigation & Sentence Strip */}
      <div className="flex flex-row items-center justify-between p-3 gap-3 bg-[#f8efe6] shrink-0">
        
        <button className="flex items-center justify-center p-3 sm:p-4 bg-white rounded-2xl shadow-sm text-blue-500 hover:bg-gray-50 active:scale-95 transition-all h-14 w-14 sm:h-16 sm:w-16 shrink-0">
          <Home size={28} strokeWidth={2.5} />
        </button>

        {/* Sentence Display Window */}
        <div className="flex-1 flex flex-row items-center bg-white rounded-2xl shadow-sm h-14 sm:h-16 border border-gray-100 px-2 overflow-hidden relative">
          
          <div className="flex-1 flex flex-row items-center overflow-x-auto overflow-y-hidden no-scrollbar h-full px-2">
            {sentence.length === 0 && (
              <span className="text-gray-400 italic text-sm sm:text-base ml-2">Build your sentence here...</span>
            )}
            
            {sentence.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-center min-w-[3rem] sm:min-w-[4rem] mx-1">
                <span className="text-xl sm:text-2xl leading-none">{item.icon}</span>
                <span className="text-[10px] sm:text-xs font-medium text-gray-800 mt-1 truncate">{item.word}</span>
              </div>
            ))}
            <div ref={sentenceEndRef} />
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-gray-100 bg-white z-10">
            <button 
              onClick={handleSpeakSentence}
              className="p-2 sm:p-3 text-green-600 hover:bg-green-50 rounded-xl active:scale-95 transition-all"
              title="Speak entire sentence"
            >
              <Volume2 size={22} strokeWidth={2.5} />
            </button>
            <button className="p-2 sm:p-3 text-gray-700 hover:bg-gray-50 rounded-xl active:scale-95 transition-all">
              <Share size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <button 
          onClick={handleDelete}
          className="flex items-center justify-center p-3 sm:p-4 bg-white rounded-2xl shadow-sm text-blue-500 hover:bg-gray-50 active:scale-95 transition-all h-14 w-14 sm:h-16 sm:w-16 shrink-0"
        >
          <Delete size={28} strokeWidth={2.5} />
        </button>

        <button 
          onClick={handleClear}
          className="flex items-center justify-center p-3 sm:p-4 bg-[#e2eff7] rounded-2xl shadow-sm text-blue-600 hover:bg-blue-100 active:scale-95 transition-all h-14 w-14 sm:h-16 sm:w-16 shrink-0"
        >
          <Trash2 size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Main AAC Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 pb-4">
        <div className="grid grid-rows-6 grid-flow-col gap-2 sm:gap-3 h-full min-w-[900px]">
          
          {aacData.map((item, index) => (
            <button
              key={index}
              onPointerDown={(e) => startTimer(index, item, e)}
              onPointerUp={cancelTimer}
              onPointerLeave={cancelTimer}
              onPointerCancel={cancelTimer}
              onContextMenu={(e) => e.preventDefault()}
              className={`
                ${item.bg} 
                relative
                flex flex-col items-center justify-center 
                rounded-xl sm:rounded-2xl 
                shadow-sm border border-black/5
                transition-all duration-75 ease-in-out
                w-full h-full p-1
                ${activeIdx === index ? 'brightness-90 scale-95' : 'hover:brightness-95 hover:shadow-md'}
              `}
              style={{ touchAction: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
            >
              {/* Dwell Progress Indicator */}
              {activeIdx === index && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-white/10 rounded-xl sm:rounded-2xl transition-opacity">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.15)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (progress / 100) * 251.2}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              )}
              
              <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2 pointer-events-none drop-shadow-sm">
                {item.icon}
              </span>
              <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 pointer-events-none">
                {item.word}
              </span>
            </button>
          ))}
          
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}



