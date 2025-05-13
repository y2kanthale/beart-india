// StockMarquee.tsx
'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Using ShadCN Alert

interface Stock {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

// Define a type for the Finnhub API quote response
interface FinnhubQuoteResponse {
  c: number; // Current price
  d: number | null; // Change
  dp: number | null; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
  error?: string; // Optional error field from Finnhub
  [key: string]: any;
}

const initialStockData: Stock[] = [
    { symbol: 'RELIANCE', price: '₹2850.75', change: '+0.90%', isPositive: true },
    { symbol: 'TCS', price: '₹3800.10', change: '-0.40%', isPositive: false },
    { symbol: 'HDFCBANK', price: '₹1450.50', change: '+0.40%', isPositive: true },
    { symbol: 'INFY', price: '₹1500.00', change: '+0.81%', isPositive: true },
    { symbol: 'ICICIBANK', price: '₹1050.20', change: '-0.22%', isPositive: false },
    { symbol: 'SBIN', price: '₹750.90', change: '+1.09%', isPositive: true },
    { symbol: 'BHARTIARTL', price: '₹1200.45', change: '-0.46%', isPositive: false },
    { symbol: 'KOTAKBANK', price: '₹1780.00', change: '+0.18%', isPositive: true },
    { symbol: 'LT', price: '₹3550.60', change: '-0.56%', isPositive: false },
    { symbol: 'AXISBANK', price: '₹1100.15', change: '+0.96%', isPositive: true },
  ];

export function StockMarquee() {
  const [stockData, setStockData] = useState<Stock[]>(initialStockData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function getStockData() {
      setIsLoading(true);
      setError(null);
      const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

      if (!apiKey) {
        setError('API key not found. Displaying static data. Please set NEXT_PUBLIC_FINNHUB_API_KEY.');
        setStockData(initialStockData);
        setIsLoading(false);
        return;
      }

      const symbolsToFetch = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS', 'AXISBANK.NS'];

      try {
        const fetchedDataPromises = symbolsToFetch.map(async (fullSymbol) => {
          const actualSymbol = fullSymbol.split('.')[0];
          const fallbackSymbolData = initialStockData.find(s => s.symbol === actualSymbol) || { symbol: actualSymbol, price: "N/A", change: "N/A", isPositive: false };

          try {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${fullSymbol}&token=${apiKey}`
            );

            if (!response.ok) {
              console.warn(`Error fetching data for ${fullSymbol}: ${response.status} ${response.statusText || 'Unknown error'}. Using static data for this symbol.`);
              return fallbackSymbolData;
            }

            const data: FinnhubQuoteResponse = await response.json();
            
            if (data.error) {
              console.warn(`Finnhub API Error for ${fullSymbol}: ${data.error}. Using static data for this symbol.`);
              return fallbackSymbolData;
            }

            if (typeof data.c !== 'number' || typeof data.dp !== 'number' || (data.c === 0 && data.pc === 0 && data.d === null)) {
              console.warn(`No/Invalid data for symbol ${fullSymbol} from Finnhub (c: ${data.c}, dp: ${data.dp}). Using static data for this symbol.`);
              return fallbackSymbolData;
            }
            
            return {
              symbol: actualSymbol,
              price: `₹${data.c.toFixed(2)}`,
              change: `${(data.dp ?? 0).toFixed(2)}%`, // Use nullish coalescing for dp
              isPositive: (data.d ?? 0) >= 0,
            };
          } catch (symbolError: any) {
            console.error(`Failed to fetch or process data for ${fullSymbol}: ${symbolError.message}. Using static data for this symbol.`);
            return fallbackSymbolData;
          }
        });

        const results = await Promise.all(fetchedDataPromises);
        
        setStockData(results as Stock[]); // All items should be Stock objects now

      } catch (err: any) {
          console.error("General error fetching stock data:", err);
          setError(`Failed to fetch stock data. Displaying static data.`);
          setStockData(initialStockData); 
      } finally {
          setIsLoading(false);
      }
    }
    
    getStockData();
    const intervalId = setInterval(getStockData, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isMounted]);


  const dataToRender = stockData.length > 0 ? stockData : initialStockData;
  const marqueeData = dataToRender.length > 0 ? [...dataToRender, ...dataToRender] : [];


  return (
    <div className="w-full bg-secondary text-secondary-foreground overflow-hidden whitespace-nowrap h-10 flex items-center">
      {isLoading && isMounted && <div className="px-4 py-2 text-xs">Loading stock data...</div>}
      {error && isMounted && (
          <Alert variant="destructive" className="p-2 text-xs w-full">
            <AlertTitle className="text-xs font-semibold">API Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      {!isLoading && !error && marqueeData.length > 0 && (
        <div className="flex animate-marquee">
          {marqueeData.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2 px-4 py-2 border-r border-border last:border-r-0">
              <span className="text-xs font-semibold text-foreground">{stock.symbol}</span>
              <span className="text-xs">{stock.price}</span>
              <span
                className={cn(
                  'text-xs flex items-center',
                  stock.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {stock.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {stock.change}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Fallback for SSR or if API fails catastrophically and error is not yet set but stockData is empty */}
      {((!isMounted && initialStockData.length > 0) || (!isLoading && !error && stockData.length === 0 && initialStockData.length > 0)) && (
         <div className="flex"> {/* This div will not animate if marqueeData is empty */}
          {initialStockData.map((stock, index) => (
            <div key={`initial-${stock.symbol}-${index}`} className="flex items-center space-x-2 px-4 py-2 border-r border-border last:border-r-0">
              <span className="text-xs font-semibold text-foreground">{stock.symbol}</span>
              <span className="text-xs">{stock.price}</span>
              <span
                className={cn(
                  'text-xs flex items-center',
                  stock.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {stock.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {stock.change}
              </span>
            </div>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite; 
        }
      `}</style>
    </div>
  );
}
