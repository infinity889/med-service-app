import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InboxIcon, CheckIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface RawUnmatchedRecord {
  id: string;
  rawName: string;
  sourceClinic: string;
  price: number;
  city: string;
}

const INITIAL_UNMATCHED_RECORDS: RawUnmatchedRecord[] = [
  { id: 'u1', rawName: 'Анализ крови развернут. ф.12', sourceClinic: 'KDL Olymp', price: 2800, city: 'Astana' },
  { id: 'u2', rawName: 'Консультация кардиолога высш. кат.', sourceClinic: 'Aksai Clinic', price: 15000, city: 'Almaty' },
  { id: 'u3', rawName: 'МРТ органов брюшной полости (3 Тесла)', sourceClinic: 'Orhun Medical', price: 32000, city: 'Almaty' },
  { id: 'u4', rawName: 'УЗИ щитовидки датчиком высокого разрешения', sourceClinic: 'Sunkar', price: 6000, city: 'Shymkent' },
  { id: 'u5', rawName: 'ОАМ экспресс метод с микроскопией осадка', sourceClinic: 'Invitro', price: 1400, city: 'Astana' },
];

const CANONICAL_SERVICES = [
  'Общий анализ крови (ОАК)',
  'Биохимический анализ крови',
  'МРТ головного мозга',
  'Прием терапевта',
  'УЗИ брюшной полости',
  'УЗИ щитовидной железы',
  'Общий анализ мочи',
  'ПЦР тест на COVID-19',
  'ЭКГ с расшифровкой'
];

export function Moderator() {
  const [records, setRecords] = useState<RawUnmatchedRecord[]>(INITIAL_UNMATCHED_RECORDS);
  const [selectedMapping, setSelectedMapping] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLink = (recordId: string, rawName: string) => {
    const canonicalName = selectedMapping[recordId] || CANONICAL_SERVICES[0];
    
    // Remove from queue
    setRecords(prev => prev.filter(r => r.id !== recordId));
    
    showToast(`Связь успешно создана: "${rawName}" ➔ "${canonicalName}"`);
  };

  const handleIgnore = (recordId: string, rawName: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
    showToast(`Запись "${rawName}" пропущена`);
  };

  const handleAutoMatch = () => {
    // Simulate AI smart matching
    const mappings: Record<string, string> = {};
    records.forEach(r => {
      const name = r.rawName.toLowerCase();
      if (name.includes('крови') || name.includes('оак')) {
        mappings[r.id] = 'Общий анализ крови (ОАК)';
      } else if (name.includes('кардиолог')) {
        mappings[r.id] = 'Прием терапевта'; // best match
      } else if (name.includes('мрт')) {
        mappings[r.id] = 'МРТ головного мозга';
      } else if (name.includes('узи щитовидки')) {
        mappings[r.id] = 'УЗИ щитовидной железы';
      } else if (name.includes('оам') || name.includes('мочи')) {
        mappings[r.id] = 'Общий анализ мочи';
      }
    });
    
    setSelectedMapping(prev => ({ ...prev, ...mappings }));
    showToast('Умное сопоставление AI успешно применило шаблоны!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2">
          <CheckIcon className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Панель модератора</h1>
          <p className="text-muted-foreground">Очередь ручной разметки (Unmatched Queue) нераспознанных услуг для нормализации со справочником.</p>
        </div>

        {records.length > 0 && (
          <Button 
            onClick={handleAutoMatch}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary to-orange-400 text-primary-foreground font-medium px-5 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
          >
            <SparklesIcon className="w-5 h-5 shrink-0" />
            <span>AI Умное сопоставление</span>
          </Button>
        )}
      </div>

      <Card className="border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center space-x-2">
            <InboxIcon className="w-5 h-5 text-primary" />
            <span>Нераспознанные записи скрейпинга</span>
          </CardTitle>
          <Badge variant="outline" className="text-foreground bg-background">
            Очередь: {records.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <InboxIcon className="w-16 h-16 opacity-10 mb-4" />
              <p className="text-lg font-medium">Очередь разметки пуста!</p>
              <p className="text-sm opacity-80 mt-1">Все спарсенные данные успешно нормализованы.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records.map(record => (
                <div key={record.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {record.sourceClinic} ({record.city})
                    </span>
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                      {record.rawName}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      Цена в источнике: <strong className="text-foreground">{record.price.toLocaleString()} ₸</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:w-96 shrink-0">
                    <div className="w-full">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Связать с услугой справочника:</label>
                      <select
                        value={selectedMapping[record.id] || ''}
                        onChange={e => setSelectedMapping(prev => ({ ...prev, [record.id]: e.target.value }))}
                        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-foreground font-medium"
                      >
                        {CANONICAL_SERVICES.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={() => handleLink(record.id, record.rawName)}
                        className="flex-1 h-10 text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Привязать
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleIgnore(record.id, record.rawName)}
                        className="h-10 text-xs font-semibold rounded-lg border-border hover:border-red-500 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
