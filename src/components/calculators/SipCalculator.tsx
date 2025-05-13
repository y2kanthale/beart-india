'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calculator, IndianRupee, Percent, BarChart as BarChartIconLucide } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';


export const SipCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [totalInvested, setTotalInvested] = useState(0);
  const [estimatedReturns, setEstimatedReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [chartMarginLeft, setChartMarginLeft] = useState(-25);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateSip = () => {
    if (!isMounted || monthlyInvestment <= 0 || expectedReturnRate <= 0 || timePeriod <= 0) {
        setTotalInvested(0);
        setEstimatedReturns(0);
        setTotalValue(0);
        setChartData([]);
        return;
    }
    const P = monthlyInvestment;
    const r = expectedReturnRate / 100 / 12; 
    const n = timePeriod * 12; 

    if (r === 0 && P === 0) { 
        setTotalInvested(0);
        setEstimatedReturns(0);
        setTotalValue(0);
        setChartData([]);
        return;
    }
    if (r === 0) { 
        const investedAmount = P * n;
        setTotalInvested(Math.round(investedAmount));
        setEstimatedReturns(0);
        setTotalValue(Math.round(investedAmount));
         const dataForChart = [];
        for (let year = 1; year <= timePeriod; year++) {
          const months = year * 12;
          const invested = P * months;
          dataForChart.push({
            year: `Year ${year}`,
            invested: Math.round(invested),
            returns: 0,
            total: Math.round(invested),
          });
        }
        setChartData(dataForChart);
        return;
    }


    const M = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const investedAmount = P * n;
    const returns = M - investedAmount;

    setTotalInvested(Math.round(investedAmount));
    setEstimatedReturns(Math.round(returns < 0 ? 0 : returns)); 
    setTotalValue(Math.round(M < investedAmount ? investedAmount : M)); 

    const dataForChart = [];
    for (let year = 1; year <= timePeriod; year++) {
      const months = year * 12;
      let futureValueYear = P * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
      const investedYear = P * months;
      if (r === 0) {
          futureValueYear = investedYear;
      }
      dataForChart.push({
        year: `Year ${year}`,
        invested: Math.round(investedYear),
        returns: Math.round(futureValueYear - investedYear < 0 ? 0 : futureValueYear - investedYear),
        total: Math.round(futureValueYear < investedYear ? investedYear : futureValueYear),
      });
    }
    setChartData(dataForChart);
  };


  useEffect(() => {
    if (isMounted) {
      calculateSip();
      setChartMarginLeft(window.innerWidth < 640 ? -30 : -25);
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-in fade-in zoom-in-95 duration-500 border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
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
            <CardHeader className="p-0 pb-3 sm:pb-4 text-center">
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">Projected Value</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 text-center sm:text-left">
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

        {chartData.length > 0 && (totalInvested > 0 || totalValue > 0) && (
          <div className="mt-6 sm:mt-8 h-[250px] sm:h-[300px] w-full animate-in fade-in duration-500 delay-200">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData} margin={{ top: 5, right: 0, left: chartMarginLeft, bottom: 5 }}>
                <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickFormatter={(value) => `${value / 100000}L`} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    boxShadow: 'var(--shadow)',
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <RechartsLegend iconType="circle" wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                <Bar dataKey="invested" stackId="a" fill="hsl(var(--secondary-foreground))" name="Invested" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" stackId="a" fill="hsl(var(--primary))" name="Returns" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
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
