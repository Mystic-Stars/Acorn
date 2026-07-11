import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'animal-island-ui';

function TabContentMover({
  active,
  onMount,
}: {
  active: boolean;
  onMount: (el: HTMLDivElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && ref.current) {
      onMount(ref.current);
    }
  }, [active, onMount]);

  return <div ref={ref} className="twikoo-pane-host" />;
}

export function TwikooAdminTabs() {
  const [tabs, setTabs] = useState<{ key: string; label: string; index: number }[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');

  useEffect(() => {
    // We observe the body for the appearance of the .tk-tabs element which Twikoo dynamically injects
    const observer = new MutationObserver(() => {
      const tkTabs = document.querySelector('.tk-tabs');
      if (tkTabs && tabs.length === 0) {
        const tkTabElements = Array.from(tkTabs.querySelectorAll('.tk-tab'));
        if (tkTabElements.length > 0) {
          const newTabs = tkTabElements.map((el, i) => {
            const label = el.textContent || `Tab ${i + 1}`;
            return { key: `tab-${i}`, label, index: i };
          });
          setTabs(newTabs);

          // Hide the original Twikoo tabs visually but keep them in the DOM so we can click them
          (tkTabs as HTMLElement).style.setProperty('display', 'none', 'important');

          // Find the initial active tab
          const activeIndex = tkTabElements.findIndex((el) => el.classList.contains('__active'));
          if (activeIndex >= 0) {
            setActiveKey(`tab-${activeIndex}`);
          } else {
            setActiveKey(`tab-0`);
          }
        }
      } else if (tkTabs && tabs.length > 0) {
        // If Twikoo's internal logic changes the active tab, we need to sync it to our React component
        const tkTabElements = Array.from(tkTabs.querySelectorAll('.tk-tab'));
        const activeIndex = tkTabElements.findIndex((el) => el.classList.contains('__active'));
        if (activeIndex >= 0 && activeKey !== `tab-${activeIndex}`) {
          setActiveKey(`tab-${activeIndex}`);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [tabs.length, activeKey]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="twikoo-admin-tabs-hijacker">
      <Tabs
        className="tk-admin-tabs-component"
        activeKey={activeKey}
        onChange={(key) => {
          setActiveKey(key);
          const tabObj = tabs.find((t) => t.key === key);
          if (tabObj) {
            // Forward the click event to the hidden original Twikoo tab
            const tkTabElements = document.querySelectorAll('.tk-tab');
            if (tkTabElements[tabObj.index]) {
              (tkTabElements[tabObj.index] as HTMLElement).click();
            }
          }
        }}
        items={tabs.map((t) => ({
          key: t.key,
          label: t.label,
          children: (
            <TabContentMover
              active={activeKey === t.key}
              onMount={(container) => {
                const twikoo = document.getElementById('twikoo');
                if (twikoo && twikoo.parentElement !== container) {
                  container.appendChild(twikoo);
                }
              }}
            />
          ),
        }))}
      />
    </div>
  );
}
