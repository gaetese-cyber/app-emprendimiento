"use client";

import { useState, useRef, useEffect } from "react";

const CITIES = [
  // Argentina - CABA y GBA
  "Buenos Aires, Argentina", "La Matanza, Argentina", "Quilmes, Argentina",
  "Lanús, Argentina", "Lomas de Zamora, Argentina", "Almirante Brown, Argentina",
  "Avellaneda, Argentina", "Merlo, Argentina", "Morón, Argentina",
  "Florencio Varela, Argentina", "Berazategui, Argentina", "Esteban Echeverría, Argentina",
  "San Isidro, Argentina", "Tigre, Argentina", "Vicente López, Argentina",
  "General San Martín, Argentina", "Tres de Febrero, Argentina", "Hurlingham, Argentina",
  "Ituzaingó, Argentina", "San Miguel, Argentina", "Malvinas Argentinas, Argentina",
  "José C. Paz, Argentina", "Pilar, Argentina", "Ezeiza, Argentina",
  // Argentina - Córdoba
  "Córdoba, Argentina", "Villa Carlos Paz, Argentina", "Río Cuarto, Argentina",
  "Villa María, Argentina", "Alta Gracia, Argentina", "San Francisco, Argentina",
  "Cosquín, Argentina", "La Falda, Argentina", "Jesús María, Argentina", "Río Tercero, Argentina",
  // Argentina - Santa Fe
  "Rosario, Argentina", "Santa Fe, Argentina", "Rafaela, Argentina",
  "Reconquista, Argentina", "Santo Tomé, Argentina", "Venado Tuerto, Argentina",
  // Argentina - Mendoza
  "Mendoza, Argentina", "Godoy Cruz, Argentina", "Guaymallén, Argentina",
  "Las Heras, Argentina", "Maipú, Argentina", "San Rafael, Argentina", "Luján de Cuyo, Argentina",
  // Argentina - Tucumán
  "San Miguel de Tucumán, Argentina", "Tafí Viejo, Argentina", "Yerba Buena, Argentina",
  // Argentina - Salta y Jujuy
  "Salta, Argentina", "Tartagal, Argentina", "San Salvador de Jujuy, Argentina",
  // Argentina - Buenos Aires provincia
  "Mar del Plata, Argentina", "Bahía Blanca, Argentina", "Tandil, Argentina",
  "Olavarría, Argentina", "Necochea, Argentina", "La Plata, Argentina",
  "Zárate, Argentina", "Campana, Argentina", "Pergamino, Argentina",
  "Junín, Argentina", "Luján, Argentina", "Pinamar, Argentina",
  "Villa Gesell, Argentina", "Chivilcoy, Argentina", "Azul, Argentina",
  // Argentina - otras provincias
  "San Juan, Argentina", "Rivadavia, Argentina",
  "San Luis, Argentina", "Villa Mercedes, Argentina",
  "Neuquén, Argentina", "Cipolletti, Argentina", "Bariloche, Argentina",
  "Resistencia, Argentina", "Presidencia Roque Sáenz Peña, Argentina",
  "Corrientes, Argentina", "Goya, Argentina",
  "Posadas, Argentina", "Oberá, Argentina", "Eldorado, Argentina",
  "Santiago del Estero, Argentina",
  "Paraná, Argentina", "Concordia, Argentina", "Gualeguaychú, Argentina",
  "Concepción del Uruguay, Argentina", "Colón, Argentina",
  "Formosa, Argentina",
  "Rawson, Argentina", "Trelew, Argentina", "Puerto Madryn, Argentina",
  "Comodoro Rivadavia, Argentina",
  "Viedma, Argentina",
  "Santa Rosa, Argentina", "General Pico, Argentina",
  "Río Gallegos, Argentina",
  "Ushuaia, Argentina", "Río Grande, Argentina",
  // Uruguay
  "Montevideo, Uruguay", "Paysandú, Uruguay", "Salto, Uruguay", "Maldonado, Uruguay",
  // Paraguay
  "Asunción, Paraguay", "Ciudad del Este, Paraguay", "Encarnación, Paraguay",
  // Bolivia
  "La Paz, Bolivia", "Santa Cruz de la Sierra, Bolivia", "Cochabamba, Bolivia", "Sucre, Bolivia",
  // Perú
  "Lima, Perú", "Arequipa, Perú", "Trujillo, Perú", "Cusco, Perú",
  // Chile
  "Santiago de Chile, Chile", "Valparaíso, Chile", "Concepción, Chile", "Antofagasta, Chile",
  // Colombia
  "Bogotá, Colombia", "Medellín, Colombia", "Cali, Colombia", "Barranquilla, Colombia", "Cartagena, Colombia",
  // Venezuela
  "Caracas, Venezuela", "Maracaibo, Venezuela",
  // Ecuador
  "Quito, Ecuador", "Guayaquil, Ecuador", "Cuenca, Ecuador",
  // México
  "Ciudad de México, México", "Guadalajara, México", "Monterrey, México",
  "Puebla, México", "Tijuana, México", "León, México", "Mérida, México",
  // Brasil
  "São Paulo, Brasil", "Río de Janeiro, Brasil", "Brasilia, Brasil",
  "Salvador, Brasil", "Fortaleza, Brasil", "Belo Horizonte, Brasil",
  "Manaus, Brasil", "Curitiba, Brasil", "Recife, Brasil", "Porto Alegre, Brasil",
  // Caribe y Centroamérica
  "La Habana, Cuba", "Santo Domingo, República Dominicana", "San Juan, Puerto Rico",
  "Ciudad de Guatemala, Guatemala", "San Salvador, El Salvador",
  "Tegucigalpa, Honduras", "Managua, Nicaragua",
  "San José, Costa Rica", "Ciudad de Panamá, Panamá",
  // España
  "Madrid, España", "Barcelona, España", "Valencia, España",
  "Sevilla, España", "Bilbao, España", "Zaragoza, España", "Málaga, España",
  // Portugal
  "Lisboa, Portugal", "Porto, Portugal",
  // Italia
  "Roma, Italia", "Milán, Italia", "Nápoles, Italia", "Turín, Italia", "Florencia, Italia",
  // Francia
  "París, Francia", "Lyon, Francia", "Marsella, Francia",
  // Alemania
  "Berlín, Alemania", "Múnich, Alemania", "Hamburgo, Alemania", "Frankfurt, Alemania",
  // Reino Unido
  "Londres, Reino Unido", "Manchester, Reino Unido", "Birmingham, Reino Unido",
  // Otros Europa
  "Ámsterdam, Países Bajos", "Bruselas, Bélgica", "Zúrich, Suiza",
  "Viena, Austria", "Varsovia, Polonia", "Praga, República Checa",
  "Budapest, Hungría", "Atenas, Grecia", "Estocolmo, Suecia",
  "Oslo, Noruega", "Helsinki, Finlandia", "Copenhague, Dinamarca",
  "Moscú, Rusia", "Estambul, Turquía",
  // Estados Unidos
  "Nueva York, Estados Unidos", "Los Ángeles, Estados Unidos",
  "Chicago, Estados Unidos", "Houston, Estados Unidos", "Miami, Estados Unidos",
  "San Francisco, Estados Unidos", "Washington D.C., Estados Unidos",
  "Seattle, Estados Unidos", "Las Vegas, Estados Unidos", "Boston, Estados Unidos",
  // Canadá
  "Toronto, Canadá", "Montreal, Canadá", "Vancouver, Canadá", "Calgary, Canadá",
  // Asia
  "Tokio, Japón", "Osaka, Japón",
  "Pekín, China", "Shanghái, China", "Guangzhou, China",
  "Seúl, Corea del Sur",
  "Mumbai, India", "Delhi, India", "Bangalore, India",
  "Singapur, Singapur",
  "Bangkok, Tailandia",
  "Dubái, Emiratos Árabes", "Riad, Arabia Saudita",
  // Oceanía
  "Sídney, Australia", "Melbourne, Australia", "Brisbane, Australia",
  "Auckland, Nueva Zelanda",
  // África
  "El Cairo, Egipto", "Lagos, Nigeria", "Nairobi, Kenia",
  "Johannesburgo, Sudáfrica", "Ciudad del Cabo, Sudáfrica",
  "Casablanca, Marruecos",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CityInput({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(text: string) {
    onChange(text);
    if (text.length >= 2) {
      const q = text.toLowerCase();
      setFiltered(CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8));
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  function select(city: string) {
    onChange(city);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Escribí tu ciudad…"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value.length >= 2 && filtered.length > 0 && setOpen(true)}
        className={className}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((city) => (
            <li
              key={city}
              onMouseDown={() => select(city)}
              className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
