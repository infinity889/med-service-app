import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartPieIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';

export function Statistics() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Comprehensive mockup database for generating statistical insights dynamically
  const statisticalData = useMemo(() => {
    let baseBarData = [
      { name: 'Astana', 'KDL Olymp': 4500, 'Invitro': 4800, 'Helix': 4200 },
      { name: 'Almaty', 'KDL Olymp': 5200, 'Invitro': 5500, 'Helix': 4900, 'Orhun Medical': 8500 },
      { name: 'Shymkent', 'KDL Olymp': 3800, 'Invitro': 4100, 'Sunkar': 3500 },
    ];

    if (selectedCity) {
      baseBarData = baseBarData.filter(d => d.name === selectedCity);
    }

    if (selectedCategory) {
      const multiplier = selectedCategory === 'Лаборатория' ? 1 : selectedCategory === 'Диагностика' ? 2.5 : 1.5;
      baseBarData = baseBarData.map(cityData => {
        const newData = { ...cityData };
        Object.keys(newData).forEach(key => {
          if (key !== 'name') {
            newData[key] = Math.round((newData[key] as number) * multiplier);
          }
        });
        return newData;
      });
    }

    let pieData = [
      { name: 'KDL Olymp', value: 45 },
      { name: 'Invitro', value: 30 },
      { name: 'Helix', value: 15 },
      { name: 'Другие', value: 10 },
    ];

    if (selectedCity === 'Shymkent') {
      pieData = [
        { name: 'Sunkar', value: 50 },
        { name: 'KDL Olymp', value: 30 },
        { name: 'Invitro', value: 20 },
      ];
    } else if (selectedCity === 'Almaty') {
      pieData = [
        { name: 'KDL Olymp', value: 35 },
        { name: 'Orhun Medical', value: 25 },
        { name: 'Invitro', value: 25 },
        { name: 'Helix', value: 15 },
      ];
    }

    return { barData: baseBarData, pieData };
  }, [selectedCity, selectedCategory]);

  const COLORS = ['#FF4F00', '#FF7A33', '#FFA566', '#FFD099'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('statistics.title', 'Рыночная статистика')}</h1>
          <p className="text-muted-foreground">{t('statistics.subtitle', 'Аналитика цен и долей рынка медицинских услуг')}</p>
        </div>

        {/* Dynamic Filters Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="w-full sm:w-48">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium text-foreground"
            >
              <option value="">{t('search.allCities')}</option>
              <option value="Astana">Astana</option>
              <option value="Almaty">Almaty</option>
              <option value="Shymkent">Shymkent</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium text-foreground"
            >
              <option value="">{t('search.allCategories')}</option>
              <option value="Лаборатория">{t('search.laboratory')}</option>
              <option value="Диагностика">{t('search.diagnostics')}</option>
              <option value="Приём врача">{t('search.doctorVisit')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Bar Chart */}
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex items-center space-x-2">
              <PresentationChartBarIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium">{t('statistics.avgPriceByCity', 'Средние цены по городам (₸)')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 h-[280px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statisticalData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6F767E' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F767E' }} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                {Object.keys(statisticalData.barData[0] || {}).filter(k => k !== 'name').map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={COLORS[index % COLORS.length]} 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Share Pie Chart */}
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex items-center space-x-2">
              <ChartPieIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium">{t('statistics.marketShare', 'Доля рынка лабораторий (%)')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statisticalData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statisticalData.pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

