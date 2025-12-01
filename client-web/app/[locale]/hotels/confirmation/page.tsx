'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Calendar, MapPin, CreditCard, Mail, User } from 'lucide-react';
import { BOOKING_ENDPOINTS } from '@/lib/apiConfig';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const completeBooking = async () => {
      try {
        const prebookId = searchParams.get('prebookId');
        const transactionId = searchParams.get('transactionId');
        
        if (!prebookId || !transactionId) {
          setError('Paramètres de réservation manquants');
          setLoading(false);
          return;
        }

        // Récupérer les données du formulaire depuis sessionStorage
        const guestData = sessionStorage.getItem('guestData');
        if (!guestData) {
          setError('Données client non trouvées. Veuillez refaire votre réservation.');
          setLoading(false);
          return;
        }

        const { firstName, lastName, email, adults } = JSON.parse(guestData);
        const adultsCount = parseInt(adults) || 1;

        // Créer un tableau de guests basé sur le nombre d'adultes
        const guests = Array.from({ length: adultsCount }, (_, i) => ({
          occupancyNumber: i + 1,
          firstName,
          lastName,
          email
        }));

        const bookingPayload = {
          prebookId,
          transactionId,
          holder: {
            firstName,
            lastName,
            email
          },
          guests
        };

        const response = await fetch(BOOKING_ENDPOINTS.BOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });

        const data = await response.json();
        if (data.success) {
          setBooking(data.data?.data);
          sessionStorage.removeItem('guestData');
        } else {
          setError(data.error?.message || 'Erreur lors de la réservation');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la réservation');
      } finally {
        setLoading(false);
      }
    };

    completeBooking();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalisation de votre réservation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/hotels/search')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
          <div className="text-green-600 mb-4">
            <CheckCircle size={64} className="mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-gray-600">
            Votre réservation a été confirmée avec succès
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Détails de la réservation</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                <CheckCircle className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Numéro de réservation</div>
                <div className="text-lg font-semibold">{booking.bookingId}</div>
              </div>
            </div>

            {booking.hotelConfirmationCode && (
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                  <CreditCard className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Code de confirmation hôtel</div>
                  <div className="text-lg font-semibold">{booking.hotelConfirmationCode}</div>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                <MapPin className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Hôtel</div>
                <div className="text-lg font-semibold">{booking.hotel?.name}</div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                <Calendar className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Dates</div>
                <div className="text-lg font-semibold">
                  {booking.checkin} - {booking.checkout}
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                <CreditCard className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Prix total</div>
                <div className="text-lg font-semibold">
                  {booking.currency} {booking.price.toFixed(2)}
                </div>
              </div>
            </div>

            {booking.cancellationPolicies && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Politique d'annulation</h3>
                <div className="text-sm text-gray-600">
                  {booking.cancellationPolicies.refundableTag === 'RFN' ? (
                    <span className="text-green-600 font-semibold">✓ Remboursable</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✗ Non remboursable</span>
                  )}
                </div>
                {booking.cancellationPolicies.cancelPolicyInfos?.[0] && (
                  <div className="text-sm text-gray-600 mt-2">
                    Annulation possible jusqu'au: {new Date(booking.cancellationPolicies.cancelPolicyInfos[0].cancelTime).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Un email de confirmation a été envoyé à votre adresse email</li>
            <li>• Présentez-vous à l'hôtel avec votre pièce d'identité</li>
            <li>• Le code de confirmation peut être demandé à l'arrivée</li>
          </ul>
        </div>

        <button
          onClick={() => router.push('/hotels/search')}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
        >
          Nouvelle recherche
        </button>
      </div>
    </div>
  );
}

