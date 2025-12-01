// Configuration de l'API backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const BOOKING_ENDPOINTS = {
  PLACES: `${API_BASE_URL}/booking/places`,
  RATES: `${API_BASE_URL}/booking/rates`,
  PREBOOK: `${API_BASE_URL}/booking/prebook`,
  BOOK: `${API_BASE_URL}/booking/book`,
  HOTEL: `${API_BASE_URL}/booking/hotel`,
  HOTELS: `${API_BASE_URL}/booking/hotels`,
  REVIEWS: `${API_BASE_URL}/booking/hotel/reviews`,
};

