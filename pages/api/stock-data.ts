import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface StockData {
  date: string;
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
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_MONTHLY',
        symbol: 'AAPL',
        apikey: apiKey,
      },
    });

    const monthlyTimeSeries = response.data['Monthly Time Series'];
    const formattedData: StockData[] = Object.entries(monthlyTimeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
}