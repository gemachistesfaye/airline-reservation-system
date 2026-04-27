import { useState } from "react";
import { motion } from "framer-motion";
import { User, Armchair, Crown } from "lucide-react";

export default function SeatSelector({ seats, onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (seat) => {
    if (seat.availability_status === "booked") return;
    const newSelection = selected === seat.seat_number ? null : seat.seat_number;
    setSelected(newSelection);
    onSelect(newSelection);
  };

  // Group seats by rows (6 seats per row: A, B, C, corridor, D, E, F)
  const rows = [];
  for (let i = 0; i < seats.length; i += 6) {
    rows.push(seats.slice(i, i + 6));
  }

  return (
    <div className="flex flex-col items-center gap-1">
      
      {/* Plane Nose Indicator */}
      <div className="w-56 h-14 bg-gray-100 rounded-t-full mb-12 border-t-4 border-primary-600 flex flex-col items-center justify-center shadow-inner">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cockpit</span>
         <div className="flex gap-2 mt-1">
            <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
         </div>
      </div>

      <div className="space-y-4">
        {rows.map((row, rowIdx) => {
          const isBusiness = rowIdx < 3;
          return (
            <div key={rowIdx} className="flex items-center gap-4">
              <div className={`w-8 text-[11px] font-black ${isBusiness ? 'text-amber-500' : 'text-gray-300'} text-center`}>
                {rowIdx + 1}
              </div>
              
              <div className={`flex items-center gap-3 p-2 rounded-2xl transition-colors ${isBusiness ? 'bg-amber-50/50 ring-1 ring-amber-100' : ''}`}>
                {/* Left Group (A, B, C) */}
                <div className="flex gap-2">
                  {row.slice(0, 3).map((seat) => (
                    <Seat 
                      key={seat.seat_number} 
                      seat={seat} 
                      isBusiness={isBusiness}
                      isSelected={selected === seat.seat_number} 
                      onClick={() => handleSelect(seat)} 
                    />
                  ))}
                </div>

                {/* Corridor */}
                <div className="w-12 h-10 flex items-center justify-center">
                  <div className={`w-px h-full ${isBusiness ? 'bg-amber-200' : 'bg-gray-100'}`} />
                </div>

                {/* Right Group (D, E, F) */}
                <div className="flex gap-2">
                  {row.slice(3, 6).map((seat) => (
                    <Seat 
                      key={seat.seat_number} 
                      seat={seat} 
                      isBusiness={isBusiness}
                      isSelected={selected === seat.seat_number} 
                      onClick={() => handleSelect(seat)} 
                    />
                  ))}
                </div>
              </div>

              <div className={`w-8 text-[11px] font-black ${isBusiness ? 'text-amber-500' : 'text-gray-300'} text-center`}>
                {rowIdx + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-16 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/30 flex items-center justify-center text-white"><Crown size={12}/></div>
          <span className="text-xs font-bold text-gray-600">Business Class</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-lg shadow-lg shadow-green-500/30 flex items-center justify-center text-white"><Armchair size={12}/></div>
          <span className="text-xs font-bold text-gray-600">Economy Class</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center text-white"><User size={12}/></div>
          <span className="text-xs font-bold text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-500 rounded-lg shadow-lg shadow-red-500/30 flex items-center justify-center text-white"><XIcon size={12}/></div>
          <span className="text-xs font-bold text-gray-600">Booked</span>
        </div>
      </div>

    </div>
  );
}

function Seat({ seat, isSelected, onClick, isBusiness }) {
  const isBooked = seat.availability_status === "booked";
  
  return (
    <motion.button
      whileHover={!isBooked ? { scale: 1.1, y: -2 } : {}}
      whileTap={!isBooked ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isBooked}
      className={`
        relative w-11 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group
        ${isBooked ? 'bg-red-500 text-white cursor-not-allowed shadow-inner opacity-80' : 
          isSelected ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/40 ring-4 ring-blue-100 z-10' : 
          isBusiness ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30' :
          'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'}
      `}
    >
      {isBooked ? <XIcon size={16}/> : isSelected ? <User size={16}/> : isBusiness ? <Crown size={16}/> : <Armchair size={16}/>}
      
      {/* Tooltip on hover */}
      {!isBooked && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl">
          {seat.seat_number} {isBusiness ? '(Business)' : ''}
        </div>
      )}
    </motion.button>
  );
}

function XIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}