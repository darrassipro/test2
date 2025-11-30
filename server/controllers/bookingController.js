const { getLiteApiClient } = require('../services/nuiteeService');

const DEFAULT_TIMEOUT = 4;

const truthyValues = ['true', '1', 'yes', 'on'];
const falsyValues = ['false', '0', 'no', 'off'];

//===============================================
// utils functions
//===============================================

function toInteger(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function toFloat(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function toBoolean(value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    const normalized = String(value).trim().toLowerCase();
    if (truthyValues.includes(normalized)) return true;
    if (falsyValues.includes(normalized)) return false;
    return undefined;
}

function buildMetadata(source, schema) {
    return Object.entries(schema).reduce((acc, [key, parser]) => {
        if (source[key] === undefined) {
            return acc;
        }
        const parsedValue = parser ? parser(source[key]) : source[key];
        if (parsedValue !== undefined && parsedValue !== '') {
            acc[key] = parsedValue;
        }
        return acc;
    }, {});
}

function metadataToQueryString(metadata = {}) {
    const params = new URLSearchParams();

    Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((entry) => {
                if (entry !== undefined && entry !== null && entry !== '') {
                    params.append(key, entry);
                }
            });
            return;
        }

        params.append(key, value);
    });

    return params.toString();
}

function handleControllerError(res, error, fallbackMessage) {
    console.error(fallbackMessage, error);
    const status = error?.status || error?.statusCode || 500;
    const details = error?.data || error?.error || { message: fallbackMessage };

    res.status(status).json({
        success: false,
        error: details,
        message: fallbackMessage
    });
}

//==================================================
//==================================================

// Search Places (autocomplete)
async function searchPlacesController(req, res) {
    try {
        const metadata = buildMetadata(req.query, {
            textQuery: null,
            type: null,
            language: null,
            clientIP: null
        });

        if (!metadata.textQuery) {
            return res.status(400).json({
                success: false,
                error: 'textQuery parameter is required'
            });
        }

        const queryString = metadataToQueryString(metadata);
        const { data } = await getLiteApiClient().getDataPlaces(queryString);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        handleControllerError(res, error, 'Erreur lors de la recherche de lieux');
    }
}

// Search Hotel Rates
async function searchRatesController(req, res) {
    try {
        const response = await getLiteApiClient().searchHotelRates(req.body);

        if (response.status === 204) {
            // No Content - Aucun résultat trouvé
            return res.status(200).json({
                success: true,
                data: {
                    data: [],
                    hotels: []
                },
                message: 'Aucun hôtel trouvé pour les critères de recherche'
            });
        }
        
        if (response.status === 200) {
            // Même si data est null, retourner une structure valide
            return res.status(200).json({
                success: true,
                data: response.data || { data: [], hotels: [] }
            });
        }

        // Autres codes de statut (ne devrait pas arriver ici normalement)
        return res.status(response.status || 500).json({
            success: false,
            error: response.data || { message: 'Erreur inconnue' }
        });
    } catch (error) {
        console.error('Search Rates - Error:', error);
        console.error('Search Rates - Error status:', error.status || error.statusCode);
        console.error('Search Rates - Error data:', error.data || error.error);
        handleControllerError(res, error, 'Erreur lors de la recherche de tarifs');
    }
}

// Get Hotel Details
async function getHotelDetailsController(req, res) {
    try {
        const metadata = buildMetadata(req.query, {
            hotelId: null,
            timeout: toFloat,
            language: null,
            advancedAccessibilityOnly: toBoolean
        });

        if (!metadata.hotelId) {
            return res.status(400).json({
                success: false,
                error: 'hotelId parameter is required'
            });
        }

        metadata.timeout = metadata.timeout ?? DEFAULT_TIMEOUT;

        const queryString = metadataToQueryString(metadata);
        const { data } = await getLiteApiClient().getDataHotel(queryString);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        handleControllerError(res, error, 'Erreur lors de la récupération du détail hôtel');
    }
}

async function askNaturalLanguageQuestionsController(req, res) {
    try {
        const metadata = buildMetadata(req.query, {
            hotelId: null,
            query: null,
            allowWebSearch: toBoolean
        });

        if (!metadata.hotelId || !metadata.query) {
            return res.status(400).json({
                success: false,
                error: 'hotelId and query parameters are required'
            });
        }

        metadata.allowWebSearch = metadata.allowWebSearch ?? false;

        const queryString = metadataToQueryString(metadata);
        const { data } = await getLiteApiClient().getAskNaturalLanguageQuestions(queryString);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        handleControllerError(res, error, 'Erreur lors de la récupération des questions naturelles');
    }
}

// List Hotels metadata helper
const hotelsMetadataSchema = {
    countryCode: null,
    cityName: null,
    hotelName: null,
    offset: toInteger,
    limit: toInteger,
    lastUpdatedAt: null,
    longitude: toFloat,
    latitude: toFloat,
    radius: toInteger,
    aiSearch: null,
    timeout: toFloat,
    zip: null,
    minRating: toFloat,
    minReviewsCount: toInteger,
    facilityIds: null,
    hotelTypeIds: null,
    chainIds: null,
    strictFacilitiesFiltering: toBoolean,
    starRating: null,
    placeId: null,
    language: null,
    hotelIds: null,
    iataCode: null,
    advancedAccessibilityOnly: toBoolean
};

async function listHotelsController(req, res) {
    try {
        const metadata = buildMetadata(req.query, hotelsMetadataSchema);
        const hasCountryCode = !!metadata.countryCode;
        const hasLatLng = !!(metadata.latitude && metadata.longitude);
        const hasPlaceId = !!metadata.placeId;
        const hasLastUpdatedAt = !!metadata.lastUpdatedAt;
        const hasIataCode = !!metadata.iataCode;
        const hasHotelIds = !!metadata.hotelIds;
        
        if (!hasCountryCode && !hasLatLng && !hasPlaceId && !hasLastUpdatedAt && !hasIataCode && !hasHotelIds) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 4000,
                    description: 'you must search by either country code, latitude and longitude, placeId, lastUpdatedAt, IATA code, or hotelIds',
                    message: 'bad request'
                }
            });
        }
        
        const queryString = metadataToQueryString(metadata);
        const { data } = await getLiteApiClient().getDataHotels(queryString);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        handleControllerError(res, error, 'Erreur lors de la récupération de la liste des hôtels');
    }
}

async function getHotelReviewsController(req, res) {
    try {
        const metadata = buildMetadata(req.query, {
            hotelId: null,
            limit: toInteger,
            offset: toInteger,
            timeout: toFloat,
            getSentiment: toBoolean,
            language: null
        });

        if (!metadata.hotelId) {
            return res.status(400).json({
                success: false,
                error: 'hotelId parameter is required'
            });
        }

        const queryString = metadataToQueryString(metadata);
        const { data } = await getLiteApiClient().getDataReviews(queryString);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        handleControllerError(res, error, 'Erreur lors de la récupération des avis');
    }
}

module.exports = {
    searchPlacesController,
    searchRatesController,
    getHotelDetailsController,
    askNaturalLanguageQuestionsController,
    listHotelsController,
    getHotelReviewsController
};

