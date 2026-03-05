import type { Handler, HandlerEvent } from '@netlify/functions';
import axios from 'axios';

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { accessToken, method = 'GET', endpoint, body } = JSON.parse(event.body || '{}');

    if (!accessToken || !endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Determine base URL based on environment
    const isProd = process.env.VITE_EBAY_ENVIRONMENT === 'production';
    const baseUrl = isProd 
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com';

    // Make request to eBay API
    const response = await axios({
      method,
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Language': 'en-US',
      },
      data: body,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error: any) {
    console.error('eBay API proxy error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.response?.data || error.message,
      }),
    };
  }
};

export { handler };
