import { TaxSimulator as TaxCalculator } from '@/components/tax/TaxSimulator';

export default function TaxSimulator() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <TaxCalculator />
    </div>
  );
}