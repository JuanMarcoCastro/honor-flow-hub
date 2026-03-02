import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, AlertTriangle, CheckCircle, Building2, User, Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { UMA_VALUE_MXN, UMA_THRESHOLDS, convertToUMA } from '@/data/complianceData';

interface MockDonor {
  id: string;
  type: 'fisica' | 'moral';
  name: string;
  rfc: string;
  address: string;
  city: string;
  state: string;
  cp: string;
  totalDonated: number;
  totalUMA: number;
  exceedsThreshold: boolean;
  donations: number;
  lastDonation: string;
}

const mockDonors: MockDonor[] = [
  { id: '1', type: 'moral', name: 'Grupo Industrial del Norte SA de CV', rfc: 'GIN850101AB1', address: 'Av. Constitución 1200, Col. Centro', city: 'Monterrey', state: 'Nuevo León', cp: '64000', totalDonated: 520000, totalUMA: convertToUMA(520000), exceedsThreshold: true, donations: 4, lastDonation: '2025-02-15' },
  { id: '2', type: 'fisica', name: 'María Elena Ríos Gutiérrez', rfc: 'RIGM880315LK9', address: 'Calle Reforma 456, Col. Juárez', city: 'Ciudad de México', state: 'CDMX', cp: '06600', totalDonated: 245000, totalUMA: convertToUMA(245000), exceedsThreshold: true, donations: 3, lastDonation: '2025-02-18' },
  { id: '3', type: 'moral', name: 'Fundación Esperanza Viva AC', rfc: 'FEV920610QR7', address: 'Blvd. López Mateos 890, Col. Del Valle', city: 'Guadalajara', state: 'Jalisco', cp: '44100', totalDonated: 310000, totalUMA: convertToUMA(310000), exceedsThreshold: true, donations: 2, lastDonation: '2025-01-30' },
  { id: '4', type: 'fisica', name: 'Roberto Sánchez Pérez', rfc: 'SAPR760820MN3', address: 'Privada de los Cedros 23, Fracc. Las Águilas', city: 'Puebla', state: 'Puebla', cp: '72150', totalDonated: 198000, totalUMA: convertToUMA(198000), exceedsThreshold: true, donations: 6, lastDonation: '2025-02-22' },
  { id: '5', type: 'fisica', name: 'Ana Lucía Fernández Mora', rfc: 'FEMA950412JK5', address: 'Av. Universidad 1500, Col. Copilco', city: 'Ciudad de México', state: 'CDMX', cp: '04360', totalDonated: 95000, totalUMA: convertToUMA(95000), exceedsThreshold: false, donations: 2, lastDonation: '2025-02-10' },
  { id: '6', type: 'moral', name: 'Constructora del Pacífico SA', rfc: 'CPA010305HG2', address: 'Calle Independencia 700, Col. Centro', city: 'Culiacán', state: 'Sinaloa', cp: '80000', totalDonated: 420000, totalUMA: convertToUMA(420000), exceedsThreshold: true, donations: 1, lastDonation: '2025-02-01' },
];

export default function SatReporting() {
  const [filter, setFilter] = useState<'all' | 'exceeded'>('exceeded');
  const [generating, setGenerating] = useState(false);

  const filtered = filter === 'exceeded' ? mockDonors.filter(d => d.exceedsThreshold) : mockDonors;
  const thresholdMXN = UMA_THRESHOLDS.LOW * UMA_VALUE_MXN;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Reportes SAT</h1>
        <p className="text-muted-foreground">Genera el Excel de donantes que superan el umbral de {UMA_THRESHOLDS.LOW} UMAs (${thresholdMXN.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN)</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Donantes sobre umbral', value: mockDonors.filter(d => d.exceedsThreshold).length, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Personas Físicas', value: mockDonors.filter(d => d.exceedsThreshold && d.type === 'fisica').length, icon: User, color: 'text-info' },
          { label: 'Personas Morales', value: mockDonors.filter(d => d.exceedsThreshold && d.type === 'moral').length, icon: Building2, color: 'text-primary' },
          { label: 'Umbral UMA', value: `${UMA_THRESHOLDS.LOW.toLocaleString()}`, icon: CheckCircle, color: 'text-success' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-xl font-bold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Actions bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => setFilter('exceeded')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filter === 'exceeded' ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            Solo sobre umbral
          </button>
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filter === 'all' ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            Todos
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {generating ? 'Generando...' : 'Descargar Excel SAT'}
        </motion.button>
      </motion.div>

      {/* Generated file mock */}
      {generating === false && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4 flex items-center gap-3 border border-primary/20">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Reporte_SAT_Donantes_Feb2025.xlsx</div>
            <div className="text-xs text-muted-foreground">Incluye {filtered.filter(d => d.exceedsThreshold).length} donantes · RFC, domicilio, montos acumulados</div>
          </div>
          <span className="text-xs text-muted-foreground">Mock</span>
        </motion.div>
      )}

      {/* Donors table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold">Donantes — Período Semestral</h3>
          <p className="text-xs text-muted-foreground mt-1">Datos que se incluyen en el reporte Excel para el SAT</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-left p-3 font-medium">Nombre / Razón Social</th>
                <th className="text-left p-3 font-medium">RFC</th>
                <th className="text-left p-3 font-medium">Domicilio</th>
                <th className="text-right p-3 font-medium">Total MXN</th>
                <th className="text-right p-3 font-medium">UMAs</th>
                <th className="text-center p-3 font-medium">Umbral</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor, i) => (
                <motion.tr
                  key={donor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                  className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${donor.type === 'moral' ? 'bg-info/15 text-info' : 'bg-accent/15 text-accent'}`}>
                      {donor.type === 'moral' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {donor.type === 'moral' ? 'Moral' : 'Física'}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{donor.name}</td>
                  <td className="p-3 font-mono text-xs">{donor.rfc}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{donor.address}, {donor.city}, {donor.state}</td>
                  <td className="p-3 text-right font-medium">${donor.totalDonated.toLocaleString('es-MX')}</td>
                  <td className="p-3 text-right text-muted-foreground">{donor.totalUMA.toFixed(0)}</td>
                  <td className="p-3 text-center">
                    {donor.exceedsThreshold ? (
                      <span className="text-warning text-xs font-medium">⚠️ Excede</span>
                    ) : (
                      <span className="text-success text-xs">✓ OK</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
