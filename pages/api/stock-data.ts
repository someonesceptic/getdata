import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface StockData {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StockData[] | { error: string }>
) {
  console.log('Environment variables:', process.env);

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  console.log('API Key:', apiKey ? 'Set' : 'Not set');

  if (!apiKey) {
    console.error('API key is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await axios.get('https://api.twelvedata.com/time_series', {
      params: {
        symbol: 'AAPL',
        interval: '1month',
        apikey: apiKey,
        format: 'JSON',
        outputsize: '5000'
      }
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'Unknown error from Twelve Data API');
    }

    const stockData: StockData[] = response.data.values.map((item: any) => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume)
    }));

    res.status(200).json(stockData);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error fetching stock data' });
  }
}