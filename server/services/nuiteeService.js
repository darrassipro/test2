require('isomorphic-fetch');
require('dotenv').config();

const NUITEE_API_KEY = process.env.NUITEE_API_KEY;
const NUITEE_API_BASE_URL = process.env.NUITEE_API_BASE_URL || 'api.liteapi.travel';
const NUITEE_API_VERSION = process.env.NUITEE_API_VERSION || 'v3.0';

const API_SERVER_URL = `https://${NUITEE_API_BASE_URL}/${NUITEE_API_VERSION}`;

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
    };
    
    if (NUITEE_API_KEY) {
        headers['X-API-Key'] = NUITEE_API_KEY;
    }
    
    return headers;
}

// Client manuel qui simule le SDK
const liteApiClient = {
    // POST /hotels/rates
    async searchHotelRates(payload) {
        const url = `${API_SERVER_URL}/hotels/rates`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload || {})
        });

        if (response.status === 204) {
            return { status: 204, data: null };
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            const error = new Error(data?.error?.message || data?.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return { status: response.status, data };
    },

    // GET /data/places
    async getDataPlaces(queryString = '') {
        const url = `${API_SERVER_URL}/data/places${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            const error = new Error(data?.error?.message || data?.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return { data };
    },
    // GET /data/hotels
    async getDataHotels(queryString = '') {
        const url = `${API_SERVER_URL}/data/hotels${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        
        if (!response.ok) {
            const error = new Error(data?.error?.message || data?.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return { data };
    },
    
    // GET /data/hotel
    async getDataHotel(queryString = '') {
        const url = `${API_SERVER_URL}/data/hotel${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        
        if (!response.ok) {
            const error = new Error(data?.error?.message || data?.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return { data };
    },
    
    // GET /data/reviews
    async getDataReviews(queryString = '') {
        const url = `${API_SERVER_URL}/data/reviews${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        
        if (!response.ok) {
            const error = new Error(data?.error?.message || data?.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return { data };
    },

    async getAskNaturalLanguageQuestions(queryString = '') {
        const url = `${API_SERVER_URL}/data/hotel/ask${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        
        if (!response.ok) {
            const error = new Error(data?.error?.message || data?.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return { data };
    },
    
    // autres helpers retirés car inutilisés
};

function getLiteApiClient() {
    return liteApiClient;
}

module.exports = {
    getLiteApiClient
};
