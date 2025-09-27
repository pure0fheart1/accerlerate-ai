import React, { useState, useRef } from 'react';
import Whiteboard from '../pages/Whiteboard';

interface WhiteboardTab {
  id: string;
  name: string;
  isActive: boolean;
}

const WhiteboardTabs: React.FC = () => {
  const [tabs, setTabs] = useState<WhiteboardTab[]>([
    { id: 'wb-1', name: 'Whiteboard 1', isActive: true }
  ]);
  const [activeTabId, setActiveTabId] = useState('wb-1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const tabCounter = useRef(1);

  const MAX_TABS = 30;

  const createNewTab = () => {
    if (tabs.length >= MAX_TABS) {
      alert(`Maximum ${MAX_TABS} tabs allowed`);
      return;
    }

    tabCounter.current += 1;
    const newTab: WhiteboardTab = {
      id: `wb-${tabCounter.current}`,
      name: `Whiteboard ${tabCounter.current}`,
      isActive: false
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat({ ...newTab, isActive: true }));
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (tabs.length === 1) {
      return; // Don't close the last tab
    }

    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);

    if (tabId === activeTabId) {
      // If closing active tab, switch to adjacent tab
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTabId(newActiveTab.id);
      setTabs(newTabs.map(tab => ({
        ...tab,
        isActive: tab.id === newActiveTab.id
      })));
    } else {
      setTabs(newTabs);
    }
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  const startEditingTab = (tabId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tabId);
    setEditingName(currentName);
  };

  const saveTabName = () => {
    if (editingTabId && editingName.trim()) {
      setTabs(prev => prev.map(tab =>
        tab.id === editingTabId
          ? { ...tab, name: editingName.trim() }
          : tab
      ));
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const cancelEditingTab = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTabName();
    } else if (e.key === 'Escape') {
      cancelEditingTab();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const duplicateTab = (tabId: string) => {
    if (tabs.length >= MAX_TABS) {
      alert(`Maximum ${MAX_TABS} tabs allowed`);
      return;
    }

    const tabToDuplicate = tabs.find(tab => tab.id === tabId);
    if (tabToDuplicate) {
      tabCounter.current += 1;
      const newTab: WhiteboardTab = {
        id: `wb-${tabCounter.current}`,
        name: `${tabToDuplicate.name} (Copy)`,
        isActive: false
      };

      setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat({ ...newTab, isActive: true }));
      setActiveTabId(newTab.id);
    }
    closeContextMenu();
  };

  const closeOtherTabs = (keepTabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id === keepTabId).map(tab => ({ ...tab, isActive: true })));
    setActiveTabId(keepTabId);
    closeContextMenu();
  };

  const closeTabsToRight = (fromTabId: string) => {
    const fromIndex = tabs.findIndex(tab => tab.id === fromTabId);
    const newTabs = tabs.slice(0, fromIndex + 1);

    // If active tab was closed, make the fromTab active
    if (!newTabs.find(tab => tab.id === activeTabId)) {
      setActiveTabId(fromTabId);
      setTabs(newTabs.map(tab => ({ ...tab, isActive: tab.id === fromTabId })));
    } else {
      setTabs(newTabs);
    }
    closeContextMenu();
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 't') {
          e.preventDefault();
          createNewTab();
        } else if (e.key === 'w') {
          e.preventDefault();
          if (tabs.length > 1) {
            closeTab(activeTabId, e as any);
          }
        } else if (e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          const tabIndex = parseInt(e.key) - 1;
          if (tabs[tabIndex]) {
            switchTab(tabs[tabIndex].id);
          }
        }
      }
    };

    const handleClickOutside = () => {
      closeContextMenu();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [tabs, activeTabId]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-1 overflow-x-auto">
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center group min-w-0 max-w-48 px-3 py-2 rounded-t-lg cursor-pointer border-b-2 transition-all duration-200 ${
                tab.isActive
                  ? 'bg-white dark:bg-gray-900 border-blue-500 text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => switchTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
            >
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveTabName}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent text-sm font-medium outline-none border-none flex-1 min-w-0"
                  autoFocus
                  maxLength={20}
                />
              ) : (
                <span
                  className="text-sm font-medium truncate flex-1 min-w-0"
                  onDoubleClick={(e) => startEditingTab(tab.id, tab.name, e)}
                  title={tab.name}
                >
                  {tab.name}
                </span>
              )}

              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Close tab"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* New Tab Button */}
        {tabs.length < MAX_TABS && (
          <button
            onClick={createNewTab}
            className="ml-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
            title={`Add new whiteboard (${tabs.length}/${MAX_TABS})`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}

        {/* Tab Counter */}
        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 px-2">
          {tabs.length}/{MAX_TABS}
        </div>
      </div>

      {/* Active Whiteboard */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${tab.isActive ? 'block' : 'hidden'}`}
          >
            <Whiteboard key={tab.id} />
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 py-1 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => duplicateTab(contextMenu.tabId)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate Tab
          </button>

          <button
            onClick={() => startEditingTab(contextMenu.tabId, tabs.find(t => t.id === contextMenu.tabId)?.name || '', new MouseEvent('click') as any)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </button>

          <hr className="my-1 border-gray-200 dark:border-gray-600" />

          {tabs.length > 2 && (
            <button
              onClick={() => closeOtherTabs(contextMenu.tabId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close Other Tabs
            </button>
          )}

          {tabs.findIndex(t => t.id === contextMenu.tabId) < tabs.length - 1 && (
            <button
              onClick={() => closeTabsToRight(contextMenu.tabId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close Tabs to Right
            </button>
          )}

          {tabs.length > 1 && (
            <>
              <hr className="my-1 border-gray-200 dark:border-gray-600" />
              <button
                onClick={(e) => closeTab(contextMenu.tabId, e as any)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Tab
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WhiteboardTabs;