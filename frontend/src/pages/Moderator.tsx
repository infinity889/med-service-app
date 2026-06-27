import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InboxIcon, CheckIcon, TrashIcon, SparklesIcon, DocumentArrowUpIcon, GlobeAltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { getRecords, uploadFile, runParser, getServices, resolveRecord } from '@/services/moderator';
import type { RawRecord, ServiceItem } from '@/services/moderator';



export function Moderator() {
  const [records, setRecords] = useState<RawRecord[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapping, setSelectedMapping] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [parseUrl, setParseUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getRecords('NEEDS_REVIEW');
      setRecords(data);
    } catch (e) {
      console.error(e);
      showToast('Ошибка загрузки записей');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecords();
    loadServices();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLink = async (recordId: string, rawName: string) => {
    const serviceId = selectedMapping[recordId] || (services.length > 0 ? services[0].id : '');
    if (!serviceId) {
      showToast('Нет доступных услуг для привязки');
      return;
    }
    try {
      await resolveRecord(recordId, serviceId);
      const serviceName = services.find(s => s.id === serviceId)?.canonical_name || '';
      setRecords(prev => prev.filter(r => r.id !== recordId));
      showToast(`✅ Цена опубликована: "${rawName}" ➔ "${serviceName}"`);
    } catch (err) {
      console.error(err);
      showToast('Ошибка при привязке записи');
    }
  };

  const handleIgnore = (recordId: string, rawName: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
    showToast(`Запись "${rawName}" пропущена`);
  };

  const handleAutoMatch = () => {
    if (services.length === 0) return;
    const mappings: Record<string, string> = {};
    records.forEach(r => {
      const name = r.raw_service_name.toLowerCase();
      // Find best matching service by keyword
      const keywords: Record<string, string[]> = {
        'крови': ['крови', 'оак', 'гемоглобин'],
        'мочи': ['мочи', 'оам'],
        'узи': ['узи', 'ультразвук'],
        'мрт': ['мрт', 'магнитно'],
        'прием': ['прием', 'консультац', 'осмотр'],
        'экг': ['экг', 'электрокардио'],
      };
      for (const service of services) {
        const sn = service.canonical_name.toLowerCase();
        for (const [, kws] of Object.entries(keywords)) {
          if (kws.some(k => name.includes(k)) && kws.some(k => sn.includes(k))) {
            mappings[r.id] = service.id;
            break;
          }
        }
        if (mappings[r.id]) break;
      }
    });
    setSelectedMapping(prev => ({ ...prev, ...mappings }));
    showToast('Умное сопоставление AI успешно применило шаблоны!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      await uploadFile(e.target.files[0]);
      showToast('Файл загружен и отправлен на обработку');
      // Очищаем input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      showToast('Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleParseUrl = async () => {
    if (!parseUrl) return;
    setIsParsing(true);
    try {
      await runParser(parseUrl);
      showToast('Запущен парсинг по ссылке');
      setParseUrl('');
    } catch (err) {
      console.error(err);
      showToast('Ошибка при запуске парсера');
    } finally {
      setIsParsing(false);
    }
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
          <p className="text-muted-foreground">Загрузка данных и очередь ручной разметки (Unmatched Queue).</p>
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

      {/* Upload and Parse Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-medium flex items-center space-x-2">
              <DocumentArrowUpIcon className="w-5 h-5 text-primary" />
              <span>Загрузить прайс-лист</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">Поддерживаются форматы: Excel (.xlsx), PDF, DOCX</p>
            <div className="flex items-center space-x-4">
              <Input 
                type="file" 
                accept=".xlsx,.xls,.pdf,.docx" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <Button disabled={isUploading} variant="outline" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                {isUploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Загрузить'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-medium flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-primary" />
              <span>Спарсить сайт</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">Введите ссылку на страницу с ценами клиники</p>
            <div className="flex items-center space-x-4">
              <Input 
                type="url" 
                placeholder="https://kdl.kz/price" 
                value={parseUrl}
                onChange={(e) => setParseUrl(e.target.value)}
                disabled={isParsing}
              />
              <Button disabled={!parseUrl || isParsing} className="shrink-0" onClick={handleParseUrl}>
                {isParsing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Запустить'}
              </Button>
            </div>
          </CardContent>
        </Card>
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
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <InboxIcon className="w-16 h-16 opacity-10 mb-4" />
              <p className="text-lg font-medium">Очередь разметки пуста!</p>
              <p className="text-sm opacity-80 mt-1">Все спарсенные данные успешно нормализованы.</p>
              <Button variant="outline" className="mt-4" onClick={loadRecords}>Обновить</Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records.map(record => (
                <div key={record.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      File: {record.source_file_id.substring(0, 8)}...
                    </span>
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                      {record.raw_service_name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      Цена в источнике: <strong className="text-foreground">{record.raw_price}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:w-96 shrink-0">
                    <div className="w-full">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Связать с услугой справочника:</label>
                      <select
                        value={selectedMapping[record.id] || (services.length > 0 ? services[0].id : '')}
                        onChange={e => setSelectedMapping(prev => ({ ...prev, [record.id]: e.target.value }))}
                        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-foreground font-medium"
                      >
                        {services.map(service => (
                          <option key={service.id} value={service.id}>{service.canonical_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={() => handleLink(record.id, record.raw_service_name)}
                        className="flex-1 h-10 text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Привязать
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleIgnore(record.id, record.raw_service_name)}
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
