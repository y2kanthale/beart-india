'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, // Ensure DialogTitle is imported if used, or add it
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SipCalculator } from "@/app/calculators/sip/page"; // Changed import

interface SipCalculatorDialogProps {
  children: React.ReactNode;
}

export function SipCalculatorDialog({ children }: SipCalculatorDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0"> {/* Adjusted width and padding */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center sm:text-left">SIP Calculator</DialogTitle> {/* Added DialogTitle */}
          <DialogDescription className="text-center sm:text-left text-sm sm:text-base">
            Estimate the future value of your Systematic Investment Plan (SIP).
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto"> {/* Scrollable content area */}
          <SipCalculator />
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