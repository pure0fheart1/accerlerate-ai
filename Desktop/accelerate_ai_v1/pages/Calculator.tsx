import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorIcon, TrashIcon } from '../components/icons';

type Tab = 'calculator' | 'currency' | 'unit';
const HISTORY_KEY = 'accelerate-calculator-history';
const MAX_HISTORY_ITEMS = 20;

const currencies = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'JPY': 'Japanese Yen',
    'GBP': 'British Pound',
    'CAD': 'Canadian Dollar',
    'AUD': 'Australian Dollar',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan'
};

const exchangeRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.93,
    JPY: 157.23,
    GBP: 0.79,
    CAD: 1.37,
    AUD: 1.51,
    CHF: 0.90,
    CNY: 7.25
};

const unitConfig = {
    Length: {
        'Meters (m)': 1,
        'Kilometers (km)': 1000,
        'Centimeters (cm)': 0.01,
        'Millimeters (mm)': 0.001,
        'Feet (ft)': 0.3048,
        'Inches (in)': 0.0254,
        'Yards (yd)': 0.9144,
        'Miles (mi)': 1609.34,
    },
    Weight: {
        'Kilograms (kg)': 1,
        'Grams (g)': 0.001,
        'Milligrams (mg)': 0.000001,
        'Pounds (lb)': 0.453592,
        'Ounces (oz)': 0.0283495,
    },
    Temperature: {
        'Celsius (°C)': 'celsius',
        'Fahrenheit (°F)': 'fahrenheit',
        'Kelvin (K)': 'kelvin',
    }
};

const Calculator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('calculator');
    const [history, setHistory] = useState<string[]>([]);
    
    // Calculator state
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');

    // Currency state
    const [currencyAmount, setCurrencyAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');

    // Unit state
    const [unitType, setUnitType] = useState<keyof typeof unitConfig>('Length');
    const [fromUnit, setFromUnit] = useState<string>('Meters (m)');
    const [toUnit, setToUnit] = useState<string>('Feet (ft)');
    const [unitAmount, setUnitAmount] = useState('1');

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) { console.error("Failed to parse history from localStorage", e); }
    }, []);

    const addToHistory = (item: string) => {
        const newHistory = [item, ...history].slice(0, MAX_HISTORY_ITEMS);
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };
    
    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    // Calculator Logic
    const handleCalculatorClick = (value: string) => {
        if (display.length > 15) return;
        
        switch (value) {
            case 'C':
                setDisplay('0');
                setExpression('');
                break;
            case '=':
                try {
                    // Basic safety check for eval
                    if (/[^0-9+\-*/().]/.test(expression)) throw new Error("Invalid characters");
                    const result = eval(expression).toString();
                    addToHistory(`${expression} = ${result}`);
                    setDisplay(result);
                    setExpression(result);
                } catch {
                    setDisplay('Error');
                    setExpression('');
                }
                break;
            case '.':
                if (!display.includes('.')) {
                    setDisplay(display + '.');
                    setExpression(expression + '.');
                }
                break;
            default: // Numbers and operators
                if (display === '0' || display === 'Error') {
                    setDisplay(value);
                    setExpression(value);
                } else {
                    setDisplay(display + value);
                    setExpression(expression + value);
                }
        }
    };
    
    const currencyResult = useMemo(() => {
        const amount = parseFloat(currencyAmount);
        if (isNaN(amount)) return null;
        const rate = (1 / exchangeRates[fromCurrency]) * exchangeRates[toCurrency];
        return (amount * rate).toFixed(2);
    }, [currencyAmount, fromCurrency, toCurrency]);

    const handleCurrencyConvert = () => {
        if (currencyResult !== null) {
            addToHistory(`${currencyAmount} ${fromCurrency} = ${currencyResult} ${toCurrency}`);
        }
    };

    const unitResult = useMemo(() => {
        const amount = parseFloat(unitAmount);
        if (isNaN(amount)) return null;

        if (unitType === 'Temperature') {
            let celsius;
            if (fromUnit === 'Celsius (°C)') celsius = amount;
            else if (fromUnit === 'Fahrenheit (°F)') celsius = (amount - 32) * 5/9;
            else celsius = amount - 273.15; // Kelvin

            let result;
            if (toUnit === 'Celsius (°C)') result = celsius;
            else if (toUnit === 'Fahrenheit (°F)') result = (celsius * 9/5) + 32;
            else result = celsius + 273.15; // Kelvin
            return result.toFixed(2);
        } else {
            const fromFactor = unitConfig[unitType][fromUnit as keyof typeof unitConfig[typeof unitType]];
            const toFactor = unitConfig[unitType][toUnit as keyof typeof unitConfig[typeof unitType]];
            const result = (amount * fromFactor) / toFactor;
            return result.toFixed(4);
        }
    }, [unitAmount, unitType, fromUnit, toUnit]);

    const handleUnitConvert = () => {
        if (unitResult !== null) {
            addToHistory(`${unitAmount} ${fromUnit.split(' ')[0]} = ${unitResult} ${toUnit.split(' ')[0]}`);
        }
    };

    const renderCalculator = () => (
        <div className="flex flex-col gap-4">
            <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 text-right text-4xl font-mono break-all">{display}</div>
            <div className="grid grid-cols-4 gap-2">
                {['C', '(', ')', '/'].map(v => <button key={v} onClick={() => handleCalculatorClick(v)} className="p-4 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xl">{v}</button>)}
                {['7', '8', '9', '*'].map(v => <button key={v} onClick={() => handleCalculatorClick(v)} className="p-4 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xl">{v}</button>)}
                {['4', '5', '6', '-'].map(v => <button key={v} onClick={() => handleCalculatorClick(v)} className="p-4 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xl">{v}</button>)}
                {['1', '2', '3', '+'].map(v => <button key={v} onClick={() => handleCalculatorClick(v)} className="p-4 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xl">{v}</button>)}
                <button onClick={() => handleCalculatorClick('0')} className="col-span-2 p-4 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-xl">0</button>
                {['.', '='].map(v => <button key={v} onClick={() => handleCalculatorClick(v)} className={`p-4 rounded-lg hover:bg-opacity-80 transition-colors text-xl ${v === '=' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-slate-700'}`}>{v}</button>)}
            </div>
        </div>
    );

    const renderCurrencyConverter = () => (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Amount</label>
                <input type="number" value={currencyAmount} onChange={e => setCurrencyAmount(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100" />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">From</label>
                    <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100">
                        {Object.entries(currencies).map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">To</label>
                    <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100">
                        {Object.entries(currencies).map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
                    </select>
                </div>
            </div>
            <div className="text-center bg-gray-100 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-slate-400">Result</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{currencyResult} {toCurrency}</p>
            </div>
            <button onClick={handleCurrencyConvert} className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">Add to History</button>
        </div>
    );
    
    const renderUnitConverter = () => (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Type</label>
                <select value={unitType} onChange={e => {
                    const newType = e.target.value as keyof typeof unitConfig;
                    setUnitType(newType);
                    setFromUnit(Object.keys(unitConfig[newType])[0]);
                    setToUnit(Object.keys(unitConfig[newType])[1] || Object.keys(unitConfig[newType])[0]);
                }} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100">
                    {Object.keys(unitConfig).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Value</label>
                <input type="number" value={unitAmount} onChange={e => setUnitAmount(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100" />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">From</label>
                    <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100">
                        {Object.keys(unitConfig[unitType]).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">To</label>
                    <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100">
                        {Object.keys(unitConfig[unitType]).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                </div>
            </div>
            <div className="text-center bg-gray-100 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-slate-400">Result</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{unitResult} {toUnit.match(/\(([^)]+)\)/)?.[1] || toUnit}</p>
            </div>
            <button onClick={handleUnitConvert} className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">Add to History</button>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-8">
                <CalculatorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Calculator & Converter</h1>
            </header>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4">
                        {(['calculator', 'currency', 'unit'] as Tab[]).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-500 text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    {activeTab === 'calculator' && renderCalculator()}
                    {activeTab === 'currency' && renderCurrencyConverter()}
                    {activeTab === 'unit' && renderUnitConverter()}
                </div>

                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">History</h2>
                        {history.length > 0 && (
                            <button onClick={handleClearHistory} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
                                <TrashIcon className="h-4 w-4" /> Clear
                            </button>
                        )}
                    </div>
                    <div className="flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-2 overflow-y-auto border border-gray-200 dark:border-slate-700">
                        {history.length > 0 ? (
                            <ul className="space-y-1 text-right">
                                {history.map((item, index) => (
                                    <li key={index} className="px-3 py-1.5 text-gray-700 dark:text-slate-300 font-mono text-sm">{item}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                                <p>Your history will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
