'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, ArrowRight, Search, X, Filter, Star } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/home/Navbar';
import { useLazyListHotelsQuery } from '@/lib/api/bookingApi';

export default function HotelSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true); // Ouvert par défaut
  const [error, setError] = useState('');
  const [triggerListHotels, { isFetching: searchLoading }] = useLazyListHotelsQuery();
  const [searchFilters, setSearchFilters] = useState({
    hotelName: '',
    countryCode: '',
    cityName: '',
    aiSearch: '',
    minRating: '',
    minReviewsCount: '',
    starRating: [] as string[]
  });

  // Liste des pays principaux
  const countries = [
    { code: 'MA', name: 'Maroc' },
    { code: 'FR', name: 'France' },
    { code: 'US', name: 'États-Unis' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'PT', name: 'Portugal' },
    { code: 'EG', name: 'Égypte' },
    { code: 'AE', name: 'Émirats arabes unis' },
    { code: 'SA', name: 'Arabie saoudite' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australie' },
    { code: 'JP', name: 'Japon' },
    { code: 'CN', name: 'Chine' }
  ];

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
        color: 'bg-pink-600', 
        textColor: 'text-white',
        comment: 'Un excellent hôtel très apprécié par les voyageurs'
      };
    } else if (rating >= 7.0) {
      return { 
        text: 'Bien', 
        color: 'bg-pink-500', 
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

  // Fonction pour rechercher des hôtels
  const searchHotelsByName = async () => {
    try {
      setError('');

      // Validation : au moins un paramètre principal doit être fourni
      const hasCountryCode = !!searchFilters.countryCode;
      const hasCityName = !!searchFilters.cityName;
      const hasAiSearch = !!searchFilters.aiSearch;

      // Si aucun paramètre principal n'est fourni (countryCode, cityName, ou aiSearch)
      if (!hasCountryCode && !hasCityName && !hasAiSearch) {
        setError('Veuillez spécifier au moins un pays, une ville, ou utiliser la recherche AI');
        return;
      }

      // Construire les paramètres de recherche
      const params: Record<string, string> = {};

      if (searchFilters.hotelName) {
        params.hotelName = searchFilters.hotelName;
      }
      if (searchFilters.countryCode) {
        params.countryCode = searchFilters.countryCode;
      }
      if (searchFilters.cityName) {
        params.cityName = searchFilters.cityName;
      }
      if (searchFilters.aiSearch) {
        params.aiSearch = searchFilters.aiSearch;
      }
      if (searchFilters.minRating) {
        params.minRating = searchFilters.minRating;
      }
      if (searchFilters.minReviewsCount) {
        params.minReviewsCount = searchFilters.minReviewsCount;
      }
      if (searchFilters.starRating && searchFilters.starRating.length > 0) {
        params.starRating = searchFilters.starRating.join(',');
      }

      const data = await triggerListHotels(params).unwrap();

      if (data.success) {
        setSearchResults(data.data?.data || []);
      } else {
        const errorMessage = data.error?.description || data.error?.message || data.message || 'Erreur lors de la recherche';
        setError(errorMessage);
        setSearchResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche');
      setSearchResults([]);
    }
  };

  // Fonction pour sélectionner un hôtel et voir ses tarifs
  const selectHotelForRates = (hotelId: string) => {
    // Récupérer les paramètres de recherche existants ou utiliser des valeurs par défaut
    const checkin = searchParams.get('checkin') || new Date().toISOString().split('T')[0];
    const checkout = searchParams.get('checkout') || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const adults = searchParams.get('adults') || '2';
    const children = searchParams.get('children') || '0';
    const childrenAges = searchParams.get('childrenAges') || '';

    // Naviguer vers la page de résultats avec l'ID de l'hôtel
    const params = new URLSearchParams({
      hotelIds: hotelId,
      checkin,
      checkout,
      adults,
      children
    });
    
    if (childrenAges) {
      params.append('childrenAges', childrenAges);
    }

    router.push(`/hotels/results?${params.toString()}`);
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-white py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Recherche d'hôtels
          </h1>
          <p className="text-gray-600 mt-2">
            Trouvez l'hôtel parfait pour votre séjour
          </p>
        </div>

        {/* Barre de recherche d'hôtels */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Message d'aide */}
            <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
              <p className="text-sm text-pink-800">
                <strong>Note :</strong> Vous devez sélectionner au moins un <strong>pays</strong> ou une <strong>ville</strong> pour effectuer une recherche. 
                Vous pouvez aussi utiliser la <strong>recherche AI</strong> seule ou combiner plusieurs critères.
              </p>
            </div>

            {/* Ligne principale de recherche */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'hôtel <span className="text-gray-400 text-xs">(nécessite un code pays ou une ville)</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchFilters.hotelName}
                    onChange={(e) => setSearchFilters({ ...searchFilters, hotelName: e.target.value })}
                    placeholder="Ex: Marriott, Hilton..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchHotelsByName();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={searchHotelsByName}
                  disabled={searchLoading || (!searchFilters.aiSearch && !searchFilters.countryCode && !searchFilters.cityName)}
                  className="px-6 py-2 bg-[#E72858] text-white rounded-lg font-semibold hover:bg-[#d6204a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searchLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Recherche...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>Rechercher</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Afficher les filtres actifs */}
            {(searchFilters.countryCode || searchFilters.cityName || searchFilters.aiSearch || 
              searchFilters.minRating || searchFilters.minReviewsCount || searchFilters.starRating.length > 0) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {searchFilters.countryCode && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                    Pays: {searchFilters.countryCode}
                  </span>
                )}
                {searchFilters.cityName && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                    Ville: {searchFilters.cityName}
                  </span>
                )}
                {searchFilters.aiSearch && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    AI: {searchFilters.aiSearch.substring(0, 30)}...
                  </span>
                )}
                {searchFilters.minRating && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Note min: {searchFilters.minRating}
                  </span>
                )}
                {searchFilters.minReviewsCount && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Avis min: {searchFilters.minReviewsCount}
                  </span>
                )}
                {searchFilters.starRating.length > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    Étoiles: {searchFilters.starRating.join(', ')}
                  </span>
                )}
              </div>
            )}

            {/* Bouton pour afficher/masquer les filtres */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter size={16} />
                <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres avancés'}</span>
              </button>
              {(searchFilters.countryCode || searchFilters.cityName || searchFilters.aiSearch || 
                searchFilters.minRating || searchFilters.minReviewsCount || searchFilters.starRating.length > 0) && (
                <button
                  onClick={() => {
                    setSearchFilters({
                      hotelName: searchFilters.hotelName, // Garder le nom de l'hôtel
                      countryCode: '',
                      cityName: '',
                      aiSearch: '',
                      minRating: '',
                      minReviewsCount: '',
                      starRating: []
                    });
                  }}
                  className="flex items-center gap-2 text-sm text-[#E72858] hover:text-[#d6204a]"
                >
                  <X size={16} />
                  <span>Réinitialiser les filtres</span>
                </button>
              )}
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Filtres avancés */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays <span className="text-[#E72858]">*</span>
                    <span className="text-gray-400 text-xs block font-normal">(requis si nom d'hôtel seul)</span>
                  </label>
                  <select
                    value={searchFilters.countryCode}
                    onChange={(e) => setSearchFilters({ ...searchFilters, countryCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la ville <span className="text-[#E72858]">*</span>
                    <span className="text-gray-400 text-xs block font-normal">(requis si nom d'hôtel seul)</span>
                  </label>
                  <input
                    type="text"
                    value={searchFilters.cityName}
                    onChange={(e) => setSearchFilters({ ...searchFilters, cityName: e.target.value })}
                    placeholder="Ex: Casablanca, Paris..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recherche sémantique (AI) <span className="text-[#E72858]">*</span>
                    <span className="text-gray-400 text-xs block font-normal">(peut être utilisé seul)</span>
                  </label>
                  <input
                    type="text"
                    value={searchFilters.aiSearch}
                    onChange={(e) => setSearchFilters({ ...searchFilters, aiSearch: e.target.value })}
                    placeholder="Ex: hôtel romantique près de la plage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={searchFilters.minRating}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minRating: e.target.value })}
                    placeholder="Ex: 8.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre minimum d'avis
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={searchFilters.minReviewsCount}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minReviewsCount: e.target.value })}
                    placeholder="Ex: 100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'étoiles (sélection multiple)
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['2.0', '3.0', '4.0', '5.0'].map((rating) => {
                      const isSelected = searchFilters.starRating.includes(rating);
                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSearchFilters({
                                ...searchFilters,
                                starRating: searchFilters.starRating.filter(r => r !== rating)
                              });
                            } else {
                              setSearchFilters({
                                ...searchFilters,
                                starRating: [...searchFilters.starRating, rating]
                              });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#E72858] text-white'
                              : 'bg-pink-50 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {rating} ⭐
                        </button>
                      );
                    })}
                  </div>
                  {searchFilters.starRating.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchFilters({ ...searchFilters, starRating: [] })}
                      className="mt-2 text-xs text-[#E72858] hover:underline"
                    >
                      Effacer la sélection
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Affichage des résultats */}
        {searchLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E72858] mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {error ? error : 'Aucun hôtel trouvé. Essayez de modifier vos critères de recherche.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map((hotel: any) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => selectHotelForRates(hotel.id)}
              >
                {/* Image avec badge de prix (si disponible) */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={hotel.main_photo || '/placeholder-hotel.jpg'}
                    alt={hotel.name || 'Hôtel'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge d'étoiles en haut à droite */}
                  {hotel.stars && (
                    <div className="absolute top-4 right-4 bg-[#E72858] text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Star size={16} className="fill-white" />
                      <span className="font-bold">{hotel.stars}</span>
                    </div>
                  )}
                </div>

                {/* Contenu de la carte */}
                <div className="p-6">
                  {/* Nom et localisation */}
                  <div className="mb-3">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {hotel.name}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-600 mb-2 flex-wrap">
                      {hotel.address && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1 text-[#E72858]" />
                          <span className="text-sm">
                            {hotel.address}
                            {hotel.city && `, ${hotel.city}`}
                            {hotel.country && `, ${hotel.country.toUpperCase()}`}
                          </span>
                        </div>
                      )}
                      {hotel.rating && (() => {
                        const ratingStatus = getRatingStatus(hotel.rating);
                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star size={16} className="mr-1 fill-[#E72858] text-[#E72858]" />
                              <span className="text-sm font-semibold">{hotel.rating}</span>
                            </div>
                            <div className={`flex items-center ${ratingStatus.color} ${ratingStatus.textColor} px-2 py-1 rounded-full`}>
                              <span className="text-xs font-medium">{ratingStatus.text}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Commentaire basé sur la note */}
                    {hotel.rating && (() => {
                      const ratingStatus = getRatingStatus(hotel.rating);
                      return (
                        <p className="text-xs text-gray-500 italic mt-1">
                          {ratingStatus.comment}
                        </p>
                      );
                    })()}
                  </div>

                  {/* Description */}
                  {hotel.hotelDescription && (
                    <p 
                      className="text-sm text-gray-600 mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: hotel.hotelDescription.replace(/<[^>]*>/g, '').substring(0, 200) + '...' }}
                    />
                  )}

                  {/* Tags/Amenities */}
                  {hotel.chain && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-md">
                        {hotel.chain}
                      </span>
                      {hotel.city && (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                          {hotel.city}
                        </span>
                      )}
                      {hotel.stars && (
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md">
                          {hotel.stars} étoiles
                        </span>
                      )}
                    </div>
                  )}

                  {/* Informations supplémentaires */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {hotel.reviewCount && (
                      <span>{hotel.reviewCount} avis</span>
                    )}
                    {hotel.currency && (
                      <span>Devise: {hotel.currency}</span>
                    )}
                  </div>

                  {/* Bouton Voir les tarifs */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      selectHotelForRates(hotel.id);
                    }}
                    className="w-full bg-[#E72858] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d6204a] transition-colors flex items-center justify-center gap-2"
                  >
                    Voir les tarifs
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

