import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import partListData from './part_list.json';
import PixiCanvas from './components/PixiCanvas';
import lottie from "lottie-web";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function App() {
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedPart, setSelectedPart] = useState('');
  const [production, setProduction] = useState('');
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [showScrollMessage, setShowScrollMessage] = useState(false);
  const [availableParts, setAvailableParts] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentCarFrame, setCurrentCarFrame] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [cashRainData, setCashRainData] = useState(null);
  const [displayedRetailValue, setDisplayedRetailValue] = useState(0);
  const [displayedWageValue, setDisplayedWageValue] = useState(0);

  // Refs for GSAP animations
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const frameImageRef = useRef(null);
  const carFrameImageRef = useRef(null);

  // Refs for text animations
  const section1TextRef = useRef(null);
  const section2TextRef = useRef(null);
  const section3TextRef = useRef(null);
  const section4TextRef = useRef(null);

  // Get unique lines from the data
  const lines = [...new Set(partListData.map(item => item.Line))].sort();

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Preload all frame images
  useEffect(() => {
    const preloadFrames = async () => {
      const framePromises = [];

      // Preload boxframes (frame_000.png to frame_048.png - 49 frames)
      for (let i = 0; i <= 48; i++) {
        const frameNumber = i.toString().padStart(3, '0');
        const img = new Image();
        img.src = `/assets/boxframes/frame_${frameNumber}.png`;

        framePromises.push(
          new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          })
        );
      }

      // Preload carframes (frame_000.png to frame_048.png - 49 frames)
      for (let i = 0; i <= 48; i++) {
        const frameNumber = i.toString().padStart(3, '0');
        const img = new Image();
        img.src = `/assets/carframes/frame_${frameNumber}.png`;

        framePromises.push(
          new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          })
        );
      }

      try {
        await Promise.all(framePromises);
        setFramesLoaded(true);
      } catch (error) {
        console.error('Error preloading frames:', error);
        setFramesLoaded(true);
      }
    };

    preloadFrames();
  }, []);

  // Load cash rain animation data
  useEffect(() => {
    const loadCashRainData = async () => {
      try {
        const response = await fetch('/assets/cashrain.json');
        const data = await response.json();
        setCashRainData(data);
      } catch (error) {
        console.error('Error loading cash rain animation:', error);
      }
    };

    loadCashRainData();
  }, []);

  // Update available parts when line changes
  useEffect(() => {
    if (selectedLine) {
      const parts = partListData
        .filter(item => item.Line === selectedLine)
        .map(item => ({
          SKU: item.SKU,
          'Carton Qty': item['Carton Qty'],
          'Unit Weight (lb)': item['Unit Weight (lb)'],
          'Price (ea)': item['Price (ea)']
        }));
      setAvailableParts(parts);
      setSelectedPart(''); // Reset part selection
    } else {
      setAvailableParts([]);
      setSelectedPart('');
    }
  }, [selectedLine]);

  // Check if form is valid for submit button
  useEffect(() => {
    const isValid = selectedLine && selectedPart && production &&
                   parseInt(production) > 0 && parseInt(production) <= 15000;
    setShowSubmitButton(isValid);
  }, [selectedLine, selectedPart, production]);

  // Calculate selected part data
  const selectedPartData = availableParts.find(part => part.SKU.toString() === selectedPart);

  // Calculate final retail value
  const finalRetailValue = selectedPartData ?
    parseFloat(selectedPartData['Price (ea)'].replace('$', '')) * parseInt(production) : 0;

  // Calculate weight and car equivalents
  const totalWeight = selectedPartData ?
    parseFloat(selectedPartData['Unit Weight (lb)'].replace(' lb', '')) * parseInt(production) : 0;
  const carWeight = 2800; // Average small car weight in lbs
  const carEquivalents = totalWeight > 0 ? (totalWeight / carWeight).toFixed(1) : 0;

  // Calculate boxes stacked
  const boxesStacked = selectedPartData && production ?
    Math.ceil(parseInt(production) / parseInt(selectedPartData['Carton Qty'])) : 0;

  // Set initial displayed values if not already set
  useEffect(() => {
    if (finalRetailValue > 0 && displayedRetailValue === 0) {
      setDisplayedRetailValue(finalRetailValue);
    }
    if (displayedWageValue === 0) {
      setDisplayedWageValue(50000);
    }
  }, [finalRetailValue, displayedRetailValue, displayedWageValue]);


  // Setup GSAP ScrollTrigger animations in a single useEffect
  useEffect(() => {
    if (showScrollMessage && framesLoaded && cashRainData) {
      // Clear any previous ScrollTriggers to prevent duplicates
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      const sections = [section1Ref, section2Ref, section3Ref, section4Ref];

      // Load Lottie animation once
      const lottieContainer = section3Ref.current?.querySelector(".lottie-container");
      let lottieAnim = null;
      if (lottieContainer) {
        lottieAnim = lottie.loadAnimation({
          container: lottieContainer,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData: cashRainData,
        });
      }

      sections.forEach((sectionRef, index) => {
        if (sectionRef.current) {
          // All sections start invisible, then animate in
          gsap.set(sectionRef.current, { opacity: 0, y: 50 });

          // Pin the section to the viewport
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom+=100%",
            pin: true,
            scrub: 1,
            // Main animation logic
            onUpdate: (self) => {
              const progress = self.progress;

              switch (index) {
                case 0: // Section 1: Box frames
                  setCurrentFrame(Math.floor(progress * 48));
                  break;
                case 1: // Section 2: Car frames
                  setCurrentCarFrame(Math.floor(progress * 48));
                  break;
                case 2: // Section 3: Lottie cash rain
                  if (lottieAnim) {
                    const frame = progress * (lottieAnim.totalFrames - 1);
                    lottieAnim.goToAndStop(frame, true);
                  }
                  // Count-up effect
                  const finalValue = selectedPartData ?
                    parseFloat(selectedPartData['Price (ea)'].replace('$', '')) * parseInt(production) : 0;
                  setDisplayedRetailValue(Math.floor(progress * finalValue));
                  break;
                case 3: // Section 4: Wage vs Profit
                  const finalWageValue = 21 * 8; // Example: $21/hour * 8 hours
                  const finalProfitValue = finalRetailValue;
                  
                  // **FIXED LOGIC**: Check for division by zero
                  if (finalProfitValue > 0) {
                    const currentWageValue = Math.floor(progress * finalWageValue);
                    const currentProfitValue = Math.floor(progress * finalProfitValue);

                    gsap.to("#wage-bar", {
                      height: `${(currentWageValue / finalProfitValue) * 100}%`,
                      duration: 0.1,
                    });
                    gsap.to("#profit-bar", {
                      height: `${(currentProfitValue / finalProfitValue) * 100}%`,
                      duration: 0.1,
                    });
                    // Update labels
                    document.getElementById("wage-label").innerText = `$${currentWageValue.toLocaleString()}`;
                    document.getElementById("profit-label").innerText = `$${currentProfitValue.toLocaleString()}`;
                  } else {
                    // Reset bars to 0 if there's no profit
                    gsap.to("#wage-bar, #profit-bar", { height: `0%`, duration: 0.1 });
                    document.getElementById("wage-label").innerText = `$0`;
                    document.getElementById("profit-label").innerText = `$0`;
                  }
                  break;
                default:
                  break;
              }
            },
            // Animate section into view
            onEnter: () => {
              gsap.to(sectionRef.current, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
              });
              // Animate text elements on enter
              let textRef;
              if (index === 0) textRef = section1TextRef;
              if (index === 1) textRef = section2TextRef;
              if (index === 2) textRef = section3TextRef;
              if (index === 3) textRef = section4TextRef;

              if (textRef?.current) {
                const textElements = textRef.current.children;
                gsap.set(textElements, { opacity: 0, y: 30 });
                gsap.to(textElements, {
                  opacity: 1,
                  y: 0,
                  duration: 1,
                  ease: "power2.out",
                  stagger: 0.2
                });
              }
            },
            onLeaveBack: () => {
              // Reset the bars and labels when leaving the section by scrolling up
              gsap.to("#wage-bar, #profit-bar", {
                height: 0,
                duration: 0.5,
              });
              document.getElementById("wage-label").innerText = `$0`;
              document.getElementById("profit-label").innerText = `$0`;
            }
          });
        }
      });

      // Refresh ScrollTrigger after setup
      ScrollTrigger.refresh();

      // Cleanup function
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        if (lottieAnim) {
          lottieAnim.destroy();
        }
      };
    }
  }, [showScrollMessage, framesLoaded, cashRainData, finalRetailValue, selectedPartData, production]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowScrollMessage(true);
    // Scroll to first section after a brief delay
    setTimeout(() => {
      const firstSection = document.getElementById('section-1');
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(242, 238, 235, 1)' }}>
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Workload Stats
          </h1>
          <p className="text-gray-600 text-center text-sm leading-relaxed">
            Track your daily production and see the real impact of your work.
            Enter your production details below to get started.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-md mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Line Selection */}
          <div>
            <label htmlFor="line" className="block text-sm font-medium text-gray-700 mb-2">
              Select Line
            </label>
            <select
              id="line"
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a line...</option>
              {lines.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>

          {/* Part Selection */}
          {selectedLine && (
            <div>
              <label htmlFor="part" className="block text-sm font-medium text-gray-700 mb-2">
                Select Part
              </label>
              <select
                id="part"
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a part...</option>
                {availableParts.map(part => (
                  <option key={part.SKU} value={part.SKU}>
                    TP{part.SKU}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Production Input */}
          {selectedPart && (
            <div>
              <label htmlFor="production" className="block text-sm font-medium text-gray-700 mb-2">
                Production Count
              </label>
              <input
                type="number"
                id="production"
                value={production}
                onChange={(e) => setProduction(e.target.value)}
                min="1"
                max="15000"
                placeholder="Enter production count"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Submit Button */}
          {showSubmitButton && (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Calculate My Stats
            </button>
          )}

          {/* Scroll Message */}
          {showScrollMessage && (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium animate-pulse">
                📊 Scroll down to see your results!
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Results Sections */}
      {showScrollMessage && (
        <>
          {/* Section 1: Boxes Stacked */}
          <div
            ref={section1Ref}
            id="section-1"
            className="h-screen w-full flex items-center justify-center bg-white relative overflow-hidden"
          >
            {/* Frame animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                ref={frameImageRef}
                src={`/assets/boxframes/frame_${currentFrame.toString().padStart(3, '0')}.png`}
                alt={`Frame ${currentFrame}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div ref={section1TextRef} className="text-center px-4 relative z-20">
              <h2 className="text-4xl md:text-6xl font-bold text-blue-600 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                You stacked {boxesStacked} boxes.
              </h2>
              <p className="text-lg text-blue-500 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                That's a lot of hard work!
              </p>
            </div>
          </div>

          {/* Section 2: Weight Comparison */}
          <div
            ref={section2Ref}
            id="section-2"
            className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden"
          >
            {/* Car frame animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                ref={carFrameImageRef}
                src={`/assets/carframes/frame_${currentCarFrame.toString().padStart(3, '0')}.png`}
                alt={`Car Frame ${currentCarFrame}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div ref={section2TextRef} className="text-center px-4 relative z-20">
              <h2 className="text-4xl md:text-6xl font-bold text-green-600 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                That equals {totalWeight.toFixed(0)} lbs
              </h2>
              <p className="text-xl text-red-600 font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                That's like lifting {carEquivalents} small cars!
              </p>
            </div>
          </div>

          {/* Section 3: Retail Value */}
          <div
            ref={section3Ref}
            id="section-3"
            className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden"
          >
            {/* Lottie cash rain animation container */}
            <div className="absolute inset-0 lottie-container"></div>

            <div ref={section3TextRef} className="text-center px-4 relative z-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
              }}>
                Retail value: ${displayedRetailValue.toLocaleString()}
              </h2>
              <p className="text-lg text-yellow-600 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                That's the value you helped create!
              </p>
            </div>
          </div>

          {/* Section 4: Wage vs Profit */}
          <div
            ref={section4Ref}
            id="section-4"
            className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-orange-900 mb-8 drop-shadow-lg">
              Your wage vs company profit
            </h2>

            <div className="flex items-end gap-16 h-[60%] w-[80%] max-w-3xl">
              {/* Wage Bar */}
              <div className="flex flex-col items-center flex-1">
                <div id="wage-bar" className="w-20 bg-blue-600 rounded-t-lg" style={{height:0}}></div>
                <p id="wage-label" className="mt-4 text-lg font-semibold text-blue-800">$0</p>
                <p className="text-sm text-gray-700">Your Wage</p>
              </div>

              {/* Profit Bar */}
              <div className="flex flex-col items-center flex-1">
                <div id="profit-bar" className="w-20 bg-green-600 rounded-t-lg" style={{height:0}}></div>
                <p id="profit-label" className="mt-4 text-lg font-semibold text-green-800">$0</p>
                <p className="text-sm text-gray-700">Retail Value</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;