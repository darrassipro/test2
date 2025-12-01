'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  Calendar,
  Users,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Shield,
  Info,
  Bed,
  Bath,
  Tv,
  AirVent,
  Search,
  Mic,
  ArrowUp,
  Loader2,
  Globe,
  Sparkles,
  Languages
} from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/home/Navbar';
import {
  useGetHotelDetailsQuery,
  useGetHotelReviewsQuery,
  useLazyAskHotelQuestionQuery,
  useLazySearchRatesQuery
} from '@/services/api/bookingApi';

type TabType = 'overview' | 'info' | 'facilities' | 'house-rules' | 'reviews';

export default function HotelDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hotelId = params.id as string;
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const adultsParam = searchParams.get('adults') || '2';
  const parsedAdults = parseInt(adultsParam, 10);
  const adultsCount = Number.isNaN(parsedAdults) ? 2 : parsedAdults;
  const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
  const [fetchRates, { data: ratesResponse, isFetching: ratesFetching, error: ratesError }] =
    useLazySearchRatesQuery();
  const [triggerAskQuestion, { isFetching: askingQuestion, error: askQuestionError }] =
    useLazyAskHotelQuestionQuery();
  const {
    data: hotelDetailsResponse,
    isFetching: hotelDetailsLoading,
    error: hotelDetailsError
  } = useGetHotelDetailsQuery(
    { hotelId, language: selectedLanguage },
    { skip: !hotelId }
  );
  const {
    data: hotelReviewsResponse,
    isFetching: hotelReviewsLoading,
    error: hotelReviewsError
  } = useGetHotelReviewsQuery(
    { hotelId, limit: 50, language: selectedLanguage },
    { skip: !hotelId }
  );
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedRoomMediaIndex, setSelectedRoomMediaIndex] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [questionTouched, setQuestionTouched] = useState(false);
  const [conversation, setConversation] = useState<
    { role: 'user' | 'assistant'; content: string; citations?: string[]; searchUsed?: boolean }[]
  >([]);

  const hotelDetails = hotelDetailsResponse?.data?.data;
  const reviews = hotelReviewsResponse?.data?.data || [];
  const hotelRates = ratesResponse?.data?.data?.[0];

  const allMedia = useMemo(() => {
    if (!hotelDetails) return [];
    const media: Array<{ type: 'image' | 'video'; url: string; thumbnail?: string }> = [];

    if (Array.isArray(hotelDetails.hotelImages)) {
      hotelDetails.hotelImages.forEach((img: any) => {
        if (img?.url) {
          media.push({ type: 'image', url: img.url });
        }
      });
    }

    if (Array.isArray(hotelDetails.rooms)) {
      hotelDetails.rooms.forEach((room: any) => {
        if (Array.isArray(room.photos)) {
          room.photos.forEach((photo: any) => {
            if (photo?.url) {
              media.push({ type: 'image', url: photo.url });
            }
          });
        }
      });
    }

    if (Array.isArray(hotelDetails.videos)) {
      hotelDetails.videos.forEach((video: any) => {
        if (video?.url) {
          media.push({
            type: 'video',
            url: video.url,
            thumbnail: video.thumbnail || hotelDetails.hotelImages?.[0]?.url
          });
        }
      });
    }

    return media;
  }, [hotelDetails]);

  const groupedRates = useMemo(() => {
    if (!hotelRates?.roomTypes) return {};
    const grouped: Record<string, any> = {};

    hotelRates.roomTypes.forEach((roomType: any) => {
      roomType.rates?.forEach((rate: any) => {
        const roomId = rate.mappedRoomId || 'other';
        if (!grouped[roomId]) {
          grouped[roomId] = {
            roomName: rate.name,
            roomImage:
              roomType.roomImage ||
              hotelDetails?.rooms?.find((room: any) => room.id === roomId)?.photos?.[0]?.url,
            rates: []
          };
        }
        grouped[roomId].rates.push({
          ...rate,
          offerId: roomType.offerId
        });
      });
    });

    return grouped;
  }, [hotelRates, hotelDetails]);

  const extractErrorMessage = (apiError: any) => {
    if (!apiError) return '';
    if (typeof apiError === 'string') return apiError;
    return (
      apiError?.data?.error?.message ||
      apiError?.data?.message ||
      apiError?.error ||
      apiError?.message ||
      ''
    );
  };

  const error =
    extractErrorMessage(hotelDetailsError) ||
    extractErrorMessage(hotelReviewsError) ||
    extractErrorMessage(ratesError);
  const loading = hotelDetailsLoading || hotelReviewsLoading || ratesFetching;

  const askErrorMessage = extractErrorMessage(askQuestionError);

  useEffect(() => {
    setConversation([]);
    setQuestion('');
    setQuestionTouched(false);
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    fetchRates({
      hotelIds: [hotelId],
      occupancies: [{ adults: adultsCount }],
      currency: 'USD',
      guestNationality: 'US',
      checkin,
      checkout,
      roomMapping: true,
      includeHotelData: true,
      language: selectedLanguage
    });
  }, [hotelId, checkin, checkout, adultsCount, selectedLanguage, fetchRates]);

  const handleSelectOffer = (offerId: string) => {
    router.push(`/hotels/checkout?offerId=${offerId}&hotelId=${hotelId}&checkin=${searchParams.get('checkin')}&checkout=${searchParams.get('checkout')}&adults=${searchParams.get('adults')}`);
  };

  const getRatingStatus = (rating: number) => {
    if (rating >= 9.5) return { text: 'Excellent', color: 'bg-green-600' };
    if (rating >= 8.4) return { text: 'Très bien', color: 'bg-pink-600' };
    if (rating >= 7.0) return { text: 'Bien', color: 'bg-pink-500' };
    if (rating >= 6.0) return { text: 'Moyen', color: 'bg-yellow-500' };
    return { text: 'Faible', color: 'bg-orange-500' };
  };

  const getFacilityIcon = (facilityId: number) => {
    // Mapping basique des IDs de facilities aux icônes
    const iconMap: { [key: number]: any } = {
      3: Wifi,
      5: Car,
      15: Utensils,
      28: Dumbbell,
      16: Waves,
    };
    return iconMap[facilityId] || Info;
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const elements: ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = (keyPrefix: string) => {
      if (currentList.length === 0) return;
      elements.push(
        <ul key={`${keyPrefix}-list-${elements.length}`} className="list-disc list-inside text-gray-700 space-y-1">
          {currentList.map((item, idx) => (
            <li key={`${keyPrefix}-item-${idx}`}>{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('*')) {
        currentList.push(trimmed.replace(/^\*\s*/, ''));
      } else {
        flushList(`p-${idx}`);
        elements.push(
          <p key={`p-${idx}`} className="text-gray-700 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });

    flushList('end');
    return elements;
  };

  const handleAskQuestion = async () => {
    setQuestionTouched(true);
    if (!question.trim() || !hotelId) {
      return;
    }

    const currentQuestion = question.trim();
    setConversation((prev) => [...prev, { role: 'user', content: currentQuestion }]);

    try {
      const response = await triggerAskQuestion({
        hotelId,
        query: currentQuestion,
        allowWebSearch: enableWebSearch
      }).unwrap();

      const assistantAnswer =
        response?.data?.data?.answer || response?.data?.answer || 'Aucune réponse disponible.';
      const citations = response?.data?.data?.citations || response?.data?.citations || [];
      const searchUsed =
        response?.data?.data?.search_used ?? response?.data?.search_used ?? enableWebSearch;

      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantAnswer,
          citations,
          searchUsed
        }
      ]);

      setQuestion('');
      setQuestionTouched(false);
    } catch (_) {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Une erreur s'est produite lors de la génération de la réponse."
        }
      ]);
    }
  };

  const handleQuestionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E72858]"></div>
        </div>
      </>
    );
  }

  if (error || !hotelDetails) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Hôtel non trouvé'}</p>
            <button
              onClick={() => router.push('/hotels/search')}
              className="px-4 py-2 bg-[#E72858] text-white rounded-lg"
            >
              Retour
            </button>
          </div>
        </div>
      </>
    );
  }

  const mainImage = allMedia[0]?.url || hotelDetails.hotelImages?.[0]?.url || '/placeholder-hotel.jpg';
  const thumbnailImages = allMedia.slice(1, 5);
  const remainingCount = allMedia.length - 5;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Galerie d'images principale */}
        <div className="relative max-w-7xl mx-auto">
          {allMedia.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 h-[500px]">
              {/* Image principale */}
              <div 
                className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-tl-lg rounded-bl-lg"
                onClick={() => setSelectedImageIndex(0)}
              >
                {allMedia[0].type === 'video' ? (
                  <>
                    <Image
                      src={allMedia[0].thumbnail || mainImage}
                      alt={hotelDetails.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-4">
                        <Play className="text-[#E72858]" size={48} fill="#E72858" />
                      </div>
                    </div>
                  </>
                ) : (
                  <Image
                    src={mainImage}
                    alt={hotelDetails.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              
              {/* Miniatures */}
              {thumbnailImages.map((media, idx) => (
                <div
                  key={idx}
                  className="relative cursor-pointer group overflow-hidden rounded"
                  onClick={() => setSelectedImageIndex(idx + 1)}
                >
                  {media.type === 'video' ? (
                    <>
                      <Image
                        src={media.thumbnail || mainImage}
                        alt="Video thumbnail"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <Play className="text-white" size={24} fill="white" />
                      </div>
                    </>
                  ) : (
                    <Image
                      src={media.url}
                      alt={`Image ${idx + 2}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  {idx === 3 && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold text-lg hover:bg-opacity-80 transition-all">
                      +{remainingCount} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-[500px] w-full">
              <Image
                src={mainImage}
                alt={hotelDetails.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header avec nom, badges et localisation */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {hotelDetails.starRating && (
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-500 fill-yellow-500" size={20} />
                      <span className="text-gray-700 font-semibold">{hotelDetails.starRating} étoiles</span>
                    </div>
                  )}
                  {hotelDetails.rating && (() => {
                    const ratingStatus = getRatingStatus(hotelDetails.rating);
                    return (
                      <div className={`${ratingStatus.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {ratingStatus.text} {hotelDetails.rating}
                      </div>
                    );
                  })()}
                  {hotelDetails.beachfront && (
                    <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Waves size={14} />
                      Beachfront
                    </div>
                  )}
                  {/* Sélecteur de langue */}
                  <div className="ml-auto flex items-center gap-2">
                    <Languages className="text-gray-500" size={18} />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E72858] focus:border-transparent"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{hotelDetails.name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={18} className="mr-2 text-[#E72858]" />
                  <span>{hotelDetails.address}</span>
                  {hotelDetails.city && <span>, {hotelDetails.city}</span>}
                  {hotelDetails.country && <span>, {hotelDetails.country.toUpperCase()}</span>}
                </div>
                {hotelDetails.location_type && (
                  <div className="text-pink-600 text-sm font-medium">
                    – Excellent location – show map
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assistant IA */}
          <div className="bg-gradient-to-br from-white via-rose-50/80 to-white border border-rose-100 shadow-lg shadow-rose-100/50 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sparkles className="text-rose-500" size={16} />
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-semibold">Assistant IA</p>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Que souhaitez-vous savoir ?</h2>
              <p className="text-sm text-gray-600">
                Posez des questions naturelles sur cet hôtel. L'assistant s'appuie sur LiteAPI Ask (beta) et peut
                activer une recherche web si nécessaire.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-white/90 border border-rose-100 focus-within:border-[#E72858] focus-within:ring-2 focus-within:ring-[#E72858]/30 rounded-full flex items-center gap-3 px-4 py-3 shadow-sm">
                <Search className="text-rose-400" size={18} />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleQuestionKeyDown}
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm text-gray-800"
                  placeholder="Donnez-moi un hôtel similaire à Marrakech ?"
                />
                <button
                  type="button"
                  onClick={handleAskQuestion}
                  disabled={askingQuestion || !question.trim()}
                  className="bg-[#E72858] text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {askingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                  <span className="sr-only">Envoyer</span>
                </button>
              </div>
              {questionTouched && !question.trim() && (
                <p className="text-xs text-red-500 ml-1">Veuillez saisir une question.</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <button
                  type="button"
                  onClick={() => setEnableWebSearch(!enableWebSearch)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    enableWebSearch
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-pink-500 text-white border border-gray-200 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  <Globe size={14} />
                  <span>Recherche web</span>
                </button>
                <span className="text-gray-400">|</span>
                <span>{askingQuestion ? 'Analyse en cours...' : 'Temps de réponse moyen ~3s'}</span>
              </div>
              {askErrorMessage && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {askErrorMessage}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {conversation.length === 0 && (
                <div className="border border-dashed border-rose-200 rounded-2xl p-4 bg-white/70 text-sm text-gray-500">
                  Commencez la conversation pour obtenir des recommandations sur les équipements, les politiques, les
                  restaurants ou les navettes.
                </div>
              )}
              {conversation.map((message, index) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={`${message.role}-${index}-${message.content.slice(0, 10)}`}
                    className={`rounded-2xl p-4 border ${
                      isUser
                        ? 'bg-gradient-to-r from-[#ffe0eb] to-white border-rose-100'
                        : 'bg-white border-gray-100'
                    } shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            isUser ? 'bg-[#E72858] text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isUser ? 'me' : 'IA'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {isUser ? 'me' : 'Assistant IA'}
                          </p>
                          <p className="text-xs text-gray-500">{isUser ? 'Question' : 'Réponse'}</p>
                        </div>
                      </div>
                      {!isUser && message.searchUsed && (
                        <span className="text-[10px] uppercase tracking-wide bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          Web search activée
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">{renderFormattedText(message.content)}</div>
                    {!isUser && message.citations && message.citations.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        Sources : {message.citations.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview' as TabType, label: 'Overview' },
                { id: 'info' as TabType, label: 'Info & prices' },
                { id: 'facilities' as TabType, label: 'Facilities' },
                { id: 'house-rules' as TabType, label: 'House rules' },
                { id: 'reviews' as TabType, label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#E72858] text-[#E72858]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="md:col-span-2">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Informations commerciales */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold mb-4">Informations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hotelDetails.chain && (
                        <div>
                          <span className="text-sm text-gray-600">Chaîne hôtelière</span>
                          <p className="font-semibold text-gray-900">{hotelDetails.chain}</p>
                        </div>
                      )}
                      {hotelDetails.hotelType && (
                        <div>
                          <span className="text-sm text-gray-600">Type d'hôtel</span>
                          <p className="font-semibold text-gray-900">{hotelDetails.hotelType}</p>
                        </div>
                      )}
                      {hotelDetails.currency && (
                        <div>
                          <span className="text-sm text-gray-600">Devise</span>
                          <p className="font-semibold text-gray-900">{hotelDetails.currency}</p>
                        </div>
                      )}
                      {hotelDetails.starRating && (
                        <div>
                          <span className="text-sm text-gray-600">Classification</span>
                          <p className="font-semibold text-gray-900">{hotelDetails.starRating} étoiles</p>
                        </div>
                      )}
                      {hotelDetails.latitude && hotelDetails.longitude && (
                        <div>
                          <span className="text-sm text-gray-600">Coordonnées</span>
                          <p className="font-semibold text-gray-900">
                            {hotelDetails.latitude.toFixed(4)}, {hotelDetails.longitude.toFixed(4)}
                          </p>
                        </div>
                      )}
                      {hotelDetails.zip && (
                        <div>
                          <span className="text-sm text-gray-600">Code postal</span>
                          <p className="font-semibold text-gray-900">{hotelDetails.zip}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {hotelDetails.hotelDescription && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-2xl font-bold mb-4">À propos de cet établissement</h2>
                      <div
                        className="text-gray-700 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: hotelDetails.hotelDescription }}
                      />
                    </div>
                  )}

                  {/* Types de chambres */}
                  {hotelDetails.rooms && hotelDetails.rooms.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-2xl font-bold mb-6">Types de chambres</h2>
                      <div className="space-y-6">
                        {hotelDetails.rooms.map((room: any, idx: number) => {
                          const roomPhotos = room.photos || [];
                          return (
                            <div 
                              key={idx} 
                              className="border border-gray-200 rounded-lg p-4 hover:border-[#E72858] hover:shadow-md transition-all cursor-pointer"
                              onClick={() => {
                                if (roomPhotos.length > 0) {
                                  setSelectedRoom(room);
                                  setSelectedRoomMediaIndex(0);
                                }
                              }}
                            >
                              <div className="flex gap-4">
                                {roomPhotos[0] && (
                                  <div className="w-32 h-24 relative flex-shrink-0">
                                    <Image
                                      src={roomPhotos[0].url}
                                      alt={room.roomName || room.name || 'Chambre'}
                                      fill
                                      className="object-cover rounded"
                                    />
                                    {roomPhotos.length > 1 && (
                                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                                        {roomPhotos.length} photos
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">{room.roomName || room.name || 'Chambre'}</h3>
                                  {room.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{room.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    {room.maxOccupancy && (
                                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                        Jusqu'à {room.maxOccupancy} personnes
                                      </span>
                                    )}
                                    {room.bedTypes && room.bedTypes.length > 0 && (
                                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                                        <Bed size={12} />
                                        {room.bedTypes.map((bed: any) => bed.bedType || bed).join(', ')}
                                      </span>
                                    )}
                                    {room.roomSizeSquare && (
                                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                        {room.roomSizeSquare} {room.roomSizeUnit || 'm²'}
                                      </span>
                                    )}
                                  </div>
                                  {roomPhotos.length > 0 && (
                                    <p className="text-xs text-[#E72858] mt-2 font-medium">
                                      Cliquez pour voir toutes les photos
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {hotelDetails.sentiment_analysis && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-2xl font-bold mb-4">Ce que les clients adorent</h2>
                      {hotelDetails.sentiment_analysis.pros && hotelDetails.sentiment_analysis.pros.length > 0 && (
                        <div className="mb-4">
                          <ul className="space-y-2">
                            {hotelDetails.sentiment_analysis.pros.map((pro: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                                <span className="text-gray-700">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hotelDetails.sentiment_analysis.cons && hotelDetails.sentiment_analysis.cons.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Points à améliorer</h3>
                          <ul className="space-y-2">
                            {hotelDetails.sentiment_analysis.cons.map((con: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <X className="text-red-600 mr-2 mt-1 flex-shrink-0" size={20} />
                                <span className="text-gray-700">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chambres disponibles */}
                  {Object.keys(groupedRates).length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-2xl font-bold mb-4">Chambres disponibles</h2>
                      <div className="space-y-4">
                        {Object.entries(groupedRates).slice(0, 3).map(([roomId, roomData]: [string, any]) => {
                          const firstRate = roomData.rates[0];
                          const totalPrice = firstRate?.retailRate?.total?.[0];
                          const price = totalPrice?.amount;
                          const currency = totalPrice?.currency || firstRate?.retailRate?.currency || 'USD';
                          
                          const formatCurrency = (amount: number, curr: string) => {
                            if (!amount && amount !== 0) return 'N/A';
                            return new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: curr,
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(amount);
                          };
                          
                          return (
                            <div key={roomId} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex gap-4">
                                {roomData.roomImage && (
                                  <div className="w-32 h-24 relative flex-shrink-0">
                                    <Image
                                      src={roomData.roomImage}
                                      alt={roomData.roomName}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">{roomData.roomName}</h3>
                                  <div className="text-sm text-gray-600 mb-2">
                                    {roomData.rates.length} option{roomData.rates.length > 1 ? 's' : ''} disponible{roomData.rates.length > 1 ? 's' : ''}
                                  </div>
                                  <div className="text-lg font-bold text-[#E72858]">
                                    À partir de {formatCurrency(price || 0, currency)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info & Prices Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6 w-full">
                  {Object.keys(groupedRates).length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                      <p className="text-gray-600">Aucune chambre disponible pour ces dates</p>
                    </div>
                  ) : (
                    <div className="space-y-6 w-full">
                      {Object.entries(groupedRates).map(([roomId, roomData]: [string, any]) => (
                        <div key={roomId} className="bg-white rounded-lg shadow-sm overflow-hidden w-full ">
                          <div className="flex flex-col md:flex-row">
                            {roomData.roomImage && (
                              <div className="md:w-1/3 h-64 md:h-auto relative">
                                <Image
                                  src={roomData.roomImage}
                                  alt={roomData.roomName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="md:w-2/3 p-6">
                              <h3 className="text-xl font-bold mb-4">{roomData.roomName}</h3>
                              <div className="space-y-3">
                                {roomData.rates.map((rate: any, idx: number) => {
                                  // Calcul précis du prix total
                                  const totalPrice = rate.retailRate?.total?.[0];
                                  const price = totalPrice?.amount;
                                  const currency = totalPrice?.currency || rate.retailRate?.currency || 'USD';
                                  const refundable = rate.cancellationPolicies?.refundableTag === 'RFN';
                                  const suggestedPrice = rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
                                  
                                  // Format de devise
                                  const formatCurrency = (amount: number, curr: string) => {
                                    if (!amount && amount !== 0) return 'N/A';
                                    return new Intl.NumberFormat('fr-FR', {
                                      style: 'currency',
                                      currency: curr,
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    }).format(amount);
                                  };
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className="border border-gray-200 rounded-lg p-4 hover:border-[#E72858] hover:shadow-md transition-all"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                          <div className="font-semibold mb-2 text-lg">{rate.boardName || 'Room Only'}</div>
                                          <div className="flex flex-wrap gap-2 mb-2">
                                            {refundable && (
                                              <span className="inline-flex items-center text-green-600 text-sm bg-green-50 px-2 py-1 rounded border border-green-200">
                                                <CheckCircle size={14} className="mr-1" />
                                                Remboursable
                                              </span>
                                            )}
                                            {!refundable && (
                                              <span className="inline-flex items-center text-orange-600 text-sm bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                                <Shield size={14} className="mr-1" />
                                                Non remboursable
                                              </span>
                                            )}
                                            {rate.maxOccupancy && (
                                              <span className="inline-flex items-center text-gray-600 text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                <Users size={14} className="mr-1" />
                                                Jusqu'à {rate.maxOccupancy} personnes
                                              </span>
                                            )}
                                            {rate.adultCount && (
                                              <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                {rate.adultCount} adulte{rate.adultCount > 1 ? 's' : ''}
                                              </span>
                                            )}
                                            {rate.childCount > 0 && (
                                              <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                {rate.childCount} enfant{rate.childCount > 1 ? 's' : ''}
                                              </span>
                                            )}
                                          </div>
                                          {rate.remarks && (
                                            <div 
                                              className="text-sm text-gray-600 mb-2 prose prose-sm max-w-none"
                                              dangerouslySetInnerHTML={{ __html: rate.remarks }}
                                            />
                                          )}
                                          {rate.retailRate?.taxesAndFees && rate.retailRate.taxesAndFees.length > 0 && (
                                            <div className="text-xs text-gray-500 mb-2">
                                              {rate.retailRate.taxesAndFees.filter((t: any) => t.included).length > 0 && (
                                                <span>
                                                  {rate.retailRate.taxesAndFees.filter((t: any) => t.included).length} taxe(s) incluse(s)
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right ml-4">
                                          {suggestedPrice && price && suggestedPrice > price && (
                                            <>
                                              <div className="text-sm text-gray-500 line-through mb-1">
                                                {formatCurrency(suggestedPrice, currency)}
                                              </div>
                                              <div className="text-xs text-green-600 font-medium mb-1">
                                                Économisez {formatCurrency(suggestedPrice - price, currency)}
                                              </div>
                                            </>
                                          )}
                                          <div className="text-3xl font-bold text-[#E72858]">
                                            {formatCurrency(price || 0, currency)}
                                          </div>
                                          <div className="text-sm text-gray-600">total</div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleSelectOffer(rate.offerId)}
                                        className="w-full mt-3 bg-[#E72858] text-white py-3 rounded-lg font-semibold hover:bg-[#d6204a] transition-colors"
                                      >
                                        Sélectionner cette offre
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Facilities Tab */}
              {activeTab === 'facilities' && (
                <div className="space-y-6">
                  {/* Équipements de l'hôtel */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold mb-6">Équipements de l'hôtel</h2>
                    {hotelDetails.facilities && hotelDetails.facilities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hotelDetails.facilities.map((facility: any, idx: number) => {
                          const Icon = getFacilityIcon(facility.id || idx);
                          // Gérer les cas où facility est un objet ou une chaîne
                          const facilityName = typeof facility === 'string' 
                            ? facility 
                            : (facility?.name || facility?.description || `Équipement ${facility?.id || idx}`);
                          return (
                            <div key={idx} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#E72858] hover:shadow-sm transition-all">
                              <Icon size={24} className="text-[#E72858] flex-shrink-0" />
                              <span className="text-gray-700">{facilityName}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : hotelDetails.facilityIds && hotelDetails.facilityIds.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hotelDetails.facilityIds.map((facilityId: number, idx: number) => {
                          const Icon = getFacilityIcon(facilityId);
                          return (
                            <div key={idx} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#E72858] hover:shadow-sm transition-all">
                              <Icon size={24} className="text-[#E72858] flex-shrink-0" />
                              <span className="text-gray-700">Équipement {facilityId}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600">Aucun équipement disponible</p>
                    )}
                  </div>

                </div>
              )}

              {/* House Rules Tab */}
              {activeTab === 'house-rules' && (
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Règles de la maison</h2>
                  
                  {hotelDetails.checkIn && (
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar size={20} className="text-[#E72858]" />
                        Arrivée
                      </h3>
                      <p className="text-gray-700">{hotelDetails.checkIn}</p>
                    </div>
                  )}
                  
                  {hotelDetails.checkOut && (
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar size={20} className="text-[#E72858]" />
                        Départ
                      </h3>
                      <p className="text-gray-700">{hotelDetails.checkOut}</p>
                    </div>
                  )}

                  {hotelDetails.policies && (
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-[#E72858]" />
                        Politiques
                      </h3>
                      <div className="text-gray-700 space-y-2">
                        {Array.isArray(hotelDetails.policies) ? (
                          hotelDetails.policies.map((policy: any, idx: number) => {
                            // Si c'est un objet, afficher ses propriétés
                            if (typeof policy === 'object' && policy !== null) {
                              return (
                                <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2">
                                  {policy.name && (
                                    <p className="font-semibold mb-1">{policy.name}</p>
                                  )}
                                  {policy.description && (
                                    <p className="text-sm">{policy.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {policy.child_allowed !== undefined && (
                                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        Enfants: {policy.child_allowed ? 'Autorisés' : 'Non autorisés'}
                                      </span>
                                    )}
                                    {policy.pets_allowed !== undefined && (
                                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                        Animaux: {policy.pets_allowed ? 'Autorisés' : 'Non autorisés'}
                                      </span>
                                    )}
                                    {policy.parking !== undefined && (
                                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                        Parking: {policy.parking ? 'Disponible' : 'Non disponible'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            // Si c'est une chaîne, l'afficher directement
                            return (
                              <p key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{String(policy)}</span>
                              </p>
                            );
                          })
                        ) : typeof hotelDetails.policies === 'object' ? (
                          <div className="border border-gray-200 rounded-lg p-3">
                            {hotelDetails.policies.name && (
                              <p className="font-semibold mb-1">{hotelDetails.policies.name}</p>
                            )}
                            {hotelDetails.policies.description && (
                              <p className="text-sm">{hotelDetails.policies.description}</p>
                            )}
                          </div>
                        ) : (
                          <p>{String(hotelDetails.policies)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {hotelDetails.hotelRemarks && Array.isArray(hotelDetails.hotelRemarks) && hotelDetails.hotelRemarks.length > 0 && (
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Info size={20} className="text-[#E72858]" />
                        Remarques importantes
                      </h3>
                      <ul className="text-gray-700 space-y-2">
                        {hotelDetails.hotelRemarks.map((remark: any, idx: number) => {
                          // Gérer les cas où remark est un objet ou une chaîne
                          const remarkText = typeof remark === 'string' 
                            ? remark 
                            : (remark?.text || remark?.description || remark?.message || String(remark));
                          return (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 text-[#E72858]">•</span>
                              <span>{remarkText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {hotelDetails.cancellationPolicy && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-[#E72858]" />
                        Politique d'annulation
                      </h3>
                      <div className="text-gray-700">
                        {typeof hotelDetails.cancellationPolicy === 'string' ? (
                          <p>{hotelDetails.cancellationPolicy}</p>
                        ) : (
                          <div className="space-y-2">
                            {hotelDetails.cancellationPolicy.description && (
                              <p>{hotelDetails.cancellationPolicy.description}</p>
                            )}
                            {hotelDetails.cancellationPolicy.rules && Array.isArray(hotelDetails.cancellationPolicy.rules) && (
                              <ul className="list-disc list-inside space-y-1">
                                {hotelDetails.cancellationPolicy.rules.map((rule: any, idx: number) => {
                                  const ruleText = typeof rule === 'string' 
                                    ? rule 
                                    : (rule?.text || rule?.description || String(rule));
                                  return <li key={idx}>{ruleText}</li>;
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                      <p className="text-gray-600">Aucun avis disponible pour cet hôtel</p>
                    </div>
                  ) : (
                    <>
                      {/* Résumé des avis */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">Avis des clients</h2>
                        <div className="flex items-center gap-4 mb-4">
                          {hotelDetails.rating && (
                            <div className="text-5xl font-bold text-gray-900">{hotelDetails.rating}</div>
                          )}
                          <div>
                            {hotelDetails.rating && (() => {
                              const ratingStatus = getRatingStatus(hotelDetails.rating);
                              return (
                                <div className={`${ratingStatus.color} text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-2`}>
                                  {ratingStatus.text}
                                </div>
                              );
                            })()}
                            <div className="text-gray-600">
                              {hotelDetails.reviewCount || reviews.length} avis
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Liste des avis */}
                      <div className="space-y-6">
                        {reviews.map((review: any, idx: number) => {
                          const rating = review.averageScore || review.rating;
                          const country = review.country || review.guestCountry;
                          const travelerType = review.type;
                          const travelerTypeLabels: { [key: string]: string } = {
                            'couple': 'Couple',
                            'solo_traveller': 'Voyageur solo',
                            'family_with_children': 'Famille avec enfants',
                            'extended_group': 'Groupe étendu'
                          };
                          
                          return (
                            <div key={idx} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    {rating && (
                                      <div className="flex items-center gap-1">
                                        <span className="ml-1 font-bold text-lg">{rating}</span>
                                      </div>
                                    )}
                                    {review.name && (
                                      <span className="text-gray-900 font-semibold">{review.name}</span>
                                    )}
                                    {country && (
                                      <span className="text-gray-500 text-sm">({country.toUpperCase()})</span>
                                    )}
                                    {travelerType && travelerTypeLabels[travelerType] && (
                                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        {travelerTypeLabels[travelerType]}
                                      </span>
                                    )}
                                  </div>
                                  {review.date && (
                                    <div className="text-sm text-gray-500 mb-2">
                                      Séjour le {new Date(review.date).toLocaleDateString('fr-FR', { 
                                        year: 'numeric', 
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  )}
                                  {review.headline && (
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.headline}</h3>
                                  )}
                                </div>
                                {rating && (() => {
                                  const ratingStatus = getRatingStatus(rating);
                                  return (
                                    <div className={`${ratingStatus.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                      {ratingStatus.text}
                                    </div>
                                  );
                                })()}
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                {review.pros && review.pros.trim() && (
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                                      <CheckCircle size={16} className="text-green-600" />
                                      Points positifs
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{review.pros}</p>
                                  </div>
                                )}
                                {review.cons && review.cons.trim() && (
                                  <div className="bg-red-50 rounded-lg p-4">
                                    <div className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                                      <X size={16} className="text-red-600" />
                                      Points négatifs
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{review.cons}</p>
                                  </div>
                                )}
                              </div>
                              
                              {review.source && (
                                <div className="mt-3 text-xs text-gray-500">
                                  Source: {review.source}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="space-y-4 mb-6">
                  {hotelDetails.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Note</span>
                      <span className="font-bold text-lg">{hotelDetails.rating}</span>
                    </div>
                  )}
                  {hotelDetails.starRating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Classification</span>
                      <div className="flex items-center gap-2">
                        {[...Array(Math.floor(hotelDetails.starRating))].map((_, i) => (
                          <Star key={i} className="text-yellow-400 fill-yellow-400" size={18} />
                        ))}
                        <span className="font-semibold text-sm">{hotelDetails.starRating}</span>
                      </div>
                    </div>
                  )}
                  {hotelDetails.reviewCount && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avis</span>
                      <span className="font-semibold">{hotelDetails.reviewCount}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Arrivée</span>
                    <span className="font-semibold">{searchParams.get('checkin')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Départ</span>
                    <span className="font-semibold">{searchParams.get('checkout')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Voyageurs</span>
                    <span className="font-semibold">{searchParams.get('adults') || '2'} adulte(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de galerie */}
        {selectedImageIndex !== null && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                <X size={28} />
              </button>
              {selectedImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex - 1);
                  }}
                  className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft size={28} />
                </button>
              )}
              {selectedImageIndex < allMedia.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex + 1);
                  }}
                  className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight size={28} />
                </button>
              )}
              <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
                {allMedia[selectedImageIndex]?.type === 'video' ? (
                  <video
                    src={allMedia[selectedImageIndex].url}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Image
                    src={allMedia[selectedImageIndex]?.url || mainImage}
                    alt={`Image ${selectedImageIndex + 1}`}
                    fill
                    className="object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {selectedImageIndex + 1} / {allMedia.length}
              </div>
            </div>
          </div>
        )}

        {/* Modal de galerie pour la chambre sélectionnée */}
        {selectedRoom && selectedRoomMediaIndex !== null && selectedRoom.photos && selectedRoom.photos.length > 0 && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedRoom(null);
              setSelectedRoomMediaIndex(null);
            }}
          >
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setSelectedRoomMediaIndex(null);
                }}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                <X size={28} />
              </button>
              {selectedRoomMediaIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoomMediaIndex(selectedRoomMediaIndex - 1);
                  }}
                  className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft size={28} />
                </button>
              )}
              {selectedRoomMediaIndex < selectedRoom.photos.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoomMediaIndex(selectedRoomMediaIndex + 1);
                  }}
                  className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight size={28} />
                </button>
              )}
              <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
                <Image
                  src={selectedRoom.photos[selectedRoomMediaIndex].url}
                  alt={selectedRoom.roomName || selectedRoom.name || 'Chambre'}
                  fill
                  className="object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                <div className="font-semibold mb-1">{selectedRoom.roomName || selectedRoom.name || 'Chambre'}</div>
                <div>{selectedRoomMediaIndex + 1} / {selectedRoom.photos.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
