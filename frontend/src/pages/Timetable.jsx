import React, { useState } from "react";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { Search, MapPin, CalendarDays, Bus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Timetable() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoRoutes, setDemoRoutes] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchFrom || !searchTo || !searchDate) {
      alert("Please fill in all search fields");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Generate 7 demo timetable entries
    setTimeout(() => {
      const generatedRoutes = Array.from({ length: 7 }).map((_, idx) => {
        const baseHour = 6 + idx * 2; // 6 AM, 8 AM, 10 AM, etc.
        const departureTime = `${baseHour > 12 ? baseHour - 12 : baseHour}:00 ${baseHour >= 12 ? 'PM' : 'AM'}`;
        const arrivalTime = `${baseHour + 1 > 12 ? baseHour + 1 - 12 : baseHour + 1}:30 ${baseHour + 1 >= 12 ? 'PM' : 'AM'}`;
        
        return {
          _id: `demo-route-${idx}`,
          name: `${searchFrom.toUpperCase()} TO ${searchTo.toUpperCase()} EXPRESS`,
          routeId: `EXP-${100 + idx}`,
          busType: idx % 2 === 0 ? "AC Seater" : "Non-AC Standard",
          fare: `₹${150 + (idx * 10)}`,
          stops: [
            { name: searchFrom, scheduled: departureTime },
            { name: "Transit Hub Alpha", scheduled: `${baseHour > 12 ? baseHour - 12 : baseHour}:45 ${baseHour >= 12 ? 'PM' : 'AM'}` },
            { name: searchTo, scheduled: arrivalTime }
          ]
        };
      });

      setDemoRoutes(generatedRoutes);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0d14] flex flex-col font-mono text-slate-800 dark:text-slate-200">
      <GovHeader
        lastSyncText="Bus Timetable"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="bg-[#0a3161] text-white py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold flex justify-between items-center border-b-[3px] border-[#d4af37]">
        <span>{t("welcome.headerTitle")}</span>
        <span>{t("timetable.cityBusTimetable")}</span>
      </div>
      
      <main className="flex-1 p-4 sm:p-6 w-full max-w-5xl mx-auto flex flex-col pb-20">
        
        {/* Search Section */}
        <section className="bg-white dark:bg-[#0f141e] border-t-8 border-t-[#0a3161] border border-slate-300 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden transition-colors mb-8">
          <div className="bg-slate-50 dark:bg-[#151b27] px-8 py-5 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-[22px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white m-0 leading-tight">
                {t("timetable.selectRoute")}
              </h1>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold">
                {t("search.searchSubtitle")}
              </div>
            </div>
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          </div>

          <div className="p-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Origin Station
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[14px] font-bold text-slate-800 dark:text-white focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition uppercase placeholder:normal-case placeholder:font-normal placeholder:opacity-70"
                    placeholder="E.g. Sector 17"
                  />
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center pb-3 px-2">
                <i className="fa-solid fa-arrow-right-arrow-left text-slate-400"></i>
              </div>

              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Destination Station
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[14px] font-bold text-slate-800 dark:text-white focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition uppercase placeholder:normal-case placeholder:font-normal placeholder:opacity-70"
                    placeholder="E.g. ISBT-43"
                  />
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Date of Journey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[14px] font-bold text-slate-800 dark:text-white focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[#0a3161] hover:bg-[#1a4480] text-white px-8 py-3 text-[12px] font-black uppercase tracking-widest border border-[#0a3161] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin"></i> SEARCHING...
                  </span>
                ) : (
                  <>
                    <Search size={16} /> FIND BUSES
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="bg-white dark:bg-[#0f141e] border border-slate-300 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
            <div className="bg-slate-50 dark:bg-[#151b27] px-8 py-4 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-[16px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 m-0 leading-tight">
                  Available Services
                </h2>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">
                  {searchFrom} to {searchTo} • {new Date(searchDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-[#0a3161]/10 text-[#0a3161] dark:bg-blue-900/30 dark:text-blue-400 border border-[#0a3161]/20 dark:border-blue-900/50">
                {demoRoutes.length} Results Found
              </div>
            </div>
            
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <i className="fa-solid fa-satellite-dish text-4xl mb-4 animate-pulse text-[#0a3161] dark:text-blue-400"></i>
                  <div className="font-black uppercase tracking-widest text-[12px]">Connecting to Central Dispatch...</div>
                </div>
              ) : demoRoutes.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {demoRoutes.map((route, idx) => (
                    <div key={route._id || idx} className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111622] hover:shadow-md transition-shadow group relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0a3161] dark:bg-blue-500 group-hover:bg-[#d4af37] transition-colors" />
                      
                      <div className="p-5 flex flex-col md:flex-row gap-6 md:items-center justify-between ml-2">
                        {/* Bus Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1a2333] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#0a3161] dark:text-blue-400">
                            <Bus size={24} />
                          </div>
                          <div>
                            <h3 className="font-black text-[15px] uppercase tracking-widest text-slate-800 dark:text-slate-100">{route.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                                {route.routeId}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0a3161] dark:text-blue-400">
                                {route.busType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timings */}
                        <div className="flex flex-col md:flex-row items-center gap-6 flex-1 justify-center">
                          <div className="text-center">
                            <div className="text-[18px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                              {route.stops[0].scheduled}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                              {route.stops[0].name}
                            </div>
                          </div>
                          
                          <div className="flex-1 max-w-[150px] flex flex-col items-center">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                              Direct
                            </div>
                            <div className="w-full h-px bg-slate-300 dark:bg-slate-700 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111622]" />
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-[18px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                              {route.stops[route.stops.length - 1].scheduled}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                              {route.stops[route.stops.length - 1].name}
                            </div>
                          </div>
                        </div>

                        {/* Fare and Action */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Standard Fare</div>
                            <div className="text-[20px] font-black text-[#0a3161] dark:text-emerald-400 tracking-tighter">
                              {route.fare}
                            </div>
                          </div>
                          <button className="bg-slate-100 hover:bg-[#0a3161] dark:bg-slate-800 dark:hover:bg-blue-600 text-[#0a3161] hover:text-white dark:text-blue-400 dark:hover:text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-300 dark:border-slate-700">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 font-bold uppercase tracking-widest text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#151b27]">
                  No buses available for the selected route on this date.
                </div>
              )}
            </div>
          </section>
        )}
        
      </main>
    </div>
  );
}
