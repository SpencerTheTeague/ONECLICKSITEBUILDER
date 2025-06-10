# OneClickSiteBuilder

Professional website creation service with Stripe payment integration.

## Features

- **Multiple Service Tiers**: Basic ($29.99), Premium ($99.99), Domain Package ($499.99)
- **Edit Credits System**: Additional edits available for $10 each
- **Complete Customer Data Collection**: Name, email, phone, address
- **Stripe Payment Integration**: Secure payment processing
- **Professional Forms**: Large, green, 3D submit buttons
- **Responsive Design**: Works on desktop and mobile

## Package Contents

### Frontend (`oneclicksitebuilder-clean/`)
- `index.html` - Main landing page with pricing
- `basic.html` - Basic plan order form
- `premium.html` - Premium plan order form  
- `domain.html` - Domain package order form
- `credits.html` - Standalone edit credits form
- `success.html` - Payment success page
- `styles.css` - Complete styling with fixed submit buttons
- `script.js` - Unified JavaScript for all forms
- Image assets for showcase

### Backend (`stripe-working/`)
- `app.py` - Flask server with Stripe integration
- Handles all order types (basic, premium, domain, credits)
- Processes customer data and payment information
- Live Stripe API integration

## Recent Updates

### ✅ Submit Button Styling Fixed
- All submit buttons now display as large, green, 3D raised buttons
- Consistent styling across all forms
- Professional appearance matching design requirements

### ✅ Complete Payment System
- All order forms collect complete customer information
- Edit credits available on all forms with real-time calculation
- Backend processes all order types correctly
- Customer data properly captured and logged

## Deployment

1. **Frontend**: Serve the `oneclicksitebuilder-clean/` directory
2. **Backend**: Run `python3 app.py` in `stripe-working/` directory
3. **Configuration**: Update Stripe keys in `app.py` for production

## Live Demo

- **Website**: https://8022-iiblxxu8kfn4b3g7cndpb-b71d04c4.manusvm.computer
- **Backend**: https://5002-iiblxxu8kfn4b3g7cndpb-b71d04c4.manusvm.computer

## Contact

For support or questions, contact: spencer@oneclicksitebuilder.com

