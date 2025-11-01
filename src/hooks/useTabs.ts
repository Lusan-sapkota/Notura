import { useState, useCallback, useEffect } from 'react';
import { Tab } from '../components/ui/TabSystem';

// Session storage keys
const TABS_STORAGE_KEY = 'notura-tabs';
const ACTIVE_TAB_STORAGE_KEY = 'notura-active-tab';

// Load tabs from session storage
const loadTabsFromStorage = (): { tabs: Tab[], activeTabId: string } => {
  try {
    const savedTabs = sessionStorage.getItem(TABS_STORAGE_KEY);
    const savedActiveTabId = sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    
    if (savedTabs) {
      const tabs = JSON.parse(savedTabs) as Tab[];
      const activeTabId = savedActiveTabId || (tabs.length > 0 ? tabs[0].id : '');
      
      // Validate that activeTabId exists in tabs
      const validActiveTabId = tabs.find(tab => tab.id === activeTabId) ? activeTabId : (tabs.length > 0 ? tabs[0].id : '');
      
      return { tabs, activeTabId: validActiveTabId };
    }
  } catch (error) {
    console.warn('Failed to load tabs from storage:', error);
  }
  
  // Return empty state by default
  return { tabs: [], activeTabId: '' };
};

// Save tabs to session storage
const saveTabsToStorage = (tabs: Tab[], activeTabId: string) => {
  try {
    sessionStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
    sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
  } catch (error) {
    console.warn('Failed to save tabs to storage:', error);
  }
};

export function useTabs() {
  const { tabs: initialTabs, activeTabId: initialActiveTabId } = loadTabsFromStorage();
  
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState(initialActiveTabId);

  // Save tabs to storage whenever they change
  useEffect(() => {
    saveTabsToStorage(tabs, activeTabId);
  }, [tabs, activeTabId]);

  const createTab = useCallback((title?: string, content?: string) => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      title: title || 'Untitled Note',
      content: content || '',
      isDirty: false,
      isActive: false
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    return newId;
  }, []);

  const createBlankTab = useCallback(() => {
    return createTab('Untitled Note', '');
  }, [createTab]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      
      // If closing active tab, switch to another tab or clear active tab
      if (tabId === activeTabId) {
        if (filtered.length > 0) {
          setActiveTabId(filtered[0].id);
        } else {
          setActiveTabId('');
        }
      }
      
      return filtered;
    });
  }, [activeTabId]);

  const selectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isDirty: true }
        : tab
    ));
  }, []);

  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, title }
        : tab
    ));
  }, []);

  const markTabSaved = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, isDirty: false }
        : tab
    ));
  }, []);

  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]);

  const duplicateTab = useCallback((tabId: string) => {
    const tabToDuplicate = tabs.find(tab => tab.id === tabId);
    if (tabToDuplicate) {
      const newId = Date.now().toString();
      const newTab: Tab = {
        ...tabToDuplicate,
        id: newId,
        title: `${tabToDuplicate.title} (Copy)`,
        isDirty: true
      };
      
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newId);
    }
  }, [tabs]);

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(TABS_STORAGE_KEY);
      sessionStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
      setTabs([]);
      setActiveTabId('');
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }, []);

  return {
    tabs,
    activeTabId,
    createTab,
    createBlankTab,
    closeTab,
    selectTab,
    updateTabContent,
    updateTabTitle,
    markTabSaved,
    getActiveTab,
    duplicateTab,
    clearSession
  };
}