const express = require('express');
const router = express.Router();
const {
    searchPlacesController,
    searchRatesController,
    getHotelDetailsController,
    askNaturalLanguageQuestionsController,
    listHotelsController,
    getHotelReviewsController
} = require('../controllers/bookingController');

// Search Places (autocomplete)
router.get('/places', searchPlacesController);

// Search Hotel Rates
router.post('/rates', searchRatesController);

// Get Hotel Details
router.get('/hotel', getHotelDetailsController);

// Ask AI question about hotel
router.get('/hotel/ask', askNaturalLanguageQuestionsController);

// List Hotels
router.get('/hotels', listHotelsController);

// Get Hotel Reviews
router.get('/hotel/reviews', getHotelReviewsController);

module.exports = router;

