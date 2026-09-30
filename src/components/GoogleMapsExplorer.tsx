import React, { useState, useEffect } from 'react';

export interface PlaceItem {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

interface GoogleMapsExplorerProps {
  isDark?: boolean;
  defaultCategory?: 'supplements' | 'gyms' | 'healthy_food' | 'custom';
  title?: string;
  subtitle?: string;
  onSelectPlace?: (place: PlaceItem) => void;
}

export const GoogleMapsExplorer: React.FC<GoogleMapsExplorerProps> = ({
  isDark = true,
  defaultCategory = 'supplements',
  title = "Puntos de Nutrición & Fitness Cercanos",
  subtitle = "Búsqueda verificada con Google Maps en tiempo real vía Gemini 3.5 Flash",
  onSelectPlace,
}) => {
  const [category, setCategory] = useState<'supplements' | 'gyms' | 'healthy_food' | 'custom'>(defaultCategory);
  const [customQuery, setCustomQuery] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [searched, setSearched] = useState(false);

  // Intentar geolocalización al iniciar
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocatingError("Geolocalización no soportada por el navegador");
      return;
    }
    setIsLocating(true);
    setLocatingError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        setLocatingError("Ubicación GPS no disponible. Puedes escribir tu ciudad o barrio.");
        setIsLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleSearch = async (overrideCategory?: 'supplements' | 'gyms' | 'healthy_food' | 'custom' | string) => {
    const activeCat = (overrideCategory as any) || category;
    setIsLoading(true);
    setResponseText(null);
    setPlaces([]);
    setSearched(true);

    try {
      let finalQuery = customQuery.trim();
      const locSuffix = locationName.trim() ? ` en ${locationName.trim()}` : '';

      if (activeCat === 'supplements' && !finalQuery) {
        finalQuery = `Tiendas de suplementos deportivos, creatina, proteína isolada y nutrición deportiva oficial${locSuffix}`;
      } else if (activeCat === 'gyms' && !finalQuery) {
        finalQuery = `Gimnasios, centros de musculación, fitness y boxes de entrenamiento${locSuffix}`;
      } else if (activeCat === 'healthy_food' && !finalQuery) {
        finalQuery = `Restaurantes de comida saludable, ensaladas y platos proteicos fitness${locSuffix}`;
      } else if (!finalQuery) {
        finalQuery = `Tiendas de suplementación deportiva y nutrición${locSuffix}`;
      } else if (locSuffix) {
        finalQuery += locSuffix;
      }

      const res = await fetch('/api/maps/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          category: activeCat,
        }),
      });

      const data = await res.json();
      setResponseText(data.text || null);
      if (Array.isArray(data.places)) {
        setPlaces(data.places);
      }
    } catch (err) {
      console.error(err);
      setResponseText("No pudimos conectar con el servicio de Google Maps en este momento. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar búsqueda automática inicial
  useEffect(() => {
    handleSearch(defaultCategory);
  }, []);

  return (
    <div className="bg-[#06151e] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
      {/* Header con insignia de Google Maps Grounding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-[22px]">pin_drop</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                {title}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Google Maps · Gemini 3.5 Flash</span>
              </span>
            </div>
            <p className="text-xs text-[#898a8c]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Botón GPS */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto ${
            coordinates
              ? 'bg-[#ffffff]/20 text-[#d6d6d6] border-[#ffffff]/40'
              : 'bg-[#06151e] text-[#d6d6d6] border-white/10 hover:bg-[#06151e]'
          }`}
        >
          <span className={`material-symbols-outlined text-[16px] ${isLocating ? 'animate-spin' : 'text-rose-400'}`}>
            {isLocating ? 'sync' : coordinates ? 'my_location' : 'location_searching'}
          </span>
          <span>{coordinates ? 'GPS Activo' : 'Usar mi GPS'}</span>
        </button>
      </div>

      {locatingError && (
        <div className="text-[11px] text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          {locatingError}
        </div>
      )}

      {/* Selector de Categorías de Búsqueda */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setCategory('supplements');
            handleSearch('supplements');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            category === 'supplements'
              ? 'bg-[#06151e] text-white border-white/20 shadow-sm'
              : 'bg-[#06151e] text-[#898a8c] border-white/10 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">medication</span>
          <span>Tiendas de Suplementos</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategory('gyms');
            handleSearch('gyms');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            category === 'gyms'
              ? 'bg-[#06151e] text-white border-white/20 shadow-sm'
              : 'bg-[#06151e] text-[#898a8c] border-white/10 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">fitness_center</span>
          <span>Gimnasios & CrossFit</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategory('healthy_food');
            handleSearch('healthy_food');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            category === 'healthy_food'
              ? 'bg-[#06151e] text-white border-white/20 shadow-sm'
              : 'bg-[#06151e] text-[#898a8c] border-white/10 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">restaurant</span>
          <span>Comida Proteica & Fit</span>
        </button>

        <button
          type="button"
          onClick={() => setCategory('custom')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            category === 'custom'
              ? 'bg-[#06151e] text-white border-white/20 shadow-sm'
              : 'bg-[#06151e] text-[#898a8c] border-white/10 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">search</span>
          <span>Personalizado</span>
        </button>
      </div>

      {/* Barra de Filtro / Ubicación Manual */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#898a8c] text-[18px]">
            location_city
          </span>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Ciudad, barrio o zona (ej. Palermo, Buenos Aires, São Paulo...)"
            className="w-full pl-9 pr-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white placeholder-[#898a8c] focus:outline-none focus:border-[#ffffff]"
          />
        </div>

        {category === 'custom' && (
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#898a8c] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="¿Qué lugar buscas? Ej. Creatina pura, box calistenia..."
              className="w-full pl-9 pr-3 py-2 bg-[#06151e] border border-white/10 rounded-xl text-xs text-white placeholder-[#898a8c] focus:outline-none focus:border-[#ffffff]"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="px-4 py-2 bg-[#06151e] hover:bg-[#545a5b] disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0 active:scale-95"
        >
          <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>
            {isLoading ? 'sync' : 'explore'}
          </span>
          <span>{isLoading ? 'Explorando...' : 'Buscar en Maps'}</span>
        </button>
      </div>

      {/* Resultados de Búsqueda */}
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-transparent animate-spin"></div>
          <p className="text-xs text-[#898a8c]">
            Consultando Google Maps con Gemini 3.5 Flash para obtener lugares actualizados...
          </p>
        </div>
      )}

      {!isLoading && searched && (
        <div className="space-y-4">
          {/* Resumen descriptivo de Gemini con Grounding */}
          {responseText && (
            <div className="p-3.5 rounded-xl bg-[#06151e] border border-white/10 text-xs text-[#d6d6d6] leading-relaxed">
              <div className="flex items-center gap-1.5 text-white font-bold mb-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Análisis de Ubicación:</span>
              </div>
              <p className="whitespace-pre-line">{responseText}</p>
            </div>
          )}

          {/* Tarjetas de Lugares de Google Maps (Requerimiento estricto: Listar links de groundingChunks) */}
          {places.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  Lugares Verificados en Google Maps ({places.length})
                </span>
                <span className="text-[10px] text-[#898a8c]">
                  Enlaces oficiales extraídos en tiempo real
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {places.map((place, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#06151e] hover:bg-[#06151e] border border-white/10 hover:border-white/50 transition-all flex flex-col justify-between gap-3 group shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-rose-500 text-[20px] shrink-0 mt-0.5">
                            location_on
                          </span>
                          <h4 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-white transition-colors line-clamp-2">
                            {place.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-black text-[#898a8c] bg-[#06151e] px-1.5 py-0.5 rounded border border-white/10">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Reseñas / Snippets */}
                      {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                        <div className="mt-2 text-[11px] text-[#898a8c] italic bg-[#06151e]/60 p-2 rounded-lg border border-white/10 line-clamp-2">
                          "{place.reviewSnippets[0]}"
                        </div>
                      )}
                    </div>

                    {/* Botón de Enlace Directo a Google Maps (Mandatorio según directiva) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white hover:text-white border border-white/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        <span>Ver en Google Maps</span>
                      </a>

                      {onSelectPlace && (
                        <button
                          type="button"
                          onClick={() => onSelectPlace(place)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#06151e] hover:bg-slate-700 text-xs text-white transition-all font-bold"
                          title="Seleccionar lugar"
                        >
                          Usar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#898a8c]">
              No se encontraron lugares en este rango. Intenta escribir una ciudad o ampliar la búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
