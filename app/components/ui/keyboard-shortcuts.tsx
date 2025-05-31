import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  onClose?: () => void;
}

export function KeyboardShortcuts({ shortcuts, onClose }: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts panel with Cmd/Ctrl + ?
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsVisible(true);
      }
      
      // Close with Escape
      if (e.key === 'Escape') {
        setIsVisible(false);
        onClose?.();
      }

      // Handle individual shortcuts
      shortcuts.forEach(shortcut => {
        const keys = shortcut.keys.map(k => k.toLowerCase());
        const isModifierMatch = 
          (keys.includes('cmd') && e.metaKey) ||
          (keys.includes('ctrl') && e.ctrlKey) ||
          (keys.includes('shift') && e.shiftKey) ||
          (keys.includes('alt') && e.altKey);
        
        const keyMatch = keys.includes(e.key.toLowerCase());
        
        if (shortcut.action && ((isModifierMatch && keyMatch) || (keys.length === 1 && keyMatch))) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, onClose]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
          onClick={() => setIsVisible(true)}
        >
          <Keyboard className="w-4 h-4 mr-2" />
          Shortcuts
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex} className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-xs text-white font-mono">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-slate-400 text-xs">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-xs text-slate-400 text-center">
            Press <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Cmd</kbd> + <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">/</kbd> anytime to view shortcuts
          </p>
        </div>
      </Card>
    </div>
  );
}

// Hook for easy integration
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  return {
    ShortcutsComponent: () => (
      <KeyboardShortcuts 
        shortcuts={shortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    ),
    showShortcuts,
    setShowShortcuts
  };
} 