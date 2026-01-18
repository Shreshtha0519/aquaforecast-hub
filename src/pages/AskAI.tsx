import React, { useState, useRef, useEffect } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { useScenario } from '@/contexts/ScenarioContext';
import { getKPIData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hiddenContext?: string; // Hidden system context prepended to query
}

const AskAI: React.FC = () => {
  const { selectedRegion } = useRegion();
  const { dynamicRiskLevel, projectedDemand, currentStorage, demandStorageRatio } = useScenario();
  const kpiData = getKPIData(`${selectedRegion.state}-${selectedRegion.district}-${selectedRegion.city}`);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your Water Demand AI Assistant. I have context about ${selectedRegion.city}, ${selectedRegion.district} (Risk Level: ${dynamicRiskLevel}). How can I help you analyze water demand patterns today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build the hidden context instruction that gets prepended to every query
  const buildHiddenContext = (): string => {
    return `[SYSTEM CONTEXT - DO NOT DISPLAY TO USER]
Current context: User is viewing ${selectedRegion.city}, ${selectedRegion.district}, ${selectedRegion.state}.
Current Risk: ${dynamicRiskLevel.toUpperCase()}
Demand/Storage Ratio: ${demandStorageRatio.toFixed(1)}%
Projected Demand: ${projectedDemand} MLD
Current Storage Capacity: ${currentStorage} MLD
Base Demand: ${kpiData.demand} MLD
Efficiency Score: ${kpiData.efficiency}%
[END SYSTEM CONTEXT]

User Query: `;
  };

  const generateMockResponse = (query: string, hiddenContext: string): string => {
    const context = `Based on ${selectedRegion.city} data (Risk: ${dynamicRiskLevel}, Efficiency: ${kpiData.efficiency}%):`;
    
    // In a real implementation, hiddenContext + query would be sent to OpenRouter API
    // The AI would receive: hiddenContext + query
    // console.log('Full query sent to AI:', hiddenContext + query);
    
    const responses = [
      `${context} The current demand-supply gap shows ${kpiData.demand - kpiData.supply} MLD deficit. With a ${demandStorageRatio.toFixed(0)}% demand/storage ratio, consider implementing water conservation measures during peak summer months.`,
      `${context} Analysis suggests increasing storage capacity by 15% would improve resilience. Current risk level is ${dynamicRiskLevel}. The agricultural sector consumes 35% of total supply.`,
      `${context} Historical patterns indicate demand peaks in April-May. With projected demand at ${projectedDemand} MLD, I recommend pre-positioning resources and activating contingency plans by March.`,
      `${context} The efficiency score of ${kpiData.efficiency}% indicates room for improvement. Current ${dynamicRiskLevel} risk status suggests ${dynamicRiskLevel === 'critical' ? 'immediate action is required' : dynamicRiskLevel === 'warning' ? 'monitoring is recommended' : 'the system is performing well'}.`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Build the hidden context that will be prepended to the user's query
    const hiddenContext = buildHiddenContext();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      hiddenContext: hiddenContext, // Store for reference (not displayed)
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API delay
    // In production: send (hiddenContext + input) to OpenRouter API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: generateMockResponse(input, hiddenContext),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-primary" />
          Ask AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Get insights about water demand for {selectedRegion.city}
        </p>
      </div>

      <Card className="flex-1 glass-card border-border/50 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground text-sm">AI Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">
                Context: {selectedRegion.city} | Risk: {dynamicRiskLevel} | Ratio: {demandStorageRatio.toFixed(0)}%
              </p>
            </div>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant' ? 'bg-primary/20' : 'bg-secondary'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'assistant'
                      ? 'bg-muted text-foreground rounded-tl-none'
                      : 'bg-primary text-primary-foreground rounded-tr-none'
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-2 opacity-60',
                      message.role === 'user' && 'text-right'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <CardContent className="border-t border-border pt-4">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border">
            <AlertCircle className="w-4 h-4 text-muted-foreground ml-2" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about water demand patterns, predictions, or recommendations..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-foreground"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI responses are simulated. Connect OpenRouter API for live predictions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AskAI;
