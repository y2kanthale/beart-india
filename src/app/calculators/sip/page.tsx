'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, IndianRupee, Percent, BarChart as BarChartIconLucide } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';


export const SipCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [totalInvested, setTotalInvested] = useState(0);
  const [estimatedReturns, setEstimatedReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [pieChartData, setPieChartData] = useState<any[]>([]); // Renamed for clarity
  const [isMounted, setIsMounted] = useState(false);
  const [pieOuterRadius, setPieOuterRadius] = useState(80);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateSip = () => {
    if (!isMounted || monthlyInvestment <= 0 || expectedReturnRate <= 0 || timePeriod <= 0) {
        setTotalInvested(0);
        setEstimatedReturns(0);
        setTotalValue(0);
        setPieChartData([]);
        return;
    }
    const P = monthlyInvestment;
    const r = expectedReturnRate / 100 / 12; 
    const n = timePeriod * 12; 

    if (r === 0 && P === 0) { 
        setTotalInvested(0);
        setEstimatedReturns(0);
        setTotalValue(0);
        setPieChartData([]);
        return;
    }
    if (r === 0) { 
        const investedAmount = P * n;
        setTotalInvested(Math.round(investedAmount));
        setEstimatedReturns(0);
        setTotalValue(Math.round(investedAmount));
        setPieChartData(investedAmount > 0 ? [
            { name: 'Total Invested', value: Math.round(investedAmount) },
            { name: 'Estimated Returns', value: 0 },
        ] : []);
        return;
    }


    const M = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const investedAmount = P * n;
    const returns = M - investedAmount;

    const finalTotalInvested = Math.round(investedAmount);
    const finalEstimatedReturns = Math.round(returns < 0 ? 0 : returns);
    const finalTotalValue = Math.round(M < investedAmount ? investedAmount : M);

    setTotalInvested(finalTotalInvested);
    setEstimatedReturns(finalEstimatedReturns); 
    setTotalValue(finalTotalValue); 

    if (finalTotalInvested > 0 || finalEstimatedReturns > 0) {
      setPieChartData([
        { name: 'Total Invested', value: finalTotalInvested },
        { name: 'Estimated Returns', value: finalEstimatedReturns },
      ]);
    } else {
      setPieChartData([]);
    }
  };


  useEffect(() => {
    if (isMounted) {
      calculateSip();
      setPieOuterRadius(window.innerWidth < 640 ? 60 : 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyInvestment, expectedReturnRate, timePeriod, isMounted]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!isMounted) {
    return <div className="flex justify-center items-center h-64">Loading calculator...</div>;
  }
  
  const COLORS = ['hsl(var(--secondary-foreground))', 'hsl(var(--primary))'];


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-in fade-in zoom-in-95 duration-500 border-0 shadow-none">
      <CardHeader className="text-left">
        <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
          <Calculator className="mr-2 h-7 w-7 text-primary" /> SIP Calculator
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Estimate the future value of your Systematic Investment Plan (SIP).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyInvestmentSip" className="flex justify-between items-center text-sm sm:text-base">
                Monthly Investment <span className="text-primary font-semibold">{formatCurrency(monthlyInvestment)}</span>
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <Slider
                  id="monthlyInvestmentSip"
                  min={500}
                  max={100000}
                  step={500}
                  value={[monthlyInvestment]}
                  onValueChange={(value) => setMonthlyInvestment(value[0])}
                  className="flex-grow"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="returnRateSip" className="flex justify-between items-center text-sm sm:text-base">
                Expected Return Rate (p.a.) <span className="text-primary font-semibold">{expectedReturnRate}%</span>
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <Slider
                  id="returnRateSip"
                  min={1}
                  max={30}
                  step={0.5}
                  value={[expectedReturnRate]}
                  onValueChange={(value) => setExpectedReturnRate(value[0])}
                  className="flex-grow"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timePeriodSip" className="flex justify-between items-center text-sm sm:text-base">
                Time Period (Years) <span className="text-primary font-semibold">{timePeriod} Yrs</span>
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <BarChartIconLucide className="h-4 w-4 text-muted-foreground transform rotate-90" />
                <Slider
                  id="timePeriodSip"
                  min={1}
                  max={40}
                  step={1}
                  value={[timePeriod]}
                  onValueChange={(value) => setTimePeriod(value[0])}
                  className="flex-grow"
                />
              </div>
            </div>
          </div>

          <Card className="bg-secondary/50 p-4 sm:p-6 rounded-lg shadow-inner">
            <CardHeader className="p-0 pb-3 sm:pb-4 text-left">
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Projected Value</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 text-left">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Invested Amount:</span>
                <span className="font-medium">{formatCurrency(totalInvested)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Est. Returns:</span>
                <span className="font-medium">{formatCurrency(estimatedReturns)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold pt-1 border-t border-border mt-2">
                <span className="text-foreground">Total Value:</span>
                <span className="text-primary">{formatCurrency(totalValue)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {pieChartData.length > 0 && totalValue > 0 && (
          <div className="mt-6 sm:mt-8 h-[200px] sm:h-[250px] w-full animate-in fade-in duration-500 delay-200">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={pieOuterRadius}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem', 
                    boxShadow: 'var(--shadow)',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <RechartsLegend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}
         <p className="text-xs text-muted-foreground text-center pt-4">
            Disclaimer: The calculations are illustrative and based on the inputs provided. Actual returns may vary. Mutual fund investments are subject to market risks.
          </p>
      </CardContent>
    </Card>
  );
};

// Default export for the page route
export default function SipCalculatorPageContainer() {
  return (
    <div className="flex-grow container mx-auto py-8 px-4 md:px-6 flex justify-center items-start animate-in fade-in duration-500">
      <SipCalculator />
    </div>
  );
}

