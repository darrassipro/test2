'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, ArrowRight, UtensilsCrossed, Shield, Info, Star } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/home/Navbar';
import { useLazySearchRatesQuery } from '@/services/api/bookingApi';

export default function HotelResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const LIMIT = 50;
  const [triggerSearchRates] = useLazySearchRatesQuery();

  const fetchHotels = useCallback(async (currentOffset: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError('');
      }

      const checkin = searchParams.get('checkin');
      const checkout = searchParams.get('checkout');
      const adults = parseInt(searchParams.get('adults') || '2');
      const children = parseInt(searchParams.get('children') || '0');
      const childrenAgesParam = searchParams.get('childrenAges');
      const childrenAges = childrenAgesParam 
        ? childrenAgesParam.split(',').map(age => parseInt(age)).filter(age => !isNaN(age))
        : [];
      const searchType = searchParams.get('searchType');
      const placeId = searchParams.get('placeId');
      const vibeQuery = searchParams.get('vibeQuery');
      const hotelIdsParam = searchParams.get('hotelIds');

      // Construire occupancies avec adultes et enfants
      const occupancy: any = { adults };
      if (children > 0 && childrenAges.length === children) {
        occupancy.children = childrenAges;
      }

      const searchPayload: any = {
        occupancies: [occupancy],
        currency: 'USD',
        guestNationality: 'US',
        checkin,
        checkout,
        roomMapping: true,
        maxRatesPerHotel: 1,
        includeHotelData: true,
        limit: LIMIT,
        offset: currentOffset
      };

      // Gérer les différents types de recherche
      if (hotelIdsParam) {
        // Recherche par IDs d'hôtels (depuis la page de recherche)
        const hotelIds = hotelIdsParam.split(',').filter(id => id.trim());
        if (hotelIds.length > 0) {
          searchPayload.hotelIds = hotelIds;
        }
      } else if (searchType === 'destination' && placeId) {
        searchPayload.placeId = placeId;
      } else if (searchType === 'vibe' && vibeQuery) {
        searchPayload.aiSearch = vibeQuery;
      }

      const data = await triggerSearchRates(searchPayload).unwrap();
      
      if (data.success) {
        // La structure de réponse est data.data qui contient un array de rates
        const ratesData = data.data?.data || [];
        const hotelsData = data.data?.hotels || [];
        
        if (append) {
          // Ajouter aux résultats existants
          setRates(prev => [...prev, ...ratesData]);
          if (hotelsData.length > 0) {
            setHotels(prev => {
              const existingIds = new Set(prev.map(h => h.id));
              const newHotels = hotelsData.filter((h: any) => !existingIds.has(h.id));
              return [...prev, ...newHotels];
            });
          }
        } else {
          // Remplacer les résultats
          setRates(ratesData);
          if (hotelsData.length > 0) {
            setHotels(hotelsData);
          } else {
            // Sinon, créer un map basique depuis les rates
            const hotelsMap = new Map();
            ratesData.forEach((rate: any) => {
              if (rate.hotelId && !hotelsMap.has(rate.hotelId)) {
                hotelsMap.set(rate.hotelId, {
                  id: rate.hotelId,
                  name: 'Hôtel',
                  address: '',
                  main_photo: '/placeholder-hotel.jpg',
                  rating: null,
                  tags: []
                });
              }
            });
            setHotels(Array.from(hotelsMap.values()));
          }
        }

        // Vérifier s'il y a plus de résultats
        if (ratesData.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (!append) {
          setError(data.error?.message || data.message || 'Erreur lors de la recherche');
          setRates([]);
          setHotels([]);
        }
        setHasMore(false);
      }
    } catch (err: any) {
      if (!append) {
        setError(err.message || 'Erreur lors de la recherche');
        setRates([]);
        setHotels([]);
      }
      setHasMore(false);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [searchParams]);

  // Charger les premiers résultats
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchHotels(0, false);
  }, [searchParams, fetchHotels]);

  // Observer pour le scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const newOffset = offset + LIMIT;
          setOffset(newOffset);
          fetchHotels(newOffset, true);
        }
      },
      {
        rootMargin: '500px'
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, offset, fetchHotels]);

  const getHotelInfo = (hotelId: string) => {
    return hotels.find(h => h.id === hotelId);
  };

  const getHotelRate = (hotelId: string) => {
    const hotelRates = rates.find((r: any) => r.hotelId === hotelId);
    if (!hotelRates?.roomTypes?.[0]?.rates?.[0]) return null;
    return hotelRates.roomTypes[0].rates[0];
  };

  const getMinPrice = (hotelId: string) => {
    const rate = getHotelRate(hotelId);
    if (!rate) return null;
    return rate.retailRate?.total?.[0]?.amount;
  };

  const getSuggestedPrice = (hotelId: string) => {
    const rate = getHotelRate(hotelId);
    if (!rate) return null;
    return rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
  };

  const getRoomInfo = (hotelId: string) => {
    const rate = getHotelRate(hotelId);
    if (!rate) return null;
    
    // Vérifier le refundableTag - peut être 'RFN' (Remboursable) ou 'NRFN' (Non remboursable)
    const refundableTag = rate.cancellationPolicies?.refundableTag;
    const isRefundable = refundableTag === 'RFN';
    
    return {
      name: rate.name || 'Chambre',
      boardName: rate.boardName,
      boardType: rate.boardType,
      refundable: isRefundable,
      refundableTag: refundableTag, // Garder le tag original pour debug
      maxOccupancy: rate.maxOccupancy,
      adultCount: rate.adultCount,
      childCount: rate.childCount
    };
  };

  const getTaxesInfo = (hotelId: string) => {
    const rate = getHotelRate(hotelId);
    if (!rate?.retailRate?.taxesAndFees) return null;
    const taxes = rate.retailRate.taxesAndFees;
    const included = taxes.filter((t: any) => t.included).length;
    const excluded = taxes.filter((t: any) => !t.included).length;
    return { included, excluded, total: taxes.length };
  };

  const getRatingStatus = (rating: number) => {
    if (rating >= 9.5) {
      return { 
        text: 'Excellent', 
        color: 'bg-green-600', 
        textColor: 'text-white',
        comment: 'Un établissement exceptionnel avec des avis remarquables'
      };
    } else if (rating >= 8.4) {
      return { 
        text: 'Très bien', 
        color: 'bg-blue-600', 
        textColor: 'text-white',
        comment: 'Un excellent hôtel très apprécié par les voyageurs'
      };
    } else if (rating >= 7.0) {
      return { 
        text: 'Bien', 
        color: 'bg-blue-500', 
        textColor: 'text-white',
        comment: 'Un bon hôtel qui répond aux attentes'
      };
    } else if (rating >= 6.0) {
      return { 
        text: 'Moyen', 
        color: 'bg-yellow-500', 
        textColor: 'text-white',
        comment: 'Un hôtel correct avec quelques points à améliorer'
      };
    } else {
      return { 
        text: 'Faible', 
        color: 'bg-orange-500', 
        textColor: 'text-white',
        comment: 'Un établissement basique nécessitant des améliorations'
      };
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E72858] mx-auto mb-4"></div>
          <p className="text-gray-600">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/hotels/search')}
            className="px-4 py-2 bg-[#E72858] text-white rounded-lg"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const uniqueHotels = rates.map(rate => rate.hotelId).filter((id, index, self) => self.indexOf(id) === index);

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-white py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header avec titre et description */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#E72858] rounded-lg flex items-center justify-center">
              <MapPin className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Résultats de recherche
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Découvrez nos hôtels exceptionnels pour un séjour inoubliable
          </p>
        </div>

        {/* Affichage des résultats */}
        {uniqueHotels.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-gray-400" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Aucun hôtel trouvé</h2>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche pour trouver plus d'options.
              </p>
              <button
                onClick={() => router.push('/hotels/search')}
                className="px-6 py-3 bg-[#E72858] text-white rounded-lg font-semibold hover:bg-[#d6204a] transition-colors"
              >
                Nouvelle recherche
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uniqueHotels.map((hotelId) => {
              const hotel = getHotelInfo(hotelId);
              const minPrice = getMinPrice(hotelId);
              
              return (
                <div
                  key={hotelId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/hotels/${hotelId}?checkin=${searchParams.get('checkin')}&checkout=${searchParams.get('checkout')}&adults=${searchParams.get('adults')}`)}
                >
                  {/* Image avec badge de prix */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={hotel?.main_photo || '/placeholder-hotel.jpg'}
                      alt={hotel?.name || 'Hôtel'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badge de prix en haut à droite */}
                    {minPrice && (
                      <div className="absolute top-4 right-4 bg-[#E72858] text-white px-4 py-2 rounded-lg shadow-lg">
                        <span className="font-bold text-lg">${minPrice.toFixed(0)}</span>
                        <span className="text-sm ml-1">/ nuit</span>
                      </div>
                    )}
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-6">
                    {/* Nom et localisation */}
                    <div className="mb-3">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {hotel?.name || 'Hôtel'}
                      </h2>
                      <div className="flex items-center gap-4 text-gray-600 mb-2 flex-wrap">
                        {hotel?.address && (
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-1 text-[#E72858]" />
                            <span className="text-sm">
                              {hotel.address}
                              {hotel?.city && `, ${hotel.city}`}
                              {hotel?.country && `, ${hotel.country.toUpperCase()}`}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Commentaire basé sur la note */}
                      {hotel?.rating && (() => {
                        const ratingStatus = getRatingStatus(hotel.rating);
                        return (
                          <p className="text-xs text-gray-500 italic mt-1">
                            {ratingStatus.comment}
                          </p>
                        );
                      })()}
                    </div>

                    {/* Description */}
                    {hotel?.story && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {hotel.story}
                      </p>
                    )}

                    {/* Tags/Amenities */}
                    {hotel?.tags && hotel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.tags.slice(0, 4).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {hotel.tags.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{hotel.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Informations sur la chambre (optionnel, plus compact) */}
                    {(() => {
                      const roomInfo = getRoomInfo(hotelId);
                      if (!roomInfo || (!roomInfo.name && !roomInfo.boardName)) return null;
                      return (
                        <div className="mb-4 flex items-center gap-2 flex-wrap">
                          {roomInfo.name && (
                            <span className="text-xs text-gray-500 font-medium">
                              {roomInfo.name}
                            </span>
                          )}
                          {roomInfo.boardName && roomInfo.boardName !== 'Room Only' && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                              {roomInfo.boardName}
                            </span>
                          )}
                          {roomInfo.refundableTag === 'RFN' && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                              Remboursable
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Bouton Réserver maintenant */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/hotels/${hotelId}?checkin=${searchParams.get('checkin')}&checkout=${searchParams.get('checkout')}&adults=${searchParams.get('adults')}`);
                      }}
                      className="w-full bg-[#E72858] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d6204a] transition-colors flex items-center justify-center gap-2"
                    >
                      Réserver maintenant
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
            
            {/* Élément de référence pour le scroll infini */}
            <div ref={observerTarget} className="h-1 w-full" />
            
            {/* Indicateur de chargement pour le scroll infini */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E72858]"></div>
                <span className="ml-3 text-gray-600">Chargement de plus d'hôtels...</span>
              </div>
            )}
            
            {/* Message si plus de résultats */}
            {!hasMore && uniqueHotels.length > 0 && (
              <div className="text-center py-8 text-gray-600">
                <p>Tous les hôtels ont été chargés</p>
              </div>
            )}
          </>
          )}
        </div>
      </div>
    </>
  );
}

