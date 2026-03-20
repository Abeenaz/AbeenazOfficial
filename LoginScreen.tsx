'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [error, setError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  
  const { login, setNewPin: saveNewPin, needsPinSet, isAuthenticated } = useAuthStore();

  // Generate gold particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 10 + Math.random() * 10,
  }));

  const handlePhoneSubmit = () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setStep('pin');
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    
    const result = login(phone, pin);
    
    if (result.success && result.needsPinSet) {
      setShowPinSetup(true);
    } else if (!result.success) {
      setError(result.error || 'Invalid credentials');
      // Shake animation
      const pinInput = document.getElementById('pin-dots');
      pinInput?.classList.add('shake');
      setTimeout(() => pinInput?.classList.remove('shake'), 500);
    }
  };

  const handlePinSetup = () => {
    if (newPin.length !== 4) {
      setError('New PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    const result = saveNewPin(newPin);
    if (!result.success) {
      setError(result.error || 'Failed to set PIN');
    }
  };

  const handlePinDotClick = (index: number) => {
    if (step === 'pin' && !showPinSetup) {
      if (pin.length > index) {
        // Allow backspace
        setPin(pin.slice(0, index));
      }
    }
  };

  if (isAuthenticated && !needsPinSet) return null;

  return (
    <div className="fixed inset-0 bg-[#0d0b07] flex items-center justify-center overflow-hidden">
      {/* Gold Particles */}
      <div className="gold-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="gold-particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card gold-glow p-8 w-full max-w-sm mx-4 relative z-10"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-serif gold-text mb-2">Abeenaz</h1>
            <p className="text-[#7a6a50] text-sm tracking-widest uppercase">Beauty Parlour</p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* PIN Setup Screen */}
          {showPinSetup ? (
            <motion.div
              key="pin-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-[#f5f0e8] mb-2">First Login Detected</p>
                <p className="text-[#7a6a50] text-sm">Please set a new 4-digit PIN</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[#7a6a50] text-sm mb-2 block">New PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="bg-transparent border-[rgba(201,168,76,0.3)] text-center text-2xl tracking-[1em] text-[#c9a84c]"
                    placeholder="••••"
                  />
                </div>
                
                <div>
                  <label className="text-[#7a6a50] text-sm mb-2 block">Confirm PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="bg-transparent border-[rgba(201,168,76,0.3)] text-center text-2xl tracking-[1em] text-[#c9a84c]"
                    placeholder="••••"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#c07070] text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                onClick={handlePinSetup}
                className="w-full btn-gold py-3 rounded-lg"
              >
                Set PIN & Continue
              </Button>
            </motion.div>
          ) : step === 'phone' ? (
            /* Phone Input */
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-[#7a6a50] text-sm mb-2 block">Phone Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-[#c9a84c] text-lg">+92</span>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="bg-transparent border-[rgba(201,168,76,0.3)] text-[#f5f0e8] text-lg"
                    placeholder="3XX XXX XXXX"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#c07070] text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                onClick={handlePhoneSubmit}
                className="w-full btn-gold py-3 rounded-lg"
              >
                Continue
              </Button>
            </motion.div>
          ) : (
            /* PIN Input */
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-[#f5f0e8] mb-1">Enter PIN</p>
                <p className="text-[#7a6a50] text-sm">for +92 {phone}</p>
              </div>

              {/* PIN Dots */}
              <div
                id="pin-dots"
                className="flex justify-center gap-4"
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePinDotClick(i)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      i < pin.length
                        ? 'bg-gradient-to-br from-[#c9a84c] to-[#8b6914] border-[#c9a84c]'
                        : 'border-[rgba(201,168,76,0.3)] bg-transparent'
                    }`}
                  >
                    {i < pin.length && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-[#0d0b07]"
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Hidden input for keyboard */}
              <Input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="opacity-0 absolute pointer-events-none"
                autoFocus
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#c07070] text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStep('phone');
                    setPin('');
                    setError('');
                  }}
                  variant="outline"
                  className="flex-1 btn-gold-outline py-3 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePinSubmit}
                  className="flex-1 btn-gold py-3 rounded-lg"
                >
                  Login
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#7a6a50] text-xs">Admin Access Only</p>
        </div>
      </motion.div>
    </div>
  );
}
