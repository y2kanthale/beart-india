
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmiCalculator } from '@/app/calculators/emi/page'; 

interface EmiCalculatorDialogProps {
  children: React.ReactNode;
}

export function EmiCalculatorDialog({ children }: EmiCalculatorDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center sm:text-left">EMI Calculator</DialogTitle>
          <DialogDescription className="text-center sm:text-left text-sm sm:text-base">
            Estimate your Equated Monthly Installment (EMI).
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          <EmiCalculator />
        </div>
        <DialogFooter className="p-6 pt-0 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    