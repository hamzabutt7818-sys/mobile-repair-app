import React, { useState, useEffect, useCallback } from 'react';
import type { SaleRecord, Supplier, Part, PaymentRecord } from './types';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import SalesScreen from './components/SalesScreen';
import SuppliersScreen from './components/SuppliersScreen';
import SupplierDetailScreen from './components/SupplierDetailScreen';

type View = 'home' | 'sales' | 'suppliers' | 'supplierDetail';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [view, setView] = useState<View>('home');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    
    const loadData = (key: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                setter(JSON.parse(storedData));
            }
        } catch (error) {
            console.error(`Failed to load ${key} from local storage:`, error);
        }
    };

    loadData('salesRecords', setSales);
    loadData('suppliers', setSuppliers);
    loadData('parts', setParts);
    loadData('payments', setPayments);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('salesRecords', JSON.stringify(sales));
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
        localStorage.setItem('parts', JSON.stringify(parts));
        localStorage.setItem('payments', JSON.stringify(payments));
    } catch (error) {
        console.error("Failed to save data to local storage:", error);
    }
  }, [sales, suppliers, parts, payments]);

  // Navigation
  const navigateTo = (newView: View, supplierId: string | null = null) => {
    setView(newView);
    setSelectedSupplierId(supplierId);
  };

  // Sale Handlers
  const addSale = useCallback((part: string, amount: number) => {
    const newSale: SaleRecord = { id: Date.now().toString(), date: new Date().toISOString(), part, amount };
    setSales(prev => [newSale, ...prev]);
  }, []);

  const updateSale = useCallback((id: string, newPart: string, newAmount: number) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, part: newPart, amount: newAmount } : sale
    ));
  }, []);

  const deleteSale = useCallback((id: string) => setSales(prev => prev.filter(s => s.id !== id)), []);

  // Supplier Handlers
  const addSupplier = useCallback((name: string) => {
    const newSupplier: Supplier = { id: Date.now().toString(), name };
    setSuppliers(prev => [newSupplier, ...prev]);
  }, []);
  
  const deleteSupplier = useCallback((id: string) => {
    const supplierExists = suppliers.some(s => s.id === id);
    if (!supplierExists) {
        console.error("Attempted to delete a non-existent supplier.");
        return;
    }

    const confirmationMessage = "Are you sure you want to delete this supplier and all related data?";
    
    if (window.confirm(confirmationMessage)) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
        setParts(prev => prev.filter(p => p.supplierId !== id));
        setPayments(prev => prev.filter(p => p.supplierId !== id));
    }
  }, [suppliers]);

  // Part Handlers
  const addPart = useCallback((supplierId: string, name: string, price: number) => {
    const newPart: Part = { id: Date.now().toString(), supplierId, name, price };
    setParts(prev => [newPart, ...prev]);
  }, []);
  const deletePart = useCallback((id: string) => setParts(prev => prev.filter(p => p.id !== id)), []);

  // Payment Handlers
  const addPayment = useCallback((supplierId: string, amount: number) => {
    const newPayment: PaymentRecord = { id: Date.now().toString(), supplierId, amount, date: new Date().toISOString() };
    setPayments(prev => [newPayment, ...prev]);
  }, []);


  if (isLoading) {
    return <SplashScreen />;
  }

  const renderContent = () => {
    switch (view) {
      case 'sales':
        return <SalesScreen sales={sales} onAddSale={addSale} onDeleteSale={deleteSale} onUpdateSale={updateSale} onBack={() => navigateTo('home')} />;
      case 'suppliers':
        return <SuppliersScreen suppliers={suppliers} onAddSupplier={addSupplier} onDeleteSupplier={deleteSupplier} onSelectSupplier={(id) => navigateTo('supplierDetail', id)} onBack={() => navigateTo('home')} />;
      case 'supplierDetail':
        const supplier = suppliers.find(s => s.id === selectedSupplierId);
        if (!supplier) {
            // Should not happen, but good to handle
            navigateTo('suppliers');
            return null;
        }
        const supplierParts = parts.filter(p => p.supplierId === selectedSupplierId);
        const supplierPayments = payments.filter(p => p.supplierId === selectedSupplierId);
        return <SupplierDetailScreen 
            supplier={supplier} 
            parts={supplierParts} 
            payments={supplierPayments}
            onAddPart={addPart} 
            onDeletePart={deletePart} 
            onAddPayment={addPayment}
            onBack={() => navigateTo('suppliers')} 
        />;
      case 'home':
      default:
        return <HomeScreen onNavigate={(v) => navigateTo(v)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <main className="flex-grow p-4 md:p-6 max-w-2xl mx-auto w-full">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-gray-600">
        © {new Date().getFullYear()} Mobile Repair Business Hub
      </footer>
    </div>
  );
};

export default App;