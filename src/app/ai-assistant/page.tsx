'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { chatWithAssistant, type ChatWithAssistantOutput } from '@/ai/flows/ai-assistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  role: 'user' | 'model';
  content: { text: string }[];
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result: ChatWithAssistantOutput = await chatWithAssistant({
        message: input,
        history: messages,
      });
      const assistantMessage: Message = { role: 'model', content: [{ text: result.response }] };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'model',
        content: [{ text: 'Sorry, I encountered an error. Please try again.' }],
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('AI Assistant Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageText = (message: Message) => {
    return message.content.map(part => part.text).join('');
  };


  return (
    <div className="container mx-auto">
      <Card className="h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Ask me anything about the Bharat Carbon Exchange, its projects, or carbon credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{getMessageText(message)}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a project..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
