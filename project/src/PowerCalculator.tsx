import React, { useState, useEffect } from 'react';
import { X, Calculator, Zap, Battery, Sun, Info, Save, History, Download, CloudSun } from 'lucide-react';
import { ApplianceProfile, WeatherData, SystemRecommendation, CalculationHistory } from './types/calculator';
import { supabase } from './lib/supabase';
import { toast } from 'react-hot-toast';

interface PowerCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Appliance {
    name: string;
    watts: number;
    hours: number;
    count?: number;
    backupHours: number;
}

const commonAppliances = [
    { name: 'Refrigerator', watts: 150 },
    { name: 'LED TV', watts: 100 },
    { name: 'Air Conditioner (1.5 ton)', watts: 1500 },
    { name: 'Ceiling Fan', watts: 75 },
    { name: 'Microwave', watts: 1000 },
    { name: 'Desktop Computer', watts: 200 },
    { name: 'Washing Machine', watts: 500 },
    { name: 'Water Heater', watts: 3000 }
];

const PowerCalculator: React.FC<PowerCalculatorProps> = ({ isOpen, onClose }) => {
    const [appliances, setAppliances] = useState<Appliance[]>([]);
    const [newAppliance, setNewAppliance] = useState<Appliance>({
        name: '',
        watts: 0,
        hours: 1,
        backupHours: 24
    });
    const [sunHours, setSunHours] = useState(5);
    const [backupHours, setBackupHours] = useState(24);
    const [efficiency, setEfficiency] = useState(0.85);
    const [isCalculating, setIsCalculating] = useState(false);
    const [profiles, setProfiles] = useState<ApplianceProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const [costPerKwh, setCostPerKwh] = useState(0.12);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
        title: string;
        message: string;
        icon: React.ReactNode;
        onConfirm: () => void;
    }>({ title: '', message: '', icon: null, onConfirm: () => {} });

    const ConfirmDialog = ({ title, message, icon, onConfirm, onClose }: {
        title: string;
        message: string;
        icon: React.ReactNode;
        onConfirm: () => void;
        onClose: () => void;
    }) => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 transform transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                    <div className="text-blue-600 bg-blue-50 p-3 rounded-lg shadow-inner transform transition-all duration-200 hover:scale-110 hover:rotate-3">{icon}</div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{message}</p>
                <input
                    id="profile-name-input"
                    type="text"
                    placeholder="Enter profile name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-3 justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow active:scale-95 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    const addAppliance = () => {
        if (!newAppliance.name || newAppliance.watts <= 0 || newAppliance.hours <= 0 || newAppliance.backupHours <= 0) {
            toast.error('Please fill in all appliance details correctly', {
                icon: '❌',
                duration: 4000,
                style: {
                    background: 'linear-gradient(to right, #fee2e2, #fecaca)',
                    color: '#991b1b',
                    border: '1px solid #f87171'
                }
            });
            return;
        }
        setAppliances([...appliances, newAppliance]);
        setNewAppliance({ name: '', watts: 0, hours: 1, backupHours: 24 });
    };

    const removeAppliance = (index: number) => {
        setAppliances(appliances.filter((_, i) => i !== index));
    };

    const addCommonAppliance = (appliance: { name: string; watts: number }, customBackupHours?: number) => {
        const existingAppliance = appliances.find(app => app.name === appliance.name);
        if (existingAppliance) {
            setAppliances(appliances.map(app => 
                app.name === appliance.name 
                    ? { ...app, count: (app.count || 1) + 1 } 
                    : app
            ));
        } else {
            setAppliances([...appliances, { 
                ...appliance, 
                hours: 1, 
                count: 1, 
                backupHours: customBackupHours || backupHours 
            }]);
        }
    };

    const deselectCommonAppliance = (applianceName: string) => {
        setAppliances(appliances.map(app => {
            if (app.name === applianceName && app.count && app.count > 1) {
                return { ...app, count: app.count - 1 };
            } else if (app.name === applianceName && (!app.count || app.count <= 1)) {
                return null;
            }
            return app;
        }).filter(Boolean) as Appliance[]);
    };

    const updateApplianceBackupHours = (applianceName: string, hours: number) => {
        setAppliances(appliances.map(app => 
            app.name === applianceName 
                ? { ...app, backupHours: hours }
                : app
        ));
    };

    const calculatePowerNeeds = async () => {
        if (appliances.length === 0) {
            toast.error('Please add at least one appliance', {
                icon: '⚠️',
                duration: 4000,
                style: {
                    background: 'linear-gradient(to right, #fee2e2, #fecaca)',
                    color: '#991b1b',
                    border: '1px solid #f87171'
                }
            });
            return;
        }

        setIsCalculating(true);

        try {
            // Calculate daily energy usage in watt-hours
            const dailyUsage = appliances.reduce((total, app) => total + (app.watts * app.hours * (app.count || 1)), 0);

            // Calculate required solar system size (kW)
            const solarSize = (dailyUsage / (sunHours * efficiency)) / 1000;

            // Calculate required battery size (kWh) based on individual backup hours
            const batterySize = appliances.reduce((total, app) => {
                const appDailyUsage = app.watts * app.hours * (app.count || 1);
                const appBackupUsage = (appDailyUsage * (app.backupHours / 24));
                return total + (appBackupUsage / (efficiency * 1000));
            }, 0);

            // Calculate required inverter size (kW) with 20% overhead
            const totalSimultaneousWatts = appliances.reduce((total, app) => total + (app.watts * (app.count || 1)), 0);
            const inverterSizeKW = Math.max((totalSimultaneousWatts * 1.2) / 1000, solarSize * 1.1);
            const powerFactor = 0.8;
            const inverterSizeKVA = inverterSizeKW / powerFactor;

            // Calculate daily and monthly electricity costs
            const dailyKWh = dailyUsage / 1000;
            const dailyCost = dailyKWh * costPerKwh;
            const monthlyCost = dailyCost * 30;
            const yearlyCost = dailyCost * 365;

            // Save calculation to database
            const { error } = await supabase
                .from('stats')
                .insert([{
                    daily_usage: dailyUsage,
                    sun_hours: sunHours,
                    backup_days: backupHours / 24,
                    efficiency: efficiency,
                    solar_size: solarSize,
                    battery_size: batterySize,
                    inverter_size: inverterSizeKW
                }]);

            if (error) throw error;

            toast.success('Power needs calculated successfully!', {
                duration: 5000,
                icon: '⚡',
                style: {
                    background: 'linear-gradient(to right, #dcfce7, #bbf7d0)',
                    color: '#166534',
                    border: '1px solid #4ade80'
                }
            });

            // Show results
            toast((t) => (
                <div className="space-y-2">
                    <p className="font-semibold text-emerald-800">Recommended System Specifications:</p>
                    <ul className="text-sm space-y-1 text-emerald-700">
                        <li className="flex items-center gap-2">🌞 Solar Panels: {solarSize.toFixed(2)} kW</li>
                        <li className="flex items-center gap-2">🔋 Battery Bank: {batterySize.toFixed(2)} kWh</li>
                        <li className="flex items-center gap-2">⚡ Inverter: {inverterSizeKVA.toFixed(2)} kVA</li>
                        <li className="flex items-center gap-2">📊 Daily Energy Usage: {dailyKWh.toFixed(2)} kWh</li>
                        <li className="flex items-center gap-2">💰 Daily Cost: ${dailyCost.toFixed(2)}</li>
                        <li className="flex items-center gap-2">💳 Monthly Cost: ${monthlyCost.toFixed(2)}</li>
                        <li className="flex items-center gap-2">📈 Yearly Cost: ${yearlyCost.toFixed(2)}</li>
                    </ul>
                </div>
            ), {
                duration: 8000,
                icon: '📊',
                style: {
                    background: 'linear-gradient(to right, #e0f2fe, #bae6fd)',
                    color: '#075985',
                    border: '1px solid #38bdf8'
                }
            });

        } catch (error) {
            console.error('Error calculating power needs:', error);
            toast.error('Failed to calculate power needs', {
                icon: '❌',
                duration: 4000,
                style: {
                    background: 'linear-gradient(to right, #fee2e2, #fecaca)',
                    color: '#991b1b',
                    border: '1px solid #f87171'
                }
            });
        } finally {
            setIsCalculating(false);
        }
    };

    // Fetch weather data on component mount
    useEffect(() => {
        async function fetchWeatherData() {
            try {
                // This would typically come from a weather API
                // For now, we'll use a mock
                setWeatherData({
                    location: "Sunshine City, SC",
                    sun_hours: 5.5,
                    cloud_cover: 15,
                    updated_at: new Date().toISOString()
                });
                
                // Update the sun hours based on weather data
                setSunHours(5.5);
            } catch (err) {
                console.error('Error fetching weather data:', err);
            }
        }
        
        if (isOpen) {
            fetchWeatherData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {showConfirmDialog && (
                <ConfirmDialog
                    title={confirmDialogConfig.title}
                    message={confirmDialogConfig.message}
                    icon={confirmDialogConfig.icon}
                    onConfirm={confirmDialogConfig.onConfirm}
                    onClose={() => setShowConfirmDialog(false)}
                />
            )}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-blue-600" />
                            <h3 className="text-2xl font-bold text-gray-900">Power Needs Calculator</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Profile Management */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <Save className="w-5 h-5 text-blue-600" />
                                Appliance Profiles
                            </h4>
                            <div className="flex gap-4">
                                <select
                                    value={selectedProfile}
                                    onChange={(e) => setSelectedProfile(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a profile</option>
                                    {profiles.map(profile => (
                                        <option key={profile.id} value={profile.id}>{profile.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        setConfirmDialogConfig({
                                            title: 'Save Profile',
                                            message: 'Enter a name for your appliance profile:',
                                            icon: <Save className="w-6 h-6" />,
                                            onConfirm: () => {
                                                const input = document.getElementById('profile-name-input') as HTMLInputElement;
                                                const name = input.value.trim();
                                                if (name) {
                                                    const newProfile: ApplianceProfile = {
                                                        id: Date.now().toString(),
                                                        name,
                                                        appliances: [...appliances],
                                                        created_at: new Date().toISOString()
                                                    };
                                                    setProfiles([...profiles, newProfile]);
                                                }
                                            }
                                        });
                                        setShowConfirmDialog(true);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>

                        {/* Weather Data */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <CloudSun className="w-5 h-5 text-blue-600" />
                                Weather Data
                            </h4>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                {weatherData ? (
                                    <div className="space-y-2">
                                        <p><strong>Location:</strong> {weatherData.location}</p>
                                        <p><strong>Sun Hours:</strong> {weatherData.sun_hours} hours/day</p>
                                        <p><strong>Cloud Cover:</strong> {weatherData.cloud_cover}%</p>
                                        <p className="text-sm text-gray-600">Last updated: {new Date(weatherData.updated_at).toLocaleString()}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No weather data available</p>
                                )}
                            </div>
                        </div>
                        {/* Quick Add Section */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-600" />
                                Quick Add Common Appliances
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {commonAppliances.map((app) => {
                                    const existingApp = appliances.find(a => a.name === app.name);
                                    const count = existingApp?.count || 0;
                                    return (
                                        <div
                                            key={app.name}
                                            className="p-3 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left relative cursor-pointer"
                                            onClick={() => addCommonAppliance(app)}
                                        >
                                            <div className="font-medium">{app.name}</div>
                                            <div className="text-gray-600">{app.watts}W</div>
                                            <div className="mt-2">
                                                <input
                                                    type="number"
                                                    placeholder="Backup hours"
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                    defaultValue={backupHours}
                                                    min="0"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        const hours = parseFloat(e.target.value) || backupHours;
                                                        updateApplianceBackupHours(app.name, hours);
                                                    }}
                                                />
                                            </div>
                                            {count > 0 && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deselectCommonAppliance(app.name);
                                                        }}
                                                        className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                                                        {count}×
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Appliance Form */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-600" />
                                Add Custom Appliance
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    value={newAppliance.name}
                                    onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                                    placeholder="Appliance name"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={newAppliance.watts || ''}
                                    onChange={(e) => setNewAppliance({ ...newAppliance, watts: parseInt(e.target.value) || 0 })}
                                    placeholder="Power (watts)"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={newAppliance.hours || ''}
                                    onChange={(e) => setNewAppliance({ ...newAppliance, hours: parseInt(e.target.value) || 0 })}
                                    placeholder="Hours per day"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={newAppliance.backupHours || ''}
                                    onChange={(e) => setNewAppliance({ ...newAppliance, backupHours: parseInt(e.target.value) || 0 })}
                                    placeholder="Backup hours"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={addAppliance}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Appliance
                            </button>
                        </div>

                        {/* Appliances List */}
                        {appliances.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Added Appliances</h4>
                                <div className="space-y-2">
                                    {appliances.map((app, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <span className="font-medium">{app.name}</span>
                                                <span className="text-gray-600 text-sm ml-2">
                                                    ({app.watts}W × {app.hours}h × {app.count || 1} = {app.watts * app.hours * (app.count || 1)}Wh/day, Backup: {app.backupHours}h)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                                                    {app.count || 1}×
                                                </span>
                                                <button
                                                    onClick={() => removeAppliance(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cost Analysis */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <Download className="w-5 h-5 text-blue-600" />
                                Cost Analysis
                            </h4>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cost per kWh ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={costPerKwh}
                                            onChange={(e) => setCostPerKwh(parseFloat(e.target.value) || 0.12)}
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Parameters */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <Sun className="w-5 h-5 text-blue-600" />
                                System Parameters
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sun Hours per Day
                                    </label>
                                    <input
                                        type="number"
                                        value={sunHours}
                                        onChange={(e) => setSunHours(parseFloat(e.target.value) || 5)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Backup Hours
                                    </label>
                                    <input
                                        type="number"
                                        value={backupHours}
                                        onChange={(e) => setBackupHours(parseFloat(e.target.value) || 24)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        System Efficiency
                                    </label>
                                    <input
                                        type="number"
                                        value={efficiency}
                                        onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0.85)}
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl flex gap-4">
                        <button
                            onClick={calculatePowerNeeds}
                            disabled={isCalculating || appliances.length === 0}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCalculating ? (
                                <>Calculating...</>
                            ) : (
                                <>Calculate Power Needs</>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PowerCalculator;