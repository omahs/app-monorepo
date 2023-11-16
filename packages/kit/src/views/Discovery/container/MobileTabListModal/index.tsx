import { useCallback, useEffect, useMemo, useState } from 'react';

import { FlatList, StyleSheet } from 'react-native';

import { ModalContainer, Stack } from '@onekeyhq/components';
import type { IPageNavigationProp } from '@onekeyhq/components/src/Navigation';

import useAppNavigation from '../../../../hooks/useAppNavigation';
import MobileTabListItem from '../../components/MobileTabListItem';
import MobileTabItemOptions from '../../components/MobileTabListItem/MobileTabItemOptions';
import MobileTabListPinnedItem from '../../components/MobileTabListItem/MobileTabListPinnedItem';
import { TAB_LIST_CELL_COUNT_PER_ROW } from '../../config/TabList.constants';
import useBrowserBookmarkAction from '../../hooks/useBrowserBookmarkAction';
import useWebTabAction from '../../hooks/useWebTabAction';
import { useActiveTabId, useWebTabs } from '../../hooks/useWebTabs';
import { withBrowserProvider } from '../Browser/WithBrowserProvider';

import type { IDiscoveryModalParamList } from '../../router/Routes';
import type { IWebTab } from '../../types';
import type { View } from 'react-native';

export const tabGridRefs: Record<string, View> = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContentContainer: {
    paddingBottom: 16,
  },
});

function MobileTabListModal() {
  const navigation =
    useAppNavigation<IPageNavigationProp<IDiscoveryModalParamList>>();
  const { tabs } = useWebTabs();
  const data = useMemo(() => (tabs ?? []).filter((t) => !t.isPinned), [tabs]);
  const pinnedData = useMemo(
    () => (tabs ?? []).filter((t) => t.isPinned),
    [tabs],
  );

  useEffect(() => {
    console.log('MobileTabListModal data changed ===> : ', data);
  }, [data]);
  useEffect(() => {
    console.log('MobileTabListModal pinnedData changed ===> : ', pinnedData);
  }, [pinnedData]);

  const { activeTabId } = useActiveTabId();

  const { addBrowserBookmark, removeBrowserBookmark } =
    useBrowserBookmarkAction();

  const {
    addBlankWebTab,
    closeAllWebTab,
    setCurrentWebTab,
    closeWebTab,
    setPinnedTab,
  } = useWebTabAction();

  const [open, onOpenChange] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  const handleBookmarkPress = useCallback(
    (bookmark: boolean, url: string, title: string) => {
      if (bookmark) {
        addBrowserBookmark({ url, title });
      } else {
        removeBrowserBookmark(url);
      }
      onOpenChange(false);
    },
    [addBrowserBookmark, removeBrowserBookmark],
  );
  const handleShare = useCallback(() => {
    console.log('TODO: on share');
    onOpenChange(false);
  }, []);
  const handlePinnedPress = useCallback(
    (id: string, pinned: boolean) => {
      void setPinnedTab({ id, pinned });
      onOpenChange(false);
    },
    [setPinnedTab],
  );
  const handleCloseTab = useCallback(
    (id: string) => {
      void closeWebTab(id);
      onOpenChange(false);
    },
    [closeWebTab],
  );

  const keyExtractor = useCallback((item: IWebTab) => item.id, []);
  const renderItem = useCallback(
    ({ item: tab }: { item: IWebTab }) => (
      <MobileTabListItem
        {...tab}
        activeTabId={activeTabId}
        onSelectedItem={(id) => {
          setCurrentWebTab(id);
          navigation.pop();
        }}
        onCloseItem={handleCloseTab}
        onLongPress={(id) => {
          setSelectedTabId(id);
          onOpenChange(true);
        }}
      />
    ),
    [navigation, setCurrentWebTab, activeTabId, handleCloseTab],
  );

  const ListHeader = useMemo(() => {
    if (pinnedData.length === 0) {
      return null;
    }
    return (
      <>
        {pinnedData.map((pinnedTab) => (
          <MobileTabListPinnedItem
            {...pinnedTab}
            activeTabId={activeTabId}
            onSelectedItem={(id) => {
              setCurrentWebTab(id);
              navigation.pop();
            }}
            onCloseItem={(id) => handleCloseTab}
            onLongPress={(id) => {
              setSelectedTabId(id);
              onOpenChange(true);
            }}
          />
        ))}
      </>
    );
  }, [pinnedData, setCurrentWebTab, activeTabId, navigation, handleCloseTab]);

  return (
    <ModalContainer
      onConfirm={() => {
        addBlankWebTab();
        navigation.pop();
      }}
      onCancel={() => closeAllWebTab()}
    >
      <Stack style={styles.container}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={TAB_LIST_CELL_COUNT_PER_ROW}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          ListHeaderComponent={ListHeader}
        />
      </Stack>
      <MobileTabItemOptions
        open={open}
        onOpenChange={onOpenChange}
        id={selectedTabId}
        onBookmarkPress={handleBookmarkPress}
        onPinnedPress={handlePinnedPress}
        onShare={handleShare}
        onClose={handleCloseTab}
      />
    </ModalContainer>
  );
}

export default withBrowserProvider(MobileTabListModal);
