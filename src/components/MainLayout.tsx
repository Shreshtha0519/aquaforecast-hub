import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useRegion } from '@/contexts/RegionContext';
import { getKPIData } from '@/data/mockData';
import { AlertTriangle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';

const MainLayout: React.FC = () => {
  const { selectedRegion } = useRegion();
  const kpiData = getKPIData(`${selectedRegion.state}-${selectedRegion.district}-${selectedRegion.city}`);

  const riskConfig = {
    safe: { label: 'Safe', emoji: '🟢', class: 'risk-safe' },
    warning: { label: 'Warning', emoji: '🟡', class: 'risk-warning' },
    critical: { label: 'Critical', emoji: '🔴', class: 'risk-critical' },
  };

  const risk = riskConfig[kpiData.riskLevel];

  const handleExportPDF = async () => {
    const element = document.getElementById('main-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `water-demand-report-${selectedRegion.city}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedRegion.city}, {selectedRegion.district}
            </h2>
            <Badge variant="outline" className={cn('border', risk.class)}>
              {risk.emoji} {risk.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {kpiData.riskLevel !== 'safe' && (
              <div className="flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="w-4 h-4" />
                <span>Attention required</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </header>

        {/* Content */}
        <div id="main-content" className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
