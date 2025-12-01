'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, User, Mail, Calendar, Users } from 'lucide-react';
import { BOOKING_ENDPOINTS } from '@/lib/apiConfig';

declare global {
  interface Window {
    LiteAPIPayment: any;
  }
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<'guest' | 'payment'>('guest');
  const [loading, setLoading] = useState(false);
  const [prebookData, setPrebookData] = useState<any>(null);
  const [paymentLoaded, setPaymentLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  // Guest form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadPaymentSDK = () => {
      // Vérifier si le script est déjà chargé
      if (document.getElementById('liteapi-payment-script')) {
        if (window.LiteAPIPayment) {
          setPaymentLoaded(true);
          return;
        }
      }
      
      const script = document.createElement('script');
      script.id = 'liteapi-payment-script';
      script.src = 'https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1';
      script.onload = () => {
        console.log('Payment SDK loaded');
        setPaymentLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load payment SDK');
        setPaymentError('Erreur lors du chargement du SDK de paiement');
      };
      document.body.appendChild(script);
    };

    if (step === 'payment' && prebookData) {
      loadPaymentSDK();
    }
  }, [step, prebookData]);

  useEffect(() => {
    if (step === 'payment' && paymentLoaded && prebookData && window.LiteAPIPayment && !paymentInitialized) {
      // Attendre que le DOM soit prêt
      const initPayment = () => {
        try {
          // Vérifier que toutes les données nécessaires sont présentes
          if (!prebookData.data?.prebookId || !prebookData.data?.transactionId || !prebookData.data?.secretKey) {
            console.error('Missing prebook data:', prebookData.data);
            setPaymentError('Données de pré-réservation incomplètes');
            return;
          }

          // Vérifier que le conteneur existe
          const container = document.getElementById('payment-container');
          if (!container) {
            console.error('Payment container not found');
            setPaymentError('Conteneur de paiement introuvable');
            return;
          }

          const returnUrl = `${window.location.origin}/hotels/confirmation?prebookId=${prebookData.data.prebookId}&transactionId=${prebookData.data.transactionId}`;
          
          console.log('Initializing payment SDK with:', {
            prebookId: prebookData.data.prebookId,
            transactionId: prebookData.data.transactionId,
            returnUrl: returnUrl,
            containerExists: !!container
          });
          
          const liteAPIConfig = {
            publicKey: 'sandbox', // Use 'sandbox' for sandbox keys, 'live' for production
            secretKey: prebookData.data.secretKey,
            returnUrl: returnUrl,
            targetElement: '#payment-container',
            appearance: { theme: 'flat' },
            options: { business: { name: 'Ajiw Hotels' } }
          };

          const liteAPIPayment = new window.LiteAPIPayment(liteAPIConfig);
          liteAPIPayment.handlePayment();
          setPaymentInitialized(true);
          console.log('Payment SDK initialized successfully');
        } catch (error: any) {
          console.error('Error initializing payment SDK:', error);
          setPaymentError('Erreur lors de l\'initialisation du paiement: ' + error.message);
        }
      };

      // Attendre un peu pour s'assurer que le DOM est prêt
      const timer = setTimeout(initPayment, 100);
      return () => clearTimeout(timer);
    }
  }, [step, paymentLoaded, prebookData, paymentInitialized]);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const offerId = searchParams.get('offerId');
      if (!offerId) {
        alert('Offre non trouvée');
        return;
      }

      // Sauvegarder les données client dans sessionStorage
      sessionStorage.setItem('guestData', JSON.stringify({
        firstName,
        lastName,
        email,
        adults: searchParams.get('adults') || '2'
      }));

      const response = await fetch(BOOKING_ENDPOINTS.PREBOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId })
      });

      const data = await response.json();
      console.log('Prebook response:', data);
      if (data.success) {
        // Vérifier la structure des données
        if (!data.data?.prebookId || !data.data?.transactionId || !data.data?.secretKey) {
          console.error('Invalid prebook data structure:', data.data);
          alert('Données de pré-réservation invalides. Veuillez réessayer.');
          return;
        }
        setPrebookData(data);
        setStep('payment');
      } else {
        alert(data.error?.message || 'Erreur lors de la pré-réservation');
      }
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser votre réservation</h1>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'guest' ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'}`}>
              {step === 'guest' ? '1' : '✓'}
            </div>
            <div className={`w-24 h-1 ${step === 'payment' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        {step === 'guest' ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <User className="mr-2" size={24} />
              Informations du client
            </h2>

            <form onSubmit={handleGuestSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="mr-2" size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Détails de la réservation</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>Arrivée: {searchParams.get('checkin')}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>Départ: {searchParams.get('checkout')}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    <span>Adultes: {searchParams.get('adults')}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Traitement...' : 'Continuer vers le paiement'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CreditCard className="mr-2" size={24} />
              Paiement
            </h2>

            {prebookData && prebookData.data && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {(() => {
                      // Essayer de récupérer le prix depuis différentes structures possibles
                      const price = prebookData.data?.price || 
                                   prebookData.data?.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.amount;
                      const currency = prebookData.data?.currency || 
                                      prebookData.data?.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.currency || 
                                      'USD';
                      
                      if (price !== undefined && price !== null) {
                        return `${currency} ${typeof price === 'number' ? price.toFixed(2) : price}`;
                      }
                      return 'Prix non disponible';
                    })()}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Mode test:</strong> Utilisez la carte de test <code className="bg-yellow-100 px-2 py-1 rounded">4242 4242 4242 4242</code> avec n'importe quel CVV et une date d'expiration future.
              </p>
            </div>

            {paymentError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{paymentError}</p>
                <button
                  onClick={() => {
                    setPaymentError('');
                    setPaymentInitialized(false);
                    setPaymentLoaded(false);
                    // Recharger le SDK
                    const script = document.getElementById('liteapi-payment-script');
                    if (script) {
                      script.remove();
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Réessayer
                </button>
              </div>
            )}

            <div id="payment-container" className="min-h-[400px] border border-gray-200 rounded-lg p-4 bg-white">
              {!paymentLoaded && !paymentError && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600">Chargement du formulaire de paiement...</p>
                </div>
              )}
              {paymentLoaded && !paymentInitialized && !paymentError && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600">Initialisation du paiement...</p>
                </div>
              )}
            </div>

            <style jsx global>{`
              .lp-submit-button {
                background-color: #4f46e5 !important;
                color: white !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                font-size: 16px !important;
                border: none !important;
                cursor: pointer !important;
                transition: background-color 0.2s !important;
              }
              .lp-submit-button:hover {
                background-color: #4338ca !important;
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}

