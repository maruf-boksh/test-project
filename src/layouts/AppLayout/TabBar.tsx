import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import type { ReactElement, MouseEvent as ReactMouseEvent } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  CloseOutlined, LeftOutlined, RightOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors,
  closestCenter, DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext, horizontalListSortingStrategy, arrayMove,
  useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS as DndCss } from '@dnd-kit/utilities';
import { NAV_ROUTE_META_MAP, resolveSelectedNavKey } from './navIndex';
import type { RouteMeta } from './navIndex';

const TABS_STORAGE_KEY = 'harvest-catering.open-tabs';
const MAX_TABS = 15;

export interface TabEntry {
  /** Canonical nav route key (matches an entry in NAV_ROUTE_META_MAP). */
  key: string;
  label: string;
  /** Last-visited path + search for this tab — lets users resume work. */
  lastPath: string;
}

// ─── Storage helpers ────────────────────────────────────────────────────────
function readStoredTabs(): TabEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(TABS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: TabEntry[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const { key, label, lastPath } = item as Partial<TabEntry>;
      if (typeof key !== 'string' || typeof label !== 'string') continue;
      if (!NAV_ROUTE_META_MAP.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ key, label, lastPath: typeof lastPath === 'string' && lastPath ? lastPath : key });
      if (out.length >= MAX_TABS) break;
    }
    return out;
  } catch {
    return [];
  }
}

function writeStoredTabs(tabs: TabEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
  } catch { /* swallow */ }
}

// ─── Icon lookup from nav config ────────────────────────────────────────────
function findIconForKey(items: unknown, key: string): ReactElement | undefined {
  if (!Array.isArray(items)) return undefined;
  for (const item of items as Array<{ key?: string; icon?: ReactElement; children?: unknown }>) {
    if (!item) continue;
    if (item.key === key && item.icon) return item.icon;
    const nested = findIconForKey(item.children, key);
    if (nested) return nested;
  }
  return undefined;
}

// ─── Sortable tab item ──────────────────────────────────────────────────────
interface SortableTabProps {
  tab: TabEntry;
  icon?: ReactElement;
  isActive: boolean;
  canClose: boolean;
  menu: MenuProps['items'];
  onMenuClick: (info: { key: string }) => void;
  onNavigate: () => void;
  onClose: (e?: ReactMouseEvent) => void;
}

function SortableTab({
  tab, icon, isActive, canClose, menu, onMenuClick, onNavigate, onClose,
}: SortableTabProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: tab.key });

  const style: React.CSSProperties = {
    transform: DndCss.Transform.toString(transform),
    transition,
  };

  return (
    <Dropdown
      trigger={['contextMenu']}
      menu={{ items: menu, onClick: onMenuClick }}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        data-tab-key={tab.key}
        role="tab"
        aria-selected={isActive}
        tabIndex={0}
        className={`app-tabbar-tab${isActive ? ' is-active' : ''}${isDragging ? ' is-dragging' : ''}`}
        onClick={() => { if (!isDragging) onNavigate(); }}
        onAuxClick={e => { if (e.button === 1) onClose(e); }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate();
          }
          if (e.key === 'w' && (e.ctrlKey || e.metaKey) && canClose) {
            e.preventDefault();
            onClose();
          }
        }}
        title={tab.label}
      >
        {icon && <span className="app-tabbar-tab-icon">{icon}</span>}
        <span className="app-tabbar-tab-label">{tab.label}</span>
        <span
          className={`app-tabbar-tab-close${canClose ? '' : ' is-disabled'}`}
          role="button"
          aria-label={canClose ? `Close ${tab.label}` : 'Cannot close the last remaining tab'}
          aria-disabled={!canClose}
          title={canClose ? undefined : 'At least one tab must remain open'}
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            if (!canClose) return;
            onClose(e);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              if (canClose) onClose();
            }
          }}
          tabIndex={-1}
        >
          <CloseOutlined />
        </span>
      </div>
    </Dropdown>
  );
}

// ─── Drag overlay preview (a static copy of the tab) ────────────────────────
function OverlayTab({ tab, icon, isActive }: { tab: TabEntry; icon?: ReactElement; isActive: boolean }) {
  return (
    <div className={`app-tabbar-tab app-tabbar-tab-overlay${isActive ? ' is-active' : ''}`}>
      {icon && <span className="app-tabbar-tab-icon">{icon}</span>}
      <span className="app-tabbar-tab-label">{tab.label}</span>
      <span className="app-tabbar-tab-close" style={{ opacity: 1 }}>
        <CloseOutlined />
      </span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────
interface Props {
  menuItems: unknown; // MENU_ITEMS from navIndex
}

export function TabBar({ menuItems }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState<TabEntry[]>(() => readStoredTabs());

  const activeKey = useMemo(
    () => resolveSelectedNavKey(location.pathname),
    [location.pathname],
  );

  const activeMeta: RouteMeta | undefined = NAV_ROUTE_META_MAP.get(activeKey);

  // ── Sync current route into tabs ──────────────────────────────────────────
  useEffect(() => {
    if (!activeMeta) return;
    const currentFullPath = location.pathname + (location.search || '');

    setTabs(prev => {
      const idx = prev.findIndex(t => t.key === activeKey);
      if (idx !== -1) {
        if (prev[idx].lastPath === currentFullPath) return prev;
        const next = prev.slice();
        next[idx] = { ...prev[idx], lastPath: currentFullPath };
        return next;
      }
      const entry: TabEntry = { key: activeKey, label: activeMeta.label, lastPath: currentFullPath };
      const appended = [...prev, entry];
      return appended.length > MAX_TABS ? appended.slice(appended.length - MAX_TABS) : appended;
    });
  }, [activeKey, activeMeta, location.pathname, location.search]);

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => { writeStoredTabs(tabs); }, [tabs]);

  // ── Close handlers ────────────────────────────────────────────────────────
  const closeTab = useCallback((key: string, event?: ReactMouseEvent) => {
    event?.stopPropagation();
    event?.preventDefault();

    setTabs(prev => {
      const idx = prev.findIndex(t => t.key === key);
      if (idx === -1) return prev;
      const next = prev.filter(t => t.key !== key);
      if (key === activeKey) {
        const neighbour = next[idx] ?? next[idx - 1] ?? next[next.length - 1];
        if (neighbour) navigate(neighbour.lastPath);
      }
      return next;
    });
  }, [activeKey, navigate]);

  const closeOthers = useCallback((key: string) => {
    setTabs(prev => {
      const target = prev.find(t => t.key === key);
      if (!target) return prev;
      if (key !== activeKey) navigate(target.lastPath);
      return [target];
    });
  }, [activeKey, navigate]);

  // Close-all keeps the currently active tab so the user never loses the page they're on.
  const closeAll = useCallback(() => {
    setTabs(prev => {
      const active = prev.find(t => t.key === activeKey);
      return active ? [active] : [];
    });
  }, [activeKey]);

  const closeRight = useCallback((key: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.key === key);
      if (idx === -1) return prev;
      const next = prev.slice(0, idx + 1);
      if (prev.findIndex(t => t.key === activeKey) > idx) {
        navigate(next[idx].lastPath);
      }
      return next;
    });
  }, [activeKey, navigate]);

  // ── Horizontal scroll state ───────────────────────────────────────────────
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const updateOverflow = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setOverflow({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  }, []);

  useLayoutEffect(() => {
    updateOverflow();
    const el = listRef.current;
    if (!el) return;
    const handler = () => updateOverflow();
    el.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      el.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [updateOverflow, tabs.length]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>(`[data-tab-key="${CSS.escape(activeKey)}"]`);
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [activeKey, tabs.length]);

  const scrollBy = (dx: number) => {
    listRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };

  // ── dnd-kit setup ─────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [activeDragKey, setActiveDragKey] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragKey(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragKey(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTabs(prev => {
      const src = prev.findIndex(t => t.key === active.id);
      const dst = prev.findIndex(t => t.key === over.id);
      if (src === -1 || dst === -1) return prev;
      return arrayMove(prev, src, dst);
    });
  };

  const handleDragCancel = () => setActiveDragKey(null);

  // ── Context-menu builder ──────────────────────────────────────────────────
  const buildMenu = (tab: TabEntry): MenuProps['items'] => [
    { key: 'close',        icon: <CloseOutlined />, label: 'Close', disabled: tabs.length < 2 },
    { key: 'close-others', label: 'Close Others', disabled: tabs.length < 2 },
    { key: 'close-right',  label: 'Close Tabs to the Right',
      disabled: tabs.findIndex(t => t.key === tab.key) >= tabs.length - 1 },
    { type: 'divider' },
    { key: 'close-all',    label: 'Close All (Keep Current)', danger: true, disabled: tabs.length < 2 },
  ];

  const handleMenu = (tabKey: string) => (info: { key: string }) => {
    if (info.key === 'close' && tabs.length > 1) closeTab(tabKey);
    if (info.key === 'close-others')             closeOthers(tabKey);
    if (info.key === 'close-right')              closeRight(tabKey);
    if (info.key === 'close-all')                closeAll();
  };

  const activeDragTab = activeDragKey ? tabs.find(t => t.key === activeDragKey) : null;
  const tabIds = useMemo(() => tabs.map(t => t.key), [tabs]);

  // Close-all is only useful when there's at least one non-active tab to remove
  const canCloseAll = tabs.length > 1;

  return (
    <div className="app-tabbar" role="tablist" aria-label="Open pages">
      {overflow.left && (
        <button
          type="button"
          className="app-tabbar-scroll-btn"
          aria-label="Scroll tabs left"
          onClick={() => scrollBy(-240)}
        >
          <LeftOutlined />
        </button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
          <div className="app-tabbar-list" ref={listRef}>
            {tabs.length === 0 && (
              <div className="app-tabbar-empty">
                <AppstoreOutlined />
                <span>No open pages — click any module in the sidebar to open it as a tab.</span>
              </div>
            )}

            {tabs.map(tab => (
              <SortableTab
                key={tab.key}
                tab={tab}
                icon={findIconForKey(menuItems, tab.key)}
                isActive={tab.key === activeKey}
                canClose={tabs.length > 1}
                menu={buildMenu(tab)}
                onMenuClick={handleMenu(tab.key)}
                onNavigate={() => {
                  if (tab.key !== activeKey) navigate(tab.lastPath);
                }}
                onClose={e => closeTab(tab.key, e)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
          {activeDragTab ? (
            <OverlayTab
              tab={activeDragTab}
              icon={findIconForKey(menuItems, activeDragTab.key)}
              isActive={activeDragTab.key === activeKey}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {overflow.right && (
        <button
          type="button"
          className="app-tabbar-scroll-btn"
          aria-label="Scroll tabs right"
          onClick={() => scrollBy(240)}
        >
          <RightOutlined />
        </button>
      )}

      {canCloseAll && (
        <button
          type="button"
          className="app-tabbar-clear-btn"
          aria-label="Close all tabs except current"
          title="Close all tabs (keep current)"
          onClick={closeAll}
        >
          <CloseOutlined />
        </button>
      )}
    </div>
  );
}
